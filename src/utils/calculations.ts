import { LEVELS, REAL_POR_PONTO } from "@/constants/levels";

export function getNivelAtual(pontos: number): number {
  if (pontos <= 0) return 0;
  
  for (const level of LEVELS) {
    if (pontos >= level.inicio && pontos <= level.fim) {
      return level.nivel;
    }
  }
  
  // Se passou do último nível
  if (pontos > LEVELS[LEVELS.length - 1].fim) {
    return LEVELS[LEVELS.length - 1].nivel;
  }
  
  return 0;
}

export function getPontosParaProximoNivel(pontos: number): number {
  const nivelAtual = getNivelAtual(pontos);
  
  if (nivelAtual === 0 || nivelAtual >= 50) return 0;
  
  const proximoNivel = LEVELS.find(l => l.nivel === nivelAtual + 1);
  if (!proximoNivel) return 0;
  
  return proximoNivel.inicio - pontos;
}

export function getReaisParaProximoNivel(pontos: number): number {
  const pontosNecessarios = getPontosParaProximoNivel(pontos);
  return pontosNecessarios * REAL_POR_PONTO;
}

export function getGastoTotal(pontos: number): number {
  return pontos * REAL_POR_PONTO;
}

export function getPontosParaNivel50(pontos: number): number {
  const nivel50 = LEVELS.find(l => l.nivel === 50);
  if (!nivel50) return 0;
  
  return Math.max(0, nivel50.inicio - pontos);
}

export function getReaisParaNivel50(pontos: number): number {
  const pontosNecessarios = getPontosParaNivel50(pontos);
  return pontosNecessarios * REAL_POR_PONTO;
}

export function getProgressoNivel(pontos: number): number {
  const nivelAtual = getNivelAtual(pontos);
  const levelData = LEVELS.find(l => l.nivel === nivelAtual);
  
  if (!levelData) return 0;
  
  const pontosNoNivel = pontos - levelData.inicio;
  const totalPontosNivel = levelData.fim - levelData.inicio;
  
  return (pontosNoNivel / totalPontosNivel) * 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
