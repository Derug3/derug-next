import React, { FC, useContext, useState } from "react";
import { CollectionContext } from "../../stores/collectionContext";
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
