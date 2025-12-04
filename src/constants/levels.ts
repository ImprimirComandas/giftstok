export interface Level {
  nivel: number;
  inicio: number;
  fim: number;
}

export const LEVELS: Level[] = [
  { nivel: 0, inicio: 0, fim: 0 },
  { nivel: 1, inicio: 1, fim: 7 },
  { nivel: 2, inicio: 8, fim: 17 },
  { nivel: 3, inicio: 18, fim: 33 },
  { nivel: 4, inicio: 34, fim: 55 },
  { nivel: 5, inicio: 56, fim: 89 },
  { nivel: 6, inicio: 90, fim: 139 },
  { nivel: 7, inicio: 140, fim: 219 },
  { nivel: 8, inicio: 220, fim: 339 },
  { nivel: 9, inicio: 340, fim: 529 },
  { nivel: 10, inicio: 530, fim: 819 },
  { nivel: 11, inicio: 820, fim: 1259 },
  { nivel: 12, inicio: 1260, fim: 1919 },
  { nivel: 13, inicio: 1920, fim: 2839 },
  { nivel: 14, inicio: 2840, fim: 4339 },
  { nivel: 15, inicio: 4340, fim: 6419 },
  { nivel: 16, inicio: 6420, fim: 9279 },
  { nivel: 17, inicio: 9280, fim: 13499 },
  { nivel: 18, inicio: 13500, fim: 19399 },
  { nivel: 19, inicio: 19400, fim: 27799 },
  { nivel: 20, inicio: 27800, fim: 39599 },
  { nivel: 21, inicio: 39600, fim: 54599 },
  { nivel: 22, inicio: 54600, fim: 75799 },
  { nivel: 23, inicio: 75800, fim: 104999 },
  { nivel: 24, inicio: 105000, fim: 143999 },
  { nivel: 25, inicio: 144000, fim: 195999 },
  { nivel: 26, inicio: 196000, fim: 264999 },
  { nivel: 27, inicio: 265000, fim: 356999 },
  { nivel: 28, inicio: 357000, fim: 577999 },
  { nivel: 29, inicio: 578000, fim: 636999 },
  { nivel: 30, inicio: 637000, fim: 844999 },
  { nivel: 31, inicio: 845000, fim: 1119999 },
  { nivel: 32, inicio: 1120000, fim: 1469999 },
  { nivel: 33, inicio: 1470000, fim: 1919999 },
  { nivel: 34, inicio: 1920000, fim: 2499999 },
  { nivel: 35, inicio: 2500000, fim: 3229999 },
  { nivel: 36, inicio: 3230000, fim: 4179999 },
  { nivel: 37, inicio: 4180000, fim: 5429999 },
  { nivel: 38, inicio: 5430000, fim: 6889999 },
  { nivel: 39, inicio: 6890000, fim: 8779999 },
  { nivel: 40, inicio: 8780000, fim: 11199999 },
  { nivel: 41, inicio: 11200000, fim: 14099999 },
  { nivel: 42, inicio: 14100000, fim: 22299999 },
  { nivel: 43, inicio: 22300000, fim: 30199999 },
  { nivel: 44, inicio: 30200000, fim: 37499999 },
  { nivel: 45, inicio: 37500000, fim: 47499999 },
  { nivel: 46, inicio: 47500000, fim: 56699999 },
  { nivel: 47, inicio: 56700000, fim: 67499999 },
  { nivel: 48, inicio: 67500000, fim: 74999999 },
  { nivel: 49, inicio: 75000000, fim: 97499999 },
  { nivel: 50, inicio: 97500000, fim: 999999999999 },
];

export const DEFAULT_PRICE_PER_1000 = 58.45;
export const MOEDAS_POR_REAL = 1000 / DEFAULT_PRICE_PER_1000;
export const REAL_POR_PONTO = DEFAULT_PRICE_PER_1000 / 1000;

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  costPerPoint: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', costPerPoint: 0.05845 },
  { code: 'USD', symbol: '$', name: 'Dólar Americano', costPerPoint: 0.01 },
  { code: 'EUR', symbol: '€', name: 'Euro', costPerPoint: 0.0095 },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina', costPerPoint: 0.008 },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', costPerPoint: 10.5 },
];

export const TIKTOK_DISCOUNT_LINK = "https://www.tiktok.com/coin?rc=GCERMH3M";

export interface LevelBenefit {
  badge: string;
  badgeColor: string;
  benefits: string[];
}

