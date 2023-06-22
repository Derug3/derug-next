import { Box, Text } from "@primer/react";
import React, { FC, useMemo } from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { CollectionVolumeFilter } from "../../enums/collections.enums";
import { ICollectionVolume } from "../../interface/collections.interface";
import { COLLECTION } from "../../utilities/constants";
import tensorLogo from "../../assets/tensorLogo.png";
import meLogo from "../../assets/magicEdenLogo.png";
import { useRouter } from "next/router";
const HotCollectionItem: FC<{
  collection: ICollectionVolume;
  filter: CollectionVolumeFilter;
}> = ({ collection, filter }) => {
  const { push: navigate } = useRouter();

  const getFilterText = useMemo(() => {
    switch (filter) {
      case CollectionVolumeFilter.FloorPrice:
        return ["Floor price", (+collection.floorPrice).toFixed(2)];
      case CollectionVolumeFilter.MarketCap:
        return ["Market Cap", (+collection.marketCap).toFixed(2)];
      case CollectionVolumeFilter.NumMints:
        return ["Total supply", (+collection.numMints).toFixed(0)];
    }
  }, [filter]);
  return (
    <Box
      onClick={() => navigate(`${COLLECTION}/${collection.symbol}`)}
      className="flex gap-3 items-center p-6 border border-gray-500 rounded-lg dark:border-gray dark:hover:bg-gray-800"
      style={{ background: "#0d1117" }}
    >
      <img src={collection.collection.image} className="w-24 rounded-sm " />
      <Box className="flex flex-col items-start gap-5 w-full">
        <Box className="w-full flex justify-between">
          <Text className="text-xl text-gray-400 uppercase font-mono">
            {collection.collection.name}
          </Text>
          <Box className="flex gap-4">
            <img
              className="w-8 rounded-lg shadow-xl"
              src={tensorLogo.src}
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://www.tensor.trade/trade/${collection.collection.symbol}`,
                  "_blank"
                );
              }}
            />
            <img
              className="w-8 rounded-xl"
              src={meLogo.src}
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://magiceden.io/marketplace/${collection.collection.symbol}`,
                  "_blank"
                );
              }}
            />
          </Box>
        </Box>
        <Box className="flex w-full justify-between w-full font-mono">
          <Text className="text-text-color">
            <span className="font-bold"> {getFilterText[0]}: </span>
            <span className="text-green-color"> {getFilterText[1]}</span>
          </Text>
          <Box className="flex items-center gap-3">
            {collection.collection.twitter && (
              <FaTwitter
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(collection.collection.twitter);
                }}
                style={{
                  color: "rgb(29 161 242)",
                  cursor: "pointer",
                  fontSize: "1.25em",
                }}
              />
            )}
            {collection.collection.discord && (
              <FaDiscord
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(collection.collection.discord);
                }}
                style={{
                  color: "rgb(88 101 242)",
                  cursor: "pointer",
                  fontSize: "1.25em",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HotCollectionItem;
