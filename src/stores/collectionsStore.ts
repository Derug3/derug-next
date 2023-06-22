import { create } from "zustand";
import {
  ICollectionData,
  INftListing,
} from "../interface/collections.interface";

export interface ICollectionsStore {
  collections: ICollectionData[];
  setCollections: (collections: ICollectionData[]) => void;
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
