import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator as CalcIcon, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./StatsCards";
import { LevelsTable } from "./LevelsTable";
import { CoinPriceChart } from "./CoinPriceChart";
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

export const Calculator = () => {
  const [pontos, setPontos] = useState<string>("");
  const [pontosCalculados, setPontosCalculados] = useState<number | null>(null);
  const [pricePer1000, setPricePer1000] = useState<string>(DEFAULT_PRICE_PER_1000.toString());
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [priceSubmitted, setPriceSubmitted] = useState(false);

  // Calculate dynamic cost per point based on user input
  const getDynamicCurrency = (): Currency => {
    const price = parseFloat(pricePer1000) || DEFAULT_PRICE_PER_1000;
    return {
      ...selectedCurrency,
      costPerPoint: price / 1000,
    };
  };

  const handlePriceSubmit = async () => {
    const price = parseFloat(pricePer1000);
    if (isNaN(price) || price <= 0) {
      toast.error("Por favor, insira um valor válido para o preço de 1000 moedas.");
      return;
    }

    // Save the price to database
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
      } else {
        toast.success("Preço registrado com sucesso!");
      }
    } catch (error) {
      console.error('Error saving coin price:', error);
    }

    setPriceSubmitted(true);
  };

  const handleCalculate = async () => {
    if (!priceSubmitted) {
      toast.error("Por favor, primeiro confirme o preço atual de 1000 moedas.");
      return;
    }

    const pontosNum = parseInt(pontos.replace(/\D/g, ""));
    if (!isNaN(pontosNum) && pontosNum > 0) {
      setPontosCalculados(pontosNum);
      
      // Save calculation to database
      try {
        const deviceId = getDeviceId();
        const currentLevel = getNivelAtual(pontosNum);
        const targetLevel = LEVELS[LEVELS.length - 1].nivel;
        const currentLevelData = LEVELS.find(l => l.nivel === currentLevel);
        const pointsNeeded = currentLevelData ? LEVELS[LEVELS.length - 1].fim - pontosNum : 0;
        const dynamicCurrency = getDynamicCurrency();
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
    setPriceSubmitted(false);
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
          <div className="space-y-4">
            {/* Step 1: Price Input */}
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
              <Button
                onClick={handlePriceSubmit}
                disabled={priceSubmitted}
                className={`w-full mt-3 h-10 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  priceSubmitted
                    ? "bg-green-600 hover:bg-green-600 text-white"
                    : "bg-neon-purple hover:bg-neon-purple/90 text-white"
                }`}
              >
                {priceSubmitted ? "✓ Preço Confirmado" : "Confirmar Preço"}
              </Button>
            </div>

            {/* Step 2: Points Input */}
            <div className={`p-4 rounded-xl border transition-all ${
              priceSubmitted 
                ? "bg-background/30 border-neon-cyan/20" 
                : "bg-muted/10 border-muted/20 opacity-50"
            }`}>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  priceSubmitted ? "bg-neon-cyan text-white" : "bg-muted text-muted-foreground"
                }`}>2</span>
                Quantos pontos você possui?
              </label>
              <Input
                type="text"
                value={pontos ? formatNumber(parseInt(pontos)) : ""}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ex: 37918"
                disabled={!priceSubmitted}
                className="text-center text-xl h-12 bg-background/50 border-neon-cyan/30 focus:border-neon-cyan transition-all"
              />
            </div>
            
            <Button
              onClick={handleCalculate}
              disabled={!priceSubmitted}
              className="w-full h-12 text-base font-bold bg-neon-pink hover:bg-neon-pink/90 text-white rounded-xl shadow-lg hover:shadow-neon-pink/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              Calcular
            </Button>
            
            <Button
              onClick={() => window.open(TIKTOK_DISCOUNT_LINK, '_blank')}
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2 border-neon-cyan/50 hover:border-neon-cyan hover:bg-neon-cyan/10 text-neon-cyan rounded-xl transition-all duration-300 hover:scale-105"
            >
              🎁 Comprar Moedas com 25% de Desconto
            </Button>
          </div>
        </motion.div>

        {pontosCalculados !== null && (
          <StatsCards pontos={pontosCalculados} currency={getDynamicCurrency()} />
        )}

        <div className="my-8">
          <CoinPriceChart currency={selectedCurrency} />
        </div>

        <LevelsTable pontosUsuario={pontosCalculados || undefined} currency={getDynamicCurrency()} />
      </div>
    </div>
  );
};
