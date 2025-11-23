import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator as CalcIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./StatsCards";
import { LevelsTable } from "./LevelsTable";
import { formatNumber } from "@/utils/calculations";

export const Calculator = () => {
  const [pontos, setPontos] = useState<string>("");
  const [pontosCalculados, setPontosCalculados] = useState<number | null>(null);

  const handleCalculate = () => {
    const pontosNum = parseInt(pontos.replace(/\D/g, ""));
    if (!isNaN(pontosNum) && pontosNum > 0) {
      setPontosCalculados(pontosNum);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPontos(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCalculate();
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <CalcIcon className="w-12 h-12 mx-auto mb-3 text-neon-cyan animate-glow" />
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Calculadora de Gifter</span>
          </h2>
          <p className="text-muted-foreground">
            Digite seus pontos para ver suas estatísticas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-glass rounded-2xl p-6 mb-8 max-w-2xl mx-auto"
        >
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Quantos pontos você possui?
            </label>
            <Input
              type="text"
              value={pontos ? formatNumber(parseInt(pontos)) : ""}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ex: 37918"
              className="text-center text-xl h-12 bg-background/50 border-neon-cyan/30 focus:border-neon-cyan transition-all"
            />
            <Button
              onClick={handleCalculate}
              className="w-full h-12 text-base font-bold bg-neon-pink hover:bg-neon-pink/90 text-white rounded-xl shadow-lg hover:shadow-neon-pink/50 transition-all duration-300 hover:scale-105"
            >
              Calcular
            </Button>
          </div>
        </motion.div>

        {pontosCalculados !== null && (
          <StatsCards pontos={pontosCalculados} />
        )}

        <LevelsTable pontosUsuario={pontosCalculados || undefined} />
      </div>
    </div>
  );
};
