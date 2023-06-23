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
    <div className="flex flex-row items-center justify-between w-full gap-3">
      <span
        className="text-sm border-1 p-2 w-1/2 rounded-lg text-gray-400"
        style={{
          fontFamily: "monospace",
          fontWeight: 200,
          border: "1px solid rgba(9,194,246,.15)",
        }}
      >
        {title}
      </span>
      {!isCounter ? (
        <span
          className="text-sm p-2 w-1/2 rounded-lg text-white"
          style={{
            fontFamily: "monospace",
            border: "1px solid rgba(9,194,246,.75)",
          }}
        >
          {amount} <span>{desc}</span>
        </span>
      ) : (
        <div
          className="flex w-1/2 items-center justify-center"
          style={{
            border: "1px solid rgb(154 52 18)",
          }}
        >
          <Countdown
            onComplete={refetchData}
            className="font-mono text-sm
   text-orange-800 p-2"
            date={date}
          />
        </div>
      )}
    </div>
  );
};

export default HeadingItem;
