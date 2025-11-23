import { motion } from "framer-motion";
import { LEVELS, REAL_POR_PONTO } from "@/constants/levels";
import { formatCurrency, formatNumber } from "@/utils/calculations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LevelsTableProps {
  highlightLevel?: number;
}

export const LevelsTable = ({ highlightLevel }: LevelsTableProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="card-glass rounded-3xl p-8"
    >
      <h3 className="text-3xl font-bold mb-6 text-center">
        <span className="gradient-text">Tabela Completa de Níveis</span>
      </h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-neon-cyan font-bold">Nível</TableHead>
              <TableHead className="text-neon-cyan font-bold">Pontos Inicial</TableHead>
              <TableHead className="text-neon-cyan font-bold">Pontos Final</TableHead>
              <TableHead className="text-neon-cyan font-bold">Custo Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LEVELS.map((level) => {
              const custoInicial = level.inicio * REAL_POR_PONTO;
              const custoFinal = level.fim * REAL_POR_PONTO;
              const isHighlighted = highlightLevel === level.nivel;
              
              return (
                <TableRow
                  key={level.nivel}
                  className={`border-border transition-colors ${
                    isHighlighted
                      ? "bg-neon-cyan/10 hover:bg-neon-cyan/20"
                      : "hover:bg-muted/5"
                  }`}
                >
                  <TableCell className="font-bold">
                    <span className={isHighlighted ? "text-neon-cyan" : ""}>
                      {level.nivel}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatNumber(level.inicio)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatNumber(level.fim)}
                  </TableCell>
                  <TableCell>
                    <span className="text-neon-pink font-medium">
                      {formatCurrency(custoInicial)} - {formatCurrency(custoFinal)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};
