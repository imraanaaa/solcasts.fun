export interface Market {
  publicKey: string;
  title: string;
  image: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number; // TVL
  createdAt: number;
  creator: string;
  yesReserves: number;
  noReserves: number;
  resolved: boolean;
  winner: 0 | 1 | 2; // 0=Open, 1=YES, 2=NO
}

export interface Trade {
  type: 'BUY_YES' | 'BUY_NO';
  amount: number;
  price: number;
  tokensReceived: number;
  timestamp: number;
  txHash: string;
}

export interface UserProfile {
  totalDeposited: number;
  totalWithdrawn: number;
  realizedPnL: number; // Closed positions
  unrealizedPnL: number; // Open positions
  totalVolume: number;
}

export interface BondingCurveState {
  virtualSolReserves: number;
  virtualTokenReserves: number;
  realTokenReserves: number;
}