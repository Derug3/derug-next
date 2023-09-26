import React, { useContext, useEffect, useState } from "react";
import { CollectionContext } from "../../stores/collectionContext";
import { FaTwitter } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import { getTrimmedPublicKey } from "../../solana/helpers";
import { useRouter } from "next/router";
import { AiOutlineStar } from "react-icons/ai";
import tensorLogo from "../../assets/tensorLogo.png";
import magicEdenLogo from "../../assets/magicEdenLogo.png";

const CollectionData = () => {
  const { collection, chainCollectionData } = useContext(CollectionContext);
  const [unableToLoad, setUnableToLoad] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();


  useEffect(() => {
    setTimeout(() => {
      setUnableToLoad(true);
    }, 2000);
  }, [collection]);
  return (
    <div className="flex w-full gap-5 text-white">
      <div className="flex w-full items-center gap-5">
        <div className="flex w-full flex-col gap-4 items-center justify-center h-full">
          <div className="flex items-center justify-evenly w-full h-full">
            <div className="flex h-full flex-col lg:flex-row p-4 md:p-5 items-start gap-8 flex-1 border-8 border-gray-700 bg-gray-800 shadow-md w-full">
              <img
                src={collection?.image}
                alt="collectionImg"
                className="rounded-[2em] w-64"
              />
              <div className="flex flex-col w-full h-full justify-around">
                <div className="flex w-full flex-wrap flex-col gap-4">
                  <div className="flex w-full justify-between font-bold text-white-500 text-4xl">
                    {collection?.name ?? (
                      <Skeleton
                        width={200}
                        baseColor="rgb(22,27,34)"
                        highlightColor="rgb(29,35,44)"
                      />
                    )}
                    <div className="flex gap-3 items-center">
                      <AiOutlineStar
                        style={{ color: isFavorite ? "#F0CF65" : "white" }}
                        className="text-4xl text-red cursor-pointer"
                        onClick={() => setIsFavorite(!isFavorite)}
                      />
                      <img
                        src={tensorLogo.src}
                        alt="tensorLogo"
                        className="w-8 h-8 rounded-full cursor-pointer"
                        onClick={() =>
                          window.open(
                            `https://www.tensor.trade/trade/${collection.symbol}`,
                            "_blank"
                          )
                        }
                      />
                      <img
                        src={magicEdenLogo.src}
                        alt="magicEden"
                        className="w-8 h-8 rounded-full cursor-pointer"
                        onClick={() =>
                          window.open(
                            `https://magiceden.io/marketplace/${collection.symbol}`,
                            "_blank"
                          )
                        }
                      />

                    </div>
                  </div>
                  {chainCollectionData ? (
                    <div className="flex w-full justify-between">
                      <div className="flex">
                        Rugged by:
                        <span
                          className="text-yellow-500"
                          style={{
                            fontSize: "1em",
                            marginLeft: "0.5em",
                            color: "rgba(9,194,246)",
                          }}
                        >
                          {getTrimmedPublicKey(chainCollectionData.firstCreator)}
                        </span>
                      </div>
                      <div className="flex flex-row gap-5">
                        {collection?.discord ? (
                          <a href={collection.discord} target={"_blank"} rel="noreferrer">
                            <FaDiscord
                              style={{
                                cursor: "pointer",
                                fontSize: "1.75em",
                                color: "rgb(88 101 242)",
                              }}
                            />
                          </a>
                        ) : unableToLoad ? (
                          <></>
                        ) : (
                          <Skeleton
                            height={32}
                            width={32}
                            baseColor="rgb(22,27,34)"
                            highlightColor="rgb(29,35,44)"
                          />
                        )}
                        {collection?.twitter ? (
                          <a href={collection.twitter} target={"_blank"} rel="noreferrer">
                            <FaTwitter
                              style={{
                                cursor: "pointer",
                                fontSize: "1.75em",
                                color: "rgb(29 161 242)",
                              }}
                            />
                          </a>
                        ) : unableToLoad ? (
                          <></>
                        ) : (
                          <Skeleton
                            height={32}
                            width={32}
                            baseColor="rgb(22,27,34)"
                            highlightColor="rgb(29,35,44)"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <Skeleton
                      width={200}
                      baseColor="rgb(22,27,34)"
                      highlightColor="rgb(29,35,44)"
                    />
                  )}
                </div>
                {<div className="flex flex-wrap w-full font-mono text-gray-400">
                  {collection?.description}
                </div> ?? (
                    <Skeleton
                      baseColor="rgb(22,27,34)"
                      highlightColor="rgb(29,35,44m)"
                      height={32}
                    ></Skeleton>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionData;
