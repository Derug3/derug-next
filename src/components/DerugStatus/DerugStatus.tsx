import React, { useContext } from "react";
import { CollectionContext } from "../../stores/collectionContext";

const DerugStatus = () => {
  const { collectionDerug } = useContext(CollectionContext);
  return (
    <div className="flex flex-col w-full px-5 py-2">
      <div className="flex w-full">
        <p className="text-white font-bold font-mono text-lg">STATUS:</p>
        <p className="text-main-blue font-bold border-b-[2px] border-main-blue">
          {collectionDerug?.status}
        </p>
      </div>
    </div>
  );
};

export default DerugStatus;
