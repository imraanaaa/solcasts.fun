import React, { useState, useMemo } from 'react';
import { useSolcasts } from './hooks/useSolcasts';
import MarketCard from './components/MarketCard';
import CreateMarketModal from './components/CreateMarketModal';
import ProfileModal from './components/ProfileModal';
import { Market } from './types';

// Icons
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const TrendingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

const FireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.24-4.05-2.24-6 0-.1 0-.2.01-.3A7 7 0 1 0 16 14c0-4.4-3.53-8-4-8a5.2 5.2 0 0 1 1.7 4c0 1.95-1.25 4.5-5.2 4.5Z"/></svg>
);

const NewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
);

const App = () => {
  const { markets, connected, user, balance, userProfile, connectWallet, createMarket, buy, resolveMarket, userTrades, deposit, withdraw } = useSolcasts();
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [buyAmount, setBuyAmount] = useState<string>('0.1');
  const [tradeSide, setTradeSide] = useState<'YES' | 'NO'>('YES');
  const [activeTab, setActiveTab] = useState<'TRADE' | 'HISTORY'>('TRADE');
  
  // Categories
  const [activeCategory, setActiveCategory] = useState<'TRENDING' | 'NEW'>('TRENDING');

  const handleBuy = async () => {
    if (selectedMarket && connected) {
      await buy(selectedMarket.publicKey, tradeSide, parseFloat(buyAmount));
    }
  };

  const handleResolve = async (winner: 1 | 2) => {
      if(selectedMarket) {
          await resolveMarket(selectedMarket.publicKey, winner);
      }
  }

  // Filter and Sort Markets
  const filteredMarkets = useMemo(() => {
      const sorted = [...markets];
      if (activeCategory === 'TRENDING') {
          return sorted.sort((a, b) => b.volume - a.volume);
      } else {
          return sorted.sort((a, b) => b.createdAt - a.createdAt);
      }
  }, [markets, activeCategory]);

  // Statistics
  const potentialWinnings = useMemo(() => {
      if (!selectedMarket || !buyAmount) return 0;
      const amount = parseFloat(buyAmount);
      if (isNaN(amount)) return 0;
      
      const price = tradeSide === 'YES' ? selectedMarket.yesPrice : selectedMarket.noPrice;
      const tokensReceived = amount / price;
      return tokensReceived;
  }, [selectedMarket, buyAmount, tradeSide]);

  const liquidityShare = useMemo(() => {
      if (!selectedMarket || !buyAmount) return 0;
      const amount = parseFloat(buyAmount);
      if (isNaN(amount)) return 0;
      
      const totalVol = selectedMarket.volume + 1; 
      return Math.min(100, (amount / totalVol) * 100);
  }, [selectedMarket, buyAmount]);

  // Filter trades for this market
  const marketTrades = userTrades;

  return (
    <div className="min-h-screen flex flex-col font-sans text-white bg-background">
      
      {/* --- Navbar --- */}
      <nav className="h-16 border-b border-white/5 bg-background flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-[0_0_10px_rgba(153,69,255,0.5)]">S</div>
          <span className="font-mono font-bold text-lg tracking-tighter">SOLCASTS<span className="text-primary">.FUN</span></span>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="text-xs font-mono border border-white/10 hover:border-white/40 px-3 py-2 rounded flex items-center gap-2 transition-all hover:bg-white/5"
            >
                <PlusIcon /> CREATE NEW
            </button>
            
            {connected ? (
                <div 
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-3 bg-surface px-4 py-2 rounded-full border border-white/10 shadow-lg cursor-pointer hover:bg-white/5 transition-colors"
                >
                    <span className="text-sm font-mono text-success">{balance.toFixed(4)} SOL</span>
                    <div className="w-px h-4 bg-gray-600"></div>
                    <span className="text-xs text-gray-400 font-mono">
                        {user?.wallet.address.slice(0, 4)}...{user?.wallet.address.slice(-4)}
                    </span>
                </div>
            ) : (
                <button 
                    onClick={connectWallet}
                    className="bg-primary hover:bg-primary/80 text-white font-bold text-xs px-4 py-2 rounded-full transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(153,69,255,0.3)]"
                >
                    <WalletIcon /> LOGIN WITH PRIVY
                </button>
            )}
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left: Market Feed */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            
            {/* Hero / King of the Hill */}
            {markets.length > 0 && (
                <div className="mb-8 relative rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_30px_rgba(153,69,255,0.15)] bg-surface">
                    <div className="absolute top-4 left-4 z-10 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-md">
                        <TrendingIcon /> KING OF THE HILL
                    </div>
                    <div className="flex flex-col md:flex-row h-full">
                        <div className="md:w-1/3 h-48 md:h-auto bg-gray-800 relative">
                             <img src={markets[0].image} className="w-full h-full object-cover" alt="Featured" />
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface md:bg-gradient-to-t md:from-transparent md:to-transparent"></div>
                        </div>
                        <div className="p-6 md:w-2/3 flex flex-col justify-center relative">
                            <h1 className="text-2xl font-bold mb-2 text-white">{markets[0].title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400 font-mono mb-6">
                                <span>Created by {markets[0].creator.slice(0,6)}...</span>
                                <span>Vol: {markets[0].volume.toFixed(2)} SOL</span>
                                <span className="text-primary font-bold">Liq: {markets[0].liquidity.toFixed(2)} SOL</span>
                            </div>
                            
                            {/* Big Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between mb-2 font-mono font-bold text-lg">
                                    <span className="text-success">{Math.round(markets[0].yesPrice * 100)}% YES</span>
                                    <span className="text-danger">{Math.round(markets[0].noPrice * 100)}% NO</span>
                                </div>
                                <div className="h-6 w-full bg-gray-900 rounded-full overflow-hidden flex shadow-inner border border-white/5">
                                    <div style={{width: `${markets[0].yesPrice * 100}%`}} className="h-full bg-success relative">
                                        <div className="absolute inset-0 bg-white/10"></div>
                                    </div>
                                    <div style={{width: `${markets[0].noPrice * 100}%`}} className="h-full bg-danger"></div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setSelectedMarket(markets[0])}
                                className="self-start bg-white text-black font-bold px-8 py-3 rounded hover:bg-gray-200 transition-colors shadow-lg"
                            >
                                OPEN TERMINAL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex bg-surface p-1 rounded-lg border border-white/10">
                    <button 
                        onClick={() => setActiveCategory('TRENDING')}
                        className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all ${activeCategory === 'TRENDING' ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <FireIcon /> TRENDING
                    </button>
                    <button 
                        onClick={() => setActiveCategory('NEW')}
                        className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all ${activeCategory === 'NEW' ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <NewIcon /> NEW
                    </button>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-gray-400 font-mono uppercase mr-2">Live Markets</span>
                    <input type="text" placeholder="Search markets..." className="bg-surface border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-white placeholder-gray-600 w-full md:w-64" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                {filteredMarkets.map(market => (
                    <MarketCard key={market.publicKey} market={market} onClick={setSelectedMarket} />
                ))}
            </div>
        </div>

        {/* Right: Trading Terminal (Sticky) */}
        {selectedMarket && (
            <aside className="w-[400px] bg-surface border-l border-white/5 flex flex-col h-full shadow-2xl z-30 animate-slide-in-right">
                <div className="p-4 border-b border-white/5">
                    <button onClick={() => setSelectedMarket(null)} className="text-xs text-gray-500 hover:text-white mb-4 flex items-center gap-1">← BACK TO FEED</button>
                    <div className="flex gap-3 mb-4">
                         <img src={selectedMarket.image} className="w-16 h-16 rounded-lg bg-gray-800 object-cover border border-white/10" alt="" />
                         <div>
                             <p className="font-bold text-sm leading-tight mb-2">{selectedMarket.title}</p>
                             {selectedMarket.resolved ? (
                                 <span className={`text-xs font-bold px-2 py-1 rounded ${selectedMarket.winner === 1 ? 'bg-success text-black' : 'bg-danger text-black'}`}>
                                     RESOLVED: {selectedMarket.winner === 1 ? 'YES' : 'NO'}
                                 </span>
                             ) : (
                                <span className="text-xs text-primary animate-pulse">● LIVE TRADING</span>
                             )}
                         </div>
                    </div>
                    
                    <div className="flex gap-2">
                         <button 
                            onClick={() => setActiveTab('TRADE')}
                            className={`flex-1 text-xs font-bold py-2 rounded transition-colors ${activeTab === 'TRADE' ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5'}`}
                         >
                             TRADE
                         </button>
                         <button 
                            onClick={() => setActiveTab('HISTORY')}
                            className={`flex-1 text-xs font-bold py-2 rounded transition-colors ${activeTab === 'HISTORY' ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5'}`}
                         >
                             MY TRADES
                         </button>
                    </div>
                </div>

                {activeTab === 'TRADE' && (
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="text-center text-gray-500 text-xs py-10 font-mono space-y-2">
                            <p>---- BONDING CURVE ACTIVE ----</p>
                            <p className="text-[10px] opacity-50">Liquidity Pool: {selectedMarket.liquidity.toFixed(2)} SOL</p>
                        </div>
                        
                        {/* Demo Resolver Panel */}
                        <div className="mt-4 p-3 bg-black/20 rounded border border-white/5">
                            <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider font-bold">Market Resolution (Resolver)</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleResolve(1)}
                                    disabled={selectedMarket.resolved} 
                                    className="flex-1 bg-gray-800 text-xs hover:bg-success/20 hover:text-success py-2 rounded disabled:opacity-30 border border-white/5"
                                >
                                    Resolve YES
                                </button>
                                <button 
                                    onClick={() => handleResolve(2)}
                                    disabled={selectedMarket.resolved}
                                    className="flex-1 bg-gray-800 text-xs hover:bg-danger/20 hover:text-danger py-2 rounded disabled:opacity-30 border border-white/5"
                                >
                                    Resolve NO
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-background border-t border-white/5">
                        {!selectedMarket.resolved ? (
                            <>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <button 
                                        onClick={() => setTradeSide('YES')}
                                        className={`py-3 rounded-lg font-bold transition-all border border-transparent ${tradeSide === 'YES' ? 'bg-success text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]' : 'bg-gray-800 text-gray-500 hover:border-gray-600'}`}
                                    >
                                        BUY YES
                                        <div className="text-[10px] opacity-70 font-mono">{(selectedMarket.yesPrice * 100).toFixed(1)}%</div>
                                    </button>
                                    <button 
                                        onClick={() => setTradeSide('NO')}
                                        className={`py-3 rounded-lg font-bold transition-all border border-transparent ${tradeSide === 'NO' ? 'bg-danger text-black shadow-[0_0_15px_rgba(255,26,26,0.4)]' : 'bg-gray-800 text-gray-500 hover:border-gray-600'}`}
                                    >
                                        BUY NO
                                        <div className="text-[10px] opacity-70 font-mono">{(selectedMarket.noPrice * 100).toFixed(1)}%</div>
                                    </button>
                                </div>

                                <div className="bg-surface border border-white/10 rounded-lg p-3 mb-4">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
                                        <span>AMOUNT (SOL)</span>
                                        <span className="cursor-pointer hover:text-primary" onClick={() => setBuyAmount(balance.toFixed(2))}>MAX: {balance.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 font-bold">$</span>
                                        <input 
                                            type="number" 
                                            value={buyAmount}
                                            onChange={(e) => setBuyAmount(e.target.value)}
                                            className="w-full bg-transparent text-xl font-mono font-bold focus:outline-none text-white placeholder-gray-700"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Winnings Calculator */}
                                <div className="mb-4 bg-primary/10 border border-primary/20 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-primary font-bold uppercase tracking-wide">Potential Payout</span>
                                        <span className="text-xs text-primary font-mono bg-primary/20 px-1 rounded">{(1 / (tradeSide === 'YES' ? selectedMarket.yesPrice : selectedMarket.noPrice)).toFixed(1)}x</span>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <div className="text-2xl font-bold text-white font-mono">
                                            {potentialWinnings.toFixed(2)} <span className="text-sm text-gray-400">SOL</span>
                                        </div>
                                        <div className="text-xs text-gray-400 font-mono">
                                            LP Share: {liquidityShare.toFixed(4)}%
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleBuy}
                                    disabled={!connected}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                                >
                                    {connected ? `PLACE TRADE` : 'LOGIN TO TRADE'}
                                </button>
                            </>
                        ) : (
                            <div className="bg-gray-800 p-6 rounded-lg text-center border border-white/10">
                                <h3 className="text-lg font-bold mb-2">Market Resolved</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Outcome: <span className={`font-bold ${selectedMarket.winner === 1 ? "text-success" : "text-danger"}`}>{selectedMarket.winner === 1 ? "YES" : "NO"}</span>
                                </p>
                                <button className="w-full bg-white/10 hover:bg-white/20 py-2 rounded font-bold text-sm text-white transition-colors">
                                    REDEEM WINNINGS
                                </button>
                            </div>
                        )}
                        
                        <p className="text-[10px] text-center text-gray-500 mt-3 font-mono">
                            network fee: 0.000005 SOL
                        </p>
                    </div>
                </div>
                )}

                {activeTab === 'HISTORY' && (
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase">Recent Activity</h3>
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">{marketTrades.length} trades</span>
                        </div>
                        
                        <div className="space-y-2">
                            {marketTrades.length === 0 && <p className="text-xs text-gray-600 text-center py-8 italic">No trades found for this session.</p>}
                            {marketTrades.map((trade, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${trade.type === 'BUY_YES' ? 'bg-success shadow-[0_0_8px_rgba(0,255,65,0.5)]' : 'bg-danger shadow-[0_0_8px_rgba(255,26,26,0.5)]'}`}></div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{trade.type === 'BUY_YES' ? 'Bought YES' : 'Bought NO'}</p>
                                            <p className="text-[10px] text-gray-500 font-mono">{new Date(trade.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono font-bold">{trade.amount.toFixed(2)} SOL</p>
                                        <p className="text-[10px] text-gray-500">@ {trade.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </aside>
        )}
      </main>

      <CreateMarketModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createMarket}
      />

      {user && (
          <ProfileModal 
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            userAddress={user.wallet.address}
            balance={balance}
            profile={userProfile}
            onDeposit={deposit}
            onWithdraw={withdraw}
          />
      )}
    </div>
  );
};

export default App;