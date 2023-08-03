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
      className="rounded-lg	flex p-2 cursor-pointer overflow-hidden items-center justify-between rounded-lg shadow-xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-text"
    // style={{ background: '#1e521f' }}
    >
      <div className="flex justify-start w-full gap-5 items-center relative">
        <img
          src={collectionData.image}
          alt="collectionImage"
          className={`w-[30em] h-[30em]`}
        />
        <div className="w-full flex flex-col items-center justify-between	absolute bottom-0 opacity-[0.85]">
          <div className="w-full flex justify-between px-10" style={{ background: '#475467' }}>
            <p className="text-xl font-white" style={{ fontWeight: 400, lineHeight: '44px' }}>
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
          <div className="flex flex-col w-full justify-start items-start gap-2 px-1.5 py-1 px-10" style={{ background: 'rgb(14 26 43)' }}>
            <p className="text-lg font-extralight flex w-full justify-between relateve">
              Status{" "}
              <span className={`text-${getStatusColor}`}>{getStatus(derugData.status)}</span>
            </p>
            <p className="text-lg font-extralight flex w-full justify-between">
              Time left:{" "}
              <Countdown
                className="text-gray-200  text-red-400"
                date={derugData.periodEnd}
              />
            </p>
            <p className="text-lg font-extralight flex w-full justify-between">
              Total supply{" "}
              <span className="text-white">{derugData.totalSupply}</span>
            </p>
          </div>
          {winningRequest && (
            <div className="flex justify-between w-full px-10" style={{ background: '#475467' }}>
              <p className="text-lg font-extralight flex w-full justify-between">
                New Name:{" "}
                <span className="text-white">{winningRequest.newName}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveListingItem;
