import { getListings } from "@/api/tensor";
import {
  fetchMetadata,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey, unwrapOption } from "@metaplex-foundation/umi";
import { PublicKey } from "@solana/web3.js";
import {
  IChainCollectionData,
  ICollectionData,
  INftListing,
} from "../interface/collections.interface";
import { RPC_CONNECTION } from "../utilities/utilities";
import { derugDataSeed } from "./seeds";
import { derugProgramFactory, umi } from "./utilities";

export async function getCollectionChainData(
  collection: ICollectionData,
  listedNft?: INftListing | undefined
): Promise<IChainCollectionData> {
  let mint = listedNft?.mint;

  const derugProgram = derugProgramFactory();
  //TODO:check
  // if (!mint) {
  //   throw new Error("Failed to retrieve collection Metalpex data!");
  // }

  // const [metadataAddress] = findMetadataPda(umi, { mint: publicKey(mint) });

  // const metadataAccount = await fetchMetadata(umi, metadataAddress);

  const derugCollection = "9FNQwziLT6YUt3tkLcvbdKk1XyT3M42E1vE3XTkyngzp";

  // const [derugData] = PublicKey.findProgramAddressSync(
  //   [derugDataSeed, new PublicKey(derugCollection).toBuffer()],
  //   derugProgram.programId
  // );
  const derugData = new PublicKey(
    "3UeFcBqvAmuG2ePPGofanBCwJE9NHa6Q42yE46craAHJ"
  );
  let hasActiveDerugData = false;

  try {
    const derugDataAccount = await RPC_CONNECTION.getAccountInfo(derugData);
    if (derugDataAccount && derugDataAccount.data.length > 0) {
      hasActiveDerugData = true;
    }
  } catch (error) {
    console.log(error);

    hasActiveDerugData = false;
  }
  return {
    collectionMint: derugCollection,
    firstCreator: "AFAyZncgP6ov51wfXurFLkWhxfotTZXqByeaJhYtrwUQ",
    slug: collection.symbol,
    totalSupply: collection.numMints!,
    derugDataAddress: derugData,
    hasActiveDerugData,
  };
}
