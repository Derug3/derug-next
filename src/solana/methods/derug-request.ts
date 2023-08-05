import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  GetProgramAccountsFilter,
  AccountMeta,
  Keypair,
  SYSVAR_RENT_PUBKEY,
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
import { derugProgramFactory, feeWallet, metaplex } from "../utilities";
import { createDerugDataIx } from "./derug";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { initPublicMint, storeAllNfts } from "@/api/public-mint.api";

dayjs.extend(utc);
export const createOrUpdateDerugRequest = async (
  wallet: WalletContextState,
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
  if (splTokenMint && splTokenMint.toString() !== NATIVE_MINT.toString()) {
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

  if (splTokenMint.toString() !== NATIVE_MINT.toString()) {
    destinationAta = await getAssociatedTokenAddress(
      splTokenMint,
      wallet.publicKey
    );
    const accountInfo = await RPC_CONNECTION.getAccountInfo(destinationAta);
    if (accountInfo?.data.length === 0) {
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
    .createOrUpdateDerugRequest(
      newName,
      newSymbol,
      {
        candyMachineKey: new PublicKey(candyMachine),
        mintCurrency: splTokenMint,
        destinationAta: destinationAta,
        publicMintPrice: new BN(publicMintPrice),
        remintDuration: new BN(privateMintDuration),
        sellerFeeBps,
        whitelistConfig: null,
      },
      creators
    )
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

  const claimVictoryIx = await derugProgram.methods
    .claimVictory()
    .accounts({
      derugData: collection.derugDataAddress,
      derugRequest: derugRequest,
      payer: wallet.publicKey!,
      feeWallet: feeWallet,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  instructions.push(claimVictoryIx);

  const collectionMint = Keypair.generate();

  const tokenAccount = Keypair.generate();

  const collectionMetadata = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: collectionMint.publicKey });
  const collectionEdition = metaplex
    .nfts()
    .pdas()
    .edition({ mint: collectionMint.publicKey });

  const initRemintingIx = await derugProgram.methods
    .initializeReminting()
    .accounts({
      derugData: collection.derugDataAddress,
      derugRequest: derugRequest,
      payer: wallet.publicKey!,
      feeWallet: feeWallet,
      newCollection: collectionMint.publicKey,
      tokenAccount: tokenAccount.publicKey,
      metadataAccount: collectionMetadata,
      masterEdition: collectionEdition,
      metadataProgram: METAPLEX_PROGRAM,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  instructions.push(initRemintingIx);

  const derugInstruction: IDerugInstruction[] = [
    {
      instructions,
      pendingDescription: "Creating derug request",
      successDescription: "Successfully created derug request!",
      partialSigner: [collectionMint, tokenAccount],
    },
  ];

  await sendTransaction(RPC_CONNECTION, derugInstruction, wallet);

  storeAllNfts({
    derugData: collection.derugDataAddress.toString(),
    derugRequest: derugRequest.toString(),
    creator: collection.firstCreator,
  });

  return derugRequest;
};

export const getAllDerugRequest = async (
  derugDataAddress: PublicKey
): Promise<IRequest> => {
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
      requests.push({
        createdAt: derug.account.createdAt.toNumber(),
        derugger: derug.account.derugger,
        voteCount: derug.account.voteCount,
        address: derug.publicKey,
        newName: derug.account.newName,
        newSymbol: derug.account.newSymbol,
        status: Object.keys(derug.account.requestStatus)[0] as DerugStatus,
        candyMachineKey: derug.account.mintConfig.candyMachineKey,
        mintCurrency: derug.account.mintConfig.mintCurrency,
        mintPrice: derug.account.mintConfig.publicMintPrice.toNumber(),
        sellerFeeBps: derug.account.mintConfig.sellerFeeBps,
        privateMintDuration: derug.account.mintConfig.remintDuration.toNumber(),
        creators: derug.account.creators,
        publicMint: true,
        splToken: await getFungibleTokenMetadata(
          derug.account.mintConfig.mintCurrency
        ),
        userData: await getUserDataForDerug(derug.account.derugger.toString()),
      });
    }

    return requests[0];
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
  console.log(derugAccount, "RAW REQUEST");

  return {
    address: derugRequestAddress,
    createdAt: derugAccount.createdAt.toNumber(),
    derugger: derugAccount.derugger,
    voteCount: derugAccount.voteCount,
    newName: derugAccount.newName,
    status: Object.keys(derugAccount.requestStatus)[0] as DerugStatus,
    candyMachineKey: derugAccount.mintConfig.candyMachineKey,
    newSymbol: derugAccount.newSymbol,
    mintCurrency: derugAccount.mintCurrency,
    mintPrice: derugAccount.mintConfig.publicMintPrice.toNumber(),
    sellerFeeBps: derugAccount.mintConfig.sellerFeeBps,
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
