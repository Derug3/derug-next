import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import solanaFm from "../../assets/solanaFm.jpeg";
import { FC, useContext, useRef, useState } from "react";
import Balancer from "react-wrap-balancer";
import { DerugStatus } from "../../enums/collections.enums";
import { IRequest } from "../../interface/collections.interface";
import {
  castDerugRequestVote,
  getSingleDerugRequest,
} from "../../solana/methods/derug-request";
import { CollectionContext } from "../../stores/collectionContext";
import { getAllNftsFromCollection } from "../../utilities/nft-fetching";
import { toast } from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { getTrimmedPublicKey } from "../../solana/helpers";
import DerugRequestDetails from "./DerugRequestDetails";
export const DerugRequestItem: FC<{
  derugRequest: IRequest;
  index: number;
}> = ({ derugRequest, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [loading, toggleLoading] = useState(false);
  const { collectionDerug, chainCollectionData, setRequests, derugRequests } =
    useContext(CollectionContext);

  const [isHovered, toggleIsHovered] = useState(false);

  const wallet = useWallet();

  const showVoteButton = () => {
    return (
      (collectionDerug?.status === DerugStatus.Initialized ||
        collectionDerug?.status === DerugStatus.Voting) &&
      !collectionDerug.addedRequests.find((ar) => ar.winning)
    );
  };

  function showClaimButton() {
    return collectionDerug?.status === DerugStatus.Completed;
  }

  function showRemintButton() {
    return collectionDerug?.status === DerugStatus.Reminting;
  }

  const castVote = async (e: any) => {
    if (wallet && collectionDerug && chainCollectionData) {
      try {
        e.stopPropagation();
        toggleLoading(true);
        const derugNfts = await getAllNftsFromCollection(
          wallet,
          collectionDerug,
          chainCollectionData
        );
        if (derugNfts.length === 0) {
          toast.error("No NFTs from collection!");
          return;
        }

        await castDerugRequestVote(
          derugRequest,
          wallet!,
          collectionDerug,
          derugNfts
        );

        const updatedRequest = await getSingleDerugRequest(
          derugRequest.address
        );
        const addedRequests = [...(derugRequests ?? [])];
        const derugIndex = addedRequests.findIndex(
          (dr) => dr.address.toString() === derugRequest.address.toString()
        );
        addedRequests[derugIndex] = { ...updatedRequest };
        setRequests(addedRequests);
        setIsOpen(false);
      } catch (error: any) {
        toast.error("Failed to vote:", error);
      } finally {
        toggleLoading(false);
      }
    }
  };

  return (
    <div
      className="flex flex-col w-full 
      items-start py-4 gap-5 border-[1px] border-main-blue 
      px-8 cursor-pointer hover:shadow-lg hover:shadow-main-blue"
      onClick={() => setIsOpen(true)}
    >
      {isOpen && (
        <DerugRequestDetails
          castVote={castVote}
          derugRequest={derugRequest}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}

      <div className="flex flex-row w-full">
        <div className="flex gap-3 items-center justify-start w-1/2">
          <div className="flex flex-col items-start gap-4">
            <div className="text-md text-white font-mono truncate flex items-center gap-4">
              <span style={{ fontSize: "1em", opacity: 0.7 }}>
                {getTrimmedPublicKey(derugRequest.derugger.toString())}
              </span>
              <img
                src={solanaFm.src}
                alt=""
                className="rounded-[50px] w-5 cursor-pointer "
              />
            </div>
            <div>
              {derugRequest.userData && (
                <div className="flex gap-5 items-center cursor-pointer hover:text-red-200">
                  <p className="text-lg">
                    Derugger : {derugRequest.userData.twitterHandle}
                  </p>
                  <img
                    src={derugRequest.userData.image}
                    alt=""
                    className="rounded-[50px] w-6"
                  />
                </div>
              )}
            </div>
            {/* <div className="flex gap-4 items-center">
              <p className="text-lg">Utilities : </p>
              {derugRequest.utility &&
                derugRequest.utility
                  .filter((u) => u.title !== "")
                  .map((u, i) => (
                    <Tooltip
                      sx={{
                        "::after": {
                          fontSize: "1em",
                          backgroundColor: "#282C34",
                        },
                      }}
                      direction="n"
                      aria-label={u.description}
                      noDelay={true}
                    >
                      <div
                        className="text-sm font-mono cursor-hderugRequestp"
                        style={{
                          borderRightWidth:
                            i !== derugRequest.utility.length - 1
                              ? "1px"
                              : "0px",
                          paddingRight:
                            i !== derugRequest.utility.length - 1
                              ? "1em"
                              : "0px",
                          color: "rgb(9, 194, 246)",
                        }}
                      >
                        {" "}
                        {u.title}
                      </div>
                    </Tooltip>
                  ))}
            </div> */}
          </div>
        </div>
        <div className="flex flex-col items-end w-full">
          <div className="flex items-center justify-end w-full">
            {showClaimButton() && (
              <button style={{ color: "rgba(9,194,246)" }}>
                Claim victory
              </button>
            )}
            {showRemintButton() && (
              <button style={{ color: "rgba(9,194,246)" }}>
                Remint
              </button>
            )}

            <div className="relative">
              {collectionDerug && (
                <div
                  className={`absolute w-[1px] h-[100%] bg-red-500`}
                  style={{
                    left: `${10}%`,
                  }}
                />
              )}
              {/* <ProgressBar
                progress={
                  (derugRequest.voteCount /
                    (collectionDerug?.totalSupply ?? 1)) *
                  100
                }
                bg="#2DD4BF"
                sx={{
                  width: "380px",
                  height: "12px",
                  color: "rgb(45, 212, 191)",
                  "@media (max-width: 768px)": {
                    width: "200px",
                  },
                }}
              /> */}
            </div>
            <Balancer className="text-lg cursor-pointer text-white font-mono px-5">
              <span
                style={{
                  padding: "10px",
                  fontSize: "0.75em",
                }}
              >
                {dayjs
                  .unix(derugRequest.createdAt)
                  .toDate()
                  .toString()
                  .slice(0, 10)}
              </span>
            </Balancer>
            <span
              className="text-white font-mono"
              style={{
                fontSize: "0.75em",
              }}
            >
              {derugRequest.voteCount} / {collectionDerug?.totalSupply}
            </span>
          </div>
          {showVoteButton() && (
            <button
              onClick={castVote}
              className="border-[1px] border-main-blue text-lg mt-5 px-5 py-1 text-main-blue"
            >
              {loading ? (
                <Oval
                  color="rgb(9, 194, 246)"
                  height={"1.5em"}
                  secondaryColor={"transparent"}
                />
              ) : (
                <p>Vote</p>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default DerugRequestItem;
