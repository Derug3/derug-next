import dayjs from "dayjs";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { FaTwitter } from "react-icons/fa";
import { getUserTwitterData } from "../../api/twitter.api";
import { IRequest } from "../../interface/collections.interface";
import { IUserData } from "../../interface/user.interface";
import { getTrimmedPublicKey } from "../../solana/helpers";
import solanaLogo from "../../assets/solanaLogo.jpeg";
import solanaFm from "../../assets/solanaFm.jpeg";

const DerugRequestDetails: FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  castVote: (e: any) => Promise<void>;
  derugRequest: IRequest;
}> = ({ isOpen, setIsOpen, derugRequest, castVote }) => {
  const returnFocusRef = useRef(null);
  const [creatorsData, setCreatorsData] = useState<IUserData[]>();

  useEffect(() => {
    void getCreatorsData();
  }, []);

  const getCreatorsData = async () => {
    const storedCreators: IUserData[] = [];
    for (const creator of derugRequest.creators) {
      try {
        storedCreators.push(
          await getUserTwitterData(creator.address.toString())
        );
      } catch (error) {}
    }
    setCreatorsData(storedCreators);
  };

  const renderCreators = useMemo(() => {
    return derugRequest.creators?.map((c, index) => {
      const relatedCreator = creatorsData?.find(
        (cr) => c.address.toString() === cr.pubkey
      );
      return (
        <div
          key={index}
          className="w-full bg-black border-b-[1px] border-green-color
         flex justify-between items-center p-3"
        >
          <div className="flex flex-col items-start gap-2">
            {relatedCreator && (
              <div className="flex gap-5 items-center">
                <img
                  src={relatedCreator.image}
                  className="w-8 rounded-[50px]"
                  alt=""
                />
                <p className="text-md">{relatedCreator.twitterHandle}</p>
              </div>
            )}
            <div className="flex gap-5">
              <p>{getTrimmedPublicKey(c.address.toString())}</p>
              <img src={solanaFm.src} className="w-5 rounded-[50px]" alt="" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-lg"> Share : {c.share} %</p>
          </div>
        </div>
      );
    });
  }, [creatorsData]);

  return (
    <div
      style={{
        width: "900px",
        height: "100%",
        overflow: "scroll",
      }}
      aria-labelledby="header-id"
    >
      <div className="flex w-full flex-col">
        <div
          className="flex justify-between items-center bg-gray-800"
          id="header-id"
        >
          Derug Request Details
        </div>
        <div className="w-full flex flex-col gap-10 p-5">
          {derugRequest.userData && (
            <div className="flex items-center  w-full  justify-between">
              <div className="flex gap-5 items-center">
                <img
                  src={derugRequest.userData.image}
                  alt=""
                  className="rounded-[50px] w-20"
                />
                <div className="flex flex-col items-start gap-3">
                  <p className="text-xl">Derugger</p>
                  <p className="text-xl text-main-blue">
                    {derugRequest.userData.twitterHandle}
                  </p>
                </div>
              </div>
              <FaTwitter
                style={{
                  fontSize: "2em",
                  cursor: "pointer",
                  color: "rgb(9, 194, 246)",
                }}
              />
            </div>
          )}
          <div className="flex flex-col items-start gap-5">
            <p className="text-xl font-bold">New Collection Details</p>
            <div className="flex items-center gap-10">
              <div className="flex flex-col items-start gap-4 border-main-blue px-3 py-1">
                <p className="border-b-[2px] border-green-color">New Name</p>
                <p className="text-main-blue text-lg">{derugRequest.newName}</p>
              </div>
              <div className="flex flex-col items-start gap-4  border-main-blue px-6 py-1">
                <p className="border-b-[2px] border-green-color">New Symbol</p>
                <p className="text-main-blue text-lg">
                  {derugRequest.newSymbol}
                </p>
              </div>
            </div>
          </div>
          {derugRequest.publicMint && (
            <div className="flex flex-col items-start gap-4">
              <p className="text-xl font-bold">Public Mint details</p>

              <div className="grid grid-cols-4 w-full gap-4  ">
                {derugRequest.privateMintDuration && (
                  <div className="bg-black rounded-md p-3 ">
                    <div className="flex flex-col items-start gap-4">
                      <p className="border-b-[2px] border-green-color">
                        Private Mint Duration
                      </p>
                      <p className="text-xl">
                        {derugRequest.privateMintDuration / 3600} hours
                      </p>
                    </div>
                  </div>
                )}
                {derugRequest.privateMintDuration && (
                  <div className="bg-black w-full p-3 rounded-md ">
                    <div className="flex flex-col items-start gap-4">
                      <p className="border-b-[2px] border-green-color">
                        Royalties
                      </p>
                      <p className="text-xl">
                        {derugRequest.sellerFeeBps / 100} %
                      </p>
                    </div>
                  </div>
                )}

                <div className=" bg-black flex flex-col w-full p-3 gap-4 items-start rounded-md ">
                  <p className="border-b-[2px] border-green-color">
                    Selected currency
                  </p>
                  <div className="flex flex-row gap-2 items-center">
                    <img
                      src={derugRequest.splToken?.image ?? solanaLogo.src}
                      className="w-5 h-5"
                      alt=""
                    />
                    <p className="text-xl">
                      {derugRequest.splToken?.symbol ?? "SOL"}
                    </p>
                  </div>
                </div>
                {derugRequest.mintPrice && (
                  <div className="flex bg-black flex-col w-full p-3 gap-4 items-start rounded-md ">
                    <p className="border-b-[2px] border-green-color">
                      Public Mint price
                    </p>
                    <p className="text-xl">
                      {derugRequest.mintPrice /
                        Math.pow(10, derugRequest.splToken?.decimals ?? 0)}{" "}
                      {derugRequest.splToken?.symbol}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-5 items-start w-full">
            <p className="text-xl font-bold ">New Creators</p>
            <div className="flex flex-col gap-1 w-full">{renderCreators}</div>
          </div>

          <div className="mt-5 w-full flex justify-between items-center">
            <button
              className="text-white border-[1px] font-bold p-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>

            <button
              onClick={castVote}
              className="rounded-md border-[1px]
            hover:bg-main-blue hover:text-black
             border-main-blue bg-transparent py-2 px-4 text-main-blue"
            >
              Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DerugRequestDetails;
