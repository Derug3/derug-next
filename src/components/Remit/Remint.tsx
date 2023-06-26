import { IRequest } from "../../interface/collections.interface";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { FC, useContext, useEffect, useMemo, useState } from "react";
import {
  IDerugCollectionNft,
  INonMinted,
} from "../../interface/derug.interface";
import { CollectionContext } from "../../stores/collectionContext";
import {
  generateSkeletonArrays,
  getAllNftsFromCollection,
} from "../../utilities/nft-fetching";
import WinningRequest from "../DerugRequest/WinningRequest";
import { toast } from "react-hot-toast";
import RemintNft from "./RemintNft";
import Skeleton from "react-loading-skeleton";
import { DerugStatus, RemintingStatus } from "../../enums/collections.enums";
import { remintNft } from "../../solana/methods/remint";
import { chunk } from "lodash";
import nftStore from "../../stores/nftStore";
import { Oval } from "react-loader-spinner";
import dayjs from "dayjs";
import { getNonMinted } from "../../api/public-mint.api";
import { RelativeTime } from "@primer/react";
import Countdown from "react-countdown";
export const Remint: FC<{
  getWinningRequest: IRequest | undefined;
}> = ({ getWinningRequest }) => {
  const { derugRequests } = useContext(CollectionContext);
  const [collectionNfts, setCollectionNfts] = useState<IDerugCollectionNft[]>();
  const [loading, toggleLoading] = useState(true);

  const [nonMintedNfts, setNonMintedNfts] = useState<INonMinted[]>([]);

  const [isReminting, toggleIsReminting] = useState(false);

  const { collectionDerug, chainCollectionData, remintConfig } =
    useContext(CollectionContext);

  const { nfts, setNfts } = nftStore();

  const wallet = useWallet();

  useEffect(() => {
    void getCollectionNfts();
  }, [wallet.publicKey, collectionDerug]);

  useEffect(() => {
    void getNonMintedNfts();
  }, []);

  const getNonMintedNfts = async () => {
    try {
      if (collectionDerug)
        setNonMintedNfts(
          await getNonMinted(collectionDerug?.address.toString())
        );
    } catch (error) { }
  };

  const getCollectionNfts = async () => {
    try {
      if (
        wallet &&
        wallet.publicKey &&
        collectionDerug &&
        chainCollectionData
      ) {
        const nfts = await getAllNftsFromCollection(
          wallet,
          collectionDerug,
          chainCollectionData
        );

        setCollectionNfts(nfts);
      }
    } catch (error: any) {
      console.log(error);

      toast.error(error.message);
    } finally {
      toggleLoading(false);
    }
  };

  useEffect(() => {
    if (nfts.length > 0 && collectionNfts && collectionNfts?.length > 0) {
      const ruggedNfts = [...collectionNfts];
      nfts.forEach((nft) => {
        const nftIndex = ruggedNfts.findIndex(
          (nf) => nf.mint.toString() === nft.mint.toString()
        );
        ruggedNfts[nftIndex] = {
          ...ruggedNfts[nftIndex],
          remintingStatus: nft.status,
        };
      });

      setCollectionNfts(ruggedNfts);
    }
  }, [nfts]);

  const renderCollectionNfts = useMemo(() => {
    return collectionNfts?.length > 0 ? (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 px-10">
        {collectionNfts?.map((cnft) => {
          return <RemintNft nft={cnft} key={cnft.mint.toString()} />;
        })}
      </div>
    ) : (
      <div className="w-full text-center">
        <p className="text-xl font-mono font-bold">
          You don't have NFTs from collection! Public mint will be in{" "}
          <Countdown
            className="font-mono text-sm
            text-orange-800 p-2"
            date={remintConfig?.privateMintEnd}
          />
          <RelativeTime />
        </p>
      </div>
    );
  }, [collectionNfts, collectionDerug, remintConfig]);

  const remintNfts = async () => {
    try {
      toggleIsReminting(true);
      const winningRequest = derugRequests?.sort(
        (a, b) => a.voteCount - b.voteCount
      )[derugRequests.length - 1];
      if (
        wallet &&
        collectionDerug &&
        collectionNfts &&
        collectionDerug?.status === DerugStatus.Reminting &&
        winningRequest
      ) {
        setNfts([]);
        setCollectionNfts(
          collectionNfts?.map((cnft) => {
            return { ...cnft, remintingStatus: RemintingStatus.InProgress };
          })
        );

        await remintNft(
          wallet!,
          collectionDerug,
          winningRequest,
          collectionNfts?.filter((nft) => !nft.remintingStatus)
        );
      }
    } catch (error) {
      console.log(error);

      setCollectionNfts(
        collectionNfts?.map((cnft) => {
          if (cnft.remintingStatus) {
            return { ...cnft, remintingStatus: undefined };
          } else {
            return { ...cnft };
          }
        })
      );
    } finally {
      toggleLoading(false);
      toggleIsReminting(false);
    }
  };

  const showRemintButton = useMemo(() => {
    return (
      collectionNfts?.filter(
        (cnft) =>
          !cnft.remintingStatus ||
          cnft.remintingStatus !== RemintingStatus.Failed
      ).length ?? 0 > 0
    );
  }, [collectionNfts, collectionDerug]);

  return (
    <div className="w-full flex-col gap-10">
      <WinningRequest request={getWinningRequest!} />
      <>
        {collectionDerug?.status === DerugStatus.UploadingMetadata ? (
          <div className="text-center text-lg m-10">
            <p className="text-white">
              ⚠️ Uploading metadata and preparing private mint.Minting will be
              enabled soon! ⚠️
            </p>
          </div>
        ) : (
          <>
            {collectionDerug &&
              collectionDerug.status === DerugStatus.Reminting &&
              dayjs(remintConfig?.privateMintEnd).isAfter(dayjs()) && (
                <div className="flex flex-col items-center gap-10 w-full mt-10">
                  {!loading &&
                    collectionNfts &&
                    collectionNfts?.length > 0 &&
                    showRemintButton && (
                      <button
                        onClick={remintNfts}
                        style={{
                          background: "rgb(9, 194, 246)",
                          borderRadius: "4px",
                          color: "black",
                          fontWeight: "bold",
                          border: "1px solid none",
                          minWidth: "10em",
                          fontSize: "1.5em",
                          padding: " 0.25em 1em",
                          fontFamily: "monospace",
                        }}
                      >
                        {!isReminting ? (
                          <p>Remint</p>
                        ) : (
                          <Oval
                            color="black"
                            wrapperClass="px-4 py-6 h-6 text-black font-lg"
                            width={"1em"}
                            secondaryColor="transparent"
                          />
                        )}
                      </button>
                    )}

                  {loading ? (
                    <>
                      {generateSkeletonArrays(5).map((_, index) => {
                        return <Skeleton baseColor="red" key={index} />;
                      })}
                    </>
                  ) : (
                    <>{renderCollectionNfts}</>
                  )}
                </div>
              )}
          </>
        )}
      </>
    </div>
  );
};

export default Remint;
