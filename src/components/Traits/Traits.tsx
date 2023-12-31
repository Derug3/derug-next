import React, { FC, useContext, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import { ITrait } from "../../interface/collections.interface";
import { CollectionContext } from "../../stores/collectionContext";
import { generateSkeletonArrays } from "../../utilities/nft-fetching";
const Traits: FC<{ trait: ITrait }> = ({ trait }) => {
  const { loading } = useContext(CollectionContext);
  const renderTraits = useMemo(() => {
    return trait.traits.map((t, index) => {
      return (
        <div
          key={index}
          className="flex w-full flex-col gap-2 items-start justify-start mb-2"
        >
          <img src={t.image} className="w-64" />
          <div className="flex flex-col items-start justify-start w-full">
            <span className="text-sm text-left font-mono text-white">
              {t.name}
            </span>
            <span
              style={{
                filter: "drop-shadow(rgb(9, 194, 246) 0px 0px 15px)",
                color: "rgb(9, 194, 246)",
              }}
              className="text-xs text-left"
            >
              {t.percentage}%
            </span>
          </div>
        </div>
      );
    });
  }, [trait]);
  return (
    <div className="flex flex-col pt-5 items-start">
      <span className="text-white">
        {trait.name} [{trait.traits.length}]
      </span>
      <div className="grid grid-cols-6 mt-3 gap-2">
        {loading
          ? generateSkeletonArrays(32).map((_, i) => (
            <Skeleton
              key={i}
              height={128}
              width={128}
              baseColor="rgb(22,27,34)"
              highlightColor="rgb(29,35,44)"
            />
          ))
          : renderTraits}
      </div>
    </div>
  );
};

export default Traits;
