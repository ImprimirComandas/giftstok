import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator as CalcIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./StatsCards";
import { LevelsTable } from "./LevelsTable";
import { formatNumber, getNivelAtual } from "@/utils/calculations";
import { CURRENCIES, Currency, LEVELS } from "@/constants/levels";
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

export const Calculator = () => {
  const [pontos, setPontos] = useState<string>("");
  const [pontosCalculados, setPontosCalculados] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);

  const handleCalculate = async () => {
    const pontosNum = parseInt(pontos.replace(/\D/g, ""));
    if (!isNaN(pontosNum) && pontosNum > 0) {
      setPontosCalculados(pontosNum);
      
      // Save calculation to database
      try {
        const deviceId = getDeviceId();
        const currentLevel = getNivelAtual(pontosNum);
        const targetLevel = LEVELS[LEVELS.length - 1].nivel; // Level 50
        const currentLevelData = LEVELS.find(l => l.nivel === currentLevel);
        const pointsNeeded = currentLevelData ? LEVELS[LEVELS.length - 1].fim - pontosNum : 0;
        const amountCalculated = pointsNeeded * selectedCurrency.costPerPoint;
        
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
        // Don't show error to user, as this is a background operation
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
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Quantos pontos você possui?
                </label>
                <Input
                  type="text"
                  value={pontos ? formatNumber(parseInt(pontos)) : ""}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: 37918"
                  className="text-center text-xl h-12 bg-background/50 border-neon-cyan/30 focus:border-neon-cyan transition-all mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">
                  Selecione a moeda
                </label>
                <Select
                  value={selectedCurrency.code}
                  onValueChange={(value) => {
                    const currency = CURRENCIES.find(c => c.code === value);
                    if (currency) setSelectedCurrency(currency);
                  }}
                >
                  <SelectTrigger className="h-12 bg-background/50 border-neon-purple/30 focus:border-neon-purple mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              onClick={handleCalculate}
              className="w-full h-12 text-base font-bold bg-neon-pink hover:bg-neon-pink/90 text-white rounded-xl shadow-lg hover:shadow-neon-pink/50 transition-all duration-300 hover:scale-105"
            >
              Calcular
            </Button>
          </div>
        </motion.div>

        {pontosCalculados !== null && (
          <StatsCards pontos={pontosCalculados} currency={selectedCurrency} />
        )}

        <LevelsTable pontosUsuario={pontosCalculados || undefined} currency={selectedCurrency} />
      </div>
    </div>
  );
};
