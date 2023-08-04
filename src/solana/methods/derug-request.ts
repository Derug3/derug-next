import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  GetProgramAccountsFilter,
  AccountMeta,
} from "@solana/web3.js";
import { BN } from "bn.js";
import { getSingleCollection } from "../../api/collections.api";
import {
  getFungibleTokenMetadata,
  getUserDataForDerug,
} from "../../common/helpers";
import { DerugStatus } from "../../enums/collections.enums";
import {
  IChainCollectionData,
  ICollectionData,
  ICollectionDerugData,
  ICollectionStats,
  INftListing,
  IRequest,
} from "../../interface/collections.interface";
import {
  IUtilityData,
  IDerugInstruction,
  IDerugCollectionNft,
  ICreator,
  ISplTokenData,
} from "../../interface/derug.interface";
import { METAPLEX_PROGRAM, RPC_CONNECTION } from "../../utilities/utilities";
import { mapUtilityAction } from "../helpers";
import { derugDataSeed, metadataSeed, voteRecordSeed } from "../seeds";
import { sendTransaction } from "../sendTransaction";
import { derugProgramFactory, feeWallet } from "../utilities";
import { createDerugDataIx } from "./derug";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { initPublicMint } from "@/api/public-mint.api";

dayjs.extend(utc);
export const createOrUpdateDerugRequest = async (
  wallet: WalletContextState,
  utilities: IUtilityData[],
  collection: IChainCollectionData,
  sellerFeeBps: number,
  newSymbol: string,
  newName: string,
  creators: ICreator[],
  publicMintPrice: number,
  privateMintDuration: number,
  splTokenMint: PublicKey,
  listedNft?: INftListing
) => {
  const instructions: TransactionInstruction[] = [];

  const derugProgram = derugProgramFactory();

  let hasActiveData = false;

  try {
    await derugProgram.account.derugData.fetch(collection.derugDataAddress);
    hasActiveData = true;
  } catch (error) {
    hasActiveData = false;
  }

  if (!hasActiveData) {
    instructions.push(
      await createDerugDataIx(collection, wallet, new PublicKey(listedNft.mint))
    );
  }

  const [derugRequest] = PublicKey.findProgramAddressSync(
    [
      derugDataSeed,
      collection.derugDataAddress.toBuffer(),
      wallet.publicKey!.toBuffer(),
    ],
    derugProgram.programId
  );

  const remainingAccounts: AccountMeta[] = [];
  if (splTokenMint) {
    remainingAccounts.push({
      isSigner: false,
      isWritable: false,
      pubkey: splTokenMint,
    });
  }

  const { candyMachine } = await initPublicMint(
    collection.derugDataAddress.toString()
  );

  let destinationAta: PublicKey | null = null;
  if (splTokenMint !== NATIVE_MINT) {
    destinationAta = await getAssociatedTokenAddress(
      splTokenMint,
      wallet.publicKey
    );
    const accountInfo = await RPC_CONNECTION.getAccountInfo(destinationAta);
    if (accountInfo.data.length === 0) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          destinationAta,
          wallet.publicKey,
          splTokenMint
        )
      );
    }
  }

  const initalizeDerugRequest = await derugProgram.methods
    .createOrUpdateDerugRequest(newName, newSymbol, creators, {
      candyMachineKey: new PublicKey(candyMachine),
      mintCurrency: splTokenMint,
      destinationAta: destinationAta,
      publicMintPrice: new BN(publicMintPrice),
      remintDuration: new BN(privateMintDuration),
      sellerFeeBps,
      whitelistConfig: null,
    })
    .accounts({
      derugData: collection.derugDataAddress,
      derugRequest,
      feeWallet: feeWallet,
      payer: wallet.publicKey!,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  instructions.push(initalizeDerugRequest);

  const bypassVoting = await derugProgram.methods
    .bypassVoting()
    .accounts({
      derugData: collection.derugDataAddress,
      derugRequest,
      payer: wallet.publicKey,
    })
    .instruction();

  instructions.push(bypassVoting);

  const derugInstruction: IDerugInstruction = {
    instructions,
    pendingDescription: "Creating derug request",
    successDescription: "Successfully created derug request!",
  };

  await sendTransaction(RPC_CONNECTION, [derugInstruction], wallet);

  return derugRequest;
};

export const getAllDerugRequest = async (
  derugDataAddress: PublicKey
): Promise<IRequest[]> => {
  try {
    const filters: GetProgramAccountsFilter = {
      memcmp: {
        offset: 8,
        bytes: derugDataAddress.toBase58(),
      },
    };

    const derugProgram = derugProgramFactory();

    const allRequestsForCollection =
      await derugProgram.account.derugRequest.all([filters]);

    const requests: IRequest[] = [];

    for (const derug of allRequestsForCollection) {
      console.log(derug);

      requests.push({
        createdAt: derug.account.createdAt.toNumber(),
        derugger: derug.account.derugger,
        voteCount: derug.account.voteCount,
        address: derug.publicKey,
        newName: derug.account.newName,
        newSymbol: derug.account.newSymbol,
        mintCurrency: derug.account.mintConfig.mintCurrency,
        mintPrice: derug.account.mintConfig.publicMintPrice.toNumber(),
        sellerFeeBps: derug.account.sellerFeeBps,
        privateMintDuration: derug.account.mintConfig.remintDuration.toNumber(),
        creators: derug.account.creators,
        publicMint: true,
        splToken: await getFungibleTokenMetadata(derug.account.mintCurrency),
        userData: await getUserDataForDerug(derug.account.derugger.toString()),
      });
    }

    return requests;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getSingleDerugRequest = async (
  derugRequestAddress: PublicKey
): Promise<IRequest> => {
  const derugProgram = derugProgramFactory();

  const derugAccount = await derugProgram.account.derugRequest.fetch(
    derugRequestAddress
  );

  return {
    address: derugRequestAddress,
    createdAt: derugAccount.createdAt.toNumber(),
    derugger: derugAccount.derugger,
    voteCount: derugAccount.voteCount,
    newName: derugAccount.newName,
    newSymbol: derugAccount.newSymbol,
    mintCurrency: derugAccount.mintCurrency,
    mintPrice: derugAccount.mintConfig.publicMintPrice.toNumber(),
    sellerFeeBps: derugAccount.sellerFeeBps,
    privateMintDuration: derugAccount.mintConfig.remintDuration.toNumber(),
    creators: derugAccount.creators,
    publicMint: true,
  };
};

export const getAllActiveCollections = async (): Promise<
  {
    derug: ICollectionDerugData;
    collection: ICollectionData;
  }[]
> => {
  const derugProgram = derugProgramFactory();

  const derugAccount = await derugProgram.account.derugData.all();
  const collections: {
    derug: ICollectionDerugData;
    collection: ICollectionData;
  }[] = [];

  for (const da of derugAccount) {
    try {
      collections.push({
        derug: {
          address: da.publicKey,
          collection: da.account.collection,
          newCollection: da.account.newCollection,
          createdAt: da.account.createdAt?.toNumber(),
          totalReminted: da.account.totalReminted,
          winningRequest: da.account.winningRequest,
          status: Object.keys(da.account.derugStatus)[0] as DerugStatus,
          collectionMetadata: da.account.collectionMetadata,
          thresholdDenominator: da.account.thresholdDenominator,
          totalSuggestionCount: da.account.totalSuggestionCount,
          addedRequests: da.account.activeRequests,
          totalSupply: da.account.totalSupply,
          periodEnd: dayjs.unix(da.account.periodEnd?.toNumber()).toDate(),
        },
        collection: await getSingleCollection(da.account.slug),
      });
    } catch (error) {
      console.log(error);
    }
  }

  return collections;
};

export const castDerugRequestVote = async (
  derugRequest: IRequest,
  wallet: WalletContextState,
  collectionDerug: ICollectionDerugData,
  derugNfts: IDerugCollectionNft[]
) => {
  const derugProgram = derugProgramFactory();
  const derugInstructions: IDerugInstruction[] = [];

  for (const derugNft of derugNfts) {
    const remainingAccounts: AccountMeta[] = [];

    const [voteRecordPda] = PublicKey.findProgramAddressSync(
      [derugDataSeed, derugNft.mint.toBuffer(), voteRecordSeed],
      derugProgram.programId
    );

    const [metadataAddr] = PublicKey.findProgramAddressSync(
      [metadataSeed, METAPLEX_PROGRAM.toBuffer(), derugNft.mint.toBuffer()],
      METAPLEX_PROGRAM
    );

    remainingAccounts.push({
      isSigner: false,
      isWritable: true,
      pubkey: voteRecordPda,
    });

    remainingAccounts.push({
      isSigner: false,
      isWritable: false,
      pubkey: derugNft.mint,
    });
    remainingAccounts.push({
      isSigner: false,
      isWritable: false,
      pubkey: metadataAddr,
    });
    remainingAccounts.push({
      isSigner: false,
      isWritable: false,
      pubkey: derugNft.tokenAccount,
    });

    const castVoteIx = await derugProgram.methods
      .vote()
      .accounts({
        derugData: collectionDerug.address,
        payer: wallet.publicKey!,
        derugRequest: derugRequest.address,
        feeWallet: feeWallet,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();

    derugInstructions.push({
      instructions: [castVoteIx],
      pendingDescription: "Casting vote...",
      successDescription: "Successfully voted",
    });
  }
  await sendTransaction(RPC_CONNECTION, derugInstructions, wallet);
};
