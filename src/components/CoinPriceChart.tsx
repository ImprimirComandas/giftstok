import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Currency } from "@/constants/levels";
import { createChart, IChartApi, Time, LineSeries } from "lightweight-charts";

interface CoinPriceChartProps {
  currency: Currency;
}

interface DailyPriceData {
  time: Time;
  value: number;
}

export const CoinPriceChart = ({ currency }: CoinPriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [data, setData] = useState<DailyPriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<{ icon: typeof TrendingUp; color: string; text: string } | null>(null);

  useEffect(() => {
    fetchPriceData();
  }, [currency.code]);

  const fetchPriceData = async () => {
    setLoading(true);
    try {
      const { data: prices, error } = await supabase
        .from('coin_price_history')
        .select('*')
        .eq('currency_code', currency.code)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching prices:', error);
        setData([]);
        return;
      }

      if (!prices || prices.length === 0) {
        setData([]);
        return;
      }

      // Aggregate by day - use the average of all IP submissions per day
      const dailyData: Record<string, number[]> = {};
      
      prices.forEach((price) => {
        const date = new Date(price.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = [];
        }
        dailyData[date].push(Number(price.price_per_1000));
      });

      // Calculate cumulative average price (running mean)
      let cumulativeSum = 0;
      let cumulativeCount = 0;
      
      const chartData: DailyPriceData[] = Object.entries(dailyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, values]) => {
          const dailyAverage = values.reduce((a, b) => a + b, 0) / values.length;
          cumulativeSum += dailyAverage;
          cumulativeCount++;
          
          return {
            time: date as Time,
            value: cumulativeSum / cumulativeCount,
          };
        });

      setData(chartData);

      // Calculate trend
      if (chartData.length >= 2) {
        const firstValue = chartData[0].value;
        const lastValue = chartData[chartData.length - 1].value;
        const diff = ((lastValue - firstValue) / firstValue) * 100;
        
        if (diff > 0) {
          setTrend({ icon: TrendingUp, color: "text-green-500", text: `+${diff.toFixed(2)}%` });
        } else if (diff < 0) {
          setTrend({ icon: TrendingDown, color: "text-red-500", text: `${diff.toFixed(2)}%` });
        } else {
          setTrend({ icon: Minus, color: "text-muted-foreground", text: "0%" });
        }
      } else {
        setTrend(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize and update chart
  useEffect(() => {
    if (!chartContainerRef.current || loading || data.length === 0) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Create new chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 256,
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: 'rgba(34, 211, 238, 0.5)',
          labelBackgroundColor: '#22d3ee',
        },
        horzLine: {
          color: 'rgba(34, 211, 238, 0.5)',
          labelBackgroundColor: '#22d3ee',
        },
      },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: '#22d3ee',
      lineWidth: 2,
    });

    lineSeries.setData(data);
    chart.timeScale().fitContent();

    chartRef.current = chart;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, loading, currency.symbol]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass rounded-2xl p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </motion.div>
    );
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">
          <span className="gradient-text">Histórico de Preços ({currency.symbol})</span>
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum dado de preço registrado ainda.</p>
          <p className="text-sm mt-2">Os preços serão exibidos aqui conforme os usuários informarem o valor das moedas.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card-glass rounded-2xl p-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold">
          <span className="gradient-text">Preço Médio Cumulativo - 1000 Moedas ({currency.symbol})</span>
        </h3>
        {trend && (
          <div className={`flex items-center gap-2 ${trend.color}`}>
            <trend.icon className="w-5 h-5" />
            <span className="font-bold">{trend.text}</span>
          </div>
        )}
      </div>
      
      <div ref={chartContainerRef} className="h-64" />

      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-400 rounded"></div>
          <span className="text-muted-foreground">Média cumulativa de preços (1 registro por IP/dia)</span>
        </div>
      </div>
    </motion.div>
  );
};
