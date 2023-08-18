import { walletAdapterIdentity } from "@metaplex-foundation/js";
import {
  mintV2,
  create,
  DefaultGuardSetArgs,
  GuardGroupArgs,
  MintLimit,
  findMintCounterPda,
  SolPayment,
  TokenPayment,
  fetchCandyGuard,
  fetchCandyMachine,
  findCandyGuardPda,
  CandyGuard,
  DefaultGuardSet,
  GuardGroup,
  fetchMintCounter,
  findCandyMachineAuthorityPda,
} from "derug-tech-mpl-candy-machine";
import {
  toWeb3JsInstruction,
  toWeb3JsKeypair,
} from "@metaplex-foundation/umi-web3js-adapters";
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
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import toast from "react-hot-toast";
import {
  getAuthority,
  getCandyMachine,
  getNonMinted,
  getWlConfig,
  mintCandyMachine,
} from "../../api/public-mint.api";
import {
  ICollectionDerugData,
  IRequest,
} from "../../interface/collections.interface";
import {
  CandyMachineDto,
  IDerugCandyMachine,
  IDerugInstruction,
  MintingCurrency,
  PublicConfig,
  WhitelistConfig,
} from "../../interface/derug.interface";
import { remintConfigSeed } from "../seeds";
import {
  derugProgramFactory,
  metaplex,
  metaplexAuthorizationRuleSet,
  umi,
} from "../utilities";
import { chunk } from "lodash";
import { parseKeyArray, parseTransactionError } from "../../common/helpers";
import { RPC_CONNECTION } from "../../utilities/utilities";
import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
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
import nftStore from "@/stores/nftStore";

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
        amount: createBigInt(Number(remintConfigAccount.publicMintPrice)),
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
          tokenMetadataProgram: publicKey(MPL_TOKEN_METADATA_PROGRAM_ID),
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

export const mintNftFromCandyMachine = async (
  request: IRequest,
  wallet: AnchorWallet,
  collectionDerug: ICollectionDerugData
) => {
  metaplex.use(walletAdapterIdentity(wallet));
  try {
    umi.use(umiAdapterIdentity(wallet));
    const nftMint = generateSigner(umi);

    const guardPda = findCandyGuardPda(umi, {
      base: publicKey(request.candyMachineKey),
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
        candyMachine: publicKey(request.candyMachineKey),
        nftMint: nftMint,
        collectionMint: publicKey(collectionDerug.newCollection),
        collectionUpdateAuthority: publicKey(request.derugger),
        group: some("wl"),
        tokenStandard: TokenStandard.ProgrammableNonFungible,
        authorizationRules: publicKey(metaplexAuthorizationRuleSet),
        candyGuard: publicKey(guardPda),
        mintArgs: {
          // allowList: some({ merkleRoot }),
          solPayment: some({
            destination: publicKey(request.derugger),
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
  request: IRequest,
  wallet: AnchorWallet,
  collectionDerug: ICollectionDerugData,
  mintsCount: number
) => {
  metaplex.use(walletAdapterIdentity(wallet));
  const transactions: Transaction[] = [];
  const mints: string[] = [];
  const { setPublicMintNfts, publicMintNfts } = nftStore.getState();
  try {
    umi.use(umiAdapterIdentity(wallet));
    for (let i = 0; i < mintsCount; i++) {
      const nftMint = generateSigner(umi);
      const guardPda = findCandyGuardPda(umi, {
        base: publicKey(request.candyMachineKey),
      });
      const derugProgram = derugProgramFactory();
      const [authorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("derug"), request.candyMachineKey.toBuffer()],
        derugProgram.programId
      );
      const authority = await getAuthority(collectionDerug.address.toString());

      const authPda = findCandyMachineAuthorityPda(umi, {
        candyMachine: publicKey(request.candyMachineKey),
      });

      const [wAuth] = PublicKey.findProgramAddressSync(
        [Buffer.from("derug"), request.candyMachineKey.toBuffer()],
        derugProgram.programId
      );
      console.log(authPda, authorityPda.toString(), wAuth.toString(), "APDA");

      const collectionMetadata = metaplex
        .nfts()
        .pdas()
        .metadata({ mint: collectionDerug.newCollection });

      const instruction = mintV2(umi, {
        firstCreator: createNoopSigner(publicKey(authority.authority)),
        candyMachine: publicKey(request.candyMachineKey),
        nftMint: nftMint,
        collectionMint: publicKey(collectionDerug.newCollection),
        payer: createNoopSigner(publicKey(wallet.publicKey)),
        collectionMetadata: publicKey(collectionMetadata),
        collectionUpdateAuthority: publicKey(authority.authority),
        group: some("public"),
        tokenStandard: TokenStandard.ProgrammableNonFungible,
        authorizationRules: publicKey(metaplexAuthorizationRuleSet),
        candyGuard: publicKey(guardPda),
        mintArgs: {
          solPayment: some({
            destination: publicKey(request.derugger),
          }),
        },
      })
        .getInstructions()
        .map((ix) => toWeb3JsInstruction(ix));

      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        recentBlockhash: (await RPC_CONNECTION.getLatestBlockhash()).blockhash,
      });
      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 800_000 })
      );
      transaction.add(instruction[0]);
      // transaction.add(
      //   SystemProgram.transfer({
      //     fromPubkey: wallet.publicKey,
      //     toPubkey: new PublicKey(
      //       "DRG3YRmurqpWQ1jEjK8DiWMuqPX9yL32LXLbuRdoiQwt"
      //     ),
      //     lamports: 0.09 * LAMPORTS_PER_SOL,
      //   })
      // );

      transaction.sign(toWeb3JsKeypair(nftMint));
      transactions.push(transaction);
      mints.push(nftMint.publicKey);
    }

    const signedTx = await wallet.signAllTransactions(transactions);

    for (const [index, sTx] of signedTx.entries()) {
      const serializedTx = JSON.stringify(
        sTx.serialize({ requireAllSignatures: false })
      );

      await toast.promise(
        mintCandyMachine(collectionDerug.address.toString(), serializedTx),
        {
          error: (data) => {
            return data.message;
          },
          loading: "Minting...",
          success: (data) => {
            if (data.code === 200) {
              return data.message;
            } else {
              throw new Error(data.message);
            }
          },
        }
      );

      const nft = await metaplex
        .nfts()
        .findByMint({ mintAddress: new PublicKey(mints[index]) });

      setPublicMintNfts([
        ...publicMintNfts,
        { image: nft.json.image, name: nft.name },
      ]);
      toast.success(`Minted ${nft.name}`);
    }

    // await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error: any) {
    throw error;
  }
};

export async function getDerugCandyMachine(
  wallet: AnchorWallet,
  request: IRequest
): Promise<IDerugCandyMachine> {
  try {
    const candyMachineAccount = await fetchCandyMachine(
      umi,
      publicKey(request.candyMachineKey)
    );

    const guardPda = findCandyGuardPda(umi, {
      base: publicKey(request.candyMachineKey),
    });

    const guards = await fetchCandyGuard(umi, publicKey(guardPda));

    return {
      candyMachine: candyMachineAccount,
      publicConfig: await getPublicConfiguration(guards),
      whitelistingConfig: null,
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
  const wlGroup = guards.groups.find((g) => g.label === "public");

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
