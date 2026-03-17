import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Gift, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./StatsCards";
import { LevelsTable } from "./LevelsTable";
import { formatNumber, getNivelAtual } from "@/utils/calculations";
import { CURRENCIES, Currency, LEVELS, TIKTOK_DISCOUNT_LINK, DEFAULT_PRICE_PER_1000 } from "@/constants/levels";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/utils/deviceId";
import { toast } from "sonner";

const CoinPriceChart = lazy(() => import("./CoinPriceChart").then(m => ({ default: m.CoinPriceChart })));

const PRICE_CACHE_KEY = 'tiktok_gifter_daily_price';

interface CachedPrice { price: number; currencyCode: string; date: string; }

const getCachedPrice = (currencyCode: string): number | null => {
  try {
    const cached = localStorage.getItem(PRICE_CACHE_KEY);
    if (!cached) return null;
    const data: CachedPrice = JSON.parse(cached);
    const today = new Date().toISOString().split('T')[0];
    if (data.date === today && data.currencyCode === currencyCode) return data.price;
    return null;
  } catch { return null; }
};

const setCachedPrice = (price: number, currencyCode: string): void => {
  try {
    const data: CachedPrice = { price, currencyCode, date: new Date().toISOString().split('T')[0] };
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(data));
  } catch {}
};

interface CalculatorProps {
  activeTab: "calc" | "levels" | "chart";
}

export const Calculator = ({ activeTab }: CalculatorProps) => {
  const [pontos, setPontos] = useState<string>("");
  const [pontosCalculados, setPontosCalculados] = useState<number | null>(null);
  const [pricePer1000, setPricePer1000] = useState<string>(DEFAULT_PRICE_PER_1000.toString());
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [priceAvailable, setPriceAvailable] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(true);

  useEffect(() => {
    const checkTodayPrice = async () => {
      setLoadingPrice(true);
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
        if (error) { setLoadingPrice(false); return; }
        if (prices && prices.length > 0) {
          const latestPrice = Number(prices[0].price_per_1000);
          setPricePer1000(latestPrice.toString());
          setPriceAvailable(true);
          setCachedPrice(latestPrice, selectedCurrency.code);
        } else {
          setPriceAvailable(false);
        }
      } catch (e) {
        console.error('Error:', e);
      } finally {
        setLoadingPrice(false);
      }
    };
    checkTodayPrice();
  }, [selectedCurrency.code]);

  const dynamicCurrency = useMemo((): Currency => {
    const price = parseFloat(pricePer1000) || DEFAULT_PRICE_PER_1000;
    return { ...selectedCurrency, costPerPoint: price / 1000 };
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
        await supabase.functions.invoke('save-calculation', {
          body: { deviceId, currentLevel, targetLevel, pointsNeeded, currencyCode: selectedCurrency.code, amountCalculated, userPoints: pontosNum },
        });
      } catch (e) { console.error('Error:', e); }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPontos(e.target.value.replace(/\D/g, ""));
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {activeTab === "calc" && (
          <motion.div
            key="calc"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Price + Currency */}
            {loadingPrice ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="card-glass rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-0.5">Preço de 1000 moedas</p>
                      {priceAvailable ? (
                        <span className="text-lg font-bold text-primary">
                          {selectedCurrency.symbol}{parseFloat(pricePer1000).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Aguardando atualização
                        </span>
                      )}
                    </div>
                    <Select
                      value={selectedCurrency.code}
                      onValueChange={(value) => {
                        const c = CURRENCIES.find(c => c.code === value);
                        if (c) setSelectedCurrency(c);
                      }}
                    >
                      <SelectTrigger className="w-24 h-9 bg-background/50 border-border text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.symbol} {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Points Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Quantos pontos você possui?</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={pontos ? formatNumber(parseInt(pontos)) : ""}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                    placeholder="Ex: 37.918"
                    className="text-center text-xl h-14 bg-card border-border focus:border-primary rounded-xl touch-target"
                  />
                  <Button
                    onClick={handleCalculate}
                    disabled={!priceAvailable || !pontos}
                    className="w-full h-12 text-base font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl touch-target transition-transform active:scale-[0.98]"
                  >
                    Calcular
                  </Button>
                  <button
                    onClick={() => window.open(TIKTOK_DISCOUNT_LINK, '_blank')}
                    className="w-full flex items-center justify-center gap-2 text-xs text-primary/80 hover:text-primary py-2 touch-target"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    Comprar moedas com 25% de desconto
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}

            {/* Stats */}
            {pontosCalculados !== null && (
              <StatsCards pontos={pontosCalculados} currency={dynamicCurrency} />
            )}
          </motion.div>
        )}

        {activeTab === "levels" && (
          <motion.div
            key="levels"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <LevelsTable pontosUsuario={pontosCalculados ?? undefined} currency={dynamicCurrency} />
          </motion.div>
        )}

        {activeTab === "chart" && (
          <motion.div
            key="chart"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <Suspense fallback={
              <div className="card-glass rounded-xl p-4">
                <div className="animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/3 mb-3"></div>
                  <div className="h-48 bg-muted rounded"></div>
                </div>
              </div>
            }>
              <CoinPriceChart currency={selectedCurrency} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
