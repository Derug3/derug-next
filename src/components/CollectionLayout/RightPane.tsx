import { FC, useMemo } from "react";
import {
  IChainCollectionData,
  IListed,
  ITrait,
} from "../../interface/collections.interface";
import { FADE_DOWN_ANIMATION_VARIANTS } from "../../utilities/constants";
import ListedNfts from "../ListedNfts/ListedNfts";
import ListingsGraph from "../ListingsGraph/ListingsGraph";
import TraitsList from "../Traits/TraitsList";

export const RightPane: FC<{
  selectedData: string;
  chainCollectionData?: IChainCollectionData;
  traits: ITrait[] | undefined;
  iframeRef: any;
}> = ({ selectedData, traits, iframeRef, chainCollectionData }) => (
  <div className="flex w-full items-center justify-center mt-5">
    {selectedData === "traits" && traits && <TraitsList traits={traits} />}
    {selectedData === "listed" && traits && <ListedNfts />}
  </div>
);
