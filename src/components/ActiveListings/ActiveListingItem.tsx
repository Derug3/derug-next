import { FC, useEffect, useMemo, useState } from "react";
import {
  ICollectionData,
  ICollectionDerugData,
  IRequest,
} from "../../interface/collections.interface";

import {
  COLLECTION,
  FADE_DOWN_ANIMATION_VARIANTS,
} from "../../utilities/constants";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import { getSingleDerugRequest } from "../../solana/methods/derug-request";
import { IUserData } from "../../interface/user.interface";
import { getUserTwitterData } from "../../api/twitter.api";
import { getTrimmedPublicKey } from "../../solana/helpers";
import { DerugStatus } from "../../enums/collections.enums";
import Countdown from "react-countdown";
import { useRouter } from "next/router";

export const ActiveListingItem: FC<{
  derugData: ICollectionDerugData;
  collectionData: ICollectionData;
}> = ({ collectionData, derugData }) => {
  const [winningRequest, setWinningRequest] = useState<IRequest>();
  const [twitterUserData, setTwtiterUserData] = useState<IUserData>();

  useEffect(() => {
    if (derugData.winningRequest) void getWinningRequestData();
  }, []);

  const getWinningRequestData = async () => {
    try {
      const request = await getSingleDerugRequest(derugData.winningRequest!);
      setWinningRequest(request);
      const userTwitterData = await getUserTwitterData(
        request.derugger.toString()
      );
      setTwtiterUserData(userTwitterData);
    } catch (error) { }
  };

  const getStatus = useMemo(() => {
    return (status: DerugStatus) => {
      switch (status) {
        case DerugStatus.Completed:
          return "Completed";
        case DerugStatus.Initialized:
          return "Initialized";
        case DerugStatus.Reminting:
          return "Reminting";
        case DerugStatus.Succeded:
          return "Succeded";
        case DerugStatus.UploadingMetadata:
          return "Uploading Metadata";
        case DerugStatus.Voting:
          return "Voting";
      }
    };
  }, [derugData]);

  const getStatusColor = useMemo(() => {
    switch (derugData.status) {
      case DerugStatus.Completed:
      case DerugStatus.Reminting:
      case DerugStatus.Succeded:
      case DerugStatus.UploadingMetadata:
        return "green-color";
      default:
        return "main-blue";
    }
  }, [derugData]);

  const { push: navigate } = useRouter();
  return (
    <div
      onClick={() => navigate(`${COLLECTION}/${collectionData.symbol}`)}
      className="flex flex-col cursor-pointer overflow-hidden lg:flex-row p-4 md:p-5 items-start gap-8 flex-1 border-8 border-gray-700 bg-gray-800 shadow-md"
      style={{ background: 'rgb(14 26 43)' }}
    >
      <div className="flex justify-start gap-12 items-center relative flex-col lg:flex-row">
        <img
          src={collectionData.image}
          alt="collectionImage"
          className={`w-[20em] h-[20em]`}
        />
        <div className="flex flex-col items-start gap-8 w-full lg:w-[40em] rounded-xl cursor-pointer">
          <div className="w-full flex justify-between">
            <p className="text-2xl font-mono font-white" style={{ fontWeight: 400, lineHeight: '44px' }}>
              {collectionData.name}
            </p>
            <div className="flex items-center gap-2">
              {collectionData.discord && (
                <FaDiscord
                  style={{
                    color: "rgb(88 101 242)",
                    cursor: "pointer",
                    fontSize: "2em",
                  }}
                />
              )}
              {collectionData.twitter && (
                <FaTwitter
                  style={{
                    color: "rgb(29 161 242)",
                    cursor: "pointer",
                    fontSize: "2em",
                  }}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col w-full justify-start items-start gap-2 py-1">
            <p className="text-lg font-extralight flex w-full justify-between relateve">
              Status{" "}
              <span className={`text-${getStatusColor}`}>{getStatus(derugData.status)}</span>
            </p>
            <p className="text-lg font-extralight flex w-full justify-between">
              Time left:{" "}
              <Countdown
                className="text-red-400"
                date={derugData.periodEnd}
              />
            </p>
            <p className="text-lg font-extralight flex w-full justify-between">
              Total supply{" "}
              <span className="text-white">{derugData.totalSupply}</span>
            </p>
          </div>
          {winningRequest && (
            <div className="flex justify-between w-full bg-emerald-500 py-3 px-2">
              <p className="text-lg font-extralight flex w-full justify-between">
                New Name:{" "}
                <span className="text-xl font-mono font-white">{winningRequest.newName}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveListingItem;
