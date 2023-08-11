import { getListings } from "@/api/tensor";
import {
  fetchMetadata,
  findMetadataPda,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey, unwrapOption } from "@metaplex-foundation/umi";
import { PublicKey } from "@solana/web3.js";
import { getMagicEdenListingsBySlug } from "../api/collections.api";
import {
  IChainCollectionData,
  ICollectionData,
  INftListing,
} from "../interface/collections.interface";
import {
  MAINNET_RPC_CONNECTION,
  METAPLEX_PROGRAM,
  RPC_CONNECTION,
} from "../utilities/utilities";
import { derugDataSeed } from "./seeds";
import { derugProgramFactory, umi } from "./utilities";

export async function getCollectionChainData(
  collection: ICollectionData,
  listedNft?: INftListing | undefined
): Promise<IChainCollectionData> {
  let mint = listedNft?.mint;
  if (!mint) {
    mint = "CvoGgWU4ZTswvtWUGU6fe2x1RpRoyAZkGp1j8vwK1yTR";
  }

  const derugProgram = derugProgramFactory();

  if (!mint) {
    throw new Error("Failed to retrieve collection Metalpex data!");
  }

  const [metadataAddress] = findMetadataPda(umi, { mint: publicKey(mint) });

  const metadataAccount = await fetchMetadata(umi, metadataAddress);

  if (!metadataAccount || !metadataAccount.creators)
    throw new Error("Failed to retrieve collection Metalpex data!");

  const derugCollection = metadataAccount.collection
    ? metadataAccount.collection.toString()
    : unwrapOption(metadataAccount?.creators)
        .find((c) => c.share > 0)
        ?.address.toString() ?? metadataAccount.creators[0].address.toString();

  const [derugData] = PublicKey.findProgramAddressSync(
    [derugDataSeed, new PublicKey(derugCollection).toBuffer()],
    derugProgram.programId
  );

  let hasActiveDerugData = false;

  try {
    const derugDataAccount = await RPC_CONNECTION.getAccountInfo(derugData);
    if (derugDataAccount && derugDataAccount.data.length > 0) {
      hasActiveDerugData = true;
    }
  } catch (error) {
    hasActiveDerugData = false;
  }

  return {
    collectionMint: derugCollection,
    firstCreator: metadataAccount.updateAuthority.toString(),
    slug: collection.symbol,
    totalSupply: collection.numMints!,
    derugDataAddress: derugData,
    hasActiveDerugData,
  };
}
