import { FC } from "react";
import {
  IChainCollectionData,
  ICollectionData,
  ICollectionDerugData,
} from "../../interface/collections.interface";
import { FADE_DOWN_ANIMATION_VARIANTS } from "../../utilities/constants";
import { ActiveListingItem } from "./ActiveListingItem";

const dummy: ICollectionData[] = [
  {
    id: "1",
    symbol: "bonkbank",
    image:
      "https://creator-hub-prod.s3.us-east-2.amazonaws.com/bonkbank_pfp_1672702226532.png",
    name: "The Bonk Bank",
    description:
      "The Bonk Bank is Multi-Sig Governed Dao for Bonk. Our goal is to bring mass adoption to the memecoin of Solana. Features will include Staking for Bonk, Raid 4 Bonk, Bonk Bank and much more!Staking: https://staking.etakit.in/thebonkbox 100+ Game Bonksino: https://bonkbank.crashout.io/",
    twitter: "https://www.twitter.com/TheBonkBank",
    discord: "https://www.discord.gg/6UHaNVE99b",
    website: "https://bonkbank.crashout.io/",
    categories: ["pfps", "art"],
    isFlagged: true,
  },
  {
    id: "1",
    symbol: "bonkbank",
    image:
      "https://creator-hub-prod.s3.us-east-2.amazonaws.com/bonkbank_pfp_1672702226532.png",
    name: "The Bonk Bank",
    description:
      "The Bonk Bank is Multi-Sig Governed Dao for Bonk. Our goal is to bring mass adoption to the memecoin of Solana. Features will include Staking for Bonk, Raid 4 Bonk, Bonk Bank and much more!Staking: https://staking.etakit.in/thebonkbox 100+ Game Bonksino: https://bonkbank.crashout.io/",
    twitter: "https://www.twitter.com/TheBonkBank",
    discord: "https://www.discord.gg/6UHaNVE99b",
    website: "https://bonkbank.crashout.io/",
    categories: ["pfps", "art"],
    isFlagged: true,
  },
  {
    id: "1",
    symbol: "bonkbank",
    image:
      "https://creator-hub-prod.s3.us-east-2.amazonaws.com/bonkbank_pfp_1672702226532.png",
    name: "The Bonk Bank",
    description:
      "The Bonk Bank is Multi-Sig Governed Dao for Bonk. Our goal is to bring mass adoption to the memecoin of Solana. Features will include Staking for Bonk, Raid 4 Bonk, Bonk Bank and much more!Staking: https://staking.etakit.in/thebonkbox 100+ Game Bonksino: https://bonkbank.crashout.io/",
    twitter: "https://www.twitter.com/TheBonkBank",
    discord: "https://www.discord.gg/6UHaNVE99b",
    website: "https://bonkbank.crashout.io/",
    categories: ["pfps", "art"],
    isFlagged: true,
  },
  {
    id: "1",
    symbol: "bonkbank",
    image:
      "https://creator-hub-prod.s3.us-east-2.amazonaws.com/bonkbank_pfp_1672702226532.png",
    name: "The Bonk Bank",
    description:
      "The Bonk Bank is Multi-Sig Governed Dao for Bonk. Our goal is to bring mass adoption to the memecoin of Solana. Features will include Staking for Bonk, Raid 4 Bonk, Bonk Bank and much more!Staking: https://staking.etakit.in/thebonkbox 100+ Game Bonksino: https://bonkbank.crashout.io/",
    twitter: "https://www.twitter.com/TheBonkBank",
    discord: "https://www.discord.gg/6UHaNVE99b",
    website: "https://bonkbank.crashout.io/",
    categories: ["pfps", "art"],
    isFlagged: true,
  },
  {
    id: "1",
    symbol: "bonkbank",
    image:
      "https://creator-hub-prod.s3.us-east-2.amazonaws.com/bonkbank_pfp_1672702226532.png",
    name: "The Bonk Bank",
    description:
      "The Bonk Bank is Multi-Sig Governed Dao for Bonk. Our goal is to bring mass adoption to the memecoin of Solana. Features will include Staking for Bonk, Raid 4 Bonk, Bonk Bank and much more!Staking: https://staking.etakit.in/thebonkbox 100+ Game Bonksino: https://bonkbank.crashout.io/",
    twitter: "https://www.twitter.com/TheBonkBank",
    discord: "https://www.discord.gg/6UHaNVE99b",
    website: "https://bonkbank.crashout.io/",
    categories: ["pfps", "art"],
    isFlagged: true,
  },
  {
    id: "1",
    symbol: "bonkbank",
    image:
      "https://creator-hub-prod.s3.us-east-2.amazonaws.com/bonkbank_pfp_1672702226532.png",
    name: "The Bonk Bank",
    description:
      "The Bonk Bank is Multi-Sig Governed Dao for Bonk. Our goal is to bring mass adoption to the memecoin of Solana. Features will include Staking for Bonk, Raid 4 Bonk, Bonk Bank and much more!Staking: https://staking.etakit.in/thebonkbox 100+ Game Bonksino: https://bonkbank.crashout.io/",
    twitter: "https://www.twitter.com/TheBonkBank",
    discord: "https://www.discord.gg/6UHaNVE99b",
    website: "https://bonkbank.crashout.io/",
    categories: ["pfps", "art"],
    isFlagged: true,
  },
];
export const ActiveListings: FC<{
  activeListings?: {
    derug: ICollectionDerugData;
    collection: ICollectionData;
  }[];
}> = ({ activeListings }) => (
  <>
    {activeListings && (
      <div className="flex flex-col w-full gap-5">
        <div className="flex flex-col justify-between items-start">
          <span className="text-2xl font-mono text-gray-500	font-bold flex w-full text-centerw-full px-4">ACTIVE DERUGS 🛠</span>
        </div>
        <div
          className="grid grid-cols-3 gap-5 cursor-pointer overflow-hidden w-full"
          style={{
            overflowY: "scroll",
          }}
        >
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
      </div>
    )}
  </>
);
