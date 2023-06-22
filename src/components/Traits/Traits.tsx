import { Box, Text } from "@primer/react";
import React, { FC, useContext, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import { ITrait } from "../../interface/collections.interface";
import { CollectionContext } from "../../stores/collectionContext";
import { generateSkeletonArrays } from "../../utilities/nft-fetching";
const Traits: FC<{ trait: ITrait }> = ({ trait }) => {
  const { loading } = useContext(CollectionContext);
  const renderTraits = useMemo(() => {
    return trait.values.map((t) => {
      return (
        <Box
          key={t.name}
          className="flex flex-col gap-2 items-start justify-start mb-2"
        >
          <img src={t.image} className="w-32 rounded-lg" />
          <Box className="flex flex-col items-start justify-start w-full">
            <Text className="text-sm text-left" sx={{ color: "white" }}>
              {t.name}
            </Text>
            <Text
              style={{
                filter: "drop-shadow(rgb(9, 194, 246) 0px 0px 15px)",
                color: "rgb(9, 194, 246)",
              }}
              className="text-xs text-left"
            >
              {t.percentage}%
            </Text>
          </Box>
        </Box>
      );
    });
  }, [trait]);
  return (
    <Box className="flex flex-col pt-5 items-start">
      <Text className=" font-mono text-white">
        {trait.name} [{trait.values.length}]
      </Text>
      <Box className="grid grid-cols-6 mt-3 gap-2">
        {loading
          ? generateSkeletonArrays(32).map((_, i) => (
              <Skeleton
                height={128}
                width={128}
                baseColor="rgb(22,27,34)"
                highlightColor="rgb(29,35,44)"
              />
            ))
          : renderTraits}
      </Box>
    </Box>
  );
};

export default Traits;