export const LEVEL_BENEFITS: Record<number, LevelBenefit> = {
  0: { badge: "Iniciante", badgeColor: "bg-gray-500", benefits: ["Início da jornada"] },
  1: { badge: "Iniciante", badgeColor: "bg-gray-500", benefits: ["Distintivo básico"] },
  2: { badge: "Iniciante", badgeColor: "bg-gray-500", benefits: ["Distintivo básico"] },
  3: { badge: "Iniciante", badgeColor: "bg-gray-500", benefits: ["Distintivo básico"] },
  4: { badge: "Iniciante", badgeColor: "bg-gray-500", benefits: ["Distintivo básico"] },
  5: { badge: "Iniciante", badgeColor: "bg-gray-500", benefits: ["Distintivo básico", "Primeiro marco"] },
  6: { badge: "Básico", badgeColor: "bg-green-600", benefits: ["Distintivo verde"] },
  7: { badge: "Básico", badgeColor: "bg-green-600", benefits: ["Distintivo verde"] },
  8: { badge: "Básico", badgeColor: "bg-green-600", benefits: ["Distintivo verde"] },
  9: { badge: "Básico", badgeColor: "bg-green-600", benefits: ["Distintivo verde"] },
  10: { badge: "Básico+", badgeColor: "bg-green-500", benefits: ["Distintivo verde brilhante", "Reconhecimento inicial"] },
  11: { badge: "Bronze", badgeColor: "bg-amber-700", benefits: ["Distintivo bronze"] },
  12: { badge: "Bronze", badgeColor: "bg-amber-700", benefits: ["Distintivo bronze"] },
  13: { badge: "Bronze", badgeColor: "bg-amber-700", benefits: ["Distintivo bronze"] },
  14: { badge: "Bronze", badgeColor: "bg-amber-700", benefits: ["Distintivo bronze"] },
  15: { badge: "Bronze+", badgeColor: "bg-amber-600", benefits: ["Distintivo bronze brilhante", "Entrada animada"] },
  16: { badge: "Bronze Elite", badgeColor: "bg-amber-600", benefits: ["Distintivo bronze elite"] },
  17: { badge: "Bronze Elite", badgeColor: "bg-amber-600", benefits: ["Distintivo bronze elite"] },
  18: { badge: "Bronze Elite", badgeColor: "bg-amber-600", benefits: ["Distintivo bronze elite"] },
  19: { badge: "Bronze Elite", badgeColor: "bg-amber-600", benefits: ["Distintivo bronze elite"] },
  20: { badge: "Bronze Máster", badgeColor: "bg-amber-500", benefits: ["Distintivo bronze máster", "Efeitos especiais"] },
  21: { badge: "Prata", badgeColor: "bg-slate-400", benefits: ["Distintivo prata"] },
  22: { badge: "Prata", badgeColor: "bg-slate-400", benefits: ["Distintivo prata"] },
  23: { badge: "Prata", badgeColor: "bg-slate-400", benefits: ["Distintivo prata"] },
  24: { badge: "Prata", badgeColor: "bg-slate-400", benefits: ["Distintivo prata"] },
  25: { badge: "Prata+", badgeColor: "bg-slate-300", benefits: ["Distintivo prata brilhante", "Moldura especial"] },
  26: { badge: "Prata Elite", badgeColor: "bg-slate-300", benefits: ["Distintivo prata elite"] },
  27: { badge: "Prata Elite", badgeColor: "bg-slate-300", benefits: ["Distintivo prata elite"] },
  28: { badge: "Prata Elite", badgeColor: "bg-slate-300", benefits: ["Distintivo prata elite"] },
  29: { badge: "Prata Elite", badgeColor: "bg-slate-300", benefits: ["Distintivo prata elite"] },
  30: { badge: "Prata Máster", badgeColor: "bg-slate-200", benefits: ["Distintivo prata máster", "Animação premium"] },
  31: { badge: "Ouro", badgeColor: "bg-yellow-500", benefits: ["Distintivo ouro"] },
  32: { badge: "Ouro", badgeColor: "bg-yellow-500", benefits: ["Distintivo ouro"] },
  33: { badge: "Ouro", badgeColor: "bg-yellow-500", benefits: ["Distintivo ouro"] },
  34: { badge: "Ouro", badgeColor: "bg-yellow-500", benefits: ["Distintivo ouro"] },
  35: { badge: "Ouro+", badgeColor: "bg-yellow-400", benefits: ["Distintivo ouro brilhante", "VIP na live"] },
  36: { badge: "Ouro Elite", badgeColor: "bg-yellow-400", benefits: ["Distintivo ouro elite"] },
  37: { badge: "Ouro Elite", badgeColor: "bg-yellow-400", benefits: ["Distintivo ouro elite"] },
  38: { badge: "Ouro Elite", badgeColor: "bg-yellow-400", benefits: ["Distintivo ouro elite"] },
  39: { badge: "Ouro Elite", badgeColor: "bg-yellow-400", benefits: ["Distintivo ouro elite"] },
  40: { badge: "Ouro Máster", badgeColor: "bg-yellow-300", benefits: ["Distintivo ouro máster", "Entrada VIP"] },
  41: { badge: "Diamante", badgeColor: "bg-cyan-400", benefits: ["Distintivo diamante"] },
  42: { badge: "Diamante", badgeColor: "bg-cyan-400", benefits: ["Distintivo diamante", "Acesso prioritário"] },
  43: { badge: "Diamante+", badgeColor: "bg-cyan-300", benefits: ["Distintivo diamante brilhante"] },
  44: { badge: "Diamante Elite", badgeColor: "bg-cyan-300", benefits: ["Distintivo diamante elite"] },
  45: { badge: "Diamante Máster", badgeColor: "bg-cyan-200", benefits: ["Distintivo diamante máster", "Benefícios exclusivos"] },
  46: { badge: "Coroa", badgeColor: "bg-purple-500", benefits: ["Distintivo coroa", "Status premium"] },
  47: { badge: "Coroa+", badgeColor: "bg-purple-400", benefits: ["Distintivo coroa brilhante"] },
  48: { badge: "Coroa Elite", badgeColor: "bg-purple-300", benefits: ["Distintivo coroa elite", "Reconhecimento top"] },
  49: { badge: "Coroa Máster", badgeColor: "bg-purple-200", benefits: ["Distintivo coroa máster", "Acesso VIP total"] },
  50: { badge: "Lendário", badgeColor: "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500", benefits: ["Distintivo lendário", "Todos os benefícios", "Status máximo"] },
};
