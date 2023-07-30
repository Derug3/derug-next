import { useRouter } from "next/router";
import React, { FC } from "react";
import { ICollectionData, ICollectionVolume } from "../../interface/collections.interface";
import tensor from "../../assets/tensorLogo.png";
import magiceden from "../../assets/magicEdenLogo.png";
import { AiOutlineStar } from "react-icons/ai";

const CollectionItem: FC<{
  collection: ICollectionData;
  bigImage: boolean;
}> = ({ collection, bigImage }) => {
  const { push: navigate } = useRouter();
  return (
    <div
      onClick={() => navigate(`/collection/${collection.symbol}`)}
      className="flex flex-col p-5 cursor-pointer overflow-hidden w-full items-center justify-between rounded-lg shadow-xl"
      style={{ background: '#1D2939' }}
    >
      <div className="flex justify-start w-full gap-5 items-center relative">
        <img
          src={collection.image}
          alt="collectionImage"
          className={`${bigImage ? "w-full h-[32em]" : "w-16 h-16"} `}
        />
        {/* <AiOutlineStar
          style={{ color: "white" }}
          className="absolute text-4xl text-red cursor-pointer top-[15px] right-[15px] bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%"
        /> */}
        <div className="w-full flex flex-col items-center justify-between	absolute bottom-0 bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%	opacity-[0.85]">
          <div className="flex w-full justify-between h-fit px-1.5 py-1">
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
          <div className="flex flex-col w-full justify-start items-start gap-2 px-1.5 py-1" style={{ background: '#475467' }}>
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
        </div>
      </div>
    </div>
  );
};

export default CollectionItem;
