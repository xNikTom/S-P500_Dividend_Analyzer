import { StockData, StockScores, AnalyzedStock } from './types';

export function calculateScores(stock: StockData): StockScores {
    // 1. Dividend Score (0-100)
    // Yield: Ideal 4-7%. Above 8% might be risky.
    let divScore = 0;
    if (stock.dividendYield >= 0.04) {
        divScore += Math.min((stock.dividendYield / 0.06) * 40, 40); // Max 40 pts for yield
    }

    // Payout Ratio: Ideal < 60%
    if (stock.payoutRatio < 0.6) divScore += 30;
    else if (stock.payoutRatio < 0.8) divScore += 15;

    // Consecutive Years: > 10 is good, > 25 (Dividend Aristocrat) is great
    if (stock.consecutiveYears >= 25) divScore += 30;
    else if (stock.consecutiveYears >= 10) divScore += 15;
    else divScore += 5;

    // 2. Fundamental Score (0-100)
    let fundScore = 0;
    // P/E Ratio: Ideal < 20
    if (stock.peRatio < 15) fundScore += 35;
    else if (stock.peRatio < 25) fundScore += 20;

    // ROE: Ideal > 15%
    if (stock.roe >= 0.15) fundScore += 35;
    else if (stock.roe >= 0.10) fundScore += 20;

    // Debt to Equity: Ideal < 1.0
    if (stock.debtToEquity < 1) fundScore += 30;
    else if (stock.debtToEquity < 2) fundScore += 15;

    // 3. Overall Score (Weighted)
    const overall = Math.round((divScore * 0.6) + (fundScore * 0.4));

    return {
        overall,
        dividend: Math.round(divScore),
        fundamentals: Math.round(fundScore)
    };
}

export function sortStocks(stocks: AnalyzedStock[]): AnalyzedStock[] {
    return [...stocks].sort((a, b) => b.scores.overall - a.scores.overall);
}
