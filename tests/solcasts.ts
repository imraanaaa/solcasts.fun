import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
// import { Solcasts } from "../target/types/solcasts"; // Commented out to prevent build error if missing
import { assert } from "chai";
import { Buffer } from "buffer";

// Explicitly declare Mocha types for the script environment
declare const describe: (name: string, callback: () => void) => void;
declare const it: (name: string, callback: () => Promise<void>) => void;

describe("solcasts", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Use 'any' for program type to avoid dependency on generated IDL in frontend environment
  // and to prevent "Type instantiation is excessively deep" errors with Program<any>
  const program = anchor.workspace.Solcasts as any;
  
  // Test accounts
  const creator = provider.wallet;
  
  // PDAs
  let marketPda: anchor.web3.PublicKey;
  let yesMintPda: anchor.web3.PublicKey;
  let noMintPda: anchor.web3.PublicKey;

  it("Is initialized!", async () => {
    // 1. Derive PDAs
    [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("market"), creator.publicKey.toBuffer()],
      program.programId
    );
    
    [yesMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("yes"), marketPda.toBuffer()],
      program.programId
    );
    
    [noMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("no"), marketPda.toBuffer()],
      program.programId
    );

    // 2. Call Initialize
    const tx = await program.methods
      .initializeMarket("Will Bitcoin hit 100k by 2025?", 0) // Bump placeholder
      .accounts({
        market: marketPda,
        yesMint: yesMintPda,
        noMint: noMintPda,
        signer: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("Your transaction signature", tx);

    // 3. Verify State
    const marketAccount = await program.account.marketState.fetch(marketPda);
    assert.equal(marketAccount.title, "Will Bitcoin hit 100k by 2025?");
    // Check virtual reserves initialized to 1B (1_000_000_000_000_000)
    assert.ok(marketAccount.yesReserves.eq(new anchor.BN(1_000_000_000_000_000)));
  });

  it("Buys YES tokens (Bonding Curve Test)", async () => {
    // 1. Setup User Token Account (ATA) for YES
    const userYesAta = await anchor.utils.token.associatedAddress({
      mint: yesMintPda,
      owner: creator.publicKey
    });
    
    // 2. Setup Market Vault for NO (Where the unused side goes)
    const marketNoVault = await anchor.utils.token.associatedAddress({
      mint: noMintPda,
      owner: marketPda // Owned by market PDA
    });

    // 3. Execute Buy
    // Buy with 1 SOL (1_000_000_000 lamports)
    const solAmount = new anchor.BN(1_000_000_000);
    
    const tx = await program.methods
      .buyYes(solAmount)
      .accounts({
        market: marketPda,
        yesMint: yesMintPda,
        noMint: noMintPda,
        userYesAccount: userYesAta,
        marketNoVault: marketNoVault,
        signer: creator.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();
      
    console.log("Buy Transaction:", tx);
    
    // 4. Verify Curve Shift
    const marketAccount = await program.account.marketState.fetch(marketPda);
    console.log("New YES Reserves:", marketAccount.yesReserves.toString());
    
    // YES reserves should be LESS than 1B (supply shock)
    assert.ok(marketAccount.yesReserves.lt(new anchor.BN(1_000_000_000_000_000)));
    // NO reserves should be MORE than 1B (glut)
    assert.ok(marketAccount.noReserves.gt(new anchor.BN(1_000_000_000_000_000)));
  });
});