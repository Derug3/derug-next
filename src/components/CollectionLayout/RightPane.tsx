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
  <div>
    <div className="sticky">
      <div className="pl-8">
        {selectedData === "traits" && traits && <TraitsList traits={traits} />}
        {selectedData === "statistics" && traits && <ListingsGraph />}
        {selectedData === "listed" && <ListedNfts />}
        {selectedData === "solanafm" && (
          <div id="solanafm" className="flex w-full">
            <iframe
              ref={iframeRef}
              height="600px"
              width="100%"
              src={`https://solana.fm/address/${chainCollectionData?.collectionMint}?cluster=devnet-solana`}
            // todo remove cluster once we migrate
            />
          </div>
        )}
      </div>
    </div>
  </div>
);
