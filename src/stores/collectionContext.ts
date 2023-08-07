import React from "react";
import {
  IChainCollectionData,
  ICollectionData,
  ICollectionDerugData,
  ICollectionRecentActivities,
  ICollectionStats,
  INftListing,
  IRequest,
  ITrait,
} from "../interface/collections.interface";
import { IDerugCandyMachine, IGraphData } from "../interface/derug.interface";

export interface CollectionContext {
  loading: boolean;
  collection: ICollectionData | undefined;
  traits: ITrait[] | undefined;
  activeListings: INftListing[] | undefined;
  collectionStats: ICollectionStats | undefined;
  chainCollectionData: IChainCollectionData | undefined;
  recentActivities: ICollectionRecentActivities[] | undefined;
  collectionDerug: ICollectionDerugData | undefined;
  derugRequest: IRequest | undefined;
  graphData: IGraphData | undefined;
  candyMachine: IDerugCandyMachine | undefined;
  toggleLoading(loading: boolean): void;
  setGraphData: (data: IGraphData) => void;
  setRequests: (requests: IRequest) => void;
  setCollectionDerug: (derug: ICollectionDerugData) => void;
  setRecentActivities: (activities: ICollectionRecentActivities[]) => void;
  setCollection: (collection: ICollectionData) => void;
  setChainCollectionData: (data: IChainCollectionData) => void;
  setTraits: (traits: ITrait[]) => void;
  setActiveListings: (activeListings: INftListing[]) => void;
  setCollectionStats: (stats: ICollectionStats) => void;
  setCandyMachine: (candyMachine: IDerugCandyMachine | undefined) => void;
}

export const CollectionContext = React.createContext({} as CollectionContext);
