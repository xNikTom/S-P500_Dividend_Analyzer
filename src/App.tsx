import React, { useEffect, useState } from 'react';
import { calculateScores, sortStocks } from './analysis';
import { AnalyzedStock, StockData } from './types';
import { TrendingUp, Award, Star, Search, ChevronRight, ArrowUpRight, ArrowDownRight, Info, AlertCircle, HelpCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

const App: React.FC = () => {
    const [stocks, setStocks] = useState<AnalyzedStock[]>([]);
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [showScoreHelp, setShowScoreHelp] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof AnalyzedStock | 'score'; direction: 'asc' | 'desc' | null }>({ key: 'score', direction: 'desc' });
    const PULL_THRESHOLD = 80;

    const loadData = async () => {
        try {
            const res = await fetch(`./data.json?t=${Date.now()}`); // Cache busting
            const data: StockData[] = await res.json();
            const analyzed = data.map(s => ({
                ...s,
                scores: calculateScores(s)
            }));
            const filtered = analyzed.filter(s => s.dividendYield >= 0.04);
            setStocks(sortStocks(filtered));
        } catch (err) {
            console.error("Failed to load data", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setPullDistance(0);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setIsPulling(true);
            const touch = e.touches[0];
            (window as any).startY = touch.clientY;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPulling) return;
        const touch = e.touches[0];
        const distance = touch.clientY - (window as any).startY;

        if (distance > 0) {
            setPullDistance(Math.min(distance * 0.5, PULL_THRESHOLD + 20));
        }
    };

    const handleTouchEnd = () => {
        if (!isPulling) return;
        setIsPulling(false);
        if (pullDistance >= PULL_THRESHOLD) {
            setRefreshing(true);
            loadData();
        } else {
            setPullDistance(0);
        }
    };

    const handleSort = (key: keyof AnalyzedStock | 'score') => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = null;
        }
        setSortConfig({ key, direction });
    };

    const getSortedStocks = () => {
        if (!sortConfig.key || !sortConfig.direction) return stocks;

        return [...stocks].sort((a, b) => {
            let aVal: any = sortConfig.key === 'score' ? a.scores.overall : a[sortConfig.key as keyof AnalyzedStock];
            let bVal: any = sortConfig.key === 'score' ? b.scores.overall : b[sortConfig.key as keyof AnalyzedStock];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const sortedStocksList = getSortedStocks();
    const selectedStock = stocks.find(s => s.ticker === selectedTicker);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div
            className="max-w-md mx-auto h-full flex flex-col relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull to refresh indicator */}
            <div
                className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50"
                style={{ transform: `translateY(${pullDistance - 40}px)` }}
            >
                <motion.div
                    animate={{ rotate: refreshing ? 360 : 0 }}
                    transition={{ repeat: refreshing ? Infinity : 0, duration: 1, ease: "linear" }}
                    className={`w-8 h-8 rounded-full bg-slate-800 border-2 border-primary flex items-center justify-center shadow-lg transition-opacity ${pullDistance > 20 || refreshing ? 'opacity-100' : 'opacity-0'}`}
                >
                    <TrendingUp size={16} className="text-primary" />
                </motion.div>
            </div>

            {/* Header */}
            <header className="p-6 pb-2 text-center">
                <h1 className="text-2xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent inline-block">
                    S&P 500 Dividend Stocks
                </h1>
                {stocks.length > 0 && (
                    <div className="mt-1.5 flex justify-center">
                        <div className="bg-slate-800/50 text-slate-500 text-xs font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] border border-white/5">
                            Last Sync: {formatDate(stocks[0].lastUpdated)}
                        </div>
                    </div>
                )}
            </header>

            {/* List Header Labels */}
            <div className="sticky top-0 z-20 bg-[#0f172a] shadow-xl">
                <div className="px-4 py-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <div
                        className={`w-12 flex-shrink-0 text-center cursor-pointer hover:text-primary transition-colors flex items-center justify-center gap-0.5 ${sortConfig.key === 'ticker' && sortConfig.direction ? 'text-primary' : ''}`}
                        onClick={() => handleSort('ticker')}
                    >
                        {sortConfig.key === 'ticker' && sortConfig.direction && (
                            sortConfig.direction === 'asc' ? <ArrowUp size={10} className="shrink-0" /> : <ArrowDown size={10} className="shrink-0" />
                        )}
                        <span>Ticker</span>
                    </div>
                    <div
                        className={`flex-1 text-center cursor-pointer hover:text-primary transition-colors flex items-center justify-center gap-0.5 overflow-hidden ${sortConfig.key === 'name' && sortConfig.direction ? 'text-primary' : ''}`}
                        onClick={() => handleSort('name')}
                    >
                        {sortConfig.key === 'name' && sortConfig.direction && (
                            sortConfig.direction === 'asc' ? <ArrowUp size={10} className="shrink-0" /> : <ArrowDown size={10} className="shrink-0" />
                        )}
                        <span className="truncate">Company / Sector</span>
                    </div>
                    <div
                        className={`w-[54px] text-right cursor-pointer hover:text-primary transition-colors flex items-center justify-end gap-0.5 ${sortConfig.key === 'dividendYield' && sortConfig.direction ? 'text-primary' : ''}`}
                        onClick={() => handleSort('dividendYield')}
                    >
                        {sortConfig.key === 'dividendYield' && sortConfig.direction && (
                            sortConfig.direction === 'asc' ? <ArrowUp size={10} className="shrink-0" /> : <ArrowDown size={10} className="shrink-0" />
                        )}
                        <span>Yield</span>
                    </div>
                    <div
                        className={`w-14 text-center cursor-pointer hover:text-primary transition-colors flex items-center justify-center gap-0.5 ${sortConfig.key === 'score' && sortConfig.direction ? 'text-primary' : ''}`}
                        onClick={() => handleSort('score')}
                    >
                        {sortConfig.key === 'score' && sortConfig.direction && (
                            sortConfig.direction === 'asc' ? <ArrowUp size={10} className="shrink-0" /> : <ArrowDown size={10} className="shrink-0" />
                        )}
                        <span>Score</span>
                    </div>
                </div>
            </div>

            {/* Main List */}
            <main className="flex-1 overflow-y-auto px-2 pb-6 pt-2 space-y-1.5">
                {sortedStocksList.map((stock, index) => (
                    <motion.div
                        key={stock.ticker}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedTicker(stock.ticker)}
                        className={`relative overflow-hidden glass rounded-xl py-2 px-1.5 active:scale-[0.98] transition-all cursor-pointer border border-white/5 hover:border-white/10 ${stock.consecutiveYears >= 25 ? 'bg-amber-400/5 border-amber-400/20 shadow-[inset_0_0_20px_rgba(251,191,36,0.02)]' : ''}`}
                    >
                        <div className="flex items-center gap-1.5 pr-1">
                            <div className="w-12 flex-shrink-0 text-center font-black text-xs">
                                <span className={stock.consecutiveYears >= 25 ? 'text-amber-200' : 'text-white'}>{stock.ticker}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-bold leading-tight truncate ${stock.consecutiveYears >= 25 ? 'text-amber-100' : 'text-slate-200'}`}>
                                    {stock.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
                                    <span className={`text-[10px] font-black uppercase tracking-tight truncate flex-1 ${stock.consecutiveYears >= 25 ? 'text-amber-400/60' : 'text-slate-500'}`}>{stock.sector}</span>
                                    {stock.consecutiveYears >= 25 && <span className="text-[10px] bg-amber-400/20 text-amber-200 px-1 rounded font-black border border-amber-400/20 shrink-0">ARISTOCRAT</span>}
                                </div>
                            </div>

                            <div className="flex-shrink-0 w-[54px] text-right font-black text-xs">
                                <span className={stock.consecutiveYears >= 25 ? 'text-amber-200' : 'text-slate-100'}>{(stock.dividendYield * 100).toFixed(2)}%</span>
                            </div>

                            <div className="flex items-center justify-center w-14 flex-shrink-0 border-l border-white/5">
                                <div className={`text-sm font-black px-3 py-1.5 rounded bg-white/10 ${stock.scores.overall > 70 ? 'text-success' : stock.scores.overall > 40 ? 'text-warning' : 'text-danger'}`}>
                                    {stock.scores.overall}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Footer Credits */}
                <footer className="py-8 px-4 text-center space-y-1.5 opacity-60">
                    <p className="text-sm font-medium text-slate-500">
                        This app is created with <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Google Antigravity</a>
                    </p>
                    <p className="text-sm font-bold text-slate-400">
                        2025, Author: Nikolay Tomov
                    </p>
                    <p className="text-sm font-medium text-slate-500">
                        Data: <a href="https://finance.yahoo.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Yahoo Finance</a>
                    </p>
                </footer>
            </main>

            {/* Detail Overlay */}
            <AnimatePresence>
                {selectedTicker && selectedStock && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] glass border-none rounded-none flex flex-col h-full bg-[#0f172a]"
                    >
                        <div className="p-6 flex-1 overflow-y-auto pb-10">

                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <a
                                        href={`https://finance.yahoo.com/quote/${selectedStock.ticker}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 group"
                                    >
                                        <h2 className="text-3xl font-black leading-tight text-white group-hover:text-primary transition-colors">
                                            {selectedStock.ticker}
                                        </h2>
                                        <ArrowUpRight size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
                                    </a>
                                    <p className="text-slate-400 text-sm font-medium">{selectedStock.name}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold">${selectedStock.price.toFixed(2)}</div>
                                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                                        As of {formatDate(selectedStock.lastUpdated)}
                                    </div>
                                </div>
                            </div>

                            {/* Score Dashboard */}
                            <div className="mb-6">
                                <div className="flex items-center gap-1.5 mb-3 ml-1 cursor-pointer select-none group" onClick={() => setShowScoreHelp(!showScoreHelp)}>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-primary transition-colors">Analysis Scores</h3>
                                    <HelpCircle size={14} className={`transition-colors ${showScoreHelp ? 'text-primary' : 'text-slate-600'}`} />
                                </div>

                                <AnimatePresence>
                                    {showScoreHelp && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mb-4 bg-primary/5 border border-primary/20 rounded-xl overflow-hidden"
                                        >
                                            <div className="p-4 text-[11px] leading-relaxed text-slate-300 font-medium space-y-2">
                                                <div className="flex gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                    <p><span className="text-primary font-bold">Dividend Score:</span> Weighted by Yield (Ideal 4-7%), Payout Ratio (Ideal &lt;60%), and Growth Track Record (Aristocrat Bonus).</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                    <p><span className="text-primary font-bold">Fundamental Score:</span> Analyzes Valuation (P/E &lt;20), Profitability (ROE &gt;15%), and Debt-to-Equity safety levels.</p>
                                                </div>
                                                <div className="flex gap-2 border-t border-white/5 pt-2 mt-2">
                                                    <Info size={12} className="text-primary shrink-0 mt-0.5" />
                                                    <p className="italic font-bold">Overall Score is calculated as 60% Dividend and 40% Fundamental weighting.</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-3 gap-4">
                                    <BigScoreCircle label="Overall" score={selectedStock.scores.overall} />
                                    <BigScoreCircle label="Div" score={selectedStock.scores.dividend} />
                                    <BigScoreCircle label="Value" score={selectedStock.scores.fundamentals} />
                                </div>
                            </div>

                            {/* Business Summary */}
                            <div className="mb-8 px-1">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">Business Summary</h3>
                                <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="p-4 relative">
                                        <p className={`text-[11px] font-bold text-slate-400 leading-relaxed transition-all duration-300 ${!isSummaryExpanded ? 'line-clamp-5' : ''}`}>
                                            {selectedStock.description}
                                        </p>
                                        <button
                                            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                            className="mt-3 text-primary text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:opacity-80 transition-opacity ml-auto"
                                        >
                                            {isSummaryExpanded ? 'Show Less' : 'Show More...'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Indicators */}
                            <div className="space-y-4">
                                <IndicatorSection title="Dividend Profile">
                                    <IndicatorRow
                                        label="Current Yield"
                                        value={`${(selectedStock.dividendYield * 100).toFixed(2)}%`}
                                        status={selectedStock.dividendYield > 0.08 ? 'warning' : 'safe'}
                                        help="High yield (>8%) can be a signal of financial distress. Sustainability is key."
                                    />
                                    <IndicatorRow
                                        label="Payout Ratio"
                                        value={`${(selectedStock.payoutRatio * 100).toFixed(2)}%`}
                                        status={selectedStock.payoutRatio > 0.65 ? 'danger' : 'safe'}
                                        help="Portion of earnings paid as dividends. >65% limits growth and safety margin."
                                    />
                                    <IndicatorRow
                                        label="Growth Years"
                                        value={selectedStock.consecutiveYears.toString()}
                                        status={selectedStock.consecutiveYears < 10 ? 'warning' : 'safe'}
                                        help="Years of consecutive dividend increases. 25+ years identifies a 'Dividend Aristocrat'."
                                        highlight={selectedStock.consecutiveYears >= 25 ? 'gold' : undefined}
                                    />
                                    <IndicatorRow
                                        label="5Y Growth Rate"
                                        value={`${(selectedStock.dividendGrowth5Y * 100).toFixed(2)}%`}
                                        status={selectedStock.dividendGrowth5Y < 0.03 ? 'warning' : 'safe'}
                                        help="Annualized growth over 5 years. High growth offsets lower starting yields."
                                    />
                                </IndicatorSection>

                                <IndicatorSection title="Value Fundamentals">
                                    <IndicatorRow
                                        label="P/E Ratio"
                                        value={selectedStock.peRatio.toFixed(2)}
                                        status={selectedStock.peRatio > 20 ? 'warning' : 'safe'}
                                        help="Price-to-Earnings. Above 20 suggests a rich valuation for dividend stocks."
                                    />
                                    <IndicatorRow
                                        label="ROE"
                                        value={`${(selectedStock.roe * 100).toFixed(2)}%`}
                                        status={selectedStock.roe < 0.15 ? 'warning' : 'safe'}
                                        help="Return on Equity. High ROE indicates efficient management and profitability."
                                    />
                                    <IndicatorRow
                                        label="Debt / Equity"
                                        value={selectedStock.debtToEquity.toFixed(2)}
                                        status={selectedStock.debtToEquity > 1.5 ? 'danger' : 'safe'}
                                        help="Leverage ratio. High debt (>1.5) threatens dividend safety during downturns."
                                    />
                                </IndicatorSection>

                                <IndicatorSection title="Price Range (52W)">
                                    <div className="bg-slate-900/50 rounded-xl p-4">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1 uppercase font-bold">
                                            <span>Low</span>
                                            <span>Current</span>
                                            <span>High</span>
                                        </div>
                                        <div className="relative h-2 bg-slate-800 rounded-full flex items-center">
                                            <div
                                                className="absolute h-full bg-primary rounded-full"
                                                style={{
                                                    left: `${((selectedStock.price - selectedStock.low52) / (selectedStock.high52 - selectedStock.low52)) * 100}%`,
                                                    width: '2px'
                                                }}
                                            />
                                            <div className="w-full flex justify-between px-1">
                                                <span className="text-xs font-bold leading-none mt-5">${selectedStock.low52}</span>
                                                <span className="text-xs font-bold leading-none mt-5">${selectedStock.high52}</span>
                                            </div>
                                        </div>
                                    </div>
                                </IndicatorSection>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/80 backdrop-blur-md">
                            <button
                                className="w-full bg-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                                onClick={() => {
                                    setSelectedTicker(null);
                                    setIsSummaryExpanded(false);
                                }}
                            >
                                Back
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ScoreItem = ({ label, score }: { label: string, score: number }) => (
    <div className="text-center">
        <div className={`text-sm font-bold ${score > 70 ? 'text-success' : score > 40 ? 'text-warning' : 'text-danger'}`}>
            {score}
        </div>
        <div className="text-xs text-slate-500 uppercase font-black tracking-widest">{label}</div>
    </div>
);

const BigScoreCircle = ({ label, score }: { label: string, score: number }) => (
    <div className="bg-slate-900/50 rounded-2xl p-2.5 text-center border border-white/5">
        <div className={`text-xl font-black mb-0.5 ${score > 70 ? 'text-success' : score > 40 ? 'text-warning' : 'text-danger'}`}>
            {score}
        </div>
        <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">{label}</div>
    </div>
);

const IndicatorSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">{title}</h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const IndicatorRow = ({ label, value, status, help, highlight }: { label: string, value: string, status: 'safe' | 'warning' | 'danger', help: string, highlight?: 'gold' }) => {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className={`flex flex-col bg-white/5 rounded-xl border transition-all duration-300 overflow-hidden ${highlight === 'gold' ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'border-white/5'}`}>
            <div
                className="flex justify-between items-center p-3 cursor-pointer select-none active:bg-white/10"
                onClick={() => setShowHelp(!showHelp)}
            >
                <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold uppercase tracking-tight ${highlight === 'gold' ? 'text-amber-200' : 'text-slate-400'}`}>{label}</span>
                    <HelpCircle size={12} className={`transition-colors ${showHelp ? 'text-primary' : 'text-slate-600'}`} />
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${highlight === 'gold' ? 'text-amber-200' : (status === 'safe' ? 'text-success' : status === 'warning' ? 'text-warning' : 'text-danger')}`}>
                        {value}
                    </span>
                    {(status === 'warning' || status === 'danger') && (
                        <AlertCircle size={16} className={`${status === 'warning' ? 'text-warning' : 'text-danger'} animate-pulse`} />
                    )}
                </div>
            </div>
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/40 border-t border-white/5"
                    >
                        <div className="p-3 text-[10px] leading-relaxed text-slate-300 font-medium italic flex gap-2 items-start">
                            <Info size={12} className="text-primary shrink-0 mt-0.5" />
                            <span>{help}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default App;
