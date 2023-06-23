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

  const getCollectionsData = async () => {
    try {
      setLoading(true);
      const randomCollections = await getRandomCollections();
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
        className="absolute top-0 left-0 w-full h-full z-10 p-2 border border-gray-200 rounded-lg shadow"
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

  const renderTopCollections = useMemo(() => {
    return topVolumeCollections?.map((c) => {
      return <CollectionItem collection={c} key={c.symbol} bigImage={true} />;
    });
  }, [topVolumeCollections]);

  const renderHotCollections = useMemo(() => {
    return hotCollections?.map((c) => {
      return <CollectionItem collection={c} key={c.symbol} bigImage={false} />;
    });
  }, [hotCollections]);

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
      style={{
        width: "100%",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        zoom: "80%",
        padding: "3em",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      ></div>

      <div
        style={{
          width: "50%",
          margin: "auto",
          position: "relative",
          marginBottom: "80px",
        }}
      >
        <h1
          className="py-5 text-center"
        >
          <div
            className="w-full animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 text-5xl font-black bg-clip-text text-center font-display  tracking-[-0.02em] text-transparent drop-shadow-sm md:text-2xl align-center font-mono animate-[wiggle_1s_ease-in-out_infinite]"
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
        <div className="flex w-full">
          <ActiveListings activeListings={activeCollections} />
          {/* here as well */}
        </div>
      ) : (
        // loading ? (
        <></>
      )}

      {/* todo refactor this into component */}
      {topVolumeCollections && topVolumeCollections.length > 0 && (
        <div className="w-full">
          <HotCollections
            collections={topVolumeCollections}
            filter={filter}
            setFilter={setFilter}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
