import { Creator, DerugForm } from "@/interface/derug.interface";
import { Box, Button } from "@primer/react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import React, { useRef, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import CreatorsArray from "../CollectionLayout/CreatorsArray";

const Creators = () => {
  const wallet = useAnchorWallet();
  const [creators, setCreator] = useState<Creator[]>([
    {
      address: wallet?.publicKey.toString(),
      share: 100,
    },
  ]);
  const addCreator = () => {
    const newElement = {
      address: "",
      share: 0,
    };
    const oldValue = creators || [];
    setCreator([...oldValue, newElement]);
  };

  const returnFocusRef = useRef(null);

  const methods = useFormContext<DerugForm>();

  return (
    <Box
      className="flex justify-start flex-col text-white font-mono rounded-lg"
      style={{ border: "1px solid rgb(9, 194, 246)" }}
    >
      <span
        className="flex text-white font-mono w-full text-lg px-3"
        style={{
          borderBottom: "1px solid #6e7681",
          backgroundColor: "rgba(9, 194, 246, 0.2)",
        }}
      >
        Creators
      </span>
      <div className="flex justify-between flex-col h-full p-3">
        <CreatorsArray creators={creators} setCreators={setCreator} />
        <Button
          size="large"
          variant="outline"
          sx={{ backgroundColor: "transparent" }}
          ref={returnFocusRef}
          disabled={creators.length >= 4}
          onClick={() => addCreator()}
        >
          Add creator
        </Button>
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
    </Box>
  );
};

export default Creators;
