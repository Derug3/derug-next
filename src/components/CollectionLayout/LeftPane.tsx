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
    <div
      className="flex flex-col items-center justify-between w-full h-full"
    >
      {(selectedInfo === "description" || selectedInfo === "") && (
        <div
          className="flex w-full h-full flex-col justify-between"
          id="description"
        >
          <CollectionData />
        </div>
      )}
    </div>
  );
};
