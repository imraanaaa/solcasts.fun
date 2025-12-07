import { useState, useCallback, useEffect } from 'react';
import { Market, Trade, UserProfile } from '../types';

// Mock "Privy" Hook for seamless auth
export const usePrivy = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<{ wallet: { address: string } } | null>(null);
    const [loading, setLoading] = useState(false);

    // Auto-connect if already trusted
    useEffect(() => {
        // @ts-ignore
        if (window.solana && window.solana.isPhantom && window.solana.isConnected) {
             // @ts-ignore
             const pubKey = window.solana.publicKey;
             if (pubKey) {
                 setUser({ wallet: { address: pubKey.toString() } });
                 setAuthenticated(true);
             }
        }
    }, []);

    const login = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            if (window.solana && window.solana.isPhantom) {
                // @ts-ignore
                const resp = await window.solana.connect();
                setUser({ wallet: { address: resp.publicKey.toString() } });
                setAuthenticated(true);
            } else {
                console.warn("Phantom Wallet not detected. Logging in as Demo User.");
                setUser({ wallet: { address: 'DemoWallet7...3x9' } });
                setAuthenticated(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return { authenticated, user, login, loading };
}

export const useSolcasts = () => {
  const { authenticated, user, login, loading: authLoading } = usePrivy();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [userTrades, setUserTrades] = useState<Trade[]>([]);
  const [balance, setBalance] = useState(14.2);
  
  // Profile Stats
  const [userProfile, setUserProfile] = useState<UserProfile>({
      totalDeposited: 20,
      totalWithdrawn: 0,
      realizedPnL: 3.4,
      unrealizedPnL: 1.2,
      totalVolume: 45.5
  });

  const fetchMarkets = useCallback(async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      if (markets.length === 0) {
        setMarkets(generateMockMarkets());
      }
      setLoading(false);
  }, [markets.length]);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const createMarket = useCallback(async (title: string, imageUrl: string) => {
    if (!authenticated) return;
    setLoading(true);
    
    setTimeout(() => {
      const newMarket: Market = {
        publicKey: `So111${Date.now()}`,
        title,
        image: imageUrl || 'https://picsum.photos/400/400',
        yesPrice: 0.50,
        noPrice: 0.50,
        volume: 0,
        liquidity: 1.0, // Initial liquidity
        createdAt: Date.now(),
        creator: user?.wallet.address || 'Unknown',
        yesReserves: 1_000_000_000,
        noReserves: 1_000_000_000,
        resolved: false,
        winner: 0
      };
      setMarkets(prev => [newMarket, ...prev]);
      setLoading(false);
    }, 2000);
  }, [authenticated, user]);

  const buy = useCallback(async (marketPubkey: string, side: 'YES' | 'NO', amountSol: number) => {
    if (!authenticated) {
        login();
        return;
    };

    setMarkets(prev => prev.map(m => {
      if (m.publicKey !== marketPubkey) return m;

      const impact = amountSol * 0.02; 
      
      let newPrice = side === 'YES' ? m.yesPrice + impact : m.noPrice + impact;
      newPrice = Math.min(0.99, newPrice);
      
      const newOppositePrice = 1 - newPrice;

      const trade: Trade = {
          type: side === 'YES' ? 'BUY_YES' : 'BUY_NO',
          amount: amountSol,
          price: newPrice,
          tokensReceived: amountSol / newPrice,
          timestamp: Date.now(),
          txHash: '5x' + Math.random().toString(36).substring(7)
      };
      
      setUserTrades(prev => [trade, ...prev]);
      setBalance(b => b - amountSol);
      
      // Update stats
      setUserProfile(p => ({
          ...p,
          totalVolume: p.totalVolume + amountSol,
          unrealizedPnL: p.unrealizedPnL + (amountSol * 0.1) // Simulating random PnL shift
      }));

      return {
          ...m,
          yesPrice: side === 'YES' ? newPrice : newOppositePrice,
          noPrice: side === 'NO' ? newPrice : newOppositePrice,
          volume: m.volume + amountSol,
          liquidity: m.liquidity + amountSol,
          yesReserves: side === 'YES' ? m.yesReserves - (amountSol * 1000) : m.yesReserves + (amountSol * 1000),
          noReserves: side === 'NO' ? m.noReserves - (amountSol * 1000) : m.noReserves + (amountSol * 1000)
      };
    }));
  }, [authenticated, login]);

  const resolveMarket = useCallback(async (marketPubkey: string, winner: 1 | 2) => {
      if(!authenticated) return;
      setLoading(true);
      setTimeout(() => {
          setMarkets(prev => prev.map(m => {
              if (m.publicKey !== marketPubkey) return m;
              return { ...m, resolved: true, winner };
          }));
          setLoading(false);
      }, 1500);
  }, [authenticated]);

  const deposit = async (amount: number) => {
      setLoading(true);
      setTimeout(() => {
        setBalance(b => b + amount);
        setUserProfile(p => ({...p, totalDeposited: p.totalDeposited + amount}));
        setLoading(false);
      }, 1000);
  };

  const withdraw = async (amount: number) => {
    if(amount > balance) return;
    setLoading(true);
    setTimeout(() => {
      setBalance(b => b - amount);
      setUserProfile(p => ({...p, totalWithdrawn: p.totalWithdrawn + amount}));
      setLoading(false);
    }, 1000);
  };

  return {
    markets,
    loading,
    connected: authenticated,
    user,
    balance,
    userProfile,
    connectWallet: login,
    createMarket,
    buy,
    resolveMarket,
    userTrades,
    deposit,
    withdraw
  };
};

const generateMockMarkets = (): Market[] => [
  {
    publicKey: 'So11111111111111111111111111111111111111112',
    title: 'Will Bitcoin hit $100k in 2024?',
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=400&q=80',
    yesPrice: 0.65,
    noPrice: 0.35,
    volume: 1245.5,
    liquidity: 840.2,
    createdAt: Date.now(),
    creator: '845s...12z',
    yesReserves: 850000000,
    noReserves: 1150000000,
    resolved: false,
    winner: 0
  },
  {
    publicKey: 'So11111111111111111111111111111111111111113',
    title: 'Will Solana flip Ethereum market cap by Q3?',
    image: 'https://images.unsplash.com/photo-1620321023374-d1a68fddadb3?auto=format&fit=crop&w=400&q=80',
    yesPrice: 0.12,
    noPrice: 0.88,
    volume: 5402.1,
    liquidity: 2310.5,
    createdAt: Date.now() - 100000,
    creator: '999s...aa1',
    yesReserves: 1800000000,
    noReserves: 200000000,
    resolved: false,
    winner: 0
  },
  {
    publicKey: 'So11111111111111111111111111111111111111114',
    title: 'Will GPT-5 be released before December?',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80',
    yesPrice: 0.50,
    noPrice: 0.50,
    volume: 12.0,
    liquidity: 12.0,
    createdAt: Date.now() - 20000,
    creator: '777s...bb2',
    yesReserves: 1000000000,
    noReserves: 1000000000,
    resolved: false,
    winner: 0
  }
];