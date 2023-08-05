import { Creator, DerugForm } from "@/interface/derug.interface";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import React, { useRef, useState } from "react";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import CreatorsArray from "../CollectionLayout/CreatorsArray";

const Creators = ({}) => {
  const returnFocusRef = useRef(null);
  const { formState, getValues, control } = useFormContext<DerugForm>();

  const { creators } = getValues();

  const { fields, insert } = useFieldArray({
    control,
    name: "creators",
  });

  return (
    <div className="flex justify-start flex-col text-white font-mono gap-5">
      <div className="flex justify-between flex-col h-full">
        <CreatorsArray />

        <>
          {" "}
          {formState.errors.creators && (
            <p className="text-red-500 text-xs">
              {formState.errors.creators?.message}
            </p>
          )}
        </>
      </div>
    </div>
  );
};

export default Creators;
