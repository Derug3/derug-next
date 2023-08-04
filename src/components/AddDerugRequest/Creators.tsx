import { Creator, DerugForm } from "@/interface/derug.interface";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import React, { useRef, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import CreatorsArray from "../CollectionLayout/CreatorsArray";

const Creators = ({
  creators,
  setCreator,
}) => {
  const returnFocusRef = useRef(null);
  const methods = useFormContext<DerugForm>();

  return (
    <div
      className="flex justify-start flex-col text-white font-mono gap-5" >
      <div className="flex justify-between flex-col h-full">
        <CreatorsArray creators={creators} setCreators={setCreator} />
        <div className="flex items-center pt-2 gap-1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="#36BFFA" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <button
            ref={returnFocusRef}
            className="flex w-full text-[#36BFFA] font-mono text-sm"
            disabled={creators.length >= 4}
            onClick={setCreator}
          >
            Add creator
          </button>
        </div>
        <>
          {" "}
          {(methods.formState.errors.creatorsFees ||
            methods.formState.errors.creatorsKey) && (
              <p className="text-red-500 text-xs">
                {
                  (
                    methods.formState.errors.creatorsFees ??
                    methods.formState.errors.creatorsKey
                  )?.message
                }
              </p>
            )}
        </>
      </div>
    </div>
  );
};

export default Creators;
