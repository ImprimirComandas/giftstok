import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Calculator as CalcIcon, ExternalLink, Loader2, AlertCircle } from "lucide-react";
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
  const [priceAvailable, setPriceAvailable] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(true);

  // Check cache first, then database
  useEffect(() => {
    const checkTodayPrice = async () => {
      setLoadingPrice(true);
      
      // Check cache first
      const cachedPrice = getCachedPrice(selectedCurrency.code);
      if (cachedPrice !== null) {
        setPricePer1000(cachedPrice.toString());
        setPriceAvailable(true);
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
          setPriceAvailable(true);
          setCachedPrice(latestPrice, selectedCurrency.code);
        } else {
          setPriceAvailable(false);
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

  const handleCalculate = async () => {
    if (!priceAvailable) {
      toast.error("Aguarde o administrador definir o preço do dia.");
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
            userPoints: pontosNum,
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
              {/* Price Display Section (Read-only) */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Preço de 1000 moedas:</span>
                    {priceAvailable ? (
                      <span className="text-lg font-bold text-primary">
                        {selectedCurrency.symbol}{parseFloat(pricePer1000).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-yellow-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Aguardando atualização (14h)
                      </span>
                    )}
                  </div>
                </div>
                <Select
                  value={selectedCurrency.code}
                  onValueChange={(value) => {
                    const currency = CURRENCIES.find(c => c.code === value);
                    if (currency) {
                      setSelectedCurrency(currency);
                    }
                  }}
                >
                  <SelectTrigger className="w-28 h-9 bg-background/50 border-primary/30">
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

              {/* Points Input */}
              <div className="p-4 rounded-xl bg-background/30 border border-neon-cyan/20">
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
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
                disabled={!priceAvailable}
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

        {/* LevelsTable only shows after user enters points */}
        {pontosCalculados !== null && (
          <LevelsTable pontosUsuario={pontosCalculados} currency={dynamicCurrency} />
        )}
      </div>
    </div>
  );
};
