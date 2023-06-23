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
  const [hover, setHover] = useState(false);
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
      className={`p-6 border border-gray-500 rounded-lg dark:border-gray dark:hover:bg-gray-900`}
      style={{ background: "#0d1117" }}
    >
      <div className="flex items-start gap-5 w-full">
        <img className="w-56 rounded-sm" src={collectionData.image} alt="" />
        <div className="flex flex-col gap-2 py-2 w-full bg-200">
          <div className="w-full flex justify-between border-b-[1px] border-gray-200">
            <span className="text-xl text-gray-400 uppercase font-mono">
              {collectionData.name}
            </span>
            <div className="flex items-center gap-2">
              {collectionData.discord && (
                <FaDiscord
                  style={{
                    color: "rgb(88 101 242)",
                    cursor: "pointer",
                    fontSize: "1em",
                  }}
                />
              )}
              {collectionData.twitter && (
                <FaTwitter
                  style={{
                    color: "rgb(29 161 242)",
                    cursor: "pointer",
                    fontSize: "1em",
                  }}
                />
              )}
            </div>
          </div>
          <div className="w-full flex justify-between">
            <span className="text-gray-200 font-bold font-mono">Status:</span>
            <span className={`text-${getStatusColor} font-mono`}>
              {getStatus(derugData.status)}
            </span>
          </div>
          <div className="w-full flex justify-between">
            <span className="text-gray-200 font-bold font-mono">
              Time left:
            </span>
            <Countdown
              className="text-gray-200 font-mono text-red-400"
              date={derugData.periodEnd}
            />
          </div>
          <div className="w-full flex justify-between font-mono">
            <span className="text-gray-200 font-bold font-mono">
              Total supply:
            </span>
            <span className="text-gray-200 font-mono">
              {derugData.totalSupply}
            </span>
          </div>
          {winningRequest && (
            <div className="flex justify-between w-full">
              <span className="text-gray-200 font-bold font-mono">
                New Name:
              </span>
              <span className="text-gray-200 font-mono">
                {winningRequest.newName}
              </span>
            </div>
          )}
          {(twitterUserData || winningRequest) && (
            <div className="flex justify-between">
              <span className="text-gray-200 font-bold font-mono">Won by:</span>
              {twitterUserData && (
                <div className="flex gap-2">
                  <img
                    className="w-16 rounded-[50px]"
                    src={twitterUserData.image}
                    alt=""
                  />
                  <span className="text-gray-200 font-mono">
                    {twitterUserData.twitterHandle}
                  </span>
                </div>
              )}
              {!twitterUserData && winningRequest && (
                <span className="text-gray-200 font-mono">
                  {getTrimmedPublicKey(winningRequest.derugger)}
                </span>
              )}
            </div>
          )}
          {!twitterUserData && !winningRequest && (
            <div className="w-full flex justify-between">
              <span className="text-gray-200 font-bold font-mono">
                Requests count:
              </span>
              <span className="text-gray-200 font-mono">
                {derugData.addedRequests.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveListingItem;
