import { PublicKey } from "@solana/web3.js";
import { DerugStatus, ListingSource, WlType } from "../enums/collections.enums";
import { ICreator, ISplTokenData } from "./derug.interface";
import { IUserData } from "./user.interface";

export interface ICollectionData {
  symbol: string;
  id: string;
  name: string;
  image: string;
  twitter?: string;
  discord?: string;
  website?: string;
  description: string;
  isFlagged: boolean;
  type?: string[];
  numMints?: number;
  categories?: any[];
  traits: ITrait[];
}
export interface ICollectionVolume {
  collection: ICollectionData;
  marketCap: number;
  symbol: string;
  numMints: number;
  floorPrice: number;
  volume1h: number | null;
  volume24h: number | null;
  volume7d: number | null;
  floor1h: number | null;
  floor24h: number | null;
  floor7d: number | null;
}

export interface IRequest {
  address: PublicKey;
  derugger: PublicKey;
  createdAt: number;
  voteCount: number;
  sellerFeeBps: number;
  mintPrice?: number;
  status: DerugStatus;
  publicMint: boolean;
  creators: ICreator[];
  privateMintDuration?: number;
  candyMachineKey: PublicKey;
  mintCurrency: PublicKey | null;
  newSymbol: string;
  newName: string;
  splToken?: ISplTokenData;
  userData?: IUserData;
}

export interface IUtility {
  title: string;
  description: string;
  isActive: boolean;
}
export interface IListed {
  auctionHouse: string;
  price: number;
  pdaAddresses: string;
  expiry: number;
  seller: string;
  sellerReferal: string;
  tokenAddress: string;
  tokenMint: string;
  tokenSize: number;
  rarity: any;
  extra: IExtra;
}

interface IExtra {
  img: string;
}

export interface ITrait {
  name: string;
  traits: ITraitInfo[];
}

export interface ITraitInfo {
  name: string;
  percentage: number;
  image: string;
  fp: number;
  listedCount: number;
}

export interface ICollectionStats {
  fp: number;
  volume24H: number;
  marketCap: number;
  numListed: number;
  numMints: number;
  royalty: number;
  firstListed: number;
  slug: string;
}

export interface INftListing {
  price: number;
  owner: string;
  mint: string;
  soruce: ListingSource;
  imageUrl: string;
  txAt: number;
  name: string;
}

export interface IChainCollectionData {
  slug: string;
  firstCreator: string;
  collectionMint: string;
  derugDataAddress: PublicKey;
  totalSupply: number;
  hasActiveDerugData: boolean;
}

export interface ICollectionRecentActivities {
  dateExecuted: number;
  price: number;
  image: string;
  mint: string;
  rarityRank: number;
  source: ListingSource;
  txId: string;
}

export interface ICollectionDerugData {
  address: PublicKey;
  collection: PublicKey;
  totalSupply: number;
  createdAt: number;
  newCollection: PublicKey | null;
  winningRequest: PublicKey | null;
  addedRequests: IActiveRequest[];
  periodEnd: Date;
  totalReminted: number;
  totalSuggestionCount: number;
  status: DerugStatus;
  thresholdDenominator: number;
  collectionMetadata: PublicKey | null;
}

export interface IActiveRequest {
  request: PublicKey;
  voteCount: number;
  winning: boolean;
}

export interface WlSettingsDto {
  wlType: WlType;
  derugAddress: string;
  wallets: string;
  duration?: number;
  derugger: string;
}

export interface SaveWlSettingsDto extends WlSettingsDto {
  signedMessage: string;
}

export interface RemintDto {
  signedTx: Buffer[];
}

export interface RemintResponse {
  mint: string;
  succeded: boolean;
  message?: string;
}
