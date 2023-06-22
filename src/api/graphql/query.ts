import { gql } from "@apollo/client";
import { Axios } from "axios";
import { gqlClient } from "../../utilities/utilities";
import { post } from "../request.api";
import { mapCollectionListings, mapNextData } from "./mapper";
export const TRAITS_QUERY = gql`
  query CollTraits($slug: String!) {
    traits(slug: $slug) {
      ...ReducedCollectionTraitsRarities
      __typename
    }
  }
  fragment ReducedCollectionTraitsRarities on CollectionTraitsRarities {
    traitMeta
    traitActive
    numMints
    __typename
  }
`;

export const FP_QUERY = gql`
  query Instrument($slug: String!) {
    instrumentTV2(slug: $slug) {
      ...ReducedInstrument
      __typename
    }
  }

  fragment ReducedInstrument on InstrumentTV2 {
    id
    slug
    slugDisplay
    tensorWhitelisted
    name
    symbol
    imageUri
    description
    website
    twitter
    discord
    tokenStandard
    sellRoyaltyFeeBPS
    stats {
      priceUnit
      floorPrice
      __typename
    }
    statsOverall {
      ...ReducedStats
      __typename
    }
    statsTSwap {
      numMints
      __typename
    }
    statsHSwap {
      nftsForSale
      solDeposited
      __typename
    }
    statsSwap {
      ...ReducedStatsSwap
      __typename
    }
    statsTHSwap {
      ...ReducedStatsSwap
      __typename
    }
    meFloorPrice
    firstListDate
    __typename
  }

  fragment ReducedStats on CollectionStats {
    priceUnit
    floorPrice
    numListed
    numMints
    sales1h
    sales24h
    sales7d
    volume1h
    volume24h
    volume7d
    floor1h
    floor24h
    floor7d
    pctListed
    marketCap
    __typename
  }

  fragment ReducedStatsSwap on ICollectionStatsSwap {
    priceUnit
    buyNowPrice
    sellNowPrice
    nftsForSale
    solDeposited
    sales1h
    sales24h
    sales7d
    volume1h
    volume24h
    volume7d
    __typename
  }
`;

export const ACTIVE_LISTINGS_QUERY = gql`
  query ActiveListings(
    $slug: String!
    $sortBy: ActiveListingsSortBy!
    $filters: ActiveListingsFilters
    $cursor: ActiveListingsCursorInput
    $limit: Int
  ) {
    activeListings(
      slug: $slug
      sortBy: $sortBy
      filters: $filters
      cursor: $cursor
      limit: $limit
    ) {
      txs {
        ...ReducedLinkedTx
        __typename
      }
      sortBy
      generatedFor
      page {
        endCursor {
          txKey
          __typename
        }
        hasMore
        __typename
      }
      __typename
    }
  }

  fragment ReducedLinkedTx on LinkedTransactionTV2 {
    tx {
      ...ReducedParsedTx
      __typename
    }
    mint {
      ...ReducedMint
      __typename
    }
    __typename
  }

  fragment ReducedParsedTx on ParsedTransaction {
    source
    txKey
    txId
    txType
    grossAmount
    grossAmountUnit
    sellerId
    buyerId
    txAt
    txMetadata {
      auctionHouse
      urlId
      sellerRef
      tokenAcc
      __typename
    }
    poolOnchainId
    __typename
  }

  fragment ReducedMint on LinkedTxMintTV2 {
    onchainId
    name
    imageUri
    metadataUri
    metadataFetchedAt
    sellRoyaltyFeeBPS
    tokenStandard
    tokenEdition
    attributes
    rarityRankTT
    rarityRankTTStat
    rarityRankHR
    rarityRankTeam
    rarityRankStat
    rarityRankTN
    lastSale {
      price
      priceUnit
      txAt
      __typename
    }
    accState
    __typename
  }
`;

export const RECENT_ACTIVITIES_QUERY = gql`
  query RecentTransactions(
    $slug: String!
    $filters: TransactionsFilters
    $cursor: TransactionsCursorInput
    $limit: Int
  ) {
    recentTransactions(
      slug: $slug
      filters: $filters
      cursor: $cursor
      limit: $limit
    ) {
      txs {
        ...ReducedLinkedTx
        __typename
      }
      page {
        endCursor {
          txAt
          txKey
          __typename
        }
        hasMore
        __typename
      }
      __typename
    }
  }

  fragment ReducedLinkedTx on LinkedTransactionTV2 {
    tx {
      ...ReducedParsedTx
      __typename
    }
    mint {
      ...ReducedMint
      __typename
    }
    __typename
  }

  fragment ReducedParsedTx on ParsedTransaction {
    source
    txKey
    txId
    grossAmount
    grossAmountUnit
    sellerId
    buyerId
    txAt
    txMetadata {
      auctionHouse
      urlId
      sellerRef
      tokenAcc
      __typename
    }
    poolOnchainId
    __typename
  }

  fragment ReducedMint on LinkedTxMintTV2 {
    onchainId
    name
    imageUri
    metadataUri
    metadataFetchedAt
    sellRoyaltyFeeBPS
    tokenStandard
    tokenEdition
    attributes
    rarityRankTT
    rarityRankTTStat
    rarityRankHR
    rarityRankTeam
    rarityRankStat
    rarityRankTN
    lastSale {
      price
      priceUnit
      txAt
      __typename
    }
    accState
    __typename
  }
`;

export const MINTS_QUERY = gql`
  query Mints($tokenMints: [String!]!) {
    mints(tokenMints: $tokenMints) {
      slug
      wlSlug
      verifiedCollection
    }
  }
`;

export const MINTS_QUERY_C = gql`
  query MintListTSwap($slug: String!) {
    mintListTSwap(slug: $slug)
  }
`;

export const makeNextQuery = async (
  slug: string,
  cursor: string,
  limit: number
) => {
  const data = await gqlClient.query({
    query: ACTIVE_LISTINGS_QUERY,
    variables: {
      slug,
      cursor,
      limit,
      filter: null,
    },
  });

  return {
    nfts: mapCollectionListings(data.data),
    nextQueryData: mapNextData(data.data),
  };
};
