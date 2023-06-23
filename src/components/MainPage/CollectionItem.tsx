import { useRouter } from "next/router";
import React, { FC } from "react";
import { ICollectionVolume } from "../../interface/collections.interface";

const CollectionItem: FC<{
  collection: ICollectionVolume;
  bigImage: boolean;
}> = ({ collection, bigImage }) => {
  const { push: navigate } = useRouter();
  return (
    <div
      onClick={() => navigate(`/collection/${collection.collection.symbol}`)}
      className="flex flex-col p-5  cursor-pointer overflow-hidden w-full hover:shadow-lg 
    hover:shadow-main-blue items-center"
      style={{ border: "1px solid rgba(9, 194, 246, 0.5)", borderTop: "none" }}
    >
      <img
        src={collection.collection.image}
        alt="collectionImage"
        className={`${bigImage ? " w-32" : "w-16"}`}
      />
      <p className="text-xl font-bold font-white">
        {collection.collection.name}
      </p>
      <div className="w-full flex items-center jusitfy-between">
        <p className="text-md w-1/2">
          Floor price{" "}
          <span className="text-lime-400">{collection.floorPrice} SOL</span>
        </p>
        <p className="text-md w-1/2">
          Market cap{" "}
          <span className="text-main-blue">{collection.marketCap}</span>
        </p>
      </div>
    </div>
  );
};

export default CollectionItem;
