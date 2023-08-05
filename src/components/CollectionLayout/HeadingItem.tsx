import React, { FC, useCallback, useContext } from "react";
import Countdown from "react-countdown";
import { getCollectionDerugData } from "../../solana/methods/derug";
import { getAllDerugRequest } from "../../solana/methods/derug-request";
import { CollectionContext } from "../../stores/collectionContext";
const HeadingItem: FC<{
  title: string;
  amount?: number | string;
  desc?: string;
  descColor: string;
  isCounter?: boolean;
  date?: Date;
}> = ({ title, amount, desc, descColor, isCounter, date }) => {
  const { collectionDerug, setCollectionDerug, setRequests } =
    useContext(CollectionContext);

  const refetchData = useCallback(async () => {
    if (collectionDerug) {
      setCollectionDerug(await getCollectionDerugData(collectionDerug.address));
      setRequests(await getAllDerugRequest(collectionDerug?.address));
    }
  }, [collectionDerug]);

  return (
    <div className="flex items-start p-4 md:p-5 flex-col items-start gap-1 md:gap-2 flex-1 border-8 border-gray-700 bg-gray-800 shadow-md w-full">
      <span
        className="text-gray-400 text-sm md:text-base font-mono font-medium"
      >
        {title}
      </span>
      {!isCounter ? (
        <span
          className="flex text-sm rounded-lg text-white text-2xl md:text-lg font-medium"
        >
          {amount} <span className="flex w-full">{desc}</span>
        </span>
      ) : (
        <div
          className="flex items-center justify-center"
        >
          <Countdown
            onComplete={refetchData}
            className="text-2xl md:text-lg text-red-300 p-2"
            date={date}
          />
        </div>
      )}
    </div>
  );
};

export default HeadingItem;
