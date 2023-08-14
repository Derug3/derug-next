import {
  getByNameOrSlug,
  getRandomCollections,
  getCollectionsWithTopVolume,
  getOrderedCollectionsByVolume,
} from "@/api/collections.api";
import { ActiveListings } from "@/components/ActiveListings/ActiveListings";
import HotCollections from "@/components/HotCollections/HotCollections";
import CollectionItem from "@/components/MainPage/CollectionItem";
import { mapFilterTypeToValue } from "@/common/helpers";
import { CollectionVolumeFilter } from "@/enums/collections.enums";
import {
  ICollectionDerugData,
  ICollectionData,
  ICollectionVolume,
} from "@/interface/collections.interface";
import { getAllActiveCollections } from "@/solana/methods/derug-request";
import { collectionsStore } from "@/stores/collectionsStore";
import { FADE_DOWN_ANIMATION_VARIANTS } from "@/utilities/constants";
import { selectStylesPrimary } from "@/utilities/styles";
import Select from "react-select";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/router";
import { Swiper, SwiperSlide, SwiperProps } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCoverflow } from 'swiper/modules';
import { makeRequest } from "@/api/request.api";
import { useIsMobile } from "@/hooks/useIsMobile";
import TabComponent from "@/components/Tab";



const Home = () => {
  const { setCollections, collections } = collectionsStore.getState();
  const [searchValue, setSearchValue] = useState<string>();
  const [activeCollections, setActiveCollections] =
    useState<{ derug: ICollectionDerugData; collection: ICollectionData }[]>();
  const [searchLoading, toggleSearchLoading] = useState(false);
  const [filteredCollections, setFilteredCollections] = useState<
    ICollectionData[] | undefined
  >(collections);
  const [topVolumeCollections, setTopVolumeCollections] =
    useState<ICollectionVolume[]>();
  const [hotCollections, setHotCollections] = useState<ICollectionVolume[]>();
  const [filter, setFilter] = useState(CollectionVolumeFilter.MarketCap);
  const [loading, setLoading] = useState(true);
  const { name } = useDebounce(searchValue);
  const router = useRouter()
  const isMobile = useIsMobile();

  useEffect(() => {
    void getCollectionsData();
    void getActiveCollections();
    void getTopVolumeCollections();
  }, []);

  useEffect(() => {
    void getTopCollectionsWithFilter();
  }, [filter]);

  useEffect(() => {
    void searchByName();
  }, [name, activeCollections]);

  const handleSearch = (e: any) => {
    if (e && e !== "") {
      toggleSearchLoading(true);
      setSearchValue(e);
    } else {
      toggleSearchLoading(false);
      setFilteredCollections(collections);
    }
  };

  const searchByName = async () => {
    try {
      const collectionsByName = await getByNameOrSlug(name!);
      console.log(collectionsByName, "collectionsByName");

      setFilteredCollections(collectionsByName);
      toggleSearchLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  async function checkImageStatus(url) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      } else if (response.status === 404) {
        return false;
      }
    } catch (error) {
      console.error('Error occurred while fetching the image:', error);
      return false;
    }
  }

  const getCollectionsData = async () => {
    try {
      setLoading(true);
      const randomCollections = await getRandomCollections();
      setCollections(randomCollections);


      setFilteredCollections(randomCollections);
      setCollections(randomCollections);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getActiveCollections = async () => {
    try {
      const activeCollections = await getAllActiveCollections();
      setActiveCollections(activeCollections);
    } catch (error) {
      console.log(error);
    }
  };

  const getTopVolumeCollections = async () => {
    try {
      setTopVolumeCollections(await getCollectionsWithTopVolume());
      setHotCollections(await getCollectionsWithTopVolume());
    } catch (error) {
      toast.error("Failed to load collections with colume");
    }
  };

  const getTopCollectionsWithFilter = async () => {
    try {
      setTopVolumeCollections(await getOrderedCollectionsByVolume(filter));
    } catch (error) {
      toast.error("Failed to load collections with colume");
    }
  };

  const renderSelect = useMemo(() => {
    const enterSearch = (e: any) => {
      router.push(`/collection/${e.symbol}`);

    }

    return (
      <Select
        className="absolute text-center top-0 left-0 h-full z-10 p-2 border border-gray-200 rounded-lg shadow w-[20em] lg:w-[50em]"
        placeholder="Search rugged collections"
        isLoading={searchLoading}
        onInputChange={handleSearch}
        styles={selectStylesPrimary}
        options={filteredCollections}
        onChange={enterSearch}
        getOptionLabel={(option: any) => option.name}
        getOptionValue={(option: any) => option.symbol}
        formatOptionLabel={(e: any) => (
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              padding: "0.5em",
              zIndex: 100,
              gap: "0.5em",
            }}
          >
            <img style={{ width: "2.5em", height: "2.5em" }} src={e.image} />
            <h3 >{e.name}</h3>
          </div>
        )}
      />
    );
  }, [filteredCollections, searchLoading]);

  const renderRandomCollections = useMemo(() => (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap gap-12 w-full items-center justify-center mt-10">
        {collections && collections.map((c, index) => (
          <CollectionItem collection={c} key={c.symbol} bigImage={true} />)
        )}
      </div>
    </div>

  ), [collections]);

  const renderActiveCollections = useMemo(() => (
    activeCollections && activeCollections.length ? (
      <div className="flex mb-10">
        <ActiveListings activeListings={activeCollections} />
      </div>
    ) : (
      <></>
    )
  ), [activeCollections]);

  const getFilterOptions = useMemo(() => {
    return Object.values(CollectionVolumeFilter).map((c: any) => {
      return {
        label: mapFilterTypeToValue(c as CollectionVolumeFilter),
        value: c,
      };
    });
  }, []);

  const [activeTab, setActiveTab] = useState('Hot');

  const tabs = [
    {
      title: 'Active',
      id: 'Active',
    },
    {
      title: 'HOT 🔥',
      id: 'Hot',
    },
  ];

  return (
    <div
      className="w-full h-full lg:py-12 py-5 lg:px-32 px-5 flex flex-col items-center justify-center"
      style={{
        zoom: "70%",
        fontFamily: "Bungee",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          // width: "50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto",
          position: "relative",
          marginBottom: "20px",
          gap: '2em',
        }}
      >
        <h1
          className="py-5 text-center"
        >
          <div
            className="w-full animate-text bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% text-2xl  bg-clip-text text-center font-display text-transparent drop-shadow-sm lg:text-5xl align-center animate-[wiggle_1s_ease-in-out_infinite]"
          >
            Getting rugged collections back to life
          </div>
        </h1>
        {renderSelect}
      </div>
      <div className="flex w-full my-5 items-center justify-center">
        <TabComponent tabs={tabs} activeTab={activeTab} handleTabClick={(tab) => setActiveTab(tab)} />
      </div>
      {activeTab === 'Active' && renderActiveCollections || activeTab === 'Hot' && renderRandomCollections}
    </div>
  );
};

export default Home;


