import { motion } from "framer-motion";
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
import { Box, RelativeTime, Text } from "@primer/react";
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
    } catch (error) {}
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
    <motion.div
      onClick={() => navigate(`${COLLECTION}/${collectionData.symbol}`)}
      variants={FADE_DOWN_ANIMATION_VARIANTS}
      className={`p-6 border border-gray-500 rounded-lg dark:border-gray dark:hover:bg-gray-900`}
      style={{ background: "#0d1117" }}
    >
      <Box className="flex items-start gap-5 w-full">
        <img className="w-56 rounded-sm" src={collectionData.image} alt="" />
        <Box className="flex flex-col gap-2 py-2 w-full bg-200">
          <Box className="w-full flex justify-between border-b-[1px] border-gray-200">
            <Text className="text-xl text-gray-400 uppercase font-mono">
              {collectionData.name}
            </Text>
            <Box className="flex items-center gap-2">
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
            </Box>
          </Box>
          <Box className="w-full flex justify-between">
            <Text className="text-gray-200 font-bold font-mono">Status:</Text>
            <Text className={`text-${getStatusColor} font-mono`}>
              {getStatus(derugData.status)}
            </Text>
          </Box>
          <Box className="w-full flex justify-between">
            <Text className="text-gray-200 font-bold font-mono">
              Time left:
            </Text>
            <Countdown
              className="text-gray-200 font-mono text-red-400"
              date={derugData.periodEnd}
            />
          </Box>
          <Box className="w-full flex justify-between font-mono">
            <Text className="text-gray-200 font-bold font-mono">
              Total supply:
            </Text>
            <Text className="text-gray-200 font-mono">
              {derugData.totalSupply}
            </Text>
          </Box>
          {winningRequest && (
            <Box className="flex justify-between w-full">
              <Text className="text-gray-200 font-bold font-mono">
                New Name:
              </Text>
              <Text className="text-gray-200 font-mono">
                {winningRequest.newName}
              </Text>
            </Box>
          )}
          {(twitterUserData || winningRequest) && (
            <Box className="flex justify-between">
              <Text className="text-gray-200 font-bold font-mono">Won by:</Text>
              {twitterUserData && (
                <Box className="flex gap-2">
                  <img
                    className="w-16 rounded-[50px]"
                    src={twitterUserData.image}
                    alt=""
                  />
                  <Text className="text-gray-200 font-mono">
                    {twitterUserData.twitterHandle}
                  </Text>
                </Box>
              )}
              {!twitterUserData && winningRequest && (
                <Text className="text-gray-200 font-mono">
                  {getTrimmedPublicKey(winningRequest.derugger)}
                </Text>
              )}
            </Box>
          )}
          {!twitterUserData && !winningRequest && (
            <Box className="w-full flex justify-between">
              <Text className="text-gray-200 font-bold font-mono">
                Requests count:
              </Text>
              <Text className="text-gray-200 font-mono">
                {derugData.addedRequests.length}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default ActiveListingItem;
