import {
  ICollectionRecentActivities,
  ICollectionStats,
  INftListing,
  ITrait,
} from "../interface/collections.interface";
import { get } from "./request.api";
import { ACTIVITIES, FLOOR_PRICE, LISTINGS, TENSOR, TRAITS } from "./url.api";

export const getFloorPrice = async (
  slug: String
): Promise<ICollectionStats> => {
  return get(`${TENSOR}${FLOOR_PRICE}/${slug}`);
};

export const getTraits = async (slug: String): Promise<ITrait[]> => {
  return get(`${TENSOR}${TRAITS}/${slug}`);
};

export const getListings = async (slug: String): Promise<INftListing[]> => {
  return get(`${TENSOR}${LISTINGS}/${slug}`);
};

export const getRecentActivities = async (
  slug: String
): Promise<ICollectionRecentActivities[]> => {
  return get(`${TENSOR}${ACTIVITIES}/${slug}`);
};
