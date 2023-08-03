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
    <div
      onClick={() => navigate(`/collection/${collection.symbol}`)}
      className="rounded-lg w-fit flex p-2 cursor-pointer overflow-hidden items-center justify-between rounded-lg shadow-xl bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%	opacity-[0.85] animate-text"
    >
      <div className="flex justify-start w-full gap-5 items-center relative" onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        <img
          src={collection.image}
          alt="collectionImage"
          className={`${bigImage ? "w-[30em] h-[30em]" : "w-16 h-16"} `}
          onError={handleImageError}
        />

        {/* <AiOutlineStar
          style={{ color: "white" }}
          className="absolute text-4xl text-red cursor-pointer top-[15px] right-[15px] bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%"
        /> */}
        {hover ?
          <div className="w-full flex flex-col items-center justify-between	absolute bottom-0 animate-scale">
            <div className="flex w-full justify-between h-fit py-1 px-10" style={{ background: '#475467' }}>
              <p className="text-xl font-white " style={{ fontWeight: 400, lineHeight: '44px' }}>
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
            <div className="flex flex-col w-full justify-start items-start gap-2 px-1.5 py-1 px-10" style={{ background: 'rgb(14 26 43)' }}>
              <p className="text-lg font-extralight flex w-full justify-between relateve">
                Floor price{" "}
                <span className="text-emerald-400">{ } 1 SOL</span>
              </p>
              <p className="text-lg font-extralight flex w-full justify-between">
                Market cap{" "}
                <span className="text-main-blue">{ }</span>
                <span className="text-emerald-400">{ } 15 SOL</span>
              </p>
              <p className="text-lg font-extralight flex w-full justify-between">
                Total supply{" "}
                <span className="text-main-blue">{ }</span>
                <span className="text-emerald-400">{ } 333</span>
              </p>
            </div>
          </div> : <></>}
      </div>
    </div>
  );
};

export default CollectionItem;
