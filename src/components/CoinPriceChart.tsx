import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Currency } from "@/constants/levels";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Cell,
} from "recharts";

interface OHLCData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isUp: boolean;
}

interface CoinPriceChartProps {
  currency: Currency;
}

export const CoinPriceChart = ({ currency }: CoinPriceChartProps) => {
  const [data, setData] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Group by day and calculate OHLC
      const groupedByDay: Record<string, number[]> = {};
      
      prices.forEach((price) => {
        const date = new Date(price.created_at).toLocaleDateString('pt-BR');
        if (!groupedByDay[date]) {
          groupedByDay[date] = [];
        }
        groupedByDay[date].push(Number(price.price_per_1000));
      });

      const ohlcData: OHLCData[] = Object.entries(groupedByDay).map(([date, values]) => {
        const open = values[0];
        const close = values[values.length - 1];
        const high = Math.max(...values);
        const low = Math.min(...values);
        
        return {
          date,
          open,
          high,
          low,
          close,
          isUp: close >= open,
        };
      });

      setData(ohlcData);
    } catch (error) {
      console.error('Error:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as OHLCData;
      return (
        <div className="bg-background/95 border border-border rounded-lg p-3 shadow-lg">
          <p className="font-bold text-foreground mb-2">{item.date}</p>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Abertura:</span> {currency.symbol}{item.open.toFixed(2)}</p>
            <p><span className="text-muted-foreground">Máxima:</span> <span className="text-green-500">{currency.symbol}{item.high.toFixed(2)}</span></p>
            <p><span className="text-muted-foreground">Mínima:</span> <span className="text-red-500">{currency.symbol}{item.low.toFixed(2)}</span></p>
            <p><span className="text-muted-foreground">Fechamento:</span> {currency.symbol}{item.close.toFixed(2)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom OHLC candlestick shape
  const CandlestickBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const { open, high, low, close, isUp } = payload;
    
    const color = isUp ? '#22c55e' : '#ef4444';
    const bodyTop = Math.min(open, close);
    const bodyBottom = Math.max(open, close);
    
    // Calculate positions based on price scale
    const priceRange = props.yAxis?.domain || [low, high];
    const chartHeight = props.background?.height || 200;
    const yScale = chartHeight / (priceRange[1] - priceRange[0]);
    
    const candleX = x + width / 2;
    const bodyY = y;
    const bodyHeight = Math.max(height, 2);
    
    return (
      <g>
        {/* Wick line */}
        <line
          x1={candleX}
          y1={bodyY - (high - Math.max(open, close)) * (bodyHeight / (Math.abs(close - open) || 1))}
          x2={candleX}
          y2={bodyY + bodyHeight + (Math.min(open, close) - low) * (bodyHeight / (Math.abs(close - open) || 1))}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={x + width * 0.2}
          y={bodyY}
          width={width * 0.6}
          height={bodyHeight}
          fill={isUp ? color : color}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };

  const getTrend = () => {
    if (data.length < 2) return null;
    const lastClose = data[data.length - 1].close;
    const firstClose = data[0].close;
    const diff = ((lastClose - firstClose) / firstClose) * 100;
    
    if (diff > 0) return { icon: TrendingUp, color: "text-green-500", text: `+${diff.toFixed(2)}%` };
    if (diff < 0) return { icon: TrendingDown, color: "text-red-500", text: `${diff.toFixed(2)}%` };
    return { icon: Minus, color: "text-muted-foreground", text: "0%" };
  };

  const trend = getTrend();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass rounded-2xl p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-muted rounded"></div>
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
          <span className="gradient-text">Gráfico OHLC - Preço de 1000 Moedas ({currency.symbol})</span>
        </h3>
        {trend && (
          <div className={`flex items-center gap-2 ${trend.color}`}>
            <trend.icon className="w-5 h-5" />
            <span className="font-bold">{trend.text}</span>
          </div>
        )}
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${currency.symbol}${value}`}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="high" 
              shape={<CandlestickBar />}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isUp ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-muted-foreground">Alta (fechamento ≥ abertura)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-muted-foreground">Baixa (fechamento &lt; abertura)</span>
        </div>
      </div>
    </motion.div>
  );
};
