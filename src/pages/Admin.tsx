import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Coins, LogOut, Send, Users, History, ChevronDown, ChevronUp, Download } from "lucide-react";
import { getDeviceId } from "@/utils/deviceId";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, Currency } from "@/constants/levels";
import * as XLSX from "xlsx";

interface VisitorData {
  ip_address: string;
  device_id: string;
  total_calculations: number;
  total_amount: number;
  first_calculation: string;
  last_calculation: string;
  currency_code: string;
}

interface CalculationHistory {
  id: string;
  current_level: number;
  target_level: number;
  points_needed: number;
  amount_calculated: number;
  created_at: string;
  currency_code: string;
}

const Admin = () => {
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [expandedVisitor, setExpandedVisitor] = useState<string | null>(null);
  const [visitorHistory, setVisitorHistory] = useState<Record<string, CalculationHistory[]>>({});
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [todayPrice, setTodayPrice] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchVisitors();
    fetchTodayPrice();
  }, [selectedCurrency]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      navigate('/auth');
      return;
    }

    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: session.user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      navigate('/auth');
    }
  };

  const fetchTodayPrice = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('coin_price_history')
      .select('price_per_1000')
      .eq('currency_code', selectedCurrency.code)
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setTodayPrice(Number(data[0].price_per_1000));
      setPrice(data[0].price_per_1000.toString());
    } else {
      setTodayPrice(null);
      setPrice("");
    }
  };

  const fetchVisitors = async () => {
    const { data, error } = await supabase
      .from('device_statistics')
      .select('*')
      .eq('currency_code', selectedCurrency.code)
      .order('last_calculation', { ascending: false });

    if (error) {
      console.error('Error fetching visitors:', error);
      return;
    }

    setVisitors(data || []);
  };

  const fetchVisitorHistory = async (ip: string, deviceId: string) => {
    const { data, error } = await supabase
      .from('calculation_history')
      .select('*')
      .eq('device_id', deviceId)
      .eq('currency_code', selectedCurrency.code)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching history:', error);
      return;
    }

    setVisitorHistory(prev => ({
      ...prev,
      [ip]: data || []
    }));
  };

  const handlePriceSubmit = async () => {
    if (!price || isNaN(Number(price))) {
      toast({
        title: "Erro",
        description: "Informe um preço válido.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Não autenticado');
      }

      const deviceId = getDeviceId();
      
      const response = await supabase.functions.invoke('save-coin-price', {
        body: {
          deviceId,
          pricePerThousand: Number(price),
          currencyCode: selectedCurrency.code,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTodayPrice(Number(price));
      
      toast({
        title: "Sucesso!",
        description: `Preço de ${selectedCurrency.symbol}${price} registrado para hoje.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar o preço.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const toggleVisitorHistory = (ip: string, deviceId: string) => {
    if (expandedVisitor === ip) {
      setExpandedVisitor(null);
    } else {
      setExpandedVisitor(ip);
      if (!visitorHistory[ip]) {
        fetchVisitorHistory(ip, deviceId);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToExcel = async () => {
    // Fetch all calculation history for export
    const { data: allHistory, error } = await supabase
      .from('calculation_history')
      .select('*')
      .eq('currency_code', selectedCurrency.code)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar dados para exportação.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for Excel
    const exportData = allHistory?.map(calc => ({
      'IP': calc.ip_address || 'N/A',
      'Device ID': calc.device_id,
      'Nível Atual': calc.current_level,
      'Nível Alvo': calc.target_level,
      'Pontos Necessários': calc.points_needed,
      'Valor Calculado': Number(calc.amount_calculated),
      'Moeda': calc.currency_code,
      'Data/Hora': new Date(calc.created_at).toLocaleString('pt-BR'),
    })) || [];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Visitantes');

    // Auto-size columns
    const colWidths = [
      { wch: 15 }, // IP
      { wch: 40 }, // Device ID
      { wch: 12 }, // Nível Atual
      { wch: 12 }, // Nível Alvo
      { wch: 18 }, // Pontos
      { wch: 15 }, // Valor
      { wch: 8 },  // Moeda
      { wch: 20 }, // Data
    ];
    ws['!cols'] = colWidths;

    // Generate file name with date
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `visitantes_${selectedCurrency.code}_${dateStr}.xlsx`;

    // Download
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Exportado!",
      description: `Arquivo ${fileName} baixado com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Coins className="w-10 h-10 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-primary/30 -z-10"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Painel Admin</h1>
              <p className="text-sm text-muted-foreground">TikTok Gifter Calculator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={selectedCurrency.code}
              onValueChange={(value) => {
                const currency = CURRENCIES.find(c => c.code === value);
                if (currency) setSelectedCurrency(currency);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Price Section */}
        <div className="card-glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Definir Preço do Dia ({selectedCurrency.symbol})
          </h2>

          {todayPrice && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                Preço de hoje já definido: <span className="font-bold">{selectedCurrency.symbol}{todayPrice.toFixed(2)}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="price" className="text-foreground/80 text-sm mb-2 block">
                Preço de 1000 moedas
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {selectedCurrency.symbol}
                </span>
                <Input
                  id="price"
                  type="text"
                  placeholder="60.20"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={handlePriceSubmit} disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Salvando..." : todayPrice ? "Atualizar Preço" : "Confirmar Preço"}
              </Button>
            </div>
          </div>
        </div>

        {/* Visitors Section */}
        <div className="card-glass rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Visitantes do Sistema ({visitors.length})
            </h2>
            
            {visitors.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <Download className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            )}
          </div>

          {visitors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum visitante registrado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Cálculos</TableHead>
                    <TableHead>Total Buscado</TableHead>
                    <TableHead>Primeira Ação</TableHead>
                    <TableHead>Última Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => (
                    <>
                      <TableRow 
                        key={visitor.ip_address}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => toggleVisitorHistory(visitor.ip_address, visitor.device_id)}
                      >
                        <TableCell>
                          {expandedVisitor === visitor.ip_address ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {visitor.ip_address || 'N/A'}
                        </TableCell>
                        <TableCell>{visitor.total_calculations}</TableCell>
                        <TableCell className="font-medium">
                          {selectedCurrency.symbol}{Number(visitor.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {visitor.first_calculation ? formatDate(visitor.first_calculation) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {visitor.last_calculation ? formatDate(visitor.last_calculation) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded History */}
                      {expandedVisitor === visitor.ip_address && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-accent/20 p-0">
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                                <History className="w-4 h-4" />
                                Histórico de Níveis Buscados
                              </div>
                              
                              {visitorHistory[visitor.ip_address] ? (
                                visitorHistory[visitor.ip_address].length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {visitorHistory[visitor.ip_address].map((calc) => (
                                      <div 
                                        key={calc.id}
                                        className="bg-background/50 rounded-lg p-3 text-sm"
                                      >
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="font-medium">
                                            Nível {calc.current_level} → {calc.target_level}
                                          </span>
                                          <span className="text-primary font-bold">
                                            {selectedCurrency.symbol}{Number(calc.amount_calculated).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                          </span>
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                          {Number(calc.points_needed).toLocaleString('pt-BR')} pontos • {formatDate(calc.created_at)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground text-sm">Nenhum histórico encontrado.</p>
                                )
                              ) : (
                                <p className="text-muted-foreground text-sm">Carregando...</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Admin;