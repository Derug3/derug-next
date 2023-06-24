import {
  getCandyMachineSize,
  Nft,
  toBigNumber,
  TransactionBuilder,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import {
  addConfigLines,
  mintV2,
  getMerkleRoot,
  AllowList,
  create,
  DefaultGuardSetArgs,
  GuardGroupArgs,
  MintLimit,
  findCandyGuardPda,
  SolPayment,
  TokenPayment,
  CandyMachine,
  route,
  fetchCandyMachine,
  getMerkleProof,
} from "@metaplex-foundation/mpl-candy-machine";
import { walletAdapterIdentity as umiAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  createSignerFromKeypair,
  percentAmount,
  publicKey,
  createNoopSigner,
  sol,
  generateSigner,
  createBigInt,
  transactionBuilder,
  base58PublicKey,
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
  IDerugInstruction,
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
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";

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

    let allowListConfig: OptionOrNullable<AllowList> = none();
    let solPaymentConfig: OptionOrNullable<SolPayment> = none();
    let tokenPaymentConfig: OptionOrNullable<TokenPayment> = none();

    if (wlConfig && wlConfig.wlType === WlType.AllowList) {
      const merkleRoot = getMerkleRoot(
        JSON.parse(wlConfig.wallets!).map((walletWl) => walletWl.wallet)
      );

      allowListConfig = some({
        merkleRoot,
      });
    }

    if (!remintConfigAccount.mintCurrency) {
      solPaymentConfig = {
        destination: publicKey(remintConfigAccount.authority),
        lamports: sol(
          remintConfigAccount.publicMintPrice.toNumber() / LAMPORTS_PER_SOL
        ),
      };
    } else {
      tokenPaymentConfig = {
        amount: createBigInt(Number(remintConfigAccount.mintPrice)),
        mint: publicKey(remintConfigAccount.mintCurrency),
        destinationAta: publicKey(remintConfigAccount.mintFeeTreasury!),
      };
    }

    // //TODO:handle mint limit per wallet
    let mintLimit: OptionOrNullable<MintLimit> = none();

    let groups: GuardGroupArgs<DefaultGuardSetArgs>[] | undefined = [
      {
        label: "all",
        guards: {
          solPayment: solPaymentConfig,
          tokenPayment: tokenPaymentConfig,
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
          solPayment: solPaymentConfig,
          tokenPayment: tokenPaymentConfig,
        },
      });
    }

    const cmSigner = createSignerFromKeypair(umi, {
      publicKey: publicKey(candyMachine.publicKey),
      secretKey: candyMachine.secretKey,
    });

    metaplex.use(walletAdapterIdentity(wallet));

    const collectionNft = await metaplex
      .nfts()
      .findByMint({ mintAddress: remintConfigAccount.collection });
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
            nameLength: 5 + remintConfigAccount.newName.length,
            prefixUri: "https://arweave.net/",
            uriLength: collectionNft.uri.split("/")[3].length,
            prefixName: remintConfigAccount.newName,
          }),
          groups: groups,
          authority: publicKey(remintConfigAccount.authority),
          tokenStandard: TokenStandard.NonFungible,
          isMutable: true,
          symbol: remintConfigAccount.newSymbol,
          tokenMetadataProgram: publicKey(PROGRAM_ID),
          guards: {
            tokenPayment: tokenPaymentConfig,
            solPayment: solPaymentConfig,
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

    const chunkedNonMinted = chunk(nonMinted, 15);

    const candyMachineData = await getCandyMachine(derug.address.toString());

    const candyMachineKeys = Keypair.fromSecretKey(
      parseKeyArray(candyMachineData.candyMachineSecretKey)
    );

    metaplex.use(walletAdapterIdentity(wallet));

    umi.use(umiAdapterIdentity(wallet));

    const instructions: IDerugInstruction[] = [];

    let sumInserted = 0;
    for (const [index, nonMintedChunk] of chunkedNonMinted.entries()) {
      // await toast.promise(

      // const tx = await addConfigLines(umi, {
      //   candyMachine: publicKey(candyMachineKeys.publicKey),
      //   configLines: nonMintedChunk.map((nmc) => ({
      //     name: " #" + nmc.newName.split("#")[1],
      //     uri: nmc.newUri.split("/")[3],
      //   })),
      //   index: candyMachine.itemsLoaded,
      // }).

      //   {
      //     error: "Failed to insert items in candy machine",
      //     loading: `Inserting ${chunkedNonMinted.length} NFTs in candy machine`,
      //     success: "Succesfully inserted NFTs",
      //   }
      // );

      console.log(sumInserted + nonMintedChunk.length);

      const addLines = addConfigLines(umi, {
        candyMachine: publicKey(candyMachineKeys.publicKey),
        configLines: nonMintedChunk.map((nmc) => ({
          name: nmc.newName.split(" ")[1],
          uri: nmc.newUri.split("/")[3],
        })),
        index: sumInserted,
      }).getInstructions();
      instructions.push({
        instructions: addLines.map((ix) => ({
          data: Buffer.from(ix.data),
          programId: new PublicKey(ix.programId),
          keys: ix.keys.map((k) => {
            return {
              isSigner: k.isSigner,
              isWritable: k.isWritable,
              pubkey: new PublicKey(k.pubkey),
            };
          }),
        })),
        pendingDescription: `Inserting batch of ${chunkedNonMinted.length} NFTs`,
        successDescription: "Successfullu inserted NFTs",
      });

      sumInserted += nonMintedChunk.length;
    }

    const transactions: Transaction[] = [];
    for (const [index, ix] of instructions.entries()) {
      const tx = new Transaction({
        feePayer: wallet.publicKey,
        recentBlockhash: (await RPC_CONNECTION.getLatestBlockhash()).blockhash,
      });
      ix.instructions.forEach((inst) => tx.add(inst));

      transactions.push(tx);
    }
    const failed: any[] = [];
    const signedTxs = await wallet.signAllTransactions(transactions);
    for (const [index, tx] of signedTxs.entries()) {
      try {
        const txSig = await RPC_CONNECTION.sendRawTransaction(tx.serialize());
        await RPC_CONNECTION.confirmTransaction(txSig);
        toast.success("Inserted NFTs batch!");
      } catch (error) {
        console.log(JSON.parse(JSON.stringify(error)));

        toast.error("Failed to insert NFTs");
        const relatedFailed = chunkedNonMinted[index];
        failed.push([...relatedFailed]);
      }
    }
    //TODO:store failed in db and retry
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

    const guardPda = findCandyGuardPda(umi, {
      base: publicKey(remintConfig.candyMachine),
    });
    //TODO:remove ekser
    const wlConfig = await getWlConfig("nice-mice");

    const wallets = JSON.parse(wlConfig.wallets).map((w) => w.wallet);
    const merkleRoot = getMerkleRoot(wallets);

    await toast.promise(
      route(umi, {
        guard: "allowList",
        candyMachine: publicKey(remintConfig.candyMachine),
        routeArgs: {
          merkleRoot,
          path: "proof",
          merkleProof: getMerkleProof(wallets, publicKey(umi.identity)),
        },
        group: some("wl"),
      })
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
          mintV2(umi, {
            candyMachine: publicKey(remintConfig.candyMachine),
            nftMint: nftMint,
            collectionMint: publicKey(remintConfig.collection),
            collectionUpdateAuthority: publicKey(remintConfig.authority),
            group: some("wl"),
            tokenStandard: TokenStandard.NonFungible,
            candyGuard: guardPda,
            mintArgs: {
              allowList: some({ merkleRoot }),
              solPayment: some({
                destination: publicKey(remintConfig.authority),
              }),
            },
          })
        )
        .sendAndConfirm(umi),
      {
        error: "Failed to mint!",
        loading: "Minting...",
        success: "Successfully minted!",
      }
    );
    return await metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(nftMint.publicKey) });
  } catch (error: any) {
    console.log(JSON.parse(JSON.stringify(error)));

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
