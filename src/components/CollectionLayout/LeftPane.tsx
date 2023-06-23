import { FC, useState } from "react";
import { AiOutlineStar } from "react-icons/ai";
import CollectionData from "../CollectionData/CollectionData";
import tensorLogo from "../../assets/tensorLogo.png";
import magicEdenLogo from "../../assets/magicEdenLogo.png";
import { useRouter } from "next/router";

export const LeftPane: FC<{
  selectedInfo: string;
}> = ({ selectedInfo }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();
  const slug = router.pathname;
  return (
    <div>
      <div
        className="pl-10 sticky"
      >
        <div
        >
          {(selectedInfo === "description" || selectedInfo === "") && (
            <div
            >
              <div
                id="description"
                style={{ padding: 2, maxHeight: "32em", overflow: "none" }}
              >
                <div className="flex flex-col items-end">
                  <div className="flex gap-3 items-center">
                    <AiOutlineStar
                      style={{ color: isFavorite ? "#F0CF65" : "white" }}
                      className="text-4xl text-red cursor-pointer"
                      onClick={() => setIsFavorite(!isFavorite)}
                    />
                    <img
                      src={tensorLogo.src}
                      alt="tensorLogo"
                      className="w-8 h-8 rounded-full cursor-pointer"
                      onClick={() =>
                        window.open(
                          `https://www.tensor.trade/trade/${slug}`,
                          "_blank"
                        )
                      }
                    />
                    <img
                      src={magicEdenLogo.src}
                      alt="magicEden"
                      className="w-8 h-8 rounded-full cursor-pointer"
                      onClick={() =>
                        window.open(
                          `https://magiceden.io/marketplace/${slug}`,
                          "_blank"
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <CollectionData />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
