import { FC, useEffect, useMemo, useRef, useState } from "react";
import utc from "dayjs/plugin/utc";
import { LeftPane } from "@/components/CollectionLayout/LeftPane";
import { RightPane } from "@/components/CollectionLayout/RightPane";
import { getSingleCollection } from "@/api/collections.api";
import { getFloorPrice, getListings } from "@/api/tensor";
import { AddDerugRequst } from "@/components/AddDerugRequest/AddDerugRequest";
import { CollectionStats } from "@/components/CollectionLayout/CollectionStats";
import { HeaderTabs } from "@/components/CollectionLayout/HeaderTabs";
import PublicMint from "@/components/Remit/PublicMint";
import Remint from "@/components/Remit/Remint";
import { getDummyCollectionData } from "@/solana/dummy";
import { getCollectionDerugData } from "@/solana/methods/derug";
import { getAllDerugRequest } from "@/solana/methods/derug-request";
import { CollectionContext } from "@/stores/collectionContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import dayjs from "dayjs";
import { DerugStatus } from "@/enums/collections.enums";
import {
  ICollectionStats,
  ITrait,
  ICollectionData,
  INftListing,
  IChainCollectionData,
  ICollectionRecentActivities,
  ICollectionDerugData,
  IRequest,
} from "@/interface/collections.interface";
import { IDerugCandyMachine, IGraphData } from "@/interface/derug.interface";
import { GetServerSideProps } from "next";
import { getDerugCandyMachine } from "@/solana/methods/public-mint";
import Modal from "@/components/Modal";
import { Oval } from "react-loader-spinner";
import { getCollectionChainData } from "@/solana/collections";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params.id;
  return {
    props: {
      slug,
    },
  };
};
export const Collections: FC<{ slug: string }> = ({ slug }) => {
  dayjs.extend(utc);
  const [collectionStats, setCollectionStats] = useState<ICollectionStats>();

  const [derugRequestVisible, setDerugRequestVisible] = useState(false);
  const [loading, toggleLoading] = useState(true);
  const [traits, setTraits] = useState<ITrait[]>();
  const [selectedInfo, setSelectedInfo] = useState("description");
  const [selectedData, setSelectedData] = useState("listed");
  const [basicCollectionData, setBasicCollectionData] =
    useState<ICollectionData>();
  const [listings, setListings] = useState<INftListing[]>();
  const [chainCollectionData, setChainCollectionData] =
    useState<IChainCollectionData>();
  const [recentActivities, setRecentActivities] =
    useState<ICollectionRecentActivities[]>();
  const [collectionDerug, setCollectionDerug] =
    useState<ICollectionDerugData>();
  const [graphData, setGraphData] = useState<IGraphData>();
  const [candyMachine, setCandyMachine] = useState<IDerugCandyMachine>();

  const [derugRequest, setDerugRequests] = useState<IRequest>();
  const iframeRef = useRef(null);

  const wallet = useWallet();

  useEffect(() => {
    void getBasicCollectionData();
  }, []);
  const getBasicCollectionData = async () => {
    try {
      const collection = await getSingleCollection(slug ?? "");
      setBasicCollectionData(collection);
      if (slug) {
        const collectionStats = await getFloorPrice(slug);

        if (collectionStats.fp > 100 || collectionStats.marketCap > 100) {
          collectionStats.fp = collectionStats.fp / LAMPORTS_PER_SOL;
          collectionStats.marketCap =
            collectionStats.marketCap / LAMPORTS_PER_SOL;
        }

        setCollectionStats(collectionStats);
        let listingsData = await getListings(slug);
        if (listingsData.length === 0) {
          listingsData = await getListings(collectionStats.slug);
        }
        setListings(listingsData);
        setTraits(collection.traits);
      }
    } catch (error) {
      console.log(error);
    } finally {
      toggleLoading(false);
    }
  };
  useEffect(() => {
    if (basicCollectionData) void getChainCollectionDetails();
  }, [basicCollectionData, wallet]);
  const getChainCollectionDetails = async () => {
    try {
      if (basicCollectionData) {
        const chainDetails = await getCollectionChainData(
          basicCollectionData!,
          listings?.at(0)
        );

        chainDetails.slug = slug!;
        setChainCollectionData(chainDetails);

        if (chainDetails.hasActiveDerugData) {
          setCollectionDerug(
            await getCollectionDerugData(chainDetails.derugDataAddress)
          );
          setDerugRequests(
            await getAllDerugRequest(chainDetails.derugDataAddress)
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderDerugContent = useMemo(() => {
    if (derugRequest) {
      switch (derugRequest.status) {
        case DerugStatus.Initialized: {
          return (
            <div className="flex flex-col items-center">
              <Oval
                color="#36BFFA"
                width={"4em"}
                secondaryColor="transaprent"
              />
              <p> ⚠️ Minting will be enabled soon... ⚠️</p>
            </div>
          );
        }
        case DerugStatus.Reminting:
        case DerugStatus.UploadingMetadata: {
          if (
            derugRequest.privateMintDuration > dayjs().unix() ||
            derugRequest.status === DerugStatus.UploadingMetadata
          ) {
            return <Remint onComplete={() => getChainCollectionDetails()} />;
          } else {
            return <PublicMint />;
          }
        }
        case DerugStatus.PublicMint: {
          return <PublicMint />;
        }
      }
    }
  }, [derugRequest, candyMachine]);

  return (
    <CollectionContext.Provider
      value={{
        loading,
        toggleLoading,
        chainCollectionData,
        setChainCollectionData,
        activeListings: listings,
        setActiveListings: setListings,
        collection: basicCollectionData,
        setCollection: setBasicCollectionData,
        collectionStats,
        setCollectionStats,
        traits,
        setTraits,
        recentActivities,
        setRecentActivities,
        collectionDerug,
        setCollectionDerug,
        derugRequest,
        setRequests: setDerugRequests,
        graphData,
        setGraphData,
        candyMachine,
        setCandyMachine,
      }}
    >
      <div className="flex flex-col pt-12 xs:px-0 sm:px-8 md:px-32 lg:px-64">
        {wallet && (
          <Modal isOpen={derugRequestVisible} onClose={setDerugRequestVisible}>
            <AddDerugRequst
              derugRequest={derugRequest}
              isOpen={derugRequestVisible}
              setIsOpen={(val) => setDerugRequestVisible(val)}
              setDerugRequest={setDerugRequests}
            />
          </Modal>
        )}
        <div className="flex flex-col">
          <div className="flex flex-col lg:flex-row w-full justify-center">
            <div className="flex flex-col w-full justify-center items-center gap-5">
              <LeftPane selectedInfo={selectedInfo} />
              <div className="flex flex-col gap-5 w-full">
                {derugRequest && (
                  <div className="flex items-center w-full bg-gray-800 shadow-md justify-center p-10 gap-24 border-8 border-active">
                    {renderDerugContent}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <HeaderTabs
                    setSelectedInfo={setSelectedInfo}
                    selectedData={selectedData}
                    setSelectedData={setSelectedData}
                    openDerugModal={(val) => {
                      setDerugRequestVisible(val);
                    }}
                  />
                </div>

                <CollectionStats
                  collection={collectionStats}
                  collectionDerug={collectionDerug}
                  wallet={wallet}
                  openDerugModal={setDerugRequestVisible}
                />
              </div>
            </div>
          </div>

          <RightPane
            selectedData={selectedData}
            chainCollectionData={chainCollectionData}
            traits={traits}
            iframeRef={iframeRef}
          />
        </div>
      </div>

      {/* {collectionDerug && (
        <>
          {collectionDerug.status === DerugStatus.Initialized ? (
            <DerugRequest />
          ) : (
            <>
              {collectionDerug.status === DerugStatus.PublicMint &&
              candyMachine &&
              Number(candyMachine.candyMachine.itemsLoaded) > 0 &&
              Number(candyMachine.candyMachine.itemsLoaded) ===
                Number(candyMachine.candyMachine.data.itemsAvailable) ? (
                <PublicMint />
              ) : (
                collectionDerug &&
                collectionDerug.addedRequests.find((ar) => ar.winning) &&
                derugRequest && <Remint />
              )}
            </>
          )}
        </>
      )} */}
    </CollectionContext.Provider>
  );
};

export default Collections;
