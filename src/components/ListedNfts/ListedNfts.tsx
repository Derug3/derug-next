import React, { FC, useContext, useState } from "react";
import { CollectionContext } from "../../stores/collectionContext";
import ListedNftItem from "./ListedNftItem";

const ListedNfts: FC = () => {
  const { activeListings, loading } = useContext(CollectionContext);

  // test
  const renderListedNfts = () => {
    return activeListings
      ? activeListings?.map((ln) => {
        return (
          <ListedNftItem
            listedNft={ln}
            key={ln.mint}
          />
        );
      })
      : [];
  };

  return (
    <div className="grid grid-cols-4 bg-black-500">{!loading && renderListedNfts()}</div>
  );
};

export default ListedNfts;
