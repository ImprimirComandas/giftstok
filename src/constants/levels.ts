export interface Level {
  nivel: number;
  inicio: number;
  fim: number;
}

export const LEVELS: Level[] = [
  { nivel: 1, inicio: 1, fim: 7 },
  { nivel: 2, inicio: 8, fim: 17 },
  { nivel: 3, inicio: 18, fim: 33 },
  { nivel: 4, inicio: 34, fim: 55 },
  { nivel: 5, inicio: 56, fim: 85 },
  { nivel: 6, inicio: 86, fim: 125 },
  { nivel: 7, inicio: 126, fim: 177 },
  { nivel: 8, inicio: 178, fim: 243 },
  { nivel: 9, inicio: 244, fim: 325 },
  { nivel: 10, inicio: 326, fim: 449 },
  { nivel: 11, inicio: 450, fim: 619 },
  { nivel: 12, inicio: 620, fim: 849 },
  { nivel: 13, inicio: 850, fim: 1169 },
  { nivel: 14, inicio: 1170, fim: 1609 },
  { nivel: 15, inicio: 1610, fim: 2219 },
  { nivel: 16, inicio: 2220, fim: 3059 },
  { nivel: 17, inicio: 3060, fim: 4219 },
  { nivel: 18, inicio: 4220, fim: 5819 },
  { nivel: 19, inicio: 5820, fim: 30799 },
  { nivel: 20, inicio: 30800, fim: 39599 },
  { nivel: 21, inicio: 39600, fim: 54199 },
  { nivel: 22, inicio: 54200, fim: 78999 },
  { nivel: 23, inicio: 79000, fim: 115199 },
  { nivel: 24, inicio: 115200, fim: 168099 },
  { nivel: 25, inicio: 168100, fim: 245399 },
  { nivel: 26, inicio: 245400, fim: 358199 },
  { nivel: 27, inicio: 358200, fim: 522899 },
  { nivel: 28, inicio: 522900, fim: 763399 },
  { nivel: 29, inicio: 763400, fim: 1114799 },
  { nivel: 30, inicio: 1114800, fim: 1627199 },
  { nivel: 31, inicio: 1627200, fim: 2375699 },
  { nivel: 32, inicio: 2375700, fim: 3469299 },
  { nivel: 33, inicio: 3469300, fim: 5064099 },
  { nivel: 34, inicio: 5064100, fim: 7394399 },
  { nivel: 35, inicio: 7394400, fim: 10796999 },
  { nivel: 36, inicio: 10797000, fim: 15766999 },
  { nivel: 37, inicio: 15767000, fim: 23022499 },
  { nivel: 38, inicio: 23022500, fim: 33632899 },
  { nivel: 39, inicio: 33632900, fim: 49123999 },
  { nivel: 40, inicio: 49124000, fim: 71730999 },
  { nivel: 41, inicio: 71731000, fim: 104778999 },
  { nivel: 42, inicio: 104779000, fim: 153054999 },
  { nivel: 43, inicio: 153055000, fim: 223630999 },
  { nivel: 44, inicio: 223631000, fim: 326615999 },
  { nivel: 45, inicio: 326616000, fim: 477300999 },
  { nivel: 46, inicio: 477301000, fim: 697474999 },
  { nivel: 47, inicio: 697475000, fim: 1019248999 },
  { nivel: 48, inicio: 1019249000, fim: 1489113999 },
  { nivel: 49, inicio: 1489114000, fim: 2176816999 },
  { nivel: 50, inicio: 2176817000, fim: 3000000000 },
];

export const MOEDAS_POR_REAL = 700 / 36.05;
export const REAL_POR_PONTO = 0.0515;

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  costPerPoint: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', costPerPoint: 0.0515 },
  { code: 'USD', symbol: '$', name: 'Dólar Americano', costPerPoint: 0.01 },
  { code: 'EUR', symbol: '€', name: 'Euro', costPerPoint: 0.0095 },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina', costPerPoint: 0.008 },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', costPerPoint: 10.5 },
];
