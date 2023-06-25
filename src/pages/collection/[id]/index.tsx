import { FC, useEffect, useMemo, useRef, useState } from "react";

import utc from "dayjs/plugin/utc";

import { CandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { LeftPane } from "@/components/CollectionLayout/LeftPane";
import { RightPane } from "@/components/CollectionLayout/RightPane";
import { getSingleCollection } from "@/api/collections.api";
import { getFloorPrice, getListings, getTraits } from "@/api/tensor";
import { AddDerugRequst } from "@/components/CollectionLayout/AddDerugRequest";
import { CollectionStats } from "@/components/CollectionLayout/CollectionStats";
import { HeaderTabs } from "@/components/CollectionLayout/HeaderTabs";
import DerugRequest from "@/components/DerugRequest/DerugRequest";
import NoDerugRequests from "@/components/DerugRequest/NoDerugRequests";
import PublicMint from "@/components/Remit/PublicMint";
import Remint from "@/components/Remit/Remint";
import { getDummyCollectionData } from "@/solana/dummy";
import { getCollectionDerugData } from "@/solana/methods/derug";
import { getAllDerugRequest } from "@/solana/methods/derug-request";
import { getRemintConfig } from "@/solana/methods/remint";
import { derugProgramFactory } from "@/solana/utilities";
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
import {
  IDerugCandyMachine,
  IGraphData,
  IRemintConfig,
} from "@/interface/derug.interface";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getDerugCandyMachine } from "@/solana/methods/public-mint";
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

  const [derugRequests, setDerugRequests] = useState<IRequest[]>();
  const iframeRef = useRef(null);
  const router = useRouter();

  const [remintConfig, setRemintConfig] = useState<IRemintConfig | undefined>();

  const wallet = useWallet();

  useEffect(() => {
    void getBasicCollectionData();
  }, []);
  const getBasicCollectionData = async () => {
    try {
      setBasicCollectionData(await getSingleCollection(slug ?? ""));
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
        let traitsData = await getTraits(slug);
        if (traitsData.length === 0) {
          traitsData = await getTraits(collectionStats.slug);
        }
        setTraits(traitsData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      toggleLoading(false);
    }
  };
  useEffect(() => {
    if (basicCollectionData) void getChainCollectionDetails();
  }, [basicCollectionData, wallet.publicKey]);
  const getChainCollectionDetails = async () => {
    try {
      const chainDetails = await getCollectionChainData(
        basicCollectionData!,
        listings?.at(0)
      );

      const derugProgram = derugProgramFactory();

      derugProgram.addEventListener("PrivateMintStarted", async (data) => {
        if (data.derugData.toString() === collectionDerug?.address.toString()) {
          setCollectionDerug(await getCollectionDerugData(data.derugData));
          setRemintConfig(await getRemintConfig(data.derugData));
        }
      });

      chainDetails.slug = slug!;
      setChainCollectionData(chainDetails);
      if (chainDetails.hasActiveDerugData) {
        const remintConfigData = await getRemintConfig(
          chainDetails.derugDataAddress
        );
        setRemintConfig(remintConfigData);

        if (remintConfigData && remintConfigData.candyMachine && wallet) {
          const cm = await getDerugCandyMachine(remintConfigData, wallet);
          if (cm) setCandyMachine(cm);
        }
        setCollectionDerug(
          await getCollectionDerugData(chainDetails.derugDataAddress)
        );
        setDerugRequests(
          await getAllDerugRequest(chainDetails.derugDataAddress)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getWinningRequest = useMemo(() => {
    return derugRequests?.sort((a, b) => a.voteCount - b.voteCount)[
      derugRequests.length - 1
    ];
  }, [derugRequests]);
  const showDerugRequests = useMemo(() => {
    if (collectionDerug) {
      return !!!collectionDerug.winningRequest;
    } else {
      return false;
    }
  }, [collectionDerug, derugRequests]);

  const hasWinning = useMemo(() => {
    if (collectionDerug)
      return (
        dayjs(collectionDerug.periodEnd).isBefore(dayjs()) &&
        derugRequests?.find(
          (dr) =>
            dr.voteCount >=
            collectionDerug.totalSupply / collectionDerug.thresholdDenominator
        )
      );
    else return false;
  }, [collectionDerug, derugRequests]);

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
        derugRequests,
        setRequests: setDerugRequests,
        graphData,
        setGraphData,
        remintConfig,
        setRemintConfig,
        candyMachine,
        setCandyMachine,
      }}
    >
      <div
        className="overflow-y-auto pt-5"
        style={{
          zoom: "85%",
        }}
      >
        <div className="overflow-y-clip flex flex-col">
          {wallet && derugRequestVisible && (
            <AddDerugRequst
              isOpen={derugRequestVisible}
              setIsOpen={(val) => setDerugRequestVisible(val)}
              derugRequests={derugRequests}
              setDerugRequest={setDerugRequests}
            />
          )}
          <div className="sticky top-0 grid">
            <HeaderTabs
              setSelectedInfo={setSelectedInfo}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
              openDerugModal={(val) => {
                setDerugRequestVisible(val);
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "50% 50%",
            }}
          >
            <div
              className="flex flex-col justify-between items-start"
              style={{
                transform: "translateY(-42px)",
              }}
            >
              <div className="flex flex-col w-full justify-between h-full">
                <LeftPane selectedInfo={selectedInfo} />
                <CollectionStats
                  collection={collectionStats}
                  collectionDerug={collectionDerug}
                  wallet={wallet}
                  openDerugModal={setDerugRequestVisible}
                />
              </div>
            </div>
            <div
              style={{
                maxHeight: "30em",
                overflowY: "scroll",
              }}
            >
              <RightPane
                selectedData={selectedData}
                chainCollectionData={chainCollectionData}
                traits={traits}
                iframeRef={iframeRef}
              />
            </div>
          </div>
        </div>
      </div>
      {collectionDerug ? (
        <>
          {(collectionDerug.status === DerugStatus.Initialized ||
            collectionDerug.status === DerugStatus.Voting) &&
          showDerugRequests &&
          !hasWinning ? (
            <DerugRequest />
          ) : (
            <>
              {remintConfig &&
              (dayjs(remintConfig.privateMintEnd).isBefore(dayjs()) ||
                (remintConfig.mintPrice && !remintConfig.privateMintEnd)) &&
              candyMachine &&
              Number(candyMachine.candyMachine.itemsLoaded) > 0 &&
              Number(candyMachine.candyMachine.itemsLoaded) ===
                Number(candyMachine.candyMachine.data.itemsAvailable) ? (
                <PublicMint />
              ) : (
                collectionDerug &&
                (hasWinning ||
                  collectionDerug.addedRequests.find((ar) => ar.winning)) &&
                derugRequests && (
                  <Remint getWinningRequest={getWinningRequest} />
                )
              )}
            </>
          )}
        </>
      ) : (
        <NoDerugRequests openDerugModal={setDerugRequestVisible} />
      )}
    </CollectionContext.Provider>
  );
};

export default Collections;
