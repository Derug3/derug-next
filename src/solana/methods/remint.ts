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
  derugProgramFactory,
  feeWallet,
  metaplex,
  PLATFORM_FEE,
  umi,
} from "../utilities";
import {
  AccountLayout,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptAccount,
  getMinimumBalanceForRentExemptMint,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  IDerugCollectionNft,
  IDerugInstruction,
  IRemintConfig,
} from "../../interface/derug.interface";
import {
  getPrivateMintNft,
  saveCandyMachineData,
  saveMinted,
} from "../../api/public-mint.api";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getFungibleTokenMetadata } from "../../common/helpers";
import nftStore from "@/stores/nftStore";
import { MintType, RemintingStatus } from "@/enums/collections.enums";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  createNoopSigner,
  generateSigner,
  lamports,
  none,
  percentAmount,
  publicKey,
  some,
} from "@metaplex-foundation/umi";
import {
  create,
  DefaultGuardSetArgs,
  getMerkleRoot,
  GuardGroupArgs,
} from "@metaplex-foundation/mpl-candy-machine";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { token } from "@metaplex-foundation/js";

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

  try {
    const candyMachine = generateSigner(umi);

    await saveCandyMachineData({
      candyMachineKey: candyMachine.publicKey.toString(),
      candyMachineSecretKey: bs58.encode(candyMachine.secretKey),
      derugData: derug.address.toString(),
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

    const [remintConfigAddress] = PublicKey.findProgramAddressSync(
      [remintConfigSeed, derug.address.toBuffer()],
      derugProgram.programId
    );

    const claimVictoryIx = await derugProgram.methods
      .claimVictory()
      .accounts({
        derugData: derug.address,
        derugRequest: request.address,
        payer: wallet.publicKey!,
        remintConfig: remintConfigAddress,
        feeWallet: feeWallet,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();

    const collectionNft = await metaplex.nfts().findByMint({
      mintAddress: new PublicKey(chainCollectionData.collectionMint),
    });

    const collectionMint = generateSigner(umi);

    const createNft = (
      await metaplex.nfts().builders().create({
        name: collectionNft.name,
        sellerFeeBasisPoints: request.sellerFeeBps,
        uri: collectionNft.uri,
        isMutable: true,
      })
    ).toTransaction(await RPC_CONNECTION.getLatestBlockhash());

    const createTx = await create(umi, {
      candyMachine,
      collectionUpdateAuthority: createNoopSigner(publicKey(wallet.publicKey)),
      creators: request.creators.map((c) => ({
        address: publicKey(c.address),
        percentageShare: c.share,
        verified: false,
      })),
      itemsAvailable: chainCollectionData.totalSupply,
      sellerFeeBasisPoints: percentAmount(request.sellerFeeBps, 2),
      tokenStandard: TokenStandard.ProgrammableNonFungible,
      collectionMint: publicKey(""),
      groups: [
        {
          label: "remint",
          guards: {
            solPayment: {
              destination: publicKey(feeWallet),
              lamports: lamports(0.09),
            },
          },
        },
      ],
    });
  } catch (error: any) {
    console.log(error);

    toast.error(
      "Failed to get all necessary data for Candy Machine:",
      error.message
    );
    return;
  }
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
        remintConfig,
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

    const updateVerifyCollection = await derugProgram.methods
      .updateVerifyCollection()
      .accounts({
        collectionAuthority,
        derugData: derugData.address,
        derugger: request.derugger,
        collectionMint: derugData.newCollection!,
        nftMint: mint.publicKey,
        nftMetadata: newMetadata,
        feeWallet: feeWallet,
        systemProgram: SystemProgram.programId,
        pdaAuthority,
        payer: wallet.publicKey!,
        derugRequest: request.address,
        collectionMetadata: collectionMetadata,
        collectionMasterEdition,
        metadataProgram: METAPLEX_PROGRAM,
      })
      .instruction();

    instructions.push({
      instructions: [createTokenAcc, createMint, remintNftIx],
      pendingDescription: `Reminting ${nft.metadata.data.name}}`,
      successDescription: `Successfully reminted ${nft.metadata.data.name}`,
      partialSigner: [tokenAccount, mint],
      remintingNft: nft,
    });
    instructions.push({
      instructions: [updateVerifyCollection],
      pendingDescription: "Verifying NFT collection",
      successDescription: `Successfully verified collection for NFT:${nft.metadata.data.name}`,
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

export async function getRemintConfig(
  derug: PublicKey
): Promise<IRemintConfig | undefined> {
  const derugProgram = derugProgramFactory();
  const [remintConfigAddress] = PublicKey.findProgramAddressSync(
    [remintConfigSeed, derug.toBuffer()],
    derugProgram.programId
  );

  try {
    const remintConfigAccount = await derugProgram.account.remintConfig.fetch(
      remintConfigAddress
    );

    return {
      address: remintConfigAddress,
      authority: remintConfigAccount.authority,
      candyMachine: remintConfigAccount.candyMachineKey,
      candyMachineCreator: remintConfigAccount.candyMachineCreator,
      collection: remintConfigAccount.collection,
      mintCurrency: remintConfigAccount.mintCurrency ?? undefined,
      mintPrice: remintConfigAccount.publicMintPrice?.toNumber(),
      derugRequest: remintConfigAccount.derugRequest,
      newName: remintConfigAccount.newName,
      newSymbol: remintConfigAccount.newSymbol,
      sellerFeeBps: remintConfigAccount.sellerFeeBps,
      privateMintEnd: remintConfigAccount.privateMintEnd
        ? dayjs.unix(remintConfigAccount.privateMintEnd?.toNumber()).toDate()
        : undefined,
      splTokenData: await getFungibleTokenMetadata(
        remintConfigAccount.mintCurrency
      ),
    };
  } catch (error) {
    return undefined;
  }
}

export const getRemintGurads = (
  privateMintHoursDuration: number
): GuardGroupArgs<DefaultGuardSetArgs> => {
  return {
    guards: {
      solPayment: {
        destination: publicKey(feeWallet),
        lamports: lamports(PLATFORM_FEE),
      },
      startDate: {
        date: dayjs().toDate(),
      },
      endDate: {
        date: dayjs().add(privateMintHoursDuration, "hours").toDate(),
      },
    },
    label: "remint",
  };
};

export const getWlGuards = async (
  wlPrice: number,
  mintType: MintType,
  destination: PublicKey,
  startsAt: number,
  hoursDuration: number,
  whitelistedWallets?: string[],
  mintCurrency?: PublicKey
): Promise<GuardGroupArgs<DefaultGuardSetArgs>> => {
  const merkleRoot = getMerkleRoot(whitelistedWallets);

  return {
    guards: {
      botTax: {
        lastInstruction: true,
        lamports: lamports(wlPrice),
      },
      allowList: {
        merkleRoot,
      },
      startDate: {
        date: dayjs().add(startsAt, "hours").toDate(),
      },
      endDate: {
        date: dayjs().add(hoursDuration, "hours").toDate(),
      },
      solPayment:
        mintType === MintType.Sol
          ? some({
              destination: publicKey(destination),
              lamports: lamports(wlPrice),
            })
          : none(),
      tokenPayment:
        mintType === MintType.Sol
          ? some({
              amount: wlPrice,
              destinationAta: publicKey(destination),
              mint: publicKey(mintCurrency),
            })
          : none(),
    },
    label: "whitelist",
  };
};

export const getPublicGuards = (
  publicPrice: number,
  mintType: MintType,
  destination: PublicKey,
  mintCurrency?: PublicKey
): GuardGroupArgs<DefaultGuardSetArgs> => {
  return {
    guards: {
      botTax: {
        lamports: lamports(publicPrice),
        lastInstruction: true,
      },
      solPayment:
        mintType === MintType.Sol
          ? some({
              destination: publicKey(destination),
              lamports: lamports(publicPrice),
            })
          : none(),
      tokenPayment:
        mintType === MintType.Token
          ? some({
              amount: publicPrice,
              destinationAta: publicKey(destination),
              mint: publicKey(mintCurrency),
            })
          : none(),
    },
    label: "public",
  };
};
