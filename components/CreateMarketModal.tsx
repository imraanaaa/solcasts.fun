import React, { useState } from 'react';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, image: string) => void;
}

const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl animate-fade-in">
        <h2 className="text-xl font-bold mb-4 font-mono text-primary">LAUNCH NEW MARKET</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-mono">QUESTION</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Will SOL hit $500?"
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none text-white placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 font-mono">IMAGE URL</label>
            <input 
              type="text" 
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none text-white placeholder-gray-600"
            />
          </div>

          <div className="bg-background p-3 rounded border border-dashed border-gray-700 text-xs text-gray-400 font-mono">
            <p>• Initial Liquidity: 0 SOL (Virtual)</p>
            <p>• Cost: ~0.02 SOL</p>
            <p>• Bonding Curve: CPMM (50/50)</p>
          </div>

          <button 
            onClick={() => {
                onSubmit(title, image);
                onClose();
            }}
            disabled={!title}
            className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            LAUNCH MARKET (0.02 SOL)
          </button>
          
          <button 
            onClick={onClose}
            className="w-full text-gray-500 text-xs hover:text-white transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMarketModal;