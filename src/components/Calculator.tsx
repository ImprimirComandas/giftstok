import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Calculator as CalcIcon, ExternalLink, Loader2, Check, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./StatsCards";
import { LevelsTable } from "./LevelsTable";
import { formatNumber, getNivelAtual } from "@/utils/calculations";
import { CURRENCIES, Currency, LEVELS, TIKTOK_DISCOUNT_LINK, DEFAULT_PRICE_PER_1000 } from "@/constants/levels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/utils/deviceId";
import { toast } from "sonner";

// Lazy load the chart component
const CoinPriceChart = lazy(() => import("./CoinPriceChart").then(m => ({ default: m.CoinPriceChart })));

// Cache key for localStorage
const PRICE_CACHE_KEY = 'tiktok_gifter_daily_price';

interface CachedPrice {
  price: number;
  currencyCode: string;
  date: string;
}

const getCachedPrice = (currencyCode: string): number | null => {
  try {
    const cached = localStorage.getItem(PRICE_CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedPrice = JSON.parse(cached);
    const today = new Date().toISOString().split('T')[0];
    
    if (data.date === today && data.currencyCode === currencyCode) {
      return data.price;
    }
    return null;
  } catch {
    return null;
  }
};

const setCachedPrice = (price: number, currencyCode: string): void => {
  try {
    const data: CachedPrice = {
      price,
      currencyCode,
      date: new Date().toISOString().split('T')[0],
    };
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore localStorage errors
  }
};

export const Calculator = () => {
  const [pontos, setPontos] = useState<string>("");
  const [pontosCalculados, setPontosCalculados] = useState<number | null>(null);
  const [pricePer1000, setPricePer1000] = useState<string>(DEFAULT_PRICE_PER_1000.toString());
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [priceSubmitted, setPriceSubmitted] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  // Check cache first, then database
  useEffect(() => {
    const checkTodayPrice = async () => {
      setLoadingPrice(true);
      
      // Check cache first
      const cachedPrice = getCachedPrice(selectedCurrency.code);
      if (cachedPrice !== null) {
        setPricePer1000(cachedPrice.toString());
        setPriceSubmitted(true);
        setLoadingPrice(false);
        return;
      }
      
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

        const { data: prices, error } = await supabase
          .from('coin_price_history')
          .select('price_per_1000')
          .eq('currency_code', selectedCurrency.code)
          .gte('created_at', startOfDay)
          .lt('created_at', endOfDay)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error checking today price:', error);
          setLoadingPrice(false);
          return;
        }

        if (prices && prices.length > 0) {
          const latestPrice = Number(prices[0].price_per_1000);
          setPricePer1000(latestPrice.toString());
          setPriceSubmitted(true);
          setCachedPrice(latestPrice, selectedCurrency.code);
        } else {
          setPriceSubmitted(false);
        }
      } catch (error) {
        console.error('Error checking today price:', error);
      } finally {
        setLoadingPrice(false);
      }
    };

    checkTodayPrice();
  }, [selectedCurrency.code]);

  // Memoized dynamic currency
  const dynamicCurrency = useMemo((): Currency => {
    const price = parseFloat(pricePer1000) || DEFAULT_PRICE_PER_1000;
    return {
      ...selectedCurrency,
      costPerPoint: price / 1000,
    };
  }, [pricePer1000, selectedCurrency]);

  const handlePriceSubmit = async () => {
    const price = parseFloat(pricePer1000);
    if (isNaN(price) || price <= 0) {
      toast.error("Por favor, insira um valor válido para o preço de 1000 moedas.");
      return;
    }

    try {
      const deviceId = getDeviceId();
      const { error } = await supabase.functions.invoke('save-coin-price', {
        body: {
          deviceId,
          pricePerThousand: price,
          currencyCode: selectedCurrency.code,
        }
      });
      
      if (error) {
        console.error('Error saving coin price:', error);
        toast.error("Erro ao salvar preço.");
        return;
      }
      
      toast.success("Preço registrado com sucesso!");
      setCachedPrice(price, selectedCurrency.code);
      setPriceSubmitted(true);
      setIsEditingPrice(false);
    } catch (error) {
      console.error('Error saving coin price:', error);
      toast.error("Erro ao salvar preço.");
    }
  };

  const handleCalculate = async () => {
    if (!priceSubmitted) {
      toast.error("Por favor, primeiro confirme o preço atual de 1000 moedas.");
      return;
    }

    const pontosNum = parseInt(pontos.replace(/\D/g, ""));
    if (!isNaN(pontosNum) && pontosNum > 0) {
      setPontosCalculados(pontosNum);
      
      try {
        const deviceId = getDeviceId();
        const currentLevel = getNivelAtual(pontosNum);
        const targetLevel = LEVELS[LEVELS.length - 1].nivel;
        const pointsNeeded = LEVELS[LEVELS.length - 1].inicio - pontosNum;
        const amountCalculated = pointsNeeded * dynamicCurrency.costPerPoint;
        
        const { error } = await supabase.functions.invoke('save-calculation', {
          body: {
            deviceId,
            currentLevel,
            targetLevel,
            pointsNeeded,
            currencyCode: selectedCurrency.code,
            amountCalculated,
          }
        });
        
        if (error) {
          console.error('Error saving calculation:', error);
        }
      } catch (error) {
        console.error('Error saving calculation:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPontos(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCalculate();
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
    setPricePer1000(value);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <CalcIcon className="w-12 h-12 mx-auto mb-3 text-neon-cyan animate-glow" />
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Calculadora de Gifter</span>
          </h2>
          <p className="text-muted-foreground">
            Digite seus pontos para ver suas estatísticas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-glass rounded-2xl p-6 mb-8 max-w-2xl mx-auto"
        >
          {loadingPrice ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
              <span className="ml-2 text-muted-foreground">Carregando...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Price Display/Edit Section */}
              {priceSubmitted && !isEditingPrice ? (
                // Compact price badge when confirmed
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Preço do dia</p>
                      <p className="text-lg font-bold text-green-500">
                        {selectedCurrency.symbol}{parseFloat(pricePer1000).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditingPrice(true)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
              ) : (
                // Full price input when not confirmed or editing
                <div className="p-4 rounded-xl bg-background/30 border border-neon-purple/20">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <span className="bg-neon-purple text-white text-xs px-2 py-0.5 rounded-full">1</span>
                      Preço atual de 1000 moedas
                    </label>
                    <a
                      href={TIKTOK_DISCOUNT_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neon-cyan hover:underline flex items-center gap-1"
                    >
                      Ver preço oficial <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={pricePer1000}
                        onChange={handlePriceChange}
                        placeholder="Ex: 58.45"
                        className="text-center text-lg h-12 bg-background/50 border-neon-purple/30 focus:border-neon-purple transition-all"
                      />
                    </div>
                    <Select
                      value={selectedCurrency.code}
                      onValueChange={(value) => {
                        const currency = CURRENCIES.find(c => c.code === value);
                        if (currency) {
                          setSelectedCurrency(currency);
                          setPriceSubmitted(false);
                          setIsEditingPrice(false);
                        }
                      }}
                    >
                      <SelectTrigger className="w-32 h-12 bg-background/50 border-neon-purple/30 focus:border-neon-purple">
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
                  </div>
                  <div className="flex gap-2 mt-3">
                    {isEditingPrice && (
                      <Button
                        onClick={() => setIsEditingPrice(false)}
                        variant="outline"
                        className="flex-1 h-10 text-sm font-semibold rounded-xl"
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      onClick={handlePriceSubmit}
                      className={`h-10 text-sm font-semibold rounded-xl bg-neon-purple hover:bg-neon-purple/90 text-white ${isEditingPrice ? 'flex-1' : 'w-full'}`}
                    >
                      Confirmar Preço
                    </Button>
                  </div>
                </div>
              )}

              {/* Points Input - Only show when price is confirmed */}
              {priceSubmitted && !isEditingPrice && (
                <>
                  <div className="p-4 rounded-xl bg-background/30 border border-neon-cyan/20">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                      <span className="bg-neon-cyan text-white text-xs px-2 py-0.5 rounded-full">2</span>
                      Quantos pontos você possui?
                    </label>
                    <Input
                      type="text"
                      value={pontos ? formatNumber(parseInt(pontos)) : ""}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Ex: 37918"
                      className="text-center text-xl h-12 bg-background/50 border-neon-cyan/30 focus:border-neon-cyan transition-all"
                    />
                  </div>
                  
                  <Button
                    onClick={handleCalculate}
                    className="w-full h-12 text-base font-bold bg-neon-pink hover:bg-neon-pink/90 text-white rounded-xl shadow-lg hover:shadow-neon-pink/50 transition-all duration-300 hover:scale-105"
                  >
                    Calcular
                  </Button>
                </>
              )}
              
              <Button
                onClick={() => window.open(TIKTOK_DISCOUNT_LINK, '_blank')}
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-neon-cyan/50 hover:border-neon-cyan hover:bg-neon-cyan/10 text-neon-cyan rounded-xl transition-all duration-300 hover:scale-105"
              >
                🎁 Comprar Moedas com 25% de Desconto
              </Button>
            </div>
          )}
        </motion.div>

        {pontosCalculados !== null && (
          <StatsCards pontos={pontosCalculados} currency={dynamicCurrency} />
        )}

        <div className="my-8">
          <Suspense fallback={
            <div className="card-glass rounded-2xl p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          }>
            <CoinPriceChart currency={selectedCurrency} />
          </Suspense>
        </div>

        <LevelsTable pontosUsuario={pontosCalculados || undefined} currency={dynamicCurrency} />
      </div>
    </div>
  );
};
