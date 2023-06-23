import { FC, useState } from "react";
import { ICollectionData } from "../../interface/collections.interface";

import {
  COLLECTION,
  FADE_DOWN_ANIMATION_VARIANTS,
} from "../../utilities/constants";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { useRouter } from "next/router";

export const HotListingItem: FC<{
  collectionData: ICollectionData;
}> = ({ collectionData }) => {
  const [hover, setHover] = useState(false);

  const { push: navigate } = useRouter();
  return (
    <div className="flex w-1/2">
      <div className="flex w-full flex-row items-start gap-5 p-2 bg-transparent">
        <img
          src={collectionData.image}
          onClick={() => navigate(`${COLLECTION}/${collectionData.symbol}`)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          alt="colectionImg"
          style={{
            opacity: hover ? 0.6 : 1,
            transform: hover ? "scale(1.1)" : "scale(1)",
            transition: "all .2s ease-out",
          }}
          className="w-full h-40 object-cover"
        />
        <div className="flex flex-row justify-between text-white w-full">
          <div className="flex flex-col">
            <div className="flex w-full justify-between">
              <h3 className="flex" style={{ color: "rgb(9, 194, 246)" }}>
                {collectionData.name}
              </h3>
              <div className="flex gap-3">
                <a
                  href={collectionData.discord}
                  target={"_blank"}
                  rel="noreferrer"
                >
                  <FaDiscord
                    style={{
                      cursor: "pointer",
                      fontSize: "1.75em",
                      color: "rgb(88 101 242)",
                    }}
                  />
                </a>
                <a
                  href={collectionData.twitter}
                  target={"_blank"}
                  rel="noreferrer"
                >
                  <FaTwitter
                    style={{
                      cursor: "pointer",
                      fontSize: "1.75em",
                      color: "rgb(29 161 242)",
                    }}
                  />
                </a>
              </div>
            </div>
            <p>{collectionData.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotListingItem;
