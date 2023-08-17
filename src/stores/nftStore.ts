import { PublicKey } from "@solana/web3.js";
import { RemintingStatus } from "../enums/collections.enums";
import { create } from "zustand";
export interface INftStore {
  nfts: { mint: PublicKey; status: RemintingStatus }[];
  setNfts: (nfts: { mint: PublicKey; status: RemintingStatus }[]) => void;
  publicMintNfts: { image: string; name: string }[];
  setPublicMintNfts: (nfts: { image: string; name: string }[]) => void;
}

const initalState = {
  nfts: [],
  publicMintNfts: [],
};

const nftStore = create<INftStore>((set, get) => ({
  ...initalState,
  setNfts: (nfts: { mint: PublicKey; status: RemintingStatus }[]) =>
    set({ nfts: nfts }),
  setPublicMintNfts: (nfts) => set({ publicMintNfts: nfts }),
}));

export default nftStore;
