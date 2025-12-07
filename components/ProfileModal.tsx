import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  balance: number;
  profile: UserProfile;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userAddress, balance, profile, onDeposit, onWithdraw }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FUNDS'>('OVERVIEW');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-surface w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold font-mono text-white mb-1">USER PROFILE</h2>
                <p className="text-xs text-gray-400 font-mono">{userAddress}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl">
                ×
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
            <button 
                onClick={() => setActiveTab('OVERVIEW')}
                className={`flex-1 py-3 text-xs font-bold font-mono transition-colors ${activeTab === 'OVERVIEW' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'}`}
            >
                STATS & PNL
            </button>
            <button 
                onClick={() => setActiveTab('FUNDS')}
                className={`flex-1 py-3 text-xs font-bold font-mono transition-colors ${activeTab === 'FUNDS' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'}`}
            >
                DEPOSIT / WITHDRAW
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                    <div className="bg-background rounded-xl p-6 border border-white/5 text-center">
                        <p className="text-xs text-gray-400 font-mono mb-2 uppercase tracking-widest">Total Balance</p>
                        <h1 className="text-4xl font-bold font-mono text-white mb-2">{balance.toFixed(4)} SOL</h1>
                        <p className="text-xs text-gray-500">Available to trade</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                            <p className="text-[10px] text-gray-400 font-mono mb-1 uppercase">Realized PnL</p>
                            <p className={`text-xl font-mono font-bold ${profile.realizedPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                                {profile.realizedPnL > 0 ? '+' : ''}{profile.realizedPnL.toFixed(2)} SOL
                            </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                            <p className="text-[10px] text-gray-400 font-mono mb-1 uppercase">Unrealized PnL</p>
                            <p className={`text-xl font-mono font-bold ${profile.unrealizedPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                                {profile.unrealizedPnL > 0 ? '+' : ''}{profile.unrealizedPnL.toFixed(2)} SOL
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
                            <span>Total Volume Traded</span>
                            <span className="text-white font-mono">{profile.totalVolume.toFixed(2)} SOL</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
                            <span>Total Deposited</span>
                            <span className="text-white font-mono">{profile.totalDeposited.toFixed(2)} SOL</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
                            <span>Total Withdrawn</span>
                            <span className="text-white font-mono">{profile.totalWithdrawn.toFixed(2)} SOL</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'FUNDS' && (
                <div className="space-y-6">
                    <div className="bg-background border border-white/10 rounded-xl p-4">
                        <label className="block text-xs text-gray-400 mb-2 font-mono">AMOUNT (SOL)</label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-transparent text-2xl font-mono font-bold text-white focus:outline-none placeholder-gray-700"
                            />
                            <button 
                                onClick={() => setAmount(balance.toFixed(4))}
                                className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-primary font-bold"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => {
                                onDeposit(parseFloat(amount));
                                setAmount('');
                            }}
                            disabled={!amount || parseFloat(amount) <= 0}
                            className="bg-success text-black font-bold py-3 rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            DEPOSIT
                        </button>
                        <button 
                            onClick={() => {
                                onWithdraw(parseFloat(amount));
                                setAmount('');
                            }}
                            disabled={!amount || parseFloat(amount) <= 0}
                            className="bg-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            WITHDRAW
                        </button>
                    </div>

                    <p className="text-xs text-center text-gray-500 mt-4">
                        Deposits are instant. Withdrawals may take up to 2 minutes on Devnet.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;