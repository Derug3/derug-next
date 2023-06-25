import { CandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Keypair, TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { ITreasuryTokenAccInfo } from "../components/CollectionLayout/MintDetails";
import { ListingSource, RemintingStatus } from "../enums/collections.enums";
export interface IUtilityData {
  title: string;
  description: string;
  action: UtilityAction;
}

export enum UtilityAction {
  Add,
  Remove,
}

export interface IDerugInstruction {
  instructions: TransactionInstruction[];
  pendingDescription: string;
  successDescription: string;
  partialSigner?: Keypair[];
  remintingNft?: IDerugCollectionNft;
}

export interface IDerugCollectionNft {
  mint: PublicKey;
  metadata: Metadata;
  tokenAccount: PublicKey;
  remintingStatus?: RemintingStatus;
}

export interface IListingValue {
  image: string;
  price: number;
  soruce: ListingSource;
}

export interface IGraphData {
  smallestPrice: number;
  largestPrice: number;
  months: string[];
  prices: number[];
}

export interface IRemintConfig {
  address: PublicKey;
  newName: string;
  newSymbol: string;
  derugRequest: PublicKey;
  mintPrice?: number;
  collection: PublicKey;
  candyMachineCreator: PublicKey;
  authority: PublicKey;
  privateMintEnd?: Date;
  mintCurrency?: PublicKey;
  candyMachine: PublicKey;
  sellerFeeBps: number;
  splTokenData?: ISplTokenData;
}

export interface ISplTokenData {
  name: string;
  decimals: number;
  symbol: string;
  image?: string;
}

export interface CandyMachineDto {
  derugData: string;
  candyMachineKey: string;
  candyMachineSecretKey: string;
}

export interface INonMinted {
  nftMetadata: string;
  derugData: string;
  hasReminted: boolean;
  dateReminted: Date;
  remintAuthority: string;
  name: string;
  uri: string;
  creator: string;
  newName: string;
  newSymbol: string;
  newUri: string;
}

export interface ICreator {
  address: PublicKey;
  share: number;
}

export interface Creator {
  address: string;
  share: number;
}

export type DerugForm = {
  name: string;
  fee: number;
  symbol: string;
  creatorsFees: number;
  creatorsKey: string;
  privateMintEnd: number;
  price: number;
  selectedMint: ITreasuryTokenAccInfo;
  duration: number;
};

export interface StoreCandyMachineData {
  derugRequest: string;
  updateAuthority: string;
  derugData: string;
}

export interface MintingCurrency {
  name: string;
  decimals: number;
}

export interface WhitelistConfig {
  endDate: Date | string;
  walletLimit?: number;
  price: number;
  currency: MintingCurrency;
  groupName: string;
  isWhitelisted?: boolean;
  isActive: boolean;
}

export interface PublicConfig {
  startDate: Date;
  currency: MintingCurrency;
  groupName: string;
  price: number;
}

export interface IDerugCandyMachine {
  candyMachine: CandyMachine;
  whitelistingConfig: WhitelistConfig;
  publicConfig: PublicConfig;
}
