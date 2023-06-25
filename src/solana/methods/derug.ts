import { SystemProgram, TransactionInstruction } from "@solana/web3.js";
import {
  IChainCollectionData,
  ICollectionDerugData,
  ICollectionStats,
  INftListing,
} from "../../interface/collections.interface";
import { PublicKey } from "@solana/web3.js";
import { metadataSeed } from "../seeds";
import { derugProgramFactory } from "../utilities";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { METAPLEX_PROGRAM, RPC_CONNECTION } from "../../utilities/utilities";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";

import { DerugStatus } from "../../enums/collections.enums";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const createDerugDataIx = async (
  collection: IChainCollectionData,
  wallet: WalletContextState,
  collectionStats: ICollectionStats,
  listedNftMint?: PublicKey
) => {
  const derugProgram = derugProgramFactory();
  const collectionKey = new PublicKey(collection.collectionMint);

  const collectionAccountInf = await RPC_CONNECTION.getAccountInfo(
    collectionKey
  );

  let collectionMetadata: PublicKey | undefined;
  let mintKey: PublicKey | undefined;

  if (collectionAccountInf?.owner.toString() === TOKEN_PROGRAM_ID.toString()) {
    mintKey = collectionKey;
  } else {
    mintKey = listedNftMint!;
  }

  [collectionMetadata] = PublicKey.findProgramAddressSync(
    [metadataSeed, METAPLEX_PROGRAM.toBuffer(), mintKey.toBuffer()],
    METAPLEX_PROGRAM
  );

  const metadataAccInfo = await RPC_CONNECTION.getAccountInfo(
    collectionMetadata
  );
  if (
    !metadataAccInfo ||
    metadataAccInfo.owner.toString() !== METAPLEX_PROGRAM.toString()
  ) {
    [collectionMetadata] = PublicKey.findProgramAddressSync(
      [metadataSeed, METAPLEX_PROGRAM.toBuffer(), listedNftMint!.toBuffer()],
      METAPLEX_PROGRAM
    );
  }

  //TODO:PUT REAL VALUE BEFORE MAINNET

  const ix = await derugProgram.methods
    .initializeDerug(2470, collection.slug)
    .accounts({
      collectionKey,
      derugData: collection.derugDataAddress,
      payer: wallet.publicKey!,
      collectionMetadata,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  return ix;
};

export const getCollectionDerugData = async (
  derugDataAddress: PublicKey
): Promise<ICollectionDerugData> => {
  try {
    const derugProgram = derugProgramFactory();
    const derugDataAccount = await derugProgram.account.derugData.fetch(
      derugDataAddress
    );

    return {
      collection: derugDataAccount.collection,
      createdAt: derugDataAccount.dateAdded.toNumber(),
      status: Object.keys(derugDataAccount.derugStatus)[0] as DerugStatus,
      totalReminted: derugDataAccount.totalReminted,
      totalSuggestionCount: derugDataAccount.totalSuggestionCount,
      totalSupply: derugDataAccount.totalSupply,
      periodEnd: dayjs(derugDataAccount.periodEnd.toNumber() * 1000).toDate(),
      newCollection: derugDataAccount.newCollection,
      winningRequest: derugDataAccount.winningRequest,
      address: derugDataAddress,
      collectionMetadata: derugDataAccount.collectionMetadata,
      addedRequests: derugDataAccount.activeRequests,
      thresholdDenominator: derugDataAccount.thresholdDenominator,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
