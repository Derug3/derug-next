import { PublicKey } from "@solana/web3.js";
import { RemintingStatus } from "../enums/collections.enums";
import { create } from "zustand";
export interface INftStore {
  nfts: { mint: PublicKey; status: RemintingStatus }[];
  setNfts: (nfts: { mint: PublicKey; status: RemintingStatus }[]) => void;
}

const initalState = {
  nfts: [],
};

const nftStore = create<INftStore>((set, get) => ({
  ...initalState,
  setNfts: (nfts: { mint: PublicKey; status: RemintingStatus }[]) =>
    set({ nfts: nfts }),
}));

export default nftStore;
