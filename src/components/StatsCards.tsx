import { motion } from "framer-motion";
import { Trophy, Target, Award } from "lucide-react";
import {
  getNivelAtual,
  getPontosParaProximoNivel,
  getReaisParaProximoNivel,
  getGastoTotal,
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
  const reais50 = getReaisParaNivel50(pontos);
  const progresso = getProgressoNivel(pontos);

  const cards = [
    {
      icon: Trophy,
      title: "Nível Atual",
      value: nivelAtual.toString(),
      subtitle: `Total: ${formatCurrency(gastoTotal)}`,
      detail: `${formatNumber(pontos)} pontos`,
      color: "text-neon-cyan",
      glow: "glow-cyan",
    },
    {
      icon: Target,
      title: "Próximo Nível",
      value: formatNumber(pontosProximo),
      subtitle: formatCurrency(reaisProximo),
      detail: `${progresso.toFixed(1)}% completo`,
      color: "text-neon-pink",
      glow: "glow-pink",
      progress: progresso,
    },
    {
      icon: Award,
      title: "Até Nível 50",
      value: formatCurrency(reais50),
      subtitle: nivelAtual >= 40 ? "Elite" : nivelAtual >= 25 ? "Avançado" : "Progresso",
      detail: `${50 - nivelAtual} níveis restantes`,
      color: "text-neon-purple",
      glow: "glow-purple",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card-glass rounded-xl p-4 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <card.icon className={`w-6 h-6 ${card.color} ${card.glow}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {card.title}
              </span>
            </div>
            
            <div className="space-y-1">
              <h3 className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </h3>
              <p className="text-sm font-medium text-foreground">{card.subtitle}</p>
              <p className="text-xs text-muted-foreground">{card.detail}</p>
              
              {card.progress !== undefined && (
                <div className="pt-2">
                  <Progress 
                    value={card.progress} 
                    className="h-1.5 bg-muted"
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
