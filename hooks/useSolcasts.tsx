import { useState, useEffect, useMemo } from 'react';
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Market, Trade, UserProfile } from '../types';

// --- CONFIGURATION ---
// PASTE YOUR PROGRAM ID FROM SOLANA PLAYGROUND HERE
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const IDL: any = {
  "version": "0.1.0",
  "name": "solcasts",
  "instructions": [
    {
      "name": "initializeMarket",
      "accounts": [
        { "name": "market", "isMut": true, "isSigner": false },
        { "name": "yesMint", "isMut": true, "isSigner": false },
        { "name": "noMint", "isMut": true, "isSigner": false },
        { "name": "signer", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "rent", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "title", "type": "string" },
        { "name": "image", "type": "string" }
      ]
    },
    {
      "name": "buyYes",
      "accounts": [
        { "name": "market", "isMut": true, "isSigner": false },
        { "name": "yesMint", "isMut": true, "isSigner": false },
        { "name": "noMint", "isMut": true, "isSigner": false },
        { "name": "userTokenAccount", "isMut": true, "isSigner": false },
        { "name": "signer", "isMut": true, "isSigner": true },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "associatedTokenProgram", "isMut": false, "isSigner": false },
        { "name": "rent", "isMut": false, "isSigner": false }
      ],
      "args": [ { "name": "amountInSol", "type": "u64" } ]
    },
    {
      "name": "buyNo",
      "accounts": [
        { "name": "market", "isMut": true, "isSigner": false },
        { "name": "yesMint", "isMut": true, "isSigner": false },
        { "name": "noMint", "isMut": true, "isSigner": false },
        { "name": "userTokenAccount", "isMut": true, "isSigner": false },
        { "name": "signer", "isMut": true, "isSigner": true },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "associatedTokenProgram", "isMut": false, "isSigner": false },
        { "name": "rent", "isMut": false, "isSigner": false }
      ],
      "args": [ { "name": "amountInSol", "type": "u64" } ]
    }
  ],
  "accounts": [
    {
      "name": "MarketState",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "title", "type": "string" },
          { "name": "creator", "type": "publicKey" },
          { "name": "yesReserves", "type": "u64" },
          { "name": "noReserves", "type": "u64" },
          { "name": "realSolReserves", "type": "u64" },
          { "name": "realTokenReserves", "type": "u64" },
          { "name": "totalVolume", "type": "u64" },
          { "name": "resolved", "type": "bool" },
          { "name": "winner", "type": "u8" },
          { "name": "bump", "type": "u8" }
        ]
      }
    }
  ]
};

export const useSolcasts = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [program, setProgram] = useState<Program | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  // Initialize Anchor Program
  useEffect(() => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {});
      const prog = new Program(IDL, PROGRAM_ID, provider);
      setProgram(prog);
      
      // Update Balance
      connection.getBalance(wallet.publicKey).then(bal => setBalance(bal / 1e9));
    }
  }, [wallet, connection]);

  // Fetch Markets from Chain
  const fetchMarkets = async () => {
    if (!program) return;
    setLoading(true);
    try {
      // @ts-ignore
      const allMarkets = await program.account.marketState.all();
      const formattedMarkets = allMarkets.map((m: any) => {
        const yesRes = m.account.yesReserves.toNumber();
        const noRes = m.account.noReserves.toNumber();
        const total = yesRes + noRes;
        
        return {
          publicKey: m.publicKey.toString(),
          title: m.account.title,
          image: 'https://picsum.photos/400/400', // Placeholder or IPFS hash
          yesPrice: 1 - (yesRes / total), // Inverted bonding curve logic
          noPrice: 1 - (noRes / total),
          volume: m.account.totalVolume.toNumber() / 1e9,
          liquidity: (yesRes + noRes) / 1e9, // Virtual liq
          createdAt: Date.now(), // Chain doesn't store this, mock for sort
          creator: m.account.creator.toString(),
          yesReserves: yesRes,
          noReserves: noRes,
          resolved: m.account.resolved,
          winner: m.account.winner
        };
      });
      setMarkets(formattedMarkets);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, [program]);

  // Create Market
  const createMarket = async (title: string, imageUrl: string) => {
    if (!program || !wallet) return alert("Connect Wallet!");
    
    try {
      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );
      const [yesMint] = PublicKey.findProgramAddressSync(
        [Buffer.from("yes"), marketPda.toBuffer()],
        PROGRAM_ID
      );
      const [noMint] = PublicKey.findProgramAddressSync(
        [Buffer.from("no"), marketPda.toBuffer()],
        PROGRAM_ID
      );

      const tx = await program.methods
        .initializeMarket(title, imageUrl)
        .accounts({
          market: marketPda,
          yesMint: yesMint,
          noMint: noMint,
          signer: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();
        
      console.log("Created!", tx);
      fetchMarkets(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to create market");
    }
  };

  // Buy
  const buy = async (marketPubkey: string, side: 'YES' | 'NO', amountSol: number) => {
    if (!program || !wallet) return alert("Connect Wallet!");

    try {
      const marketPda = new PublicKey(marketPubkey);
      const [yesMint] = PublicKey.findProgramAddressSync(
        [Buffer.from("yes"), marketPda.toBuffer()],
        PROGRAM_ID
      );
      const [noMint] = PublicKey.findProgramAddressSync(
        [Buffer.from("no"), marketPda.toBuffer()],
        PROGRAM_ID
      );

      const mintToBuy = side === 'YES' ? yesMint : noMint;
      const userTokenAccount = getAssociatedTokenAddressSync(mintToBuy, wallet.publicKey);
      const amountLamports = new BN(amountSol * 1_000_000_000);

      const method = side === 'YES' ? 'buyYes' : 'buyNo';

      const tx = await program.methods[method](amountLamports)
        .accounts({
          market: marketPda,
          yesMint: yesMint,
          noMint: noMint,
          userTokenAccount: userTokenAccount,
          signer: wallet.publicKey,
          tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          systemProgram: web3.SystemProgram.programId,
          associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log("Bought!", tx);
      fetchMarkets(); // Refresh UI
    } catch (err) {
      console.error(err);
      alert("Trade Failed");
    }
  };

  return {
    markets,
    loading,
    connected: !!wallet,
    user: wallet ? { wallet: { address: wallet.publicKey.toString() } } : null,
    balance,
    userProfile: { totalDeposited: 0, totalWithdrawn: 0, realizedPnL: 0, unrealizedPnL: 0, totalVolume: 0 },
    connectWallet: () => {}, // Handled by WalletMultiButton usually
    createMarket,
    buy,
    resolveMarket: async () => {}, // Admin only
    userTrades: [], // ToDo: Fetch from events
    deposit: async () => {}, 
    withdraw: async () => {}
  };
};
