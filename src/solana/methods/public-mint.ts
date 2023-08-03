import { walletAdapterIdentity } from "@metaplex-foundation/js";
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
  route,
  fetchCandyMachine,
  getMerkleProof,
  findMintCounterPda,
  fetchCandyGuard,
  CandyGuard,
  DefaultGuardSet,
  GuardGroup,
  fetchMintCounter,
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
  Pda,
  dateTime,
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
  IDerugCandyMachine,
  IDerugInstruction,
  IRemintConfig,
  MintingCurrency,
  PublicConfig,
  WhitelistConfig,
} from "../../interface/derug.interface";
import { remintConfigSeed } from "../seeds";
import { derugProgramFactory, metaplex, umi } from "../utilities";
import { chunk } from "lodash";
import { parseKeyArray, parseTransactionError } from "../../common/helpers";
import { RPC_CONNECTION } from "../../utilities/utilities";
import {
  PROGRAM_ID,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { WlType } from "../../enums/collections.enums";
import { none, OptionOrNullable, some } from "@metaplex-foundation/umi";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { SolanaTokenListResolutionStrategy } from "@solana/spl-token-registry";
import { divide, pow } from "mathjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";

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
      privateMintEnd = new Date(remintConfigAccount.privateMintEnd.toNumber());
    }

    const wlConfig = await getWlConfig(collectionDerug.address.toString());

    // let allowListConfig: OptionOrNullable<AllowList> = none();
    let solPaymentConfig: OptionOrNullable<SolPayment> = none();
    let tokenPaymentConfig: OptionOrNullable<TokenPayment> = none();

    // if (wlConfig && wlConfig.wlType === WlType.AllowList) {
    //   const merkleRoot = getMerkleRoot(
    //     JSON.parse(wlConfig.wallets!).map((walletWl) => walletWl.wallet)
    //   );

    //   // allowListConfig = some({
    //   //   merkleRoot,
    //   // });
    // }

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
              ? //TODO:remove ekser before nm
                some({
                  date: dateTime(
                    new Date().setHours(new Date().getHours() + 1)
                  ),
                })
              : none(),
        },
      },
    ];

    if (wlConfig && wlConfig.wlType === WlType.AllowList && wlConfig.duration) {
      groups.unshift({
        label: "wl",
        guards: {
          // allowList: allowListConfig,
          endDate: some({
            //TODO:remove ekser before nm
            date: dateTime(new Date().setHours(new Date().getHours() + 1)),
          }),
          solPayment: solPaymentConfig,
          tokenPayment: tokenPaymentConfig,
          //TODO:remove ekser
          mintLimit: some({
            id: 1,
            limit: 3,
          }),
        },
      });
    }

    const cmSigner = createSignerFromKeypair(umi, {
      publicKey: publicKey(candyMachine.publicKey),
      secretKey: candyMachine.secretKey,
    });

    umi.use(umiAdapterIdentity(wallet));

    await toast.promise(
      (
        await create(umi, {
          candyMachine: cmSigner,
          itemsAvailable: 1890,
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
            prefixUri:
              "https://shdw-drive.genesysgo.net/AdCwAc5Hcubbog6wAxcsMVUZKfwNqAmfmgiP8GsFYvkw/",
            uriLength: 10,
            prefixName: remintConfigAccount.newName,
          }),
          groups: groups,
          authority: publicKey(remintConfigAccount.authority),
          tokenStandard: TokenStandard.NonFungible,
          isMutable: true,
          symbol: remintConfigAccount.newSymbol,
          tokenMetadataProgram: publicKey(PROGRAM_ID),
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
    const globalChunk = chunk(nonMinted, 135);

    for (const c of globalChunk) {
      const chunkedNonMinted = chunk(c, 15);

      const candyMachineData = await getCandyMachine(derug.address.toString());

      const candyMachineKeys = Keypair.fromSecretKey(
        parseKeyArray(candyMachineData.candyMachineSecretKey)
      );

      metaplex.use(walletAdapterIdentity(wallet));

      umi.use(umiAdapterIdentity(wallet));

      const instructions: IDerugInstruction[] = [];

      let sumInserted = 0;
      for (const [index, nonMintedChunk] of chunkedNonMinted.entries()) {
        console.log(sumInserted + nonMintedChunk.length);

        const addLines = addConfigLines(umi, {
          candyMachine: publicKey(candyMachineKeys.publicKey),
          configLines: nonMintedChunk.map((nmc) => ({
            name: " #" + nmc.newName.split("#")[1],
            uri: nmc.newUri.split("/")[4],
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
          recentBlockhash: (await RPC_CONNECTION.getLatestBlockhash())
            .blockhash,
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
    // const wlConfig = await getWlConfig("nice-mice");

    // const wallets = JSON.parse(wlConfig.wallets).map((w) => w.wallet);
    // const merkleRoot = getMerkleRoot(wallets);

    // await route(umi, {
    //   guard: "allowList",
    //   candyMachine: publicKey("FdXesCWBfB9KoruJVgLmMC9hNq3GoFg3BMNEfBxFJTkb"),
    //   routeArgs: {
    //     merkleRoot,
    //     path: "proof",
    //     merkleProof: getMerkleProof(wallets, publicKey(umi.identity)),
    //   },
    //   group: some("wl"),
    // })
    //   .add(setComputeUnitLimit(umi, { units: 1400000 }))
    //   .sendAndConfirm(umi);

    await toast.promise(
      mintV2(umi, {
        candyMachine: publicKey(remintConfig.candyMachine),
        nftMint: nftMint,
        collectionMint: publicKey(remintConfig.collection),
        collectionUpdateAuthority: publicKey(remintConfig.authority),
        group: some("wl"),
        tokenStandard: TokenStandard.NonFungible,
        candyGuard: guardPda,
        mintArgs: {
          // allowList: some({ merkleRoot }),
          solPayment: some({
            destination: publicKey(remintConfig.authority),
          }),
          mintLimit: some({ id: 1 }),
        },
      })
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .sendAndConfirm(umi),
      {
        error: "Failed to mint!",
        loading: "Minting...",
        success: "Successfully minted!",
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return await metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(nftMint.publicKey) });
  } catch (error: any) {
    console.log(error);

    console.log(JSON.parse(JSON.stringify(error)));

    const parsedError = JSON.parse(JSON.stringify(error)).cause;
    if (parsedError.logs.find((l: any) => l.includes("NotEnoughToken"))) {
      throw new Error(" Not enough tokens to pay for this minting.");
    }
    throw new Error(parseTransactionError(parsedError));
  }
};

export const mintPublic = async (
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

    await toast.promise(
      mintV2(umi, {
        candyMachine: publicKey(remintConfig.candyMachine),
        nftMint: nftMint,
        collectionMint: publicKey(remintConfig.collection),
        collectionUpdateAuthority: publicKey(remintConfig.authority),
        group: some("all"),
        tokenStandard: TokenStandard.NonFungible,
        candyGuard: guardPda,
        mintArgs: {
          solPayment: some({
            destination: publicKey(remintConfig.authority),
          }),
        },
      })
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .sendAndConfirm(umi),
      {
        error: "Failed to mint!",
        loading: "Minting...",
        success: "Successfully minted!",
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
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

export async function getDerugCandyMachine(
  remintConfig: IRemintConfig,
  wallet?: AnchorWallet
): Promise<IDerugCandyMachine> {
  try {
    const candyMachine = await fetchCandyMachine(
      umi,
      publicKey(remintConfig.candyMachine)
    );

    const guardPda = findCandyGuardPda(umi, {
      base: publicKey(remintConfig.candyMachine),
    });

    const guards = await fetchCandyGuard(umi, guardPda);

    return {
      candyMachine,
      publicConfig: await getPublicConfiguration(guards),
      whitelistingConfig: await getWhitelistingConfig(
        guards,
        wallet,
        remintConfig.candyMachine,
        guardPda
      ),
    };
  } catch (error) {
    console.log(error);
  }
}

export const getWhitelistingConfig = async (
  guards: CandyGuard<DefaultGuardSet>,
  wallet: AnchorWallet,
  candyMachine: PublicKey,
  guardPda: Pda<string, number>
): Promise<WhitelistConfig> => {
  const wlGroup = guards.groups.find((g) => g.label === "wl");

  let isWhitelisted = false;

  // if (wlGroup.guards.allowList !== none()) {
  //TODO:remove ekser
  const wlConfig = await getWlConfig("nice-mice");
  const wallets = JSON.parse(wlConfig.wallets);
  isWhitelisted = !!wallets.find(
    (w) => w.wallet === wallet?.publicKey?.toString()
  );
  // }

  let endDate: Date | string = new Date();
  let walletLimit: number | undefined = undefined;
  let unix: number = dayjs().unix();
  if (wlGroup.guards.endDate.__option === "Some") {
    unix = Number(wlGroup.guards.endDate.value.date.toString());
    endDate = new Date(unix).toLocaleString();

    const [day, month, year, hour, minute, second] = endDate.match(/\d+/g);
    endDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  }

  if (wlGroup.guards.mintLimit.__option === "Some") {
    walletLimit = wlGroup.guards.mintLimit.value.limit;
  }

  if (wlGroup.guards.mintLimit.__option === "Some") {
    const pda = findMintCounterPda(umi, {
      id: 1,
      user: publicKey(wallet.publicKey),
      candyMachine: publicKey(candyMachine),
      candyGuard: publicKey(guardPda[0]),
    });
    try {
      const mintCounterAccount = await fetchMintCounter(umi, pda);
      walletLimit = mintCounterAccount.count;
    } catch (error) {
      walletLimit = 0;
    }
  }

  const { currency, price } = await getGuardPayment(wlGroup);
  const currUnix = dayjs().unix() * 1000;

  return {
    currency,
    endDate: dayjs()
      .add(unix - currUnix, "milliseconds")
      .toDate(),
    groupName: "wl",
    price,
    walletLimit,
    isWhitelisted,
    isActive: currUnix < unix,
  };
};

export const getPublicConfiguration = async (
  guards: CandyGuard<DefaultGuardSet>
): Promise<PublicConfig> => {
  const wlGroup = guards.groups.find((g) => g.label === "all");

  const { price, currency } = await getGuardPayment(wlGroup);

  let startDate = new Date();

  if (wlGroup.guards.startDate.__option === "Some") {
    startDate = new Date(Number(wlGroup.guards.startDate.value.date) * 1000);
  }

  return {
    currency,
    groupName: "all",
    startDate: startDate,
    price,
  };
};

export const getGuardPayment = async (wlGroup: GuardGroup<DefaultGuardSet>) => {
  let price: number | undefined = undefined;
  let currency: MintingCurrency | undefined = undefined;

  if (wlGroup.guards.solPayment.__option === "Some") {
    currency = {
      decimals: wlGroup.guards.solPayment.value.lamports.decimals,
      name: wlGroup.guards.solPayment.value.lamports.identifier,
    };
    price = divide(
      Number(wlGroup.guards.solPayment.value.lamports.basisPoints),
      pow(10, wlGroup.guards.solPayment.value.lamports.decimals)
    ) as number;
  }

  if (wlGroup.guards.tokenPayment.__option === "Some") {
    const mint = wlGroup.guards.tokenPayment.value.mint;
    price = Number(wlGroup.guards.tokenPayment.value.amount);
    const tokenList = await new SolanaTokenListResolutionStrategy().resolve();
    const relatedToken = tokenList.find(
      (t) => t.address.toString() === mint.toString()
    );
    if (relatedToken) {
      currency = {
        decimals: relatedToken.decimals,
        name: relatedToken.name,
      };
    }
  }

  return { price, currency };
};
