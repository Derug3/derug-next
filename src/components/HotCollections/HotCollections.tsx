import React, { FC, useMemo } from "react";
import Select from "react-select";
import { ICollectionVolume } from "../../interface/collections.interface";
import { CollectionVolumeFilter } from "../../enums/collections.enums";
import HotCollectionItem from "./HotCollectionItem";
import { selectStylesPrimary } from "../../utilities/styles";
import { mapFilterTypeToValue } from "../../common/helpers";

const HotCollections: FC<{
  collections: ICollectionVolume[];
  filter: CollectionVolumeFilter;
  setFilter: (filter: CollectionVolumeFilter) => void;
}> = ({ filter, collections, setFilter }) => {
  const renderCollectionItem = useMemo(() => {
    return collections.map((c) => {
      return (
        <HotCollectionItem collection={c} filter={filter} key={c.symbol} />
      );
    });
  }, [collections]);

  const getFilterOptions = useMemo(() => {
    return Object.values(CollectionVolumeFilter).map((c: any) => {
      return {
        label: mapFilterTypeToValue(c as CollectionVolumeFilter),
        value: c,
      };
    });
  }, []);

  return (
    <div className="w-full flex-col gap-5 mt-6 flex gap-5">
      <div className="w-full flex justify-center">
        <span className="px-4 text-2xl font-mono text-gray-500 items-center	font-bold flex text-start">
          COLLECTIONS 🔥
        </span>
        <Select
          styles={{ ...selectStylesPrimary }}
          className="p-2 border border-gray-200 rounded-lg shadow"
          options={getFilterOptions}
          onChange={(e) => setFilter(e?.value as CollectionVolumeFilter)}
          defaultValue={getFilterOptions[0]}
          formatOptionLabel={(val) => {
            return (
              <div className="w-full font-bold text-white font-md px-5">
                {val.label}
              </div>
            );
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-10">{renderCollectionItem}</div>
    </div>
  );
};

export default HotCollections;
