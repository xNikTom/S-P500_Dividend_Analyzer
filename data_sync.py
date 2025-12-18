import yfinance as yf
import pandas as pd
import json
import os
from datetime import datetime

# S&P 500 Tickers (simplified list for demo, ideally fetch from live source)
SP500_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"

import requests

def get_sp500_tickers():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    print("Fetching S&P 500 list from Wikipedia...")
    try:
        response = requests.get(SP500_URL, headers=headers)
        response.raise_for_status()
        print("Wikipedia response received. Parsing HTML...")
        from io import StringIO
        tables = pd.read_html(StringIO(response.text))
        df_sp500 = tables[0]
        tickers = df_sp500['Symbol'].tolist()
        print(f"Successfully fetched {len(tickers)} tickers.")
        return tickers
    except Exception as e:
        print(f"Error fetching symbols: {e}")
        return ["VZ", "T", "PFE", "MO", "KMB", "CVX", "XOM", "IBM", "MMM", "BEN"]

def get_dividend_metrics(ticker_obj):
    try:
        # Fetching 10 years of dividend history is more reliable than ticker_obj.dividends
        hist = ticker_obj.history(period="10y")
        if 'Dividends' not in hist or hist['Dividends'].empty:
            return 0, 0.05
        
        divs = hist['Dividends']
        divs = divs[divs > 0] # Only positive dividends
        
        if divs.empty: return 0, 0.05
        
        # Resample to yearly totals (using 'YE' or 'Y')
        try:
            annual = divs.resample('YE').sum()
        except:
            annual = divs.resample('Y').sum()
            
        if len(annual) < 2: return 0, 0.05
        
        # Remove the latest year if it's the current year and incomplete
        current_year = datetime.now().year
        if annual.index[-1].year == current_year:
            annual = annual.iloc[:-1]
            
        if len(annual) < 2: return 0, 0.05
        
        # 1. 5Y CAGR
        growth_5y = 0.05
        if len(annual) >= 6:
            now = annual.iloc[-1] # Newest complete year
            past = annual.iloc[-6] # 5 years prior
            if past > 0:
                growth_5y = (now / past) ** (1/5) - 1
        
        # 2. Consecutive years of growth (Checking backwards)
        years = 0
        vals = annual.values.tolist()
        vals.reverse() 
        
        for i in range(len(vals) - 1):
            if vals[i] >= vals[i+1] * 0.98: # 2% tolerance for rounding
                years += 1
            else:
                break
        return years, growth_5y
    except Exception as e:
        print(f"Error metrics: {e}")
        return 0, 0.05

def update_data():
    tickers = get_sp500_tickers()

    results = []
    
    print(f"Analyzing {len(tickers)} stocks for >4% yield...")
    
    for i, ticker in enumerate(tickers):
        print(f"[{i}/{len(tickers)}] Checking {ticker}...")
            
        try:
            ticker = ticker.replace('.', '-') 
            t = yf.Ticker(ticker)
            info = t.info
            
            price = info.get('currentPrice', info.get('previousClose', 0))
            div_rate = info.get('dividendRate', 0)
            
            if div_rate and price:
                div_yield = div_rate / price
            else:
                div_yield = info.get('trailingAnnualDividendYield')
                if div_yield is None:
                    div_yield = info.get('dividendYield', 0)
                    if div_yield and div_yield > 1: div_yield /= 100
            
            payout = info.get('payoutRatio', 0)
            # Fix Yahoo's inconsistent payout ratio
            # Some are already decimals (0.58), others are percentages (58.0 or 689.0)
            # We assume anything > 10.0 or specifically large values like 689.0 should be divided by 100
            if payout and payout > 2.0: # Most payout ratios shouldn't realistically be > 200% as a decimal
                payout = payout / 100
                
            if div_yield and div_yield >= 0.04:
                years, growth = get_dividend_metrics(t)
                print(f"Found: {ticker} ({div_yield*100:.2f}%) | {years} Years | {growth*100:.2f}% Growth")
                
                results.append({
                    "ticker": ticker,
                    "name": info.get('shortName', info.get('longName', ticker)),
                    "price": price,
                    "dividendYield": div_yield,
                    "payoutRatio": payout,
                    "consecutiveYears": years, 
                    "peRatio": info.get('forwardPE', info.get('trailingPE', 0)),
                    "roe": info.get('returnOnEquity', 0),
                    "debtToEquity": info.get('debtToEquity', 0) / 100 if info.get('debtToEquity') else 0,
                    "low52": info.get('fiftyTwoWeekLow', 0),
                    "high52": info.get('fiftyTwoWeekHigh', 0),
                    "sector": info.get('sector', 'Unknown'),
                    "dividendGrowth5Y": growth,
                    "description": info.get('longBusinessSummary', 'No description available.'),
                    "lastUpdated": datetime.now().strftime("%Y-%m-%d")
                })
        except Exception:
            continue

    # Save to public folder for the PWA to consume
    output_path = "public/data.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"Done! Saved {len(results)} stocks to {output_path}")

if __name__ == "__main__":
    # Restoration of full sync functionality
    update_data()
