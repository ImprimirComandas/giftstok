import { motion } from "framer-motion";
import { Trophy, Target, Award, Sparkles } from "lucide-react";
import {
  getNivelAtual,
  getPontosParaProximoNivel,
  getReaisParaProximoNivel,
  getGastoTotal,
  getProximoMarco,
  getReaisParaMarco,
  getPontosParaMarco,
  getProgressoNivel,
  formatCurrency,
  formatNumber,
} from "@/utils/calculations";
import { Progress } from "@/components/ui/progress";
import { Currency } from "@/constants/levels";

interface StatsCardsProps {
  pontos: number;
  currency: Currency;
}

export const StatsCards = ({ pontos, currency }: StatsCardsProps) => {
  const nivelAtual = getNivelAtual(pontos);
  const pontosProximo = getPontosParaProximoNivel(pontos);
  const reaisProximo = getReaisParaProximoNivel(pontos, currency);
  const gastoTotal = getGastoTotal(pontos, currency);
  const progresso = getProgressoNivel(pontos);
  
  // Calcula próximo marco
  const proximoMarco = getProximoMarco(nivelAtual);
  const reaisMarco = getReaisParaMarco(pontos, proximoMarco, currency);
  const pontosMarco = getPontosParaMarco(pontos, proximoMarco);
  const isLendario = nivelAtual >= 50;

  const cards = [
    {
      icon: Trophy,
      title: "Nível Atual",
      value: nivelAtual.toString(),
      subtitle: `Total: ${formatCurrency(gastoTotal, currency)}`,
      detail: `${formatNumber(pontos)} pontos`,
      color: "text-neon-cyan",
      glow: "glow-cyan",
    },
    {
      icon: Target,
      title: "Próximo Nível",
      value: nivelAtual >= 50 ? "∞" : formatNumber(pontosProximo),
      subtitle: nivelAtual >= 50 ? "Lendário" : formatCurrency(reaisProximo, currency),
      detail: nivelAtual >= 50 ? "Nível máximo atingido!" : `${progresso.toFixed(1)}% completo`,
      color: "text-neon-pink",
      glow: "glow-pink",
      progress: nivelAtual < 50 ? progresso : undefined,
    },
    {
      icon: isLendario ? Sparkles : Award,
      title: isLendario ? "Nível Lendário ∞" : `Até Nível ${proximoMarco}`,
      value: isLendario ? "∞" : formatCurrency(reaisMarco, currency),
      subtitle: isLendario ? "Sem limites!" : `${formatNumber(pontosMarco)} pontos`,
      detail: isLendario ? "Você é lendário!" : `${proximoMarco - nivelAtual} níveis restantes`,
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
