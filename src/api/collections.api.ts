import { CollectionVolumeFilter } from "@/enums/collections.enums";
import {
  ICollectionData,
  ICollectionStats,
} from "@/interface/collections.interface";
import { MAGIC_EDEN_URL } from "../utilities/utilities";
import { get } from "./request.api";
import {
  COLLECTIONS,
  COLLECTION_VOLUME,
  FILTER,
  LISTINGS,
  MAGIC_EDEN_COLLECTION,
  MAGIC_EDEN_COLLECTIONS,
  NAME,
  ORDER_BY,
  RANDOM,
  SYMBOL,
  TOP_VOLUME,
} from "./url.api";

export async function getRandomCollections(): Promise<
  { collection: ICollectionData; stats: ICollectionStats }[]
> {
  return get(`${MAGIC_EDEN_COLLECTIONS}${RANDOM}`);
}

export async function getByNameOrSlug(
  name: string
): Promise<ICollectionData[]> {
  return get(`${MAGIC_EDEN_COLLECTIONS}${NAME}/${name}`);
}

export async function getSingleCollection(
  symbol: string
): Promise<ICollectionData> {
  return get(`${MAGIC_EDEN_COLLECTIONS}${SYMBOL}/${symbol}`);
}

export async function getMagicEdenListingsBySlug(slug: string) {
  return get(`${MAGIC_EDEN_COLLECTION}/${slug}${LISTINGS}`, MAGIC_EDEN_URL);
}

export const getCollectionsWithTopVolume = () => {
  return get(`${COLLECTION_VOLUME}${TOP_VOLUME}`);
};

export const getOrderedCollectionsByVolume = (
  orderType: CollectionVolumeFilter
) => {
  return get(`${COLLECTION_VOLUME}${FILTER}${ORDER_BY}${orderType}`);
};

export async function getAllCollections(): Promise<ICollectionData[]> {
  return get(`${MAGIC_EDEN_COLLECTIONS}/all`);
}
