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
  console.log(res);

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
  //TODO:remove ekser
  return get(`${WALLET_WL}${ALL}/${"nice-mice"}`);
};

export const storeWlConfig = async (wlDto: SaveWlSettingsDto) => {
  return await post(`${WALLET_WL}${STORE_WALLETS}`, wlDto);
};
