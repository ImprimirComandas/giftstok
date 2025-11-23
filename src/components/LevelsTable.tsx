import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { LEVELS, REAL_POR_PONTO } from "@/constants/levels";
import { formatCurrency, formatNumber, getNivelAtual } from "@/utils/calculations";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from 'xlsx';

interface LevelsTableProps {
  pontosUsuario?: number;
}

export const LevelsTable = ({ pontosUsuario }: LevelsTableProps) => {
  const nivelUsuario = pontosUsuario ? getNivelAtual(pontosUsuario) : null;

  const exportToExcel = () => {
    const data = LEVELS.map((level) => {
      const custoInicial = level.inicio * REAL_POR_PONTO;
      const custoFinal = level.fim * REAL_POR_PONTO;
      const pontosNecessarios = level.fim - level.inicio + 1;
      const custoNivel = pontosNecessarios * REAL_POR_PONTO;
      
      let statusUsuario = "";
      let pontosFaltantes = 0;
      let reaisFaltantes = 0;
      let pontosJaTem = 0;
      let reaisJaGastou = 0;
      
      if (pontosUsuario) {
        if (nivelUsuario && level.nivel === nivelUsuario) {
          statusUsuario = "✓ SEU NÍVEL ATUAL";
          pontosJaTem = pontosUsuario - level.inicio;
          reaisJaGastou = pontosJaTem * REAL_POR_PONTO;
          pontosFaltantes = level.fim - pontosUsuario;
          reaisFaltantes = pontosFaltantes * REAL_POR_PONTO;
        } else if (level.nivel < (nivelUsuario || 0)) {
          statusUsuario = "Completo";
          pontosJaTem = level.fim - level.inicio + 1;
          reaisJaGastou = pontosJaTem * REAL_POR_PONTO;
        } else if (level.nivel > (nivelUsuario || 0)) {
          statusUsuario = "Bloqueado";
          pontosFaltantes = level.inicio - (pontosUsuario || 0);
          reaisFaltantes = pontosFaltantes * REAL_POR_PONTO;
        }
      }
      
      return {
        "Nível": level.nivel,
        "Pontos Inicial": level.inicio,
        "Pontos Final": level.fim,
        "Total de Pontos do Nível": pontosNecessarios,
        "Custo Inicial (R$)": custoInicial.toFixed(2),
        "Custo Final (R$)": custoFinal.toFixed(2),
        "Custo do Nível (R$)": custoNivel.toFixed(2),
        ...(pontosUsuario ? {
          "Status": statusUsuario,
          "Pontos que Você Tem": pontosJaTem,
          "R$ Já Gastos": reaisJaGastou.toFixed(2),
          "Pontos Faltantes": pontosFaltantes,
          "R$ Faltantes": reaisFaltantes.toFixed(2),
        } : {}),
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Níveis TikTok");
    
    // Auto-ajustar largura das colunas
    const maxWidth = data.reduce((w, r) => Math.max(w, ...Object.keys(r).map(k => k.length)), 10);
    ws['!cols'] = Object.keys(data[0]).map(() => ({ wch: maxWidth }));
    
    XLSX.writeFile(wb, `TikTok_Gifter_Niveis_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="card-glass rounded-2xl p-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-2xl font-bold">
          <span className="gradient-text">Tabela Completa de Níveis</span>
        </h3>
        
        <Button
          onClick={exportToExcel}
          variant="outline"
          size="sm"
          className="bg-neon-cyan/10 border-neon-cyan/30 hover:bg-neon-cyan/20 text-neon-cyan"
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar Planilha
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-neon-cyan font-bold text-xs">Nível</TableHead>
              <TableHead className="text-neon-cyan font-bold text-xs">Pontos<br/>Inicial</TableHead>
              <TableHead className="text-neon-cyan font-bold text-xs">Pontos<br/>Final</TableHead>
              <TableHead className="text-neon-cyan font-bold text-xs">Pontos do<br/>Nível</TableHead>
              <TableHead className="text-neon-cyan font-bold text-xs">Custo do<br/>Nível</TableHead>
              {pontosUsuario && (
                <>
                  <TableHead className="text-neon-pink font-bold text-xs">Pontos que<br/>Você Tem</TableHead>
                  <TableHead className="text-neon-pink font-bold text-xs">R$ Já<br/>Gastos</TableHead>
                  <TableHead className="text-neon-purple font-bold text-xs">Pontos<br/>Faltantes</TableHead>
                  <TableHead className="text-neon-purple font-bold text-xs">R$<br/>Faltantes</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {LEVELS.map((level) => {
              const pontosNecessarios = level.fim - level.inicio + 1;
              const custoNivel = pontosNecessarios * REAL_POR_PONTO;
              const isAtual = nivelUsuario === level.nivel;
              const isCompleto = nivelUsuario && level.nivel < nivelUsuario;
              const isBloqueado = nivelUsuario && level.nivel > nivelUsuario;
              
              let pontosFaltantes = 0;
              let reaisFaltantes = 0;
              let pontosJaTem = 0;
              let reaisJaGastou = 0;
              
              if (pontosUsuario) {
                if (isAtual) {
                  pontosJaTem = pontosUsuario - level.inicio;
                  reaisJaGastou = pontosJaTem * REAL_POR_PONTO;
                  pontosFaltantes = level.fim - pontosUsuario;
                  reaisFaltantes = pontosFaltantes * REAL_POR_PONTO;
                } else if (isCompleto) {
                  pontosJaTem = pontosNecessarios;
                  reaisJaGastou = custoNivel;
                } else if (isBloqueado) {
                  pontosFaltantes = level.inicio - pontosUsuario;
                  reaisFaltantes = pontosFaltantes * REAL_POR_PONTO;
                }
              }
              
              return (
                <TableRow
                  key={level.nivel}
                  className={`border-border transition-colors text-xs ${
                    isAtual
                      ? "bg-neon-cyan/20 hover:bg-neon-cyan/30 border-l-4 border-l-neon-cyan"
                      : isCompleto
                      ? "bg-green-500/5 hover:bg-green-500/10"
                      : "hover:bg-muted/5"
                  }`}
                >
                  <TableCell className="font-bold">
                    <span className={isAtual ? "text-neon-cyan text-base" : ""}>
                      {level.nivel}
                      {isAtual && <span className="ml-2 text-[10px]">← VOCÊ</span>}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatNumber(level.inicio)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatNumber(level.fim)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatNumber(pontosNecessarios)}
                  </TableCell>
                  <TableCell className="text-neon-pink font-medium">
                    {formatCurrency(custoNivel)}
                  </TableCell>
                  {pontosUsuario && (
                    <>
                      <TableCell className={isAtual || isCompleto ? "text-neon-cyan font-medium" : "text-muted-foreground"}>
                        {pontosJaTem > 0 ? formatNumber(pontosJaTem) : "-"}
                      </TableCell>
                      <TableCell className={isAtual || isCompleto ? "text-neon-cyan font-medium" : "text-muted-foreground"}>
                        {reaisJaGastou > 0 ? formatCurrency(reaisJaGastou) : "-"}
                      </TableCell>
                      <TableCell className={isAtual || isBloqueado ? "text-neon-purple font-medium" : "text-muted-foreground"}>
                        {pontosFaltantes > 0 ? formatNumber(pontosFaltantes) : "-"}
                      </TableCell>
                      <TableCell className={isAtual || isBloqueado ? "text-neon-purple font-medium" : "text-muted-foreground"}>
                        {reaisFaltantes > 0 ? formatCurrency(reaisFaltantes) : "-"}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {pontosUsuario && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-cyan/20 border-l-4 border-l-neon-cyan"></div>
            <span className="text-muted-foreground">Seu nível atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/5"></div>
            <span className="text-muted-foreground">Níveis completos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted/5"></div>
            <span className="text-muted-foreground">Níveis bloqueados</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
