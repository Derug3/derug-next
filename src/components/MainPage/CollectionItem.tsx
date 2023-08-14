import { useRouter } from "next/router";
import React, { FC, useState } from "react";
import { ICollectionData, ICollectionVolume } from "../../interface/collections.interface";
import tensor from "../../assets/tensorLogo.png";
import magiceden from "../../assets/magicEdenLogo.png";
import { AiOutlineStar } from "react-icons/ai";
import { collectionsStore } from "@/stores/collectionsStore";

const CollectionItem: FC<{
  collection: ICollectionData;
  bigImage: boolean;
}> = ({ collection, bigImage }) => {
  const { push: navigate } = useRouter();
  const [isValid, setIsValid] = useState(true);
  const [hover, setHover] = useState(false);

  const handleImageError = () => {
    setIsValid(false);
  };

  return (
    isValid && (
      <div
        onClick={() => navigate(`/collection/${collection.symbol}`)}
        className="flex flex-col items-start gap-16 bg-gray-800 shadow-md w-[40em]  rounded-xl p-5 cursor-pointer"
      >
        <div className="flex justify-between w-full gap-5 items-start relative h-60	" onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}>
          <img
            src={collection.image}
            alt="collectionImage"
            className={`${bigImage ? "w-[15em] h-60	" : "w-16 h-16"} `}
            onError={handleImageError}
          />

          <div className="w-full h-full flex flex-col items-start justify-between">
            <div className="flex justify-between h-fit py-1 px-2 w-[21.5em]">
              <p className="text-xl font-white truncate" style={{ fontWeight: 400, lineHeight: '44px' }}>
                {collection.name}
              </p>
              <div className="flex gap-3 items-center">
                <img
                  src={tensor.src}
                  alt="collectionImage"
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
                <img
                  src={magiceden.src}
                  alt="collectionImage"
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </div>
            </div>
            <div className="flex flex-col w-full justify-start items-start gap-2 px-1.5 gap-5 py-2 px-2" style={{ background: 'rgb(14 26 43)' }}>
              <p className="text-md lg:text-lg font-extralight flex w-full justify-between relateve">
                Floor price{" "}
                <span className="text-emerald-400">{ } 1 SOL</span>
              </p>
              <p className="text-md lg:text-lg font-extralight flex w-full justify-between">
                Market cap{" "}
                <span className="text-main-blue">{ }</span>
                <span className="text-emerald-400">{ } 15 SOL</span>
              </p>
              <p className="text-md lg:text-lg  font-extralight flex w-full justify-between">
                Total supply{" "}
                <span className="text-main-blue">{ }</span>
                <span className="text-emerald-400">{ } 333</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default CollectionItem;
