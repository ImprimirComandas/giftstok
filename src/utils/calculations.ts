import { LEVELS, REAL_POR_PONTO, Currency } from "@/constants/levels";

// Marcos de níveis (milestones)
const MARCOS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

export function getNivelAtual(pontos: number): number {
  if (pontos <= 0) return 0;
  
  for (const level of LEVELS) {
    if (pontos >= level.inicio && pontos <= level.fim) {
      return level.nivel;
    }
  }
  
  // Se passou do último nível (lendário - infinito)
  if (pontos > LEVELS[LEVELS.length - 1].inicio) {
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

export function getReaisParaProximoNivel(pontos: number, currency?: Currency): number {
  const pontosNecessarios = getPontosParaProximoNivel(pontos);
  const costPerPoint = currency?.costPerPoint || REAL_POR_PONTO;
  return pontosNecessarios * costPerPoint;
}

export function getGastoTotal(pontos: number, currency?: Currency): number {
  const costPerPoint = currency?.costPerPoint || REAL_POR_PONTO;
  return pontos * costPerPoint;
}

// Encontra o próximo marco (milestone) baseado no nível atual
export function getProximoMarco(nivelAtual: number): number {
  for (const marco of MARCOS) {
    if (marco > nivelAtual) return marco;
  }
  return 50; // Já está no nível máximo ou além
}

// Calcula pontos necessários para atingir um marco específico
export function getPontosParaMarco(pontos: number, marco: number): number {
  const levelMarco = LEVELS.find(l => l.nivel === marco);
  if (!levelMarco) return 0;
  
  return Math.max(0, levelMarco.inicio - pontos);
}

// Calcula custo para atingir o próximo marco
export function getReaisParaMarco(pontos: number, marco: number, currency?: Currency): number {
  const pontosNecessarios = getPontosParaMarco(pontos, marco);
  const costPerPoint = currency?.costPerPoint || REAL_POR_PONTO;
  return pontosNecessarios * costPerPoint;
}

export function getPontosParaNivel50(pontos: number): number {
  const nivel50 = LEVELS.find(l => l.nivel === 50);
  if (!nivel50) return 0;
  
  return Math.max(0, nivel50.inicio - pontos);
}

export function getReaisParaNivel50(pontos: number, currency?: Currency): number {
  const pontosNecessarios = getPontosParaNivel50(pontos);
  const costPerPoint = currency?.costPerPoint || REAL_POR_PONTO;
  return pontosNecessarios * costPerPoint;
}

export function getProgressoNivel(pontos: number): number {
  const nivelAtual = getNivelAtual(pontos);
  const levelData = LEVELS.find(l => l.nivel === nivelAtual);
  
  if (!levelData) return 0;
  
  // Se for nível 50 (infinito), retorna 100%
  if (nivelAtual === 50) return 100;
  
  const pontosNoNivel = pontos - levelData.inicio;
  const totalPontosNivel = levelData.fim - levelData.inicio;
  
  if (totalPontosNivel === 0) return 100;
  
  return (pontosNoNivel / totalPontosNivel) * 100;
}

export function formatCurrency(value: number, currency?: Currency): string {
  const currencyCode = currency?.code || 'BRL';
  const locale = currencyCode === 'BRL' ? 'pt-BR' : currencyCode === 'EUR' ? 'de-DE' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
