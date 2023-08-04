import {
  ICollectionDerugData,
  ICollectionStats,
} from "../../interface/collections.interface";
import HeadingItem from "./HeadingItem";
import { FC, useContext, useState } from "react";
import { DerugStatus } from "../../enums/collections.enums";
import { WalletContextState } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import { CollectionContext } from "../../stores/collectionContext";

export const CollectionStats: FC<{
  collection?: ICollectionStats;
  wallet: WalletContextState;
  openDerugModal: (value: boolean) => void;
  collectionDerug?: ICollectionDerugData;
}> = ({ collection, collectionDerug }) => {
  const { remintConfig } = useContext(CollectionContext);
  const currUnix = dayjs().unix() * 1000;
  const remintConfigTime =
    remintConfig &&
      Number(remintConfig.privateMintEnd) * 1000 > currUnix &&
      collectionDerug?.status === DerugStatus.Reminting
      ? remintConfig.privateMintEnd
      : undefined;

  return (
    <div className="flex flex-col items-center justify-center gap-12 w-full">
      <div className="flex gap-5 border-1 w-full">
        <HeadingItem
          amount={collection?.fp}
          descColor="#2dd4bf"
          title="FLOOR PRICE"
          desc="SOL"
        />
        {/* <HeadingItem
          title="LISTED"
          descColor="#2dd4bf"
          desc="NFTs"
          amount={collection?.numListed}
        /> */}
        <HeadingItem
          descColor="#2dd4bf"
          title="TOTAL SUPPLY"
          desc="NFTs"
          amount={collection?.numMints}
        />
        <HeadingItem
          descColor="#2dd4bf"
          title="MARKET CAP"
          amount={collection?.marketCap}
          desc="SOL"
        />
      </div>
      <div className="flex gap-5 border-1 w-full">
        {collectionDerug && (
          <HeadingItem
            descColor="#2dd4bf"
            title="STATUS"
            amount={
              collectionDerug.status[0].toUpperCase() +
              collectionDerug.status.slice(1)
            }
            desc=""
          />
        )}
        {collectionDerug && (
          <HeadingItem
            descColor="#2dd4bf"
            title={remintConfigTime ? "PRIVATE MINT END" : "REMAINING TIME"}
            date={remintConfigTime ?? collectionDerug.periodEnd}
            isCounter
            desc=""
          />
        )}
        {collectionDerug &&
          collectionDerug.status === DerugStatus.Reminting && (
            <HeadingItem
              descColor="#2dd4bf"
              title="OLD REMINTED"
              amount={collectionDerug.totalReminted}
              desc=""
            />
          )}
      </div>
    </div>
  );
};
