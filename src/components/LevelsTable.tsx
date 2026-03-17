import { useState } from "react";
import { motion } from "framer-motion";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { LEVELS, Currency, LEVEL_BENEFITS } from "@/constants/levels";
import { formatCurrency, formatNumber, getNivelAtual } from "@/utils/calculations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';

interface LevelsTableProps {
  pontosUsuario?: number;
  currency: Currency;
}

export const LevelsTable = ({ pontosUsuario, currency }: LevelsTableProps) => {
  const nivelUsuario = pontosUsuario ? getNivelAtual(pontosUsuario) : null;
  const [showAll, setShowAll] = useState(false);

  // Show relevant levels: nearby user level or first 10
  const visibleLevels = showAll
    ? LEVELS
    : nivelUsuario
      ? LEVELS.filter(l => Math.abs(l.nivel - nivelUsuario) <= 5)
      : LEVELS.slice(0, 10);

  const exportToExcel = () => {
    const costPerPoint = currency.costPerPoint;
    const data = LEVELS.map((level) => {
      const pontosNecessarios = level.fim - level.inicio + 1;
      const custoNivel = pontosNecessarios * costPerPoint;
      const benefits = LEVEL_BENEFITS[level.nivel];
      return {
        "Nível": level.nivel,
        "Distintivo": benefits?.badge || "-",
        "Pontos Inicial": level.inicio,
        "Pontos Final": level.fim === Infinity ? "∞" : level.fim,
        "Pontos do Nível": level.fim === Infinity ? "∞" : pontosNecessarios,
        [`Custo (${currency.symbol})`]: level.fim === Infinity ? "∞" : custoNivel.toFixed(2),
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Níveis");
    XLSX.writeFile(wb, `GiftsTok_Niveis_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold gradient-text">Tabela de Níveis</h3>
        <Button onClick={exportToExcel} variant="ghost" size="sm" className="text-xs text-primary h-8 px-2">
          <Download className="w-3.5 h-3.5 mr-1" />
          Excel
        </Button>
      </div>

      {/* Mobile card list */}
      <div className="space-y-2">
        {visibleLevels.map((level) => {
          const pontosNecessarios = level.fim - level.inicio + 1;
          const custoNivel = pontosNecessarios * currency.costPerPoint;
          const isAtual = nivelUsuario === level.nivel;
          const isCompleto = nivelUsuario !== null && level.nivel < nivelUsuario;
          const benefits = LEVEL_BENEFITS[level.nivel];

          let pontosUser = 0;
          let pontosFaltantes = 0;

          if (pontosUsuario && isAtual) {
            pontosUser = pontosUsuario - level.inicio;
            pontosFaltantes = level.fim - pontosUsuario;
          } else if (pontosUsuario && !isCompleto && nivelUsuario !== null && level.nivel > nivelUsuario) {
            pontosFaltantes = level.inicio - pontosUsuario;
          }

          return (
            <motion.div
              key={level.nivel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`card-glass rounded-lg p-3 ${
                isAtual ? "border border-primary/40 bg-primary/5" :
                isCompleto ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-base font-bold ${isAtual ? "text-primary" : "text-foreground"}`}>
                    Nv.{level.nivel}
                  </span>
                  {isAtual && (
                    <Badge variant="outline" className="text-[9px] border-primary/50 text-primary h-4 px-1.5">
                      VOCÊ
                    </Badge>
                  )}
                  {benefits && (
                    <Badge className={`${benefits.badgeColor} text-white text-[9px] h-4 px-1.5`}>
                      {benefits.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-secondary font-medium">
                  {level.fim === Infinity ? "∞" : formatCurrency(custoNivel, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{formatNumber(level.inicio)} — {level.fim === Infinity ? "∞" : formatNumber(level.fim)} pts</span>
                {isAtual && pontosUsuario && (
                  <span className="text-primary font-medium">
                    Faltam {formatNumber(pontosFaltantes)} pts
                  </span>
                )}
                {!isAtual && !isCompleto && pontosUsuario && pontosFaltantes > 0 && (
                  <span className="text-accent text-[10px]">
                    +{formatNumber(pontosFaltantes)} pts
                  </span>
                )}
                {isCompleto && <span className="text-green-500 text-[10px]">✓</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAll(!showAll)}
        className="w-full text-xs text-muted-foreground h-9 touch-target"
      >
        {showAll ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
        {showAll ? "Mostrar menos" : `Ver todos os ${LEVELS.length} níveis`}
      </Button>

      {/* Legend */}
      {pontosUsuario && (
        <div className="flex gap-3 text-[10px] text-muted-foreground justify-center">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span>Atual</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Completo</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted"></span>Bloqueado</span>
        </div>
      )}
    </div>
  );
};
