import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import dayjs, { unix } from "dayjs";
import { divide, i, multiply, round } from "mathjs";
import { ListingSource } from "../../enums/collections.enums";
import utc from "dayjs/plugin/utc";
import {
  ICollectionRecentActivities,
  ICollectionStats,
  INftListing,
  ITrait,
  ITraitInfo,
} from "../../interface/collections.interface";
import { IGraphData, IListingValue } from "../../interface/derug.interface";

dayjs.extend(utc);
export const mapTraitsQuery = (
  data: any
  //   collection: ICollectionData
): ITrait[] => {
  const numTraits = data?.traits?.numMints ?? 0;
  const traitData: ITraitInfo[] = [];
  if (!data || !data.traits) {
    return [];
  }
  //   collection.numMints = numTraits;
  const trait: ITrait[] = [];

  Object.keys(data.traits.traitMeta).forEach((traitMeta) => {
    trait.push({
      name: traitMeta,
      values: Object.keys(data.traits.traitMeta[traitMeta]).map(
        (singleTrait: any) => {
          return {
            name: singleTrait,
            percentage: round(
              multiply(
                (data.traits.traitMeta[traitMeta][singleTrait]["n"] as any) /
                  numTraits,
                100
              ),
              2
            ),
            fp: data.traits.traitActive[traitMeta]?.singleTrait
              ? data.traits.traitActive[traitMeta][singleTrait].p
              : 0,
            image: data.traits.traitMeta[traitMeta][singleTrait]["img"],
            listedCount: data.traits.traitActive[traitMeta]?.singleTrait
              ? data.traits.traitActive[traitMeta][singleTrait].n
              : 0,
          };
        }
      ),
    });
  });

  return trait;
};

export const mapCollectionStats = (data: any): ICollectionStats | undefined => {
  const dataInfo = data.instrumentTV2;
  if (dataInfo)
    return {
      slug: dataInfo.slug,
      firstListed: dataInfo.firstListDate,
      marketCap: dataInfo.statsOverall.marketCap,
      numListed: dataInfo.statsOverall.numListed,
      numMints: dataInfo.statsOverall.numMints,
      fp: dataInfo.statsOverall.floorPrice,
      volume24H: dataInfo.statsOverall.floor24h,
      royalty: dataInfo.sellRoyaltyFeeBPS / 100,
    };
};

export const mapCollectionListings = (data: any): INftListing[] => {
  const nftListings: INftListing[] = [];

  data.activeListings.txs.forEach((p: any) => {
    nftListings.push({
      mint: p.mint.onchainId,
      owner: p.tx.sellerId,
      price: divide(+p.tx.grossAmount, LAMPORTS_PER_SOL),
      soruce: p.tx.source as ListingSource,
      imageUrl: p.mint.imageUri,
      txAt: p.tx.txAt,
      name: p.mint.name,
    });
  });

  return nftListings;
};

export const mapNextData = (data: any) => {
  if (data.activeListings.page.endCursor)
    return {
      endCursor: data.activeListings.page.endCursor.txKey,
      hasMore: data.activeListings.page.hasMore,
    };
  else {
    return {
      hasMore: false,
      endCursor: undefined,
    };
  }
};

export const mapRecentActivities = (data: any) => {
  const recentTransacions: ICollectionRecentActivities[] = [];
  data.recentTransactions.txs.forEach((rt: any) => {
    recentTransacions.push({
      dateExecuted: rt.tx.txAt,
      txId: rt.tx.txId,
      image: rt.mint.imageUri,
      mint: rt.mint.onchainId,
      price: +rt.tx.grossAmount / LAMPORTS_PER_SOL,
      rarityRank: rt.mint.rarityRankStat,
      source: rt.tx.source as ListingSource,
    });
  });

  return recentTransacions;
};

export const mapByDates = (recentActivities: ICollectionRecentActivities[]) => {
  const monthsMap = new Map<string, IListingValue>();
  const mappedValues = recentActivities
    .map((ra) => {
      return { ...ra, dateExecuted: dayjs.unix(ra.dateExecuted / 1000).utc() };
    })
    .filter((ra) => ra.price > 0);

  for (const mv of mappedValues) {
    const mvKey =
      mv.dateExecuted.month().toString() + mv.dateExecuted.year().toString();
    const existingValue = monthsMap.get(mvKey);

    if (!existingValue || existingValue.price > mv.price) {
      monthsMap.set(mvKey, {
        image: mv.image,
        price: mv.price,
        soruce: mv.source,
      });
    }
  }
  return remapListings(monthsMap);
};

export const MONTHS_MAP = new Map<number, string>([
  [0, "Jan"],
  [1, "Feb"],
  [2, "Mar"],
  [3, "Apr"],
  [4, "May"],
  [5, "Jun"],
  [6, "Jul"],
  [7, "Aug"],
  [8, "Sep"],
  [9, "Oct"],
  [10, "Dec"],
  [11, "Jan"],
]);

export const remapListings = (
  listings: Map<string, IListingValue>
): IGraphData => {
  const months: string[] = [];
  let smallestPrice = LAMPORTS_PER_SOL;
  let largestPrice = -1;
  const prices: number[] = [];
  for (const [key, value] of listings) {
    months.push(MONTHS_MAP.get(+key.slice(0, 1))! + " / " + key.slice(-2));
    if (value.price < smallestPrice) {
      smallestPrice = value.price;
    }
    if (value.price > largestPrice) {
      largestPrice = value.price;
    }
    prices.push(value.price);
  }

  return {
    prices: prices.reverse(),
    months: months.reverse(),
    smallestPrice,
    largestPrice,
  };
};
