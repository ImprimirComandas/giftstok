import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onStartCalculating: () => void;
}

export const Hero = ({ onStartCalculating }: HeroProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.div
            className="inline-block"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-20 h-20 mx-auto text-neon-cyan animate-glow" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="gradient-text">Quer saber</span>
            <br />
            <span className="text-foreground">o quanto você já gastou</span>
            <br />
            <span className="text-neon-pink">no TikTok?</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Calcule seu nível de gifter, gastos totais e progresso para o
            próximo nível com precisão
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="pt-4"
          >
            <Button
              size="lg"
              onClick={onStartCalculating}
              className="bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 text-lg px-12 py-6 rounded-2xl font-bold shadow-lg hover:shadow-neon-cyan/50 transition-all duration-300 hover:scale-105"
            >
              Calcular Agora
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="pt-8 text-sm text-muted-foreground"
          >
            <p>✨ Cálculo preciso baseado em faixas oficiais</p>
            <p className="mt-2">🎯 Níveis 1-50 completos</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
