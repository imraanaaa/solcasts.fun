import React from 'react';
import { Market } from '../types';

interface MarketCardProps {
  market: Market;
  onClick: (market: Market) => void;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, onClick }) => {
  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);

  return (
    <div 
      onClick={() => onClick(market)}
      className="bg-surface hover:bg-[#2a2e40] transition-all cursor-pointer border border-white/5 hover:border-primary/50 rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden h-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <img 
            src={market.image} 
            alt="market" 
            className="w-12 h-12 rounded-md object-cover bg-gray-700"
          />
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors text-gray-100 leading-tight">
              {market.title}
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">by {market.creator.slice(0, 4)}...</span>
          </div>
        </div>
      </div>

      {/* Resolved Overlay or Bonding Curve */}
      {market.resolved ? (
          <div className={`mt-2 p-2 rounded text-center text-xs font-bold border ${market.winner === 1 ? 'bg-success/10 border-success text-success' : 'bg-danger/10 border-danger text-danger'}`}>
              WINNER: {market.winner === 1 ? 'YES' : 'NO'}
          </div>
      ) : (
        <div className="space-y-1 mt-auto">
            <div className="flex justify-between text-[10px] font-mono font-bold">
            <span className="text-success">YES {yesPercent}%</span>
            <span className="text-danger">NO {noPercent}%</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
            <div 
                style={{ width: `${yesPercent}%` }} 
                className="h-full bg-success transition-all duration-500 relative"
            >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            <div 
                style={{ width: `${noPercent}%` }} 
                className="h-full bg-danger transition-all duration-500 relative"
            />
            </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 font-mono border-t border-white/5 pt-2">
        <div className="flex flex-col">
            <span>Vol</span>
            <span className="text-white">{market.volume.toFixed(1)}◎</span>
        </div>
        <div className="flex flex-col items-end">
            <span>Liq</span>
            <span className="text-primary">{market.liquidity.toFixed(1)}◎</span>
        </div>
      </div>
      
      {/* Quick Badge */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-primary text-[10px] px-2 py-1 rounded text-white font-bold">TRADE</span>
      </div>
    </div>
  );
};

export default MarketCard;