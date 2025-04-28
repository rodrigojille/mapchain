export interface PropertyForecast {
  currentValue: number;
  forecastValue: number;
  growthRate: number;
  factorImpact: {
    factor: string;
    impact: number;
  }[];
}
