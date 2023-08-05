import { FC } from "react";
import {
  IChainCollectionData,
  ICollectionData,
  ICollectionDerugData,
} from "../../interface/collections.interface";
import { FADE_DOWN_ANIMATION_VARIANTS } from "../../utilities/constants";
import { ActiveListingItem } from "./ActiveListingItem";

export const ActiveListings: FC<{
  activeListings?: {
    derug: ICollectionDerugData;
    collection: ICollectionData;
  }[];
}> = ({ activeListings }) => (
  <>
    {activeListings && (
      <div className="flex flex-col w-full gap-5">
        <div className="flex flex-col w-full justify-center items-center">
          <span className="text-2xl font-mono text-gray-500	font-bold flex px-4">
            ACTIVE DERUGS 🛠
          </span>
        </div>
        {activeListings.map((cd, index) => {
          return (
            <ActiveListingItem
              key={index}
              derugData={cd.derug}
              collectionData={cd.collection}
            />
          );
        })}
      </div>
    )}
  </>
);
