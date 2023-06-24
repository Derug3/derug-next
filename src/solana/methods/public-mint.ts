import {
  getCandyMachineSize,
  toBigNumber,
  TransactionBuilder,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import {
  addConfigLines,
  fetchCandyMachine,
  mintV2,
  getMerkleRoot,
  AllowList,
  create,
  DefaultGuardSetArgs,
  GuardGroupArgs,
  initializeCandyMachineV2,
  MintLimit,
  createCandyMachineV2,
} from "@metaplex-foundation/mpl-candy-machine";
import { walletAdapterIdentity as umiAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";

import {
  createSignerFromKeypair,
  percentAmount,
  publicKey,
  createNoopSigner,
  sol,
  generateSigner,
} from "@metaplex-foundation/umi";

import { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import toast from "react-hot-toast";
import {
  getCandyMachine,
  getNonMinted,
  getWlConfig,
} from "../../api/public-mint.api";
import {
  ICollectionDerugData,
  IRequest,
} from "../../interface/collections.interface";
import {
  CandyMachineDto,
  IRemintConfig,
} from "../../interface/derug.interface";
import { remintConfigSeed } from "../seeds";
import { derugProgramFactory, metaplex, umi } from "../utilities";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { chunk } from "lodash";
import {
  getNftName,
  parseKeyArray,
  parseTransactionError,
} from "../../common/helpers";
import { RPC_CONNECTION } from "../../utilities/utilities";
import { sendTransaction, sendVersionedTx } from "../sendTransaction";
import {
  PROGRAM_ID,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { WlType } from "../../enums/collections.enums";
import {
  none,
  OptionOrNullable,
  signerIdentity,
  some,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { BN } from "bn.js";

dayjs.extend(utc);

export const initCandyMachine = async (
  collectionDerug: ICollectionDerugData,
  wallet: WalletContextState
) => {
  try {
    const derugProgram = derugProgramFactory();

    const nonMintedNfts = await getNonMinted(
      collectionDerug.address.toString()
    );

    const [remintConfig] = PublicKey.findProgramAddressSync(
      [remintConfigSeed, collectionDerug.address.toBuffer()],
      derugProgram.programId
    );
    const remintConfigAccount = await derugProgram.account.remintConfig.fetch(
      remintConfig
    );

    const candyMachineData: CandyMachineDto = await getCandyMachine(
      collectionDerug.address.toString()
    );

    if (!candyMachineData) {
      toast.error("Invalid Candy Machine");
      return;
    }

    const candyMachine = Keypair.fromSecretKey(
      parseKeyArray(candyMachineData.candyMachineSecretKey)
    );

    if (!remintConfigAccount.publicMintPrice) {
      toast.error("You did not select public mint!");
      return;
    }

    let privateMintEnd;

    if (!remintConfigAccount.privateMintEnd) {
      privateMintEnd = new Date();
    } else {
      privateMintEnd = dayjs
        .unix(remintConfigAccount.privateMintEnd.toNumber() / 1000)
        .toDate();
    }

    const wlConfig = await getWlConfig(collectionDerug.address.toString());

    const paymentConfig: any = {
      solPayment: remintConfigAccount.mintCurrency
        ? none()
        : some({
            destination: publicKey(remintConfigAccount.authority),
            lamports: sol(
              remintConfigAccount.publicMintPrice.toNumber() / LAMPORTS_PER_SOL
            ),
          }),
      tokenPayment: remintConfigAccount.mintCurrency
        ? some({
            amount: Number(remintConfigAccount.mintPrice),
            mint: publicKey(remintConfigAccount.mintCurrency),
            destinationAta: publicKey(remintConfigAccount.mintFeeTreasury!),
          })
        : none(),
    };

    let allowListConfig: OptionOrNullable<AllowList> = none();

    if (wlConfig && wlConfig.wlType === WlType.AllowList) {
      const merkleRoot = getMerkleRoot(
        JSON.parse(wlConfig.wallets!).map((walletWl) => walletWl.wallet)
      );

      allowListConfig = some({
        merkleRoot,
      });
    }

    // //TODO:handle mint limit per wallet
    let mintLimit: OptionOrNullable<MintLimit> = none();

    let groups: GuardGroupArgs<DefaultGuardSetArgs>[] | undefined = [
      {
        label: "all",
        guards: {
          ...paymentConfig,
          startDate:
            wlConfig && wlConfig.duration
              ? some({ date: dayjs().add(wlConfig.duration, "hours").toDate() })
              : none(),
        },
      },
    ];

    if (wlConfig && wlConfig.wlType === WlType.AllowList && wlConfig.duration) {
      groups.unshift({
        label: "wl",
        guards: {
          allowList: allowListConfig,
          endDate: some({
            date: dayjs().add(wlConfig.duration, "hours").toDate(),
          }),
          ...paymentConfig,
        },
      });
    }

    const cmSigner = createSignerFromKeypair(umi, {
      publicKey: publicKey(candyMachine.publicKey),
      secretKey: candyMachine.secretKey,
    });

    metaplex.use(walletAdapterIdentity(wallet));

    umi.use(umiAdapterIdentity(wallet));
    await toast.promise(
      (
        await create(umi, {
          candyMachine: cmSigner,
          itemsAvailable: nonMintedNfts.length,
          sellerFeeBasisPoints: percentAmount(
            remintConfigAccount.sellerFeeBps / 100,
            2
          ),
          creators: remintConfigAccount.creators.map((c) => ({
            address: publicKey(c.address),
            percentageShare: c.share,
            verified: true,
          })),
          configLineSettings: some({
            isSequential: false,
            nameLength: 4,
            prefixUri: "",
            uriLength: 0,
            prefixName: "",
          }),
          groups,
          authority: publicKey(remintConfigAccount.authority),
          tokenStandard: TokenStandard.NonFungible,
          isMutable: true,
          symbol: remintConfigAccount.newSymbol,
          tokenMetadataProgram: publicKey(PROGRAM_ID),
          guards: {
            allowList: allowListConfig,
          },
          collectionMint: publicKey(remintConfigAccount.collection),
          collectionUpdateAuthority: createNoopSigner(
            publicKey(remintConfigAccount.authority)
          ),
        })
      ).sendAndConfirm(umi, {
        confirm: {
          commitment: "confirmed",
        },
      }),
      {
        error: "Failed to create candy machine",
        loading: "Creating candy machine",
        success: "Successfully created candy machine",
      }
    );

    return candyMachine.publicKey;
  } catch (error: any) {
    console.log(JSON.parse(JSON.stringify(error)));

    throw error;
  }
};

export const storeCandyMachineItems = async (
  request: IRequest,
  remintConfig: IRemintConfig,
  wallet: WalletContextState,
  derug: ICollectionDerugData
) => {
  try {
    if (
      derug.winningRequest?.toString() !== remintConfig.derugRequest.toString()
    ) {
      throw new Error("Derug request missmatch");
    }

    const nonMintedNfts = await getNonMinted(derug.address.toString());
    const nonMinted = nonMintedNfts.filter((nm) => !nm.hasReminted);

    const chunkedNonMinted = chunk(nonMinted, 10);
    const candyMachineData = await getCandyMachine(derug.address.toString());

    metaplex.use(walletAdapterIdentity(wallet));

    umi.use(umiAdapterIdentity(wallet));
    for (const nonMintedChunk of chunkedNonMinted) {
      const candyMachine = await fetchCandyMachine(
        umi,
        publicKey(new PublicKey(candyMachineData.candyMachineKey))
      );

      await toast.promise(
        addConfigLines(umi, {
          candyMachine: publicKey(candyMachineData.candyMachineSecretKey),
          configLines: nonMintedChunk.map((nmc) => ({
            name: nmc.name,
            uri: nmc.uri,
          })),
          index: candyMachine.itemsLoaded,
        }).sendAndConfirm(umi),
        {
          error: "Failed to insert items in candy machine",
          loading: `Inserting ${chunkedNonMinted.length} NFTs in candy machine`,
          success: "Succesfully inserted NFTs",
        }
      );
    }
  } catch (error: any) {
    throw error;
  }
};

export const mintNftFromCandyMachine = async (
  remintConfig: IRemintConfig,
  wallet: AnchorWallet
) => {
  metaplex.use(walletAdapterIdentity(wallet));
  try {
    umi.use(umiAdapterIdentity(wallet));
    const nftMint = generateSigner(umi);

    await toast.promise(
      mintV2(umi, {
        candyMachine: publicKey(remintConfig.candyMachine),
        nftMint: nftMint,
        collectionMint: publicKey(remintConfig.collection),
        collectionUpdateAuthority: publicKey(remintConfig.authority),
      }).sendAndConfirm(umi),
      {
        error: "Failed to mint!",
        success: "Successfully minted",
        loading: "Minting...",
      }
    );

    const nft = await metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(nftMint.publicKey) });

    return nft;
  } catch (error: any) {
    const parsedError = JSON.parse(JSON.stringify(error)).cause;
    if (parsedError.logs.find((l: any) => l.includes("NotEnoughToken"))) {
      throw new Error(" Not enough tokens to pay for this minting.");
    }
    throw new Error(parseTransactionError(parsedError));
  }
};

export const closeCandyMachine = async (
  remintConfig: IRemintConfig,
  wallet: AnchorWallet
) => {
  try {
    const cm = await metaplex
      .candyMachinesV2()
      .findByAddress({ address: remintConfig.candyMachine });
    metaplex.use(walletAdapterIdentity(wallet));
    await metaplex.candyMachinesV2().delete({
      candyMachine: cm,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
