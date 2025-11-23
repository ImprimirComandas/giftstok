import { motion } from "framer-motion";
import { TrendingUp, Target, Zap, Trophy, DollarSign, Award } from "lucide-react";
import {
  getNivelAtual,
  getPontosParaProximoNivel,
  getReaisParaProximoNivel,
  getGastoTotal,
  getPontosParaNivel50,
  getReaisParaNivel50,
  getProgressoNivel,
  formatCurrency,
  formatNumber,
} from "@/utils/calculations";
import { Progress } from "@/components/ui/progress";

interface StatsCardsProps {
  pontos: number;
}

export const StatsCards = ({ pontos }: StatsCardsProps) => {
  const nivelAtual = getNivelAtual(pontos);
  const pontosProximo = getPontosParaProximoNivel(pontos);
  const reaisProximo = getReaisParaProximoNivel(pontos);
  const gastoTotal = getGastoTotal(pontos);
  const pontos50 = getPontosParaNivel50(pontos);
  const reais50 = getReaisParaNivel50(pontos);
  const progresso = getProgressoNivel(pontos);

  const cards = [
    {
      icon: Trophy,
      title: "Nível Atual",
      value: nivelAtual.toString(),
      subtitle: `${formatNumber(pontos)} pontos`,
      color: "text-neon-cyan",
      glow: "glow-cyan",
    },
    {
      icon: DollarSign,
      title: "Gasto Total",
      value: formatCurrency(gastoTotal),
      subtitle: "investido em presentes",
      color: "text-neon-pink",
      glow: "glow-pink",
    },
    {
      icon: Target,
      title: "Próximo Nível",
      value: formatNumber(pontosProximo),
      subtitle: `${formatCurrency(reaisProximo)} faltam`,
      color: "text-neon-purple",
      glow: "glow-purple",
    },
    {
      icon: Zap,
      title: "Progresso do Nível",
      value: `${progresso.toFixed(1)}%`,
      subtitle: "completado",
      color: "text-neon-blue",
      progress: progresso,
    },
    {
      icon: Award,
      title: "Até o Nível 50",
      value: formatNumber(pontos50),
      subtitle: `${formatCurrency(reais50)} faltam`,
      color: "text-neon-cyan",
      glow: "glow-cyan",
    },
    {
      icon: TrendingUp,
      title: "Status",
      value: nivelAtual >= 40 ? "Elite" : nivelAtual >= 25 ? "Avançado" : "Em Progresso",
      subtitle: "classificação",
      color: "text-neon-pink",
      glow: "glow-pink",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card-glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <card.icon className={`w-8 h-8 ${card.color} ${card.glow}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {card.title}
              </span>
            </div>
            
            <div className="space-y-2">
              <h3 className={`text-3xl font-bold ${card.color}`}>
                {card.value}
              </h3>
              <p className="text-sm text-muted-foreground">{card.subtitle}</p>
              
              {card.progress !== undefined && (
                <div className="pt-2">
                  <Progress 
                    value={card.progress} 
                    className="h-2 bg-muted"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
