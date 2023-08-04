import { authorizeTwitter } from "@/api/twitter.api";
import { DerugForm } from "@/interface/derug.interface";
import { getTrimmedPublicKey } from "@/solana/helpers";
import { userStore } from "@/stores/userStore";
import { Box, TextInput } from "@primer/react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import Slider from "rc-slider";
import React, { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTwitter } from "react-icons/fa";

const DerugBasicInfo = () => {
  const {
    register,
    clearErrors,
    formState: { errors },
  } = useFormContext<DerugForm>();
  const { userData, setUserData } = userStore();
  const wallet = useAnchorWallet();

  const [sellerFee, setSellerFee] = useState<number>(0);

  const router = useRouter();

  const linkTwitter = async () => {
    try {
      if (wallet)
        await authorizeTwitter(
          router.query["symbol"] as string,
          wallet.publicKey!.toString()
        );
    } catch (error) {
      console.log(error);

      toast.error("Failed to link twitter account");
    }
  };

  const handleSellerFeeChange = (points: number) => {
    setSellerFee(points);
  };

  return (
    <Box className="flex flex-col gap-5 w-full">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex w-full flex-col font-mono gap-2 text-white justify-center">
          <label htmlFor="wallet">Wallet</label>
          <div className="flex gap-5">
            <input id="wallet" className="flex w-full px-[14px] py-[10px] w-full items-center self-stretch border border-gray-500 bg-[#1D2939] shadow-xs bg-transparent text-gray-400 text-sm font-mono text-normal" type="text" value={wallet?.publicKey && wallet.publicKey.toString()} />
            {!userData?.twitterHandle ? (
              <div className="flex w-fit whitespace-nowrap gap-2 lex font-mono text-white items-center justify-end">
                <FaTwitter style={{ color: "rgb(29 161 242)" }} />
                <button
                  onClick={linkTwitter}
                  type="button"
                  className="flex w-fit text-white font-mono items-center gap-4 "
                >
                  Link twitter
                </button>
              </div>
            ) : (
              <div className="flex flex-row gap-5 items-center">
                <p className="text-main-blue text-lg font-bold">
                  {userData.twitterHandle}
                </p>
                <img className="rounded-[50px] w-10" src={userData.image} alt="" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col font-mono text-white gap-3">
        <div className="flex w-full flex-col font-mono gap-2 text-white justify-center">
          <label htmlFor="name">New collection name</label>
          <input
            id="name"
            className="flex w-full px-[14px] py-[10px] w-full items-center self-stretch border border-gray-500 bg-[#1D2939] shadow-xs bg-transparent text-gray-400 text-sm font-mono text-normal"
            type="text"
            onChange={(e) => {
              e.target.value.length > 0 &&
                e.target.value.length < 32 &&
                clearErrors("name");
            }}

          />
        </div>
        {/* <TextInput
          {...register("name", {
            required: "Name cannot be empty",
            maxLength: {
              message: "Max name length is 32 characters",
              value: 32,
            },
          })}
          onChange={(e) => {
            e.target.value.length > 0 &&
              e.target.value.length < 32 &&
              clearErrors("name");
          }}
          placeholder="new collection name"
          className="text-gray-400 "
          sx={{
            width: "100%",
          }}
        /> */}
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        <div className="flex w-full flex-col font-mono gap-2 text-white justify-center">
          <label htmlFor="symbol">New collection symbol</label>
          <input
            id="symbol"
            {...register("symbol", {
              required: "Symbol cannot be empty",
              maxLength: {
                value: 10,
                message: "Max symbol length is 10 characters",
              },
            })}
            className="flex w-full px-[14px] py-[10px] w-full items-center self-stretch border border-gray-500 bg-[#1D2939] shadow-xs bg-transparent text-gray-400 text-sm font-mono text-normal"
            onChange={(e) =>
              e.target.value.length > 0 &&
              e.target.value.length < 10 &&
              clearErrors("symbol")
            }
          />
        </div>
        {errors.symbol && (
          <p className="text-red-500 ">{errors.symbol.message}</p>
        )}
      </div>
      <div className="flex w-full items-center gap-8 font-mono gap-2 text-white">
        <div className="flex flex-col w-full">
          <label htmlFor="fee">Royalties</label>
          <div className="flex items-center gap-8">
            <input
              id="fee"
              className="flex px-[14px] py-[10px] items-center self-stretch border border-gray-500 bg-[#1D2939] shadow-xs bg-transparent text-gray-400 text-sm font-mono text-normal"
              {...register("fee")}
              placeholder="Fee"
              value={sellerFee}
              onChange={(e) => handleSellerFeeChange(Number(e.target.value))}
            />
            <div className="flex flex-col w-full items-center justify-center">
              <Slider
                value={Number(sellerFee)}
                className="f"
                onChange={(e) => {
                  typeof e === "number" && handleSellerFeeChange(e);
                  +e > 0 && +e <= 100 && clearErrors("fee");
                }}
              />
              {errors.fee && <p className="text-red-500">{errors.fee.message}</p>}
            </div>
          </div>
        </div>

      </div>
    </Box>
  );
};

export default DerugBasicInfo;
