import { motion } from "framer-motion";
import { Trophy, Target, Award, Sparkles } from "lucide-react";
import {
  getNivelAtual, getPontosParaProximoNivel, getReaisParaProximoNivel,
  getGastoTotal, getProximoMarco, getReaisParaMarco, getPontosParaMarco,
  getProgressoNivel, formatCurrency, formatNumber,
} from "@/utils/calculations";
import { Progress } from "@/components/ui/progress";
import { Currency } from "@/constants/levels";

interface StatsCardsProps { pontos: number; currency: Currency; }

export const StatsCards = ({ pontos, currency }: StatsCardsProps) => {
  const nivelAtual = getNivelAtual(pontos);
  const pontosProximo = getPontosParaProximoNivel(pontos);
  const reaisProximo = getReaisParaProximoNivel(pontos, currency);
  const gastoTotal = getGastoTotal(pontos, currency);
  const progresso = getProgressoNivel(pontos);
  const proximoMarco = getProximoMarco(nivelAtual);
  const reaisMarco = getReaisParaMarco(pontos, proximoMarco, currency);
  const pontosMarco = getPontosParaMarco(pontos, proximoMarco);
  const isLendario = nivelAtual >= 50;

  const cards = [
    {
      icon: Trophy, title: "Nível Atual", value: nivelAtual.toString(),
      subtitle: formatCurrency(gastoTotal, currency), detail: `${formatNumber(pontos)} pts`,
      color: "text-primary", border: "border-primary/20",
    },
    {
      icon: Target, title: "Próximo Nível",
      value: nivelAtual >= 50 ? "MAX" : formatNumber(pontosProximo),
      subtitle: nivelAtual >= 50 ? "Lendário" : formatCurrency(reaisProximo, currency),
      detail: nivelAtual >= 50 ? "Nível máximo!" : `${progresso.toFixed(0)}%`,
      color: "text-secondary", border: "border-secondary/20",
      progress: nivelAtual < 50 ? progresso : undefined,
    },
    {
      icon: isLendario ? Sparkles : Award,
      title: isLendario ? "Lendário ∞" : `Até Nv.${proximoMarco}`,
      value: isLendario ? "∞" : formatCurrency(reaisMarco, currency),
      subtitle: isLendario ? "Sem limites!" : `${formatNumber(pontosMarco)} pts`,
      detail: isLendario ? "Lendário!" : `${proximoMarco - nivelAtual} níveis`,
      color: "text-accent", border: "border-accent/20",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`card-glass rounded-xl p-3.5 border ${card.border}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <card.icon className={`w-5 h-5 shrink-0 ${card.color}`} />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{card.title}</p>
                <p className={`text-lg font-bold ${card.color} leading-tight`}>{card.value}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-foreground">{card.subtitle}</p>
              <p className="text-[10px] text-muted-foreground">{card.detail}</p>
            </div>
          </div>
          {card.progress !== undefined && (
            <Progress value={card.progress} className="h-1 mt-2 bg-muted" />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};
