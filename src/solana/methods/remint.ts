import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  AccountMeta,
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  IChainCollectionData,
  ICollectionDerugData,
  IRequest,
} from "../../interface/collections.interface";
import { METAPLEX_PROGRAM, RPC_CONNECTION } from "../../utilities/utilities";
import {
  authoritySeed,
  collectionAuthoritySeed,
  derugDataSeed,
  editionSeed,
  metadataSeed,
  remintConfigSeed,
} from "../seeds";
import { sendTransaction } from "../sendTransaction";
import {
  candyMachineProgramId,
  derugProgramFactory,
  feeWallet,
  metadataUploaderWallet,
  metaplex,
  umi,
} from "../utilities";
import {
  AccountLayout,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptAccount,
  getMinimumBalanceForRentExemptMint,
  MintLayout,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  IDerugCollectionNft,
  IDerugInstruction,
} from "../../interface/derug.interface";
import {
  getPrivateMintNft,
  saveCandyMachineData,
  saveMinted,
  storeAllNfts,
} from "../../api/public-mint.api";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { findCandyMachineAuthorityPda } from "@metaplex-foundation/mpl-candy-machine";
import { stringifyData } from "../../common/helpers";
import { UPLOAD_METADATA_FEE } from "../../common/constants";
import { publicKey } from "@metaplex-foundation/umi";
import nftStore from "@/stores/nftStore";
import { RemintingStatus } from "@/enums/collections.enums";

dayjs.extend(utc);

