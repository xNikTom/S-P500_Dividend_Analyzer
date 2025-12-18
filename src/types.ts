export interface StockData {
    ticker: string;
    name: string;
    price: number;
    dividendYield: number; // 0.04 = 4%
    payoutRatio: number; // 0.60 = 60%
    consecutiveYears: number;
    peRatio: number;
    roe: number;
    debtToEquity: number;
    low52: number;
    high52: number;
    sector: string;
    dividendGrowth5Y: number; // 0.05 = 5% growth
    description: string;
    lastUpdated: string;
}

export interface StockScores {
    overall: number; // 0-100
    dividend: number; // 0-100
    fundamentals: number; // 0-100
}

export interface AnalyzedStock extends StockData {
    scores: StockScores;
}
