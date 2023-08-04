import { useWallet } from "@solana/wallet-adapter-react";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IRequest, IUtility } from "../../interface/collections.interface";
import {
  Creator,
  DerugForm,
  UtilityAction,
} from "../../interface/derug.interface";
import { getCollectionDerugData } from "../../solana/methods/derug";
import {
  createOrUpdateDerugRequest,
  getSingleDerugRequest,
} from "../../solana/methods/derug-request";
import { CollectionContext } from "../../stores/collectionContext";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import UtilityArray from "../CollectionLayout/UtilityArray";
import { FaTwitter } from "react-icons/fa";
import CreatorsArray from "../CollectionLayout/CreatorsArray";
import { Box, Dialog, TextInput, Button, Label } from "@primer/react";
import MintDetails, {
  ITreasuryTokenAccInfo,
} from "../CollectionLayout/MintDetails";
import { getTrimmedPublicKey } from "../../solana/helpers";
import { PublicKey } from "@solana/web3.js";
import { FormProvider, useForm } from "react-hook-form";
import { WRAPPED_SOL_MINT } from "@metaplex-foundation/js";
import { validateCreators } from "../../validators/derug-request.validators";
import toast from "react-hot-toast";
import { authorizeTwitter, getUserTwitterData } from "../../api/twitter.api";
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
  const [utility, setUtility] = useState<IUtility[]>([
    {
      title: "",
      description: "",
      isActive: true,
    },
  ]);

  const { userData, setUserData } = userStore();

  const [creators, setCreator] = useState<Creator[]>([]);

  const [sellerFee, setSellerFee] = useState<number>(0);
  const [selectedMint, setSelectedMint] = useState<ITreasuryTokenAccInfo>();

  const {
    chainCollectionData,
    activeListings,
    setCollectionDerug,
    setRequests,
    collectionStats,
    derugRequests,
  } = useContext(CollectionContext);

  const handleSellerFeeChange = (points: number) => {
    setSellerFee(points);
  };

  const [activeStep, setActiveStep] = useState(
    CreateDerugRequestStep.BasicInfo
  );

  const methods = useForm<DerugForm>();

  const handleSubmit = (data?: any) => {
    setActiveStep(activeStep + 1);
  };

  const submitRequest = async (data?: any) => {
    try {
      if (wallet && chainCollectionData && utility && collectionStats && data) {
        const requestAddress = await createOrUpdateDerugRequest(
          wallet,
          utility
            .filter((u) => u.title !== "")
            .map((ut) => {
              return {
                action: UtilityAction.Add,
                description: ut.description,
                title: ut.title,
              };
            }),
          chainCollectionData,
          +sellerFee * 10,
          data.symbol,
          data.name,
          creators.map((c) => {
            return {
              address: new PublicKey(c.address),
              share: c.share,
            };
          }),
          data.price
            ? +data.price * Math.pow(10, selectedMint!.decimals)
            : undefined,
          data.privateMintEnd ? Number(data.privateMintEnd) * 3600 : undefined,
          selectedMint?.address &&
            selectedMint.address.toString() !== WRAPPED_SOL_MINT.toString()
            ? selectedMint.address
            : undefined,
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
              {/* <Box
                className="flex justify-between flex-row text-gray-400 font-mono rounded-lg"
                style={{
                  border: "1px solid rgb(9, 194, 246)",
                }}
              >
                <div className="flex flex-col justify-start items-start w-full gap-5">
                  <span
                    className="flex text-white font-mono w-full text-lg px-3"
                    style={{
                      borderBottom: "1px solid #6e7681",
                      backgroundColor: "rgba(9, 194, 246, 0.2)",
                    }}
                  >
                    Derug request details
                  </span>
                  <div className="flex justify-between w-full px-3">
                    <span className="pr-2 text-white font-mono text-start">
                      Wallet:
                    </span>
                    <div className="flex gap-5 items-center  justify-beween">
                      <span className="font-mono ">
                        {wallet.publicKey &&
                          getTrimmedPublicKey(
                            new PublicKey(wallet.publicKey.toString())
                          )}
                      </span>
                      {!userData ? (
                        <button
                          onClick={linkTwitter}
                          type="button"
                          className="flex border-[1px] border-main-blue p-1 px-5 items-center gap-4 rounded-lg"
                        >
                          Link twitter
                          <FaTwitter style={{ color: "rgb(29 161 242)" }} />
                        </button>
                      ) : (
                        <div className="flex flex-row gap-5 items-center">
                          <p className="text-main-blue text-lg font-bold">
                            {userData.twitterHandle}
                          </p>
                          <img
                            className="rounded-[50px] w-10"
                            src={userData.image}
                            alt=""
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between w-full px-3">
                    <span className="pr-2 text-white">New name:</span>
                    <div className="flex flex-col w-1/2 items-end">
                      <TextInput
                        {...methods.register("name", {
                          required: "Name cannot be empty",
                          maxLength: {
                            message: "Max name length is 32 characters",
                            value: 32,
                          },
                        })}
                        onChange={(e) => {
                          e.target.value.length > 0 &&
                            e.target.value.length < 32 &&
                            methods.clearErrors("name");
                        }}
                        placeholder="new collection name"
                        className="text-gray-400 "
                        value={newName}
                        sx={{
                          width: "100%",
                        }}
                      />
                      {methods.formState.errors.name && (
                        <p className="text-red-500">
                          {methods.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between w-full px-3">
                    <span className="pr-2 text-white">New symbol:</span>
                    <div className="flex flex-col w-1/2 items-start">
                      <TextInput
                        {...methods.register("symbol", {
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
                          methods.clearErrors("symbol")
                        }
                        value={symbol}
                        sx={{
                          width: "100%",
                        }}
                      />
                      {methods.formState.errors.symbol && (
                        <p className="text-red-500 ">
                          {methods.formState.errors.symbol.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between w-full gap-3 items-center px-3 pb-3">
                    <span className="pr-2 text-white"> Seller basic fee</span>

                    <div className="flex w-1/2 items-center gap-5">
                      <TextInput
                        {...methods.register("fee")}
                        placeholder="Fee"
                        value={sellerFee}
                        sx={{ width: "30%" }}
                        onChange={(e) =>
                          handleSellerFeeChange(Number(e.target.value))
                        }
                      />
                      <div className="flex flex-col w-full items-start">
                        <Slider
                          value={Number(sellerFee)}
                          onChange={(e) => {
                            typeof e === "number" && handleSellerFeeChange(e);
                            +e > 0 && +e <= 100 && methods.clearErrors("fee");
                          }}
                        />
                        {methods.formState.errors.fee && (
                          <p className="text-red-500">
                            {methods.formState.errors.fee.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Box>
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
              </Box> */}
            </Box>
            <Box className="grid grid-cols-2 gap-4 mx-5">
              {/* <Box
                className="flex justify-start flex-col font-mono rounded-lg"
                style={{
                  border: "1px solid rgb(9, 194, 246)",
                }}
              >
                <span
                  className="flex text-white font-mono w-full text-lg px-3"
                  style={{
                    borderBottom: "1px solid #6e7681",
                    backgroundColor: "rgba(9, 194, 246, 0.2)",
                  }}
                >
                  Mint details
                </span>
                <MintDetails
                  price={price}
                  setPrice={setPrice}
                  handleMintChange={(e) => setSelectedMint(e)}
                  duration={duration}
                  setDuration={setDuration}
                />
              </Box> */}

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