export enum ListingSource {
  MagicEden = "MAGICEDEN_V2",
  Tensor = "TENSORSWAP",
  Hades = "HADESWAP",
  SolanaArt = "SOLANART",
}

export enum DerugStatus {
  Initialized = "initialized",
  Voting = "voting",
  Succeded = "succeded",
  UploadingMetadata = "uploadingMetadata",
  Reminting = "reminting",
  Completed = "completed",
}

export enum DerugRequestStatus {
  Initialized = "initialized",
  Voting = "voting",
  Succeded = "succeded",
  UploadingMetadata = "uploadingMetadata",
  Reminting = "reminting",
  Completed = "completed",
}

export enum RemintingStatus {
  InProgress,
  Succeded,
  Failed,
}

export enum CollectionVolumeFilter {
  MarketCap = "marketCap",
  NumMints = "numMints",
  FloorPrice = "floorPrice",
}

export enum WlType {
  Token,
  AllowList,
}

export enum MintType {
  Sol,
  Token,
}
