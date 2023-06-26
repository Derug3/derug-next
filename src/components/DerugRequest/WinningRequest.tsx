import { useWallet } from "@solana/wallet-adapter-react";
import React, { FC, useContext, useMemo, useState } from "react";
import { IRequest } from "../../interface/collections.interface";
import { claimVictory } from "../../solana/methods/remint";
import { CollectionContext } from "../../stores/collectionContext";
import { toast } from "react-hot-toast";
import { getCollectionDerugData } from "../../solana/methods/derug";
import { DerugStatus } from "../../enums/collections.enums";
import { getTrimmedPublicKey } from "../../solana/helpers";
import dayjs from "dayjs";
import {
  getDerugCandyMachine,
  initCandyMachine,
  storeCandyMachineItems,
} from "../../solana/methods/public-mint";
import { Oval } from "react-loader-spinner";
const WinningRequest: FC<{ request: IRequest }> = ({ request }) => {
  const {
    collectionDerug,
    setCollectionDerug,
    remintConfig,
    chainCollectionData,
    candyMachine,
    setCandyMachine,
  } = useContext(CollectionContext);

  const [loading, toggleLoading] = useState(false);

  const wallet = useWallet();

  const renderUtilities = useMemo(() => {
    return request.utility.map((u, i) => {
      return (
        // <Tooltip
        //   sx={{
        //     "::after": {
        //       fontSize: "1em",
        //       backgroundColor: "#282C34",
        //       width: "fit-content",
        //     },
        //   }}
        //   aria-label={u.description}
        //   noDelay={true}
        // >
        //   <div
        //     className="text-sm font-mono"
        //     style={{
        //       borderRightWidth:
        //         i !== request.utility.length - 1 ? "1px" : "0px",
        //       paddingRight: i !== request.utility.length - 1 ? "1em" : "0px",
        //       color: "rgb(9, 194, 246)",
        //     }}
        //   >
        //     {" "}
        //     {u.title}
        //   </div>
        // </Tooltip>
        <></>
      );
    });
  }, []);

  const claimDerugVictory = async () => {
    try {
      if (wallet && collectionDerug && request && chainCollectionData) {
        await claimVictory(
          wallet!,
          collectionDerug,
          chainCollectionData,
          request
        );
        const updatedDerug = await getCollectionDerugData(
          collectionDerug.address
        );
        setCollectionDerug(updatedDerug);
      }
    } catch (error: any) {
      console.log(error);

      toast.error(error.message);
    }
  };

  const initPublicMinting = async () => {
    try {
      toggleLoading(true);

      if (collectionDerug && wallet && remintConfig) {
        if (!candyMachine) {
          const candyMachineAddress = await initCandyMachine(
            collectionDerug,
            wallet
          );

          if (candyMachineAddress)
            setCandyMachine(await getDerugCandyMachine(remintConfig, wallet));
        }
        // await storeCandyMachineItems(
        //   request,
        //   remintConfig,
        //   wallet,
        //   collectionDerug
        // );
        setCandyMachine(await getDerugCandyMachine(remintConfig, wallet));
      }
      toast.success("Public minting successfully initialized");
    } catch (error) {
      console.log(error);
      toast.error("Failed to initialize public minting");
    } finally {
      toggleLoading(false);
    }
  };

  return (
    <div className="flex flex-row justify-between items-center w-full relative mt-5 pl-10 pr-4">
      <div
        className="flex flex-col gap-5 w-full"
        style={{
          border:
            "1px solid animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500",
          boxShadow: "0 0 0 1px #B78E1B",
          padding: "2em",
        }}
      >
        <div className="flex flex-row justify-between ">
          <div className="flex items-center gap-1">
            <span className="font-mono flex justify-center text-sm text-yellow-500	">
              Winning request
            </span>
            ☀️
          </div>
        </div>
        <div
          className="flex flex-row gap-3 justify-between w-full items-center"
          style={{
            color: "rgb(45, 212, 191)",
            border: "1px solid rgba(9,194,246,.15)",
            padding: "1em",
          }}
        >
          <span className="font-mono text-neutral-400 flex justify-center text-sm">
            {getTrimmedPublicKey(request.derugger.toString())}
          </span>
          <div className="flex flex-row gap-3">{renderUtilities}</div>
        </div>
        <div className="flex flex-col gap-5 items-center w-full">
          <div className="flex font-mono flex-row items-center justify-between w-full gap-4 ">
            {collectionDerug &&
              collectionDerug.status !== DerugStatus.Reminting &&
              collectionDerug.status !== DerugStatus.UploadingMetadata &&
              wallet.publicKey?.toString() === request.derugger.toString() && (
                <button
                  className="animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 "
                  style={{
                    color: "white",
                    padding: "0.5em",
                    width: "30%",
                  }}
                  onClick={claimDerugVictory}
                >
                  <span className="text-xl lowercase">Claim victory</span>
                </button>
              )}
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-5">
                {/* <ProgressBar
                  progress={
                    (request.voteCount / (collectionDerug?.totalSupply ?? 1)) *
                    100
                  }
                  bg="#2DD4BF"
                  sx={{
                    width: "380px",
                    height: "30px",
                    color: "rgb(45, 212, 191)",
                    "@media (max-width: 768px)": {
                      width: "200px",
                    },
                  }}
                /> */}

                <span
                  className="text-white font-mono flex"
                  color={"rgb(9, 194, 246)"}
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {request.voteCount} / {collectionDerug?.totalSupply}
                </span>
              </div>
              {remintConfig &&
                (dayjs(remintConfig.privateMintEnd).isBefore(dayjs()) ||
                  (remintConfig.mintPrice && !remintConfig.privateMintEnd)) &&
                wallet.publicKey?.toString() === request.derugger.toString() &&
                collectionDerug?.status !== DerugStatus.UploadingMetadata && (
                  <button
                    className="animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 p-1 "
                    style={{
                      color: "white",
                    }}
                    onClick={initPublicMinting}
                  >
                    {!loading ? (
                      <span className="text-xl lowercase min-w-full">
                        Initialize public mint
                      </span>
                    ) : (
                      <Oval color="rgb(9, 194, 246)" height={"1em"} />
                    )}
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinningRequest;
