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
import { Box, Dialog, Button } from "@primer/react";
import { PublicKey } from "@solana/web3.js";
import { FormProvider, useForm } from "react-hook-form";
import { validateCreators } from "../../validators/derug-request.validators";
import { getUserTwitterData } from "../../api/twitter.api";
import { userStore } from "../../stores/userStore";
import { ProgressBar } from "@primer/react";
import DerugBasicInfo from "./DerugBasicInfo";
import Creators from "./Creators";
import PublicMintConfig from "./PublicMintConfig";

enum CreateDerugRequestStep {
  BasicInfo,
  Creators,
  MintConfig,
}

export const AddDerugRequst: FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  derugRequests: IRequest[] | undefined;
  setDerugRequest: (derugRequest: IRequest[] | undefined) => void;
}> = ({ isOpen, setIsOpen }) => {
  const wallet = useWallet();
  const returnFocusRef = useRef(null);

  const { userData, setUserData } = userStore();

  const [creators, setCreator] = useState<Creator[]>([]);

  const {
    chainCollectionData,
    activeListings,
    setCollectionDerug,
    setRequests,
    collectionStats,
    derugRequests,
  } = useContext(CollectionContext);

  const [activeStep, setActiveStep] = useState(
    CreateDerugRequestStep.BasicInfo
  );

  const methods = useForm<DerugForm>();

  const handleSubmit = (data?: any) => {
    setActiveStep(activeStep + 1);
  };

  const submitRequest = async (data?: any) => {
    try {
      if (wallet && chainCollectionData && collectionStats && data) {
        const requestAddress = await createOrUpdateDerugRequest(
          wallet,
          chainCollectionData,
          +data.sellerFee * 10,
          data.symbol,
          data.name,
          creators.map((c) => {
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
        const addedRequests = [...(derugRequests ?? [])];
        addedRequests.push(await getSingleDerugRequest(requestAddress));
        setRequests(addedRequests);
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
    if (creators[creators.length - 1]?.address)
      validateCreators(creators, methods.setError, methods.clearErrors);
  }, [creators]);

  useEffect(() => {
    if (wallet && wallet.publicKey) {
      if (!userData) void storeUserData();
      const newElement = {
        address: wallet.publicKey!.toString(),
        share: 100,
      };
      setCreator([newElement]);
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
  }, [activeStep]);

  return (
    <div className="flex w-full flex-col">
      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            activeStep < CreateDerugRequestStep.MintConfig
              ? handleSubmit()
              : methods.handleSubmit(submitRequest);
          }}
        >
          <Dialog
            className="bg-gray-800"
            returnFocusRef={returnFocusRef}
            isOpen={isOpen}
            onDismiss={() => setIsOpen(false)}
            sx={{
              width: "50%",
              maxHeight: "100%",
            }}
            aria-labelledby="header-id"
          >
            <Dialog.Header
              id="header-id"
              className="flex justify-between items-center bg-gray-800 rounded-none"
            >
              <span className="flex w-full justify-between  font-mono text-white-500 text-xl text-white">
                Derug Request
              </span>
            </Dialog.Header>

            <Box className="flex flex-col p-5 gap-5">
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
              <p className="font-normal">
                Derug request details {activeStep + 1} / 3
              </p>
              {renderCreateDerugRequestContent}
            </Box>
            <Box className="grid grid-cols-2 gap-4 mx-5">
              <Button
                size="large"
                type="button"
                className="bg-gray-800 my-10 border-[1px] text-white hover:bg-red-300 hover:text-black rounded-md"
                disabled={false}
                onClick={
                  activeStep === 0
                    ? () => setIsOpen(false)
                    : () => setActiveStep(activeStep - 1)
                }
              >
                {activeStep === 0 ? "Cancel request" : "Go Back"}
              </Button>
              <Button
                size="large"
                disabled={false}
                type={"submit"}
                className="bg-gray-800 text-lg text-white font-bold my-10 font-mono rounded-md hover:bg-main-blue hover:text-black"
              >
                {activeStep === CreateDerugRequestStep.MintConfig
                  ? "Submit requests"
                  : "Next Step"}
              </Button>
            </Box>
          </Dialog>
        </form>
      </FormProvider>
    </div>
  );
};
