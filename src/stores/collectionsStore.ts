import { create } from "zustand";
import {
  ICollectionData,
  ICollectionStats,
  INftListing,
} from "../interface/collections.interface";

export interface ICollectionsStore {
  collections: { collection: ICollectionData; stats: ICollectionStats }[];
  setCollections: (
    collections: { collection: ICollectionData; stats: ICollectionStats }[]
  ) => void;
  nftListings: INftListing[];
  setListings: (nftListings: INftListing[]) => void;
}

const initialState = {
  collections: [],
  nftListings: [],
};

export const collectionsStore = create<ICollectionsStore>((set, get) => ({
  ...initialState,
  setCollections: (collections) => set({ collections: collections }),
  setListings: (nftListings) => set({ nftListings }),
}));
