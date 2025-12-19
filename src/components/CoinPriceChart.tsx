import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Currency } from "@/constants/levels";
import { createChart, IChartApi, Time, CandlestickSeries } from "lightweight-charts";

interface CoinPriceChartProps {
  currency: Currency;
}

interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const CoinPriceChart = memo(({ currency }: CoinPriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [data, setData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<{ icon: typeof TrendingUp; color: string; text: string } | null>(null);
  const [tooltipData, setTooltipData] = useState<{ visible: boolean; x: number; y: number; data: CandleData | null }>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });

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

      // Aggregate by day - calculate OHLC for each day
      const dailyData: Record<string, number[]> = {};
      
      prices.forEach((price) => {
        const date = new Date(price.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = [];
        }
        dailyData[date].push(Number(price.price_per_1000));
      });

      // Create candlestick data with OHLC values
      // Open = previous day's close (or first value if no previous day)
      const sortedDates = Object.keys(dailyData).sort((a, b) => a.localeCompare(b));
      let previousClose: number | null = null;
      
      const chartData: CandleData[] = sortedDates.map((date) => {
        const values = dailyData[date];
        const high = Math.max(...values);
        const low = Math.min(...values);
        const close = values[values.length - 1]; // Last value of the day
        // Open = previous day's close, or first value if no previous day
        const open = previousClose !== null ? previousClose : values[0];
        
        previousClose = close; // Store for next day
        
        return {
          time: date as Time,
          open,
          high,
          low,
          close,
        };
      });

      setData(chartData);

      // Calculate trend based on first and last close
      if (chartData.length >= 2) {
        const firstClose = chartData[0].close;
        const lastClose = chartData[chartData.length - 1].close;
        const diff = ((lastClose - firstClose) / firstClose) * 100;
        
        if (diff > 0) {
          setTrend({ icon: TrendingUp, color: "text-green-500", text: `+${diff.toFixed(2)}%` });
        } else if (diff < 0) {
          setTrend({ icon: TrendingDown, color: "text-red-500", text: `${diff.toFixed(2)}%` });
        } else {
          setTrend({ icon: Minus, color: "text-muted-foreground", text: "0%" });
        }
      } else if (chartData.length === 1) {
        setTrend({ icon: Minus, color: "text-muted-foreground", text: `${currency.symbol}${chartData[0].close.toFixed(2)}` });
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

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    // Subscribe to crosshair move for tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point || !chartContainerRef.current) {
        setTooltipData(prev => ({ ...prev, visible: false }));
        return;
      }

      const candleData = param.seriesData.get(candlestickSeries) as CandleData | undefined;
      if (candleData) {
        const containerRect = chartContainerRef.current.getBoundingClientRect();
        setTooltipData({
          visible: true,
          x: param.point.x,
          y: param.point.y,
          data: candleData,
        });
      }
    });

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
  }, [data, loading]);

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
        <div>
          <h3 className="text-xl font-bold">
            <span className="gradient-text">Preço de 1000 Moedas ({currency.symbol})</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            📅 Atualização diária às 14h por um administrador
          </p>
        </div>
        {trend && (
          <div className={`flex items-center gap-2 ${trend.color}`}>
            <trend.icon className="w-5 h-5" />
            <span className="font-bold">{trend.text}</span>
          </div>
        )}
      </div>
      
      <div ref={chartContainerRef} className="h-64 relative">
        {/* Tooltip */}
        {tooltipData.visible && tooltipData.data && (
          <div
            className="absolute z-10 bg-background/95 border border-border rounded-lg p-3 shadow-lg pointer-events-none"
            style={{
              left: tooltipData.x > 200 ? tooltipData.x - 140 : tooltipData.x + 10,
              top: tooltipData.y > 150 ? tooltipData.y - 100 : tooltipData.y + 10,
            }}
          >
            <div className="text-xs text-muted-foreground mb-2">{tooltipData.data.time as string}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Abertura:</span>
              <span className="font-medium">{currency.symbol}{tooltipData.data.open.toFixed(2)}</span>
              <span className="text-muted-foreground">Máxima:</span>
              <span className="font-medium text-green-500">{currency.symbol}{tooltipData.data.high.toFixed(2)}</span>
              <span className="text-muted-foreground">Mínima:</span>
              <span className="font-medium text-red-500">{currency.symbol}{tooltipData.data.low.toFixed(2)}</span>
              <span className="text-muted-foreground">Fechamento:</span>
              <span className={`font-medium ${tooltipData.data.close >= tooltipData.data.open ? 'text-green-500' : 'text-red-500'}`}>
                {currency.symbol}{tooltipData.data.close.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-muted-foreground">Alta (fechou acima da abertura)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-muted-foreground">Baixa (fechou abaixo da abertura)</span>
        </div>
      </div>
    </motion.div>
  );
});

CoinPriceChart.displayName = 'CoinPriceChart';
