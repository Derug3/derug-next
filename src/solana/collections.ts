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
  if (!mint) {
    throw new Error("Failed to retrieve collection Metalpex data!");
  }

  const [metadataAddress] = findMetadataPda(umi, { mint: publicKey(mint) });

  const metadataAccount = await fetchMetadata(umi, metadataAddress);

  const [derugData] = PublicKey.findProgramAddressSync(
    [
      derugDataSeed,
      new PublicKey(unwrapOption(metadataAccount.collection).key).toBuffer(),
    ],
    derugProgram.programId
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
    collectionMint: unwrapOption(metadataAccount.collection).key,
    firstCreator: metadataAccount.creators[0].key,
    slug: collection.symbol,
    totalSupply: collection.numMints!,
    derugDataAddress: derugData,
    hasActiveDerugData,
  };
}
