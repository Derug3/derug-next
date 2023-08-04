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
    <Box className="flex flex-col gap-10">
      <div className="flex gap-5 items-center  w-full justify-between ">
        <span className="font-mono text-white">
          {wallet?.publicKey && wallet.publicKey.toString()}
        </span>
        {!userData?.twitterHandle ? (
          <button
            onClick={linkTwitter}
            type="button"
            className="flex text-white border-[1px] border-main-blue p-1 px-5 font-mono items-center gap-4 rounded-lg"
          >
            Link twitter
            <FaTwitter style={{ color: "rgb(29 161 242)" }} />
          </button>
        ) : (
          <div className="flex flex-row gap-5 items-center">
            <p className="text-main-blue text-lg font-bold">
              {userData.twitterHandle}
            </p>
            <img className="rounded-[50px] w-10" src={userData.image} alt="" />
          </div>
        )}
      </div>
      <div className="flex grid grid-cols-2">
        <TextInput
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
        />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        <input
          {...register("symbol", {
            required: "Symbol cannot be empty",
            maxLength: {
              value: 10,
              message: "Max symbol length is 10 characters",
            },
          })}
          placeholder="new collection symbol"
          onChange={(e) =>
            e.target.value.length > 0 &&
            e.target.value.length < 10 &&
            clearErrors("symbol")
          }
        />
        {errors.symbol && (
          <p className="text-red-500 ">{errors.symbol.message}</p>
        )}
      </div>
      <div className="flex w-full items-center gap-5 ">
        <div className="flex flex-col ">
          <p>Royalties %</p>
          <input
            className="border-white text-white "
            {...register("fee")}
            placeholder="Fee"
            value={sellerFee}
            onChange={(e) => handleSellerFeeChange(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col w-full items-start">
          <Slider
            value={Number(sellerFee)}
            onChange={(e) => {
              typeof e === "number" && handleSellerFeeChange(e);
              +e > 0 && +e <= 100 && clearErrors("fee");
            }}
          />
          {errors.fee && <p className="text-red-500">{errors.fee.message}</p>}
        </div>
      </div>
    </Box>
  );
};

export default DerugBasicInfo;