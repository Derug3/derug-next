import React, { FC, useContext, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { CollectionContext } from "../../stores/collectionContext";
import { generateSkeletonArrays } from "../../utilities/nft-fetching";
import ListedNftItem from "./ListedNftItem";

const ListedNfts: FC = () => {
  const { activeListings, loading } = useContext(CollectionContext);

  const renderListedNfts = () => {
    return activeListings
      ? activeListings?.map((ln) => {
          return (
            <ListedNftItem
              listedNft={ln}
              key={ln.mint}
              imageUrl={ln.imageUrl}
            />
          );
        })
      : [];
  };

  return (
    <div className="grid grid-cols-5">{!loading && renderListedNfts()}</div>
  );
};

export default ListedNfts;
