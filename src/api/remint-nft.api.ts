import { RemintDto } from "@/interface/collections.interface";
import {
  metadataSeed,
  editionSeed,
  derugDataSeed,
  authoritySeed,
} from "@/solana/seeds";
import { derugProgramFactory, metaplex } from "@/solana/utilities";
import { METAPLEX_PROGRAM, RPC_CONNECTION } from "@/utilities/utilities";
import { Metaplex } from "@metaplex-foundation/js";
import { request } from "@metaplex-foundation/umi";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AccountLayout,
  MintLayout,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptAccount,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { PUBLIC_REMINT } from "./url.api";
import { post } from "./request.api";

export async function remintNft(
  wallet: AnchorWallet,
  mint: string,
  derugData: PublicKey,
  requestAddress: PublicKey,
  candyMachineKey: PublicKey,
  oldCollectionMint: PublicKey,
  newCollectionMint: PublicKey
) {
  const derugProgram = derugProgramFactory();

  const mintPubkey = new PublicKey(mint);
  //TODO: Update
  const authority = new PublicKey("");
  const feeWallet = new PublicKey("");
  const newToken = Keypair.generate();
  const newMint = Keypair.generate();
  const oldToken = await RPC_CONNECTION.getParsedTokenAccountsByOwner(
    wallet.publicKey,
    {
      mint: new PublicKey(mint),
    }
  );

  const [oldMetadata] = PublicKey.findProgramAddressSync(
    [metadataSeed, METAPLEX_PROGRAM.toBuffer(), mintPubkey.toBuffer()],
    METAPLEX_PROGRAM
  );

  const [oldCollectionMetadata] = PublicKey.findProgramAddressSync(
    [metadataSeed, METAPLEX_PROGRAM.toBuffer(), oldCollectionMint.toBuffer()],
    METAPLEX_PROGRAM
  );

  const [newMasterEdition] = PublicKey.findProgramAddressSync(
    [
      metadataSeed,
      METAPLEX_PROGRAM.toBuffer(),
      mintPubkey.toBuffer(),
      editionSeed,
    ],
    METAPLEX_PROGRAM
  );

  const [newMetadata] = PublicKey.findProgramAddressSync(
    [metadataSeed, METAPLEX_PROGRAM.toBuffer(), mintPubkey.toBuffer()],
    METAPLEX_PROGRAM
  );

  const [oldMasterEdition] = PublicKey.findProgramAddressSync(
    [
      metadataSeed,
      METAPLEX_PROGRAM.toBuffer(),
      mintPubkey.toBuffer(),
      editionSeed,
    ],
    METAPLEX_PROGRAM
  );

  const [pdaAuthority] = PublicKey.findProgramAddressSync(
    [derugDataSeed, requestAddress.toBuffer(), authoritySeed],
    derugProgram.programId
  );

  const [proof] = PublicKey.findProgramAddressSync(
    [Buffer.from("derug"), mintPubkey.toBuffer()],
    derugProgram.programId
  );

  const [firstCreator] = PublicKey.findProgramAddressSync(
    [Buffer.from("derug"), candyMachineKey.toBuffer()],
    derugProgram.programId
  );

  const collectionMasterEdition = metaplex.nfts().pdas().masterEdition({
    mint: oldCollectionMint,
  });

  const ix = await derugProgram.methods
    .remintNft("", "")
    .accounts({
      authority,
      oldMint: new PublicKey(mint),
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
      feeWallet,
      newToken: newToken.publicKey,
      oldToken: oldToken.value[0].pubkey,
      pdaAuthority,
      oldEdition: oldMasterEdition,
      newMetadata,
      oldMetadata,
      newEdition: newMasterEdition,
      derugData,
      derugger: wallet!.publicKey,
      derugRequest: requestAddress,
      metadataProgram: METAPLEX_PROGRAM,
      payer: wallet!.publicKey,
      splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      firstCreator,
      collectionMasterEdition,
      oldCollection: oldCollectionMint,
      metaplexAuthorizationRules: new PublicKey(
        "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg"
      ),
      metaplexFoundationRuleset: new PublicKey(
        "eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9"
      ),
      remintProof: proof,
      //TODO: is this the same as oldcollection??
      collectionMint: oldCollectionMint,
      collectionMetadata: oldCollectionMetadata,
      newCollection: newCollectionMint,
      newMint: newMint.publicKey,
    })
    .preInstructions([
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 130000000,
      }),
    ])
    .instruction();

  return ix;
}

export async function remintMultipleNfts(
  mints: string[],
  wallet: AnchorWallet,
  derugData: PublicKey,
  requestAddress: PublicKey,
  candyMachineKey: PublicKey,
  oldCollectionMint: PublicKey,
  newCollectionMint: PublicKey
) {
  let transactions: Transaction[] = [];

  mints.forEach(async (mint) => {
    const transaction = new Transaction({
      recentBlockhash: (await RPC_CONNECTION.getLatestBlockhash()).blockhash,
      feePayer: wallet.publicKey,
    });

    const ix = await remintNft(
      wallet,
      mint,
      derugData,
      requestAddress,
      candyMachineKey,
      oldCollectionMint,
      newCollectionMint
    );

    transaction.add(ix);
    transactions.push(transaction);
  });

  const signedTxs = await wallet.signAllTransactions(transactions);

  const serializedTxs = signedTxs.map((tx) => tx.serialize());

  const dto: RemintDto = {
    signedTx: serializedTxs,
  };

  const resp = await post(PUBLIC_REMINT + "/" + "remint", dto);
}

export async function sendTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  signers: Keypair[],
  feePayer: Keypair,
  partialSigner?: Keypair
) {
  const recentBlockhash = await connection.getLatestBlockhash();
  const transaction = new Transaction({
    recentBlockhash: recentBlockhash.blockhash,
    feePayer: feePayer.publicKey,
  });
  transaction.add(...instructions);
  if (partialSigner) {
    transaction.partialSign(partialSigner);
  }
  signers.push(feePayer);

  const tx = await connection.sendTransaction(transaction, signers);

  await connection.confirmTransaction(tx);

  return tx;
}
