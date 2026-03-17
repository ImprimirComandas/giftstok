import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Currency } from "@/constants/levels";
import { createChart, IChartApi, Time, CandlestickSeries } from "lightweight-charts";

interface CoinPriceChartProps { currency: Currency; }

interface CandleData { time: Time; open: number; high: number; low: number; close: number; }
type PeriodFilter = '7d' | '30d' | 'all';

export const CoinPriceChart = memo(({ currency }: CoinPriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [data, setData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [trend, setTrend] = useState<{ icon: typeof TrendingUp; color: string; text: string } | null>(null);

  useEffect(() => {
    const fetchPriceData = async () => {
      setLoading(true);
      try {
        let dateFilter: string | null = null;
        if (periodFilter === '7d') { const d = new Date(); d.setDate(d.getDate() - 7); dateFilter = d.toISOString(); }
        else if (periodFilter === '30d') { const d = new Date(); d.setDate(d.getDate() - 30); dateFilter = d.toISOString(); }

        let query = supabase.from('coin_price_history').select('*').eq('currency_code', currency.code).order('created_at', { ascending: true });
        if (dateFilter) query = query.gte('created_at', dateFilter);
        const { data: prices, error } = await query;
        if (error || !prices?.length) { setData([]); return; }

        const dailyData: Record<string, number[]> = {};
        prices.forEach((p) => {
          const date = new Date(p.created_at).toISOString().split('T')[0];
          if (!dailyData[date]) dailyData[date] = [];
          dailyData[date].push(Number(p.price_per_1000));
        });

        const sortedDates = Object.keys(dailyData).sort();
        let prevClose: number | null = null;
        const chartData: CandleData[] = sortedDates.map((date) => {
          const v = dailyData[date];
          const open = prevClose ?? v[0];
          const close = v[v.length - 1];
          prevClose = close;
          return { time: date as Time, open, high: Math.max(...v), low: Math.min(...v), close };
        });
        setData(chartData);

        if (chartData.length >= 2) {
          const diff = ((chartData[chartData.length - 1].close - chartData[0].close) / chartData[0].close) * 100;
          if (diff > 0) setTrend({ icon: TrendingUp, color: "text-green-500", text: `+${diff.toFixed(1)}%` });
          else if (diff < 0) setTrend({ icon: TrendingDown, color: "text-red-500", text: `${diff.toFixed(1)}%` });
          else setTrend({ icon: Minus, color: "text-muted-foreground", text: "0%" });
        } else setTrend(null);
      } catch { setData([]); }
      finally { setLoading(false); }
    };
    fetchPriceData();
  }, [currency.code, periodFilter]);

  useEffect(() => {
    if (!chartContainerRef.current || loading || !data.length) return;
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: 'transparent' }, textColor: '#a1a1aa', fontSize: 11 },
      grid: { vertLines: { color: 'rgba(255,255,255,0.06)' }, horzLines: { color: 'rgba(255,255,255,0.06)' } },
      width: chartContainerRef.current.clientWidth,
      height: 220,
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true, secondsVisible: false },
      crosshair: {
        vertLine: { color: 'rgba(34,211,238,0.4)', labelBackgroundColor: '#22d3ee' },
        horzLine: { color: 'rgba(34,211,238,0.4)', labelBackgroundColor: '#22d3ee' },
      },
      handleScroll: { vertTouchDrag: false },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', downColor: '#ef4444',
      borderUpColor: '#22c55e', borderDownColor: '#ef4444',
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    });
    series.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chartRef.current?.remove(); chartRef.current = null; };
  }, [data, loading]);

  if (loading) {
    return <div className="card-glass rounded-xl p-4"><div className="animate-pulse"><div className="h-5 bg-muted rounded w-1/3 mb-3"></div><div className="h-48 bg-muted rounded"></div></div></div>;
  }

  if (!data.length) {
    return (
      <div className="card-glass rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">Nenhum dado de preço registrado.</p>
      </div>
    );
  }

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: '7d', label: '7d' }, { id: '30d', label: '30d' }, { id: 'all', label: 'Tudo' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold gradient-text">Preço ({currency.symbol})</h3>
          <p className="text-[10px] text-muted-foreground">Atualização diária às 14h</p>
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <span className={`text-xs font-bold ${trend.color}`}>{trend.text}</span>
          )}
        </div>
      </div>

      {/* Period pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriodFilter(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap touch-target transition-colors ${
              periodFilter === p.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div ref={chartContainerRef} className="h-[220px] rounded-xl overflow-hidden" />

      <div className="flex gap-3 text-[10px] text-muted-foreground justify-center">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Alta</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Baixa</span>
      </div>
    </motion.div>
  );
});

CoinPriceChart.displayName = 'CoinPriceChart';
