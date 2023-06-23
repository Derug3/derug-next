import { FC, useMemo } from "react";
import {
  IChainCollectionData,
  ICollectionData,
} from "../../interface/collections.interface";
import { FADE_DOWN_ANIMATION_VARIANTS } from "../../utilities/constants";
import { HotListingItem } from "./HotListingItem";

export const HotListings: FC<{
  hotListings?: ICollectionData[];
}> = ({ hotListings }) => (
  <>
    {hotListings && (
      <div className="flex flex-col w-1/2 mt-1">
        <div className="flex flex-col justify-between items-center">
          <div className="text-xl font-mono text-main-blue flex justify-start w-full">
            <span
              className="px-4"
              style={{
                border: "1px solid rgb(9, 194, 246)",
                borderBottom: "none",
              }}
            >
              active derugs
            </span>
          </div>
        </div>
        <div
          className="flex flex-wrap box-content cursor-pointer overflow-hidden w-full"
          style={{
            border: "1px solid rgb(9, 194, 246)",
            borderRight: "none",
            borderBottom: "none",
            height: "400px",
            overflowY: "scroll",
          }}
        >
          {hotListings.map((cd, index) => {
            console.log(cd, "cd");

            return <HotListingItem collectionData={cd} key={index} />;
          })}
        </div>
      </div>
    )}
  </>
);
