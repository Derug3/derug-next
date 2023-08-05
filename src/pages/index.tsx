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

  const swiperOptions = {
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 0,
      stretch: 40,
      depth: 100,
      modifier: 1,
      slideShadows: false,
    },
    grabCursor: true,
    spaceBetween: 0,
    slidesPerView: isMobile ? 1 : 4,
    centeredSlides: true,
    loop: true,
    modules: [EffectCoverflow],
  };

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
      const validCollections: ICollectionData[] = [];
      setLoading(true);
      const randomCollections = await getRandomCollections();
      setCollections(randomCollections);

      for (const collection of randomCollections) {
        const isValid = await checkImageStatus(collection.image); // Check image status
        if (isValid) {
          validCollections.push(collection);
        }
      }

      setFilteredCollections(validCollections);
      setCollections(validCollections);
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
        className="absolute text-center top-0 left-0 w-full h-full z-10 p-2 border border-gray-200 rounded-lg shadow"
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
    <Swiper {...swiperOptions}>
      {collections && collections.map((c, index) => (
        <SwiperSlide key={index}>
          <CollectionItem collection={c} key={c.symbol} bigImage={true} />
        </SwiperSlide>)
      )}
    </Swiper>
  ), [collections]);

  // const renderHotCollections = useMemo(() => {
  //   return hotCollections?.map((c) => {
  //     return <CollectionItem collection={c} key={c.symbol} bigImage={false} />;
  //   });
  // }, [hotCollections]);

  const getFilterOptions = useMemo(() => {
    return Object.values(CollectionVolumeFilter).map((c: any) => {
      return {
        label: mapFilterTypeToValue(c as CollectionVolumeFilter),
        value: c,
      };
    });
  }, []);

  return (
    <div
      className="w-full h-full lg:py-12 py-5 lg:px-32 px-5"
      style={{
        width: "100%",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        zoom: "70%",
        // padding: "3em 8em",
        fontFamily: "Bungee",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          // width: "50%",
          margin: "auto",
          position: "relative",
          marginBottom: "80px",
        }}
      >
        <h1
          className="py-5 text-center"
        >
          <div
            className="w-full animate-text bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% text-2xl  bg-clip-text text-center font-display text-transparent drop-shadow-sm lg:text-3xl align-center animate-[wiggle_1s_ease-in-out_infinite]"
          >
            Getting rugged collections back to life
          </div>
        </h1>
        {renderSelect}
        {/* <Text
          onClick={() =>
            window.open(`https://derug-us.gitbook.io/derug_us/`, "_blank")
          }
          className="text-xl font-mono text-yellow-500 cursor-pointer flex justify-center w-full"
        >
          <span
            className="px-4"
            style={{
              border: "1px solid rgb(9, 194, 246)",
              borderTop: "none",
              paddingTop: "5px",
            }}
          >
            how it works?
          </span>
        </Text> */}
      </div>

      {activeCollections && activeCollections.length ? (
        <div className="flex mb-10">
          <ActiveListings activeListings={activeCollections} />
        </div>
      ) : (
        <></>
      )}

      {/* create me a grid with 3 cols */}
      <div className="flex flex-col w-full">
        <div className="flex flex-wrap gap-12">
          <div className="flex flex-col w-full justify-center items-center">
            <span className="text-2xl font-mono text-gray-500	font-bold flex px-4">HOT COLLECTIONS 🔥</span>
          </div>
          {renderRandomCollections}
        </div>
      </div>
    </div>
  );
};

export default Home;


