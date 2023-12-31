import { useWallet } from "@solana/wallet-adapter-react";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IRequest } from "../../interface/collections.interface";
import { Creator, DerugForm } from "../../interface/derug.interface";
import { getCollectionDerugData } from "../../solana/methods/derug";
import {
  createOrUpdateDerugRequest,
  getSingleDerugRequest,
} from "../../solana/methods/derug-request";
import { CollectionContext } from "../../stores/collectionContext";
import "rc-slider/assets/index.css";
import { PublicKey } from "@solana/web3.js";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { validateCreators } from "../../validators/derug-request.validators";
import { getUserTwitterData } from "../../api/twitter.api";
import { userStore } from "../../stores/userStore";
import { ProgressBar } from "@primer/react";
import DerugBasicInfo from "./DerugBasicInfo";
import Creators from "./Creators";
import PublicMintConfig from "./PublicMintConfig";
import { getDefaultValues, getSolToken } from "@/common/helpers";
import toast from "react-hot-toast";

enum CreateDerugRequestStep {
  BasicInfo,
  Creators,
  MintConfig,
}

export const AddDerugRequst: FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  derugRequest: IRequest | undefined;
  setDerugRequest: (derugRequest: IRequest | undefined) => void;
}> = ({ setIsOpen }) => {
  const wallet = useWallet();

  const { userData, setUserData } = userStore();

  const {
    chainCollectionData,
    activeListings,
    setCollectionDerug,
    setRequests,
    collectionStats,
    derugRequest,
  } = useContext(CollectionContext);

  const [activeStep, setActiveStep] = useState(
    CreateDerugRequestStep.BasicInfo
  );

  const methods = useForm<DerugForm>({
    defaultValues: {
      creators: [],
      duration: 0,
      fee: 0,
      selectedMint: getSolToken(),
      name: "",
      price: 0,
      privateMintEnd: 0,
      symbol: "",
    },
  });

  const { creators } = methods.getValues();

  const handleSubmit = (data?: any) => {
    setActiveStep(activeStep + 1);
  };

  const submitRequest = async (data: DerugForm) => {
    try {
      if (wallet && chainCollectionData && collectionStats && data) {
        const requestAddress = await createOrUpdateDerugRequest(
          wallet,
          chainCollectionData,
          +data.fee * 10,
          data.symbol,
          data.name,
          data.creators.map((c) => {
            return {
              address: new PublicKey(c.address),
              share: c.share,
            };
          }),
          +data.price * Math.pow(10, data.selectedMint!.decimals),
          Number(data.privateMintEnd) * 3600,
          data.selectedMint.address,
          activeListings ? activeListings[0] : undefined
        );

        const request = await getSingleDerugRequest(requestAddress);
        console.log(request, "REQUEST");

        setRequests(request);
      }
      if (chainCollectionData) {
        const derugData = await getCollectionDerugData(
          chainCollectionData?.derugDataAddress
        );
        setCollectionDerug(derugData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (creators[creators?.length - 1]?.address)
      validateCreators(creators, methods.setError, methods.clearErrors);
  }, [creators]);

  useEffect(() => {
    if (wallet && wallet.publicKey) {
      if (!userData) void storeUserData();
      const newElement = {
        address: wallet.publicKey!.toString(),
        share: 100,
      };
      methods.setValue("creators", [newElement]);
    }
  }, [wallet]);

  const storeUserData = async () => {
    try {
      setUserData(await getUserTwitterData(wallet.publicKey?.toString()!));
    } catch (error) {}
  };
  const renderCreateDerugRequestContent = useMemo(() => {
    switch (activeStep) {
      case CreateDerugRequestStep.BasicInfo: {
        return <DerugBasicInfo />;
      }
      case CreateDerugRequestStep.Creators: {
        return <Creators />;
      }
      case CreateDerugRequestStep.MintConfig: {
        return <PublicMintConfig />;
      }
    }
  }, [activeStep, methods]);

  const renderStepName = useMemo(() => {
    switch (activeStep) {
      case CreateDerugRequestStep.BasicInfo: {
        return "Basic Info";
      }
      case CreateDerugRequestStep.Creators: {
        return "Creators";
      }
      case CreateDerugRequestStep.MintConfig: {
        return "Mint Config";
      }
    }
  }, [activeStep]);

  return (
    <div className="flex w-full flex-col">
      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            activeStep < CreateDerugRequestStep.MintConfig
              ? handleSubmit()
              : submitRequest(methods.getValues());
          }}
        >
          <div className="flex flex-col py-4 gap-3">
            <ProgressBar
              width={"100%"}
              progress={((activeStep + 1) / 3) * 100}
              bg="rgb(9, 194, 246)"
              sx={{
                width: "full",
                height: "8px",
                background: "#F9FAFB",
                color: "rgb(45, 212, 191)",
                "@media (max-width: 768px)": {
                  width: "200px",
                },
              }}
            />
            <p className="font-mono text-xs">
              {renderStepName} {activeStep + 1} / 3
            </p>
          </div>
          {renderCreateDerugRequestContent}
          <div className="flex w-full justify-between items-center mt-9">
            <button
              type="button"
              className="bg-transparent border-[1px] border-main-blue px-4 text-white py-1 font-mono"
              onClick={
                activeStep === CreateDerugRequestStep.BasicInfo
                  ? () => setIsOpen(false)
                  : () => setActiveStep(activeStep - 1)
              }
            >
              {activeStep === CreateDerugRequestStep.BasicInfo
                ? "Cancel request"
                : "Go back"}
            </button>
            <button
              disabled={false}
              className="bg-[#36BFFA] border border-[#36BFFA] px-[10%] shadow-xs text-lg text-black font-bold font-mono"
            >
              {activeStep === CreateDerugRequestStep.MintConfig
                ? "Submit requests"
                : "Next Step"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
