import { Keypair } from "@solana/web3.js";
import { WlType } from "../enums/collections.enums";
import {
  SaveWlSettingsDto,
  WlSettingsDto,
} from "../interface/collections.interface";
import {
  CandyMachineDto,
  INonMinted,
  StoreCandyMachineData,
} from "../interface/derug.interface";
import { get, post } from "./request.api";
import {
  ALL,
  COLLECTION,
  METADATA,
  NON_MINTED,
  PUBLIC_REMINT,
  SAVE_MINTED,
  STORE_WALLETS,
  WALLET_WL,
} from "./url.api";

export const saveCandyMachineData = async (
  candyMachineDto: CandyMachineDto
) => {
  return await post(PUBLIC_REMINT + "/save", candyMachineDto);
};

export const getCandyMachine = async (derugData: string) => {
  const res = await get(`${PUBLIC_REMINT}/${derugData}`);

  return res;
};

export const getNonMinted = async (
  derugData: string
): Promise<INonMinted[]> => {
  return get(`${PUBLIC_REMINT}${NON_MINTED}/${derugData}`);
};

export const storeAllNfts = async (
  storeCandyMachine: StoreCandyMachineData
) => {
  return post(`${PUBLIC_REMINT}${COLLECTION}`, storeCandyMachine);
};

export const getPrivateMintNft = (metadata: string): Promise<INonMinted> => {
  return get(`${PUBLIC_REMINT}${METADATA}/${metadata}`);
};

export const getWlConfig = async (
  derugAddress: string
): Promise<WlSettingsDto> => {
  return get(`${WALLET_WL}${ALL}/${derugAddress}`);
};

export const storeWlConfig = async (wlDto: SaveWlSettingsDto) => {
  return await post(`${WALLET_WL}${STORE_WALLETS}`, wlDto);
};

export const saveMinted = async (mint: string, reminter: string) => {
  return post(`${PUBLIC_REMINT}${SAVE_MINTED}`, { mint, reminter });
};

export const initPublicMint = (derugData: string) => {
  return post(`${PUBLIC_REMINT}/save/${derugData}`);
};

export const getAuthority = (derugData: string) => {
  return get(`${PUBLIC_REMINT}/authority/${derugData}`);
};

export const initializeDerug = (tx: string, derugData: string) => {
  return post(`${PUBLIC_REMINT}/initialize-derug`, { tx, derugData });
};
