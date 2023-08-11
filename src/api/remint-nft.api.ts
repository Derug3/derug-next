import {
  ICollectionDerugData,
  IRequest,
  RemintDto,
  RemintResponse,
} from "@/interface/collections.interface";
import { derugProgramFactory, metaplex, umi } from "@/solana/utilities";
import { METAPLEX_PROGRAM, RPC_CONNECTION } from "@/utilities/utilities";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
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
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { PUBLIC_REMINT } from "./url.api";
import { get, post } from "./request.api";
import toast from "react-hot-toast";
import { getAuthority } from "./public-mint.api";
import { RemintingStatus } from "@/enums/collections.enums";
import { updateRemintedNft } from "@/common/helpers";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

import { chunk } from "lodash";

export async function remintNft(
  wallet: AnchorWallet,
  mint: string,
  derugData: PublicKey,
  requestAddress: PublicKey,
  derugger: PublicKey,
  candyMachineKey: PublicKey,
  oldCollectionMint: PublicKey,
  newCollectionMint: PublicKey,
  authorityAddress: string,
  firstCreator: string
) {
  const derugProgram = derugProgramFactory();

  const authority = new PublicKey(authorityAddress);
  const feeWallet = new PublicKey(
    "DRG3YRmurqpWQ1jEjK8DiWMuqPX9yL32LXLbuRdoiQwt"
  );

  const newMint = Keypair.generate();
  const oldToken = await RPC_CONNECTION.getParsedTokenAccountsByOwner(
    wallet.publicKey,
    {
      mint: new PublicKey(mint),
    }
  );

  const newToken = await getAssociatedTokenAddress(
    newMint.publicKey,
    wallet.publicKey
  );

  const tokenRecord = metaplex
    .nfts()
    .pdas()
    .tokenRecord({ mint: newMint.publicKey, token: newToken });

  const oldMetadata = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: new PublicKey(mint) });

  const oldCollectionMetadata = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: oldCollectionMint });

  const oldMasterEdition = metaplex
    .nfts()
    .pdas()
    .edition({ mint: new PublicKey(mint) });

  const oldTokenRecord = metaplex
    .nfts()
    .pdas()
    .tokenRecord({
      mint: new PublicKey(mint),
      token: oldToken.value[0].pubkey,
    });

  const [proofPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("derug"), new PublicKey(mint).toBuffer()],
    derugProgram.programId
  );

  const newMasterEdition = metaplex
    .nfts()
    .pdas()
    .edition({ mint: newMint.publicKey });

  const newMetadata = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: newMint.publicKey });

  const collectionMasterEdition = metaplex.nfts().pdas().masterEdition({
    mint: newCollectionMint,
  });

  const collectionMetadata = metaplex.nfts().pdas().metadata({
    mint: newCollectionMint,
  });

  const ix = await derugProgram.methods
    .remintNft()
    .accounts({
      authority,
      oldMint: new PublicKey(mint),
      // tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      feeWallet,
      oldTokenRecord,
      newToken: newToken,
      oldToken: oldToken.value[0].pubkey,
      oldEdition: oldMasterEdition,
      newMetadata,
      metadataProgram: METAPLEX_PROGRAM,
      oldMetadata,
      newEdition: newMasterEdition,
      derugData,
      oldCollectionMetadata: oldCollectionMetadata,
      derugRequest: requestAddress,
      payer: wallet!.publicKey,
      tokenRecord,
      splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      collectionMasterEdition,
      oldCollection: oldCollectionMint,
      metaplexAuthorizationRules: new PublicKey(
        "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg"
      ),
      metaplexFoundationRuleset: new PublicKey(
        "eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9"
      ),
      //TODO: is this the same as oldcollection??
      collectionMint: newCollectionMint,
      collectionMetadata: collectionMetadata,
      newMint: newMint.publicKey,
    })

    .instruction();

  return {
    ix,
    newMint,
  };
}

export async function remintMultipleNfts(
  mints: string[],
  wallet: AnchorWallet,
  request: IRequest,
  collectionDerug: ICollectionDerugData
) {
  let transactions: Transaction[] = [];

  const authority = await getAuthority(collectionDerug.address.toString());

  transactions = await Promise.all(
    mints.map(async (mint) => {
      const transaction = new Transaction({
        recentBlockhash: (await RPC_CONNECTION.getLatestBlockhash()).blockhash,
        feePayer: wallet.publicKey,
      });

      const { ix, newMint } = await remintNft(
        wallet,
        mint,
        collectionDerug.address,
        request.address,
        request.derugger,
        request.candyMachineKey,
        collectionDerug.collection,
        collectionDerug.newCollection,
        authority.authority,
        authority.firstCreator
      );

      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 130000000,
        })
      );

      transaction.add(ix);
      transaction.sign(newMint);

      const txSim = await RPC_CONNECTION.simulateTransaction(transaction);
      console.log(txSim.value.logs);

      return transaction;
    })
  );

  // for (const tx of transactions) {
  //   const txSim = await RPC_CONNECTION.simulateTransaction(tx);
  // }

  const signedTxs = await wallet.signAllTransactions(transactions);

  const serializedTxs = signedTxs.map((tx) =>
    tx.serialize({ requireAllSignatures: false })
  );

  const chunkedTxs = chunk(serializedTxs, 2);

  for (const [index, tx] of chunkedTxs.entries()) {
    await toast.promise(
      post(`${PUBLIC_REMINT}/remint`, {
        signedTx: JSON.stringify(tx[0]),
        signedVerifyTx: JSON.stringify(tx[1]),
        derugData: collectionDerug.address.toString(),
      }),
      {
        loading: "Reminting NFT",
        success: (data: RemintResponse) => {
          if (data.code !== 200) {
            throw new Error(data.message);
          } else {
            updateRemintedNft(mints[index], RemintingStatus.Succeded);
            return "Successfully reminted";
          }
        },
        error: (data: any) => {
          updateRemintedNft(mints[index], RemintingStatus.Failed);
          return data.message;
        },
      }
    );
  }
}

export async function saveDerugData(derugData: PublicKey) {
  await get(`${PUBLIC_REMINT}/save/${derugData}`);
}

export async function initializePublicMint(
  wallet: AnchorWallet,
  derugData: string,
  messageSig: Uint8Array
) {
  const authority = await getAuthority(derugData);

  const authBalance = await RPC_CONNECTION.getBalance(
    new PublicKey(authority.authority)
  );

  if (authBalance < 100) {
    const transferIx = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      lamports: 1 * LAMPORTS_PER_SOL,
      toPubkey: new PublicKey(authority.authority),
    });

    const tx = new Transaction({
      feePayer: wallet.publicKey,
      recentBlockhash: (await RPC_CONNECTION.getLatestBlockhash()).blockhash,
    });

    tx.add(transferIx);

    const signedTx = await wallet.signTransaction(tx);

    await RPC_CONNECTION.sendRawTransaction(signedTx.serialize());
  }

  await toast.promise(
    post(`${PUBLIC_REMINT}/initialize`, {
      derugData,
      payer: wallet.publicKey.toString(),
      signedMessage: bs58.encode(messageSig),
    }),
    {
      loading: "Initializing public mint!",
      success: (data) => {
        if (data.code === 200) {
          return data.message;
        } else {
          throw new Error(data.message);
        }
      },
      error: (data) => {
        return data.message;
      },
    }
  );
}