export const claimVictory = async (
  wallet: WalletContextState,
  derug: ICollectionDerugData,
  chainCollectionData: IChainCollectionData,
  request: IRequest
) => {
  const derugProgram = derugProgramFactory();
  const instructions: IDerugInstruction[] = [];

  const remainingAccounts: AccountMeta[] = [];

  if (wallet.publicKey?.toString() !== request.derugger.toString()) {
    throw new Error("Invalid derug authority");
  }

  if (request.publicMint) {
    try {
      const candyMachine = Keypair.generate();

      const candyMachineCreator = findCandyMachineAuthorityPda(umi, {
        candyMachine: publicKey(candyMachine.publicKey),
      });

      await saveCandyMachineData({
        candyMachineKey: candyMachine.publicKey.toString(),
        candyMachineSecretKey: stringifyData(candyMachine.secretKey),
        derugData: derug.address.toString(),
      });

      remainingAccounts.push({
        isSigner: false,
        isWritable: true,
        pubkey: candyMachine.publicKey,
      });
      remainingAccounts.push({
        isSigner: false,
        isWritable: false,
        pubkey: new PublicKey(candyMachineCreator[0]),
      });

      if (request.mintCurrency) {
        const tokenAcc = getAssociatedTokenAddressSync(
          request.mintCurrency,
          wallet.publicKey!
        );
        const accInfo = await RPC_CONNECTION.getAccountInfo(tokenAcc);

        if (accInfo) {
          remainingAccounts.push({
            isSigner: false,
            isWritable: true,
            pubkey: tokenAcc,
          });
        } else {
          const ix = createAssociatedTokenAccountInstruction(
            wallet.publicKey!,
            tokenAcc,
            TOKEN_PROGRAM_ID,
            request.mintCurrency
          );

          instructions.push({
            instructions: [ix],
            pendingDescription:
              "Creating token account for accepting public mint royalites",
            successDescription: "Successfully created token account",
          });
        }
      }
    } catch (error: any) {
      console.log(error);

      toast.error(
        "Failed to get all necessary data for Candy Machine:",
        error.message
      );
      return;
    }
  }

  const claimVictoryIx = await derugProgram.methods
    .claimVictory()
    .accounts({
      derugData: derug.address,
      derugRequest: request.address,
      payer: wallet.publicKey!,
      feeWallet: feeWallet,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  const tokenAccount = Keypair.generate();
  const collection = Keypair.generate();

  const createTokenAcc = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey!,
    lamports: await getMinimumBalanceForRentExemptAccount(RPC_CONNECTION),
    newAccountPubkey: tokenAccount.publicKey,
    programId: TOKEN_PROGRAM_ID,
    space: AccountLayout.span,
  });

  const createMint = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey!,
    lamports: await getMinimumBalanceForRentExemptMint(RPC_CONNECTION),
    newAccountPubkey: collection.publicKey,
    programId: TOKEN_PROGRAM_ID,
    space: MintLayout.span,
  });

  const [pdaAuthority] = PublicKey.findProgramAddressSync(
    [derugDataSeed, request.address.toBuffer(), authoritySeed],
    derugProgram.programId
  );

  const [collectionMetadata] = PublicKey.findProgramAddressSync(
    [
      metadataSeed,
      METAPLEX_PROGRAM.toBuffer(),
      collection.publicKey.toBuffer(),
    ],
    METAPLEX_PROGRAM
  );

  const [collectionMasterEdition] = PublicKey.findProgramAddressSync(
    [
      metadataSeed,
      METAPLEX_PROGRAM.toBuffer(),
      collection.publicKey.toBuffer(),
      editionSeed,
    ],
    METAPLEX_PROGRAM
  );

  const initRemintingIx = await derugProgram.methods
    .initializeReminting()
    .accounts({
      derugData: derug.address,
      derugRequest: request.address,
      payer: wallet.publicKey!,
      feeWallet: feeWallet,
      newCollection: collection.publicKey,
      tokenAccount: tokenAccount.publicKey,
      metadataAccount: collectionMetadata,
      masterEdition: collectionMasterEdition,
      metadataProgram: METAPLEX_PROGRAM,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  instructions.push({
    instructions: [claimVictoryIx, createTokenAcc, createMint, initRemintingIx],
    pendingDescription: "Initializing reminting and claiming victory",
    successDescription: "Successfully initialized reminting",
    partialSigner: [tokenAccount, collection],
  });

  const transferIx = SystemProgram.transfer({
    fromPubkey: wallet.publicKey!,
    lamports: UPLOAD_METADATA_FEE * LAMPORTS_PER_SOL * derug.totalSupply,
    programId: SystemProgram.programId,
    toPubkey: metadataUploaderWallet,
  });

  instructions.push({
    instructions: [transferIx],
    pendingDescription: "Transfering funds for metadata uploads",
    successDescription:
      "Funds successfully transfered.All metadata files for new collection will be uploaded shortly",
  });

  await sendTransaction(RPC_CONNECTION, instructions, wallet);

  storeAllNfts({
    derugData: derug.address.toString(),
    derugRequest: request.address.toString(),
    updateAuthority: chainCollectionData.firstCreator,
  });
};

export const remintNft = async (
  wallet: WalletContextState,
  derugData: ICollectionDerugData,
  request: IRequest,
  nfts: IDerugCollectionNft[]
) => {
  const instructions: IDerugInstruction[] = [];
  const derugProgram = derugProgramFactory();

  const [remintConfig] = PublicKey.findProgramAddressSync(
    [remintConfigSeed, derugData.address.toBuffer()],
    derugProgram.programId
  );
  for (const nft of nfts) {
    const tokenAccount = Keypair.generate();
    const mint = Keypair.generate();
    const [oldMetadata] = PublicKey.findProgramAddressSync(
      [metadataSeed, METAPLEX_PROGRAM.toBuffer(), nft.mint.toBuffer()],
      METAPLEX_PROGRAM
    );

    const [newMasterEdition] = PublicKey.findProgramAddressSync(
      [
        metadataSeed,
        METAPLEX_PROGRAM.toBuffer(),
        mint.publicKey.toBuffer(),
        editionSeed,
      ],
      METAPLEX_PROGRAM
    );

    const [newMetadata] = PublicKey.findProgramAddressSync(
      [metadataSeed, METAPLEX_PROGRAM.toBuffer(), mint.publicKey.toBuffer()],
      METAPLEX_PROGRAM
    );

    const [oldMasterEdition] = PublicKey.findProgramAddressSync(
      [
        metadataSeed,
        METAPLEX_PROGRAM.toBuffer(),
        nft.mint.toBuffer(),
        editionSeed,
      ],
      METAPLEX_PROGRAM
    );

    const [pdaAuthority] = PublicKey.findProgramAddressSync(
      [derugDataSeed, request.address.toBuffer(), authoritySeed],
      derugProgram.programId
    );

    const createTokenAcc = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey!,
      lamports: await getMinimumBalanceForRentExemptAccount(RPC_CONNECTION),
      newAccountPubkey: tokenAccount.publicKey,
      programId: TOKEN_PROGRAM_ID,
      space: AccountLayout.span,
    });

    const createMint = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey!,
      lamports: await getMinimumBalanceForRentExemptMint(RPC_CONNECTION),
      newAccountPubkey: mint.publicKey,
      programId: TOKEN_PROGRAM_ID,
      space: MintLayout.span,
    });

    const remainingAccounts: AccountMeta[] = [];

    if (derugData.collectionMetadata) {
      remainingAccounts.push({
        isSigner: false,
        isWritable: true,
        pubkey: derugData.collectionMetadata,
      });
    }

    const nftData = await getPrivateMintNft(nft.mint.toString());

    if (!nftData.newName || !nftData.newUri) {
      toast.error("Failed to fetch rugged nft data.");
      return;
    }

    const remintNftIx = await derugProgram.methods
      .remintNft(nftData.newName, nftData.newUri)
      .accounts({
        derugData: derugData.address,
        derugRequest: request.address,
        oldEdition: oldMasterEdition,
        oldMetadata: oldMetadata,
        newMint: mint.publicKey,
        oldToken: nft.tokenAccount,
        newToken: tokenAccount.publicKey,
        payer: wallet.publicKey!,
        oldMint: nft.mint,
        feeWallet: feeWallet,
        pdaAuthority,
        newEdition: newMasterEdition,
        newMetadata: newMetadata,
        oldCollection: derugData.collection,
        newCollection: derugData.newCollection!,
        metadataProgram: METAPLEX_PROGRAM,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 130000000,
        }),
      ])
      .remainingAccounts(remainingAccounts)
      .instruction();

    const [collectionMetadata] = PublicKey.findProgramAddressSync(
      [
        metadataSeed,
        METAPLEX_PROGRAM.toBuffer(),
        derugData.newCollection!.toBuffer(),
      ],
      METAPLEX_PROGRAM
    );

    const [collectionMasterEdition] = PublicKey.findProgramAddressSync(
      [
        metadataSeed,
        METAPLEX_PROGRAM.toBuffer(),
        derugData.newCollection!.toBuffer(),
        editionSeed,
      ],
      METAPLEX_PROGRAM
    );

    const [collectionAuthority] = PublicKey.findProgramAddressSync(
      [
        metadataSeed,
        METAPLEX_PROGRAM.toBuffer(),
        derugData.newCollection!.toBuffer(),
        collectionAuthoritySeed,
        pdaAuthority.toBuffer(),
      ],
      METAPLEX_PROGRAM
    );

    instructions.push({
      instructions: [createTokenAcc, createMint, remintNftIx],
      pendingDescription: `Reminting ${nft.metadata.data.name}}`,
      successDescription: `Successfully reminted ${nft.metadata.data.name}`,
      partialSigner: [tokenAccount, mint],
      remintingNft: nft,
    });
  }
  await sendTransaction(RPC_CONNECTION, instructions, wallet);

  const { nfts: storeNfts } = nftStore.getState();

  for (const stNft of storeNfts) {
    if (stNft.status === RemintingStatus.Succeded) {
      await saveMinted(stNft.mint.toString(), wallet.publicKey.toString());
    }
  }
};
