import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import solanaLogo from "../../assets/solanaLogo.jpeg";
import { getNftsFromDeruggedCollection } from "../../common/helpers";
import { CollectionContext } from "../../stores/collectionContext";
import { generateSkeletonArrays } from "../../utilities/nft-fetching";
import { NftWithToken } from "@metaplex-foundation/js";
import {
  getDerugCandyMachine,
  mintNftFromCandyMachine,
  mintPublic,
} from "../../solana/methods/public-mint";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { Box, Button, ProgressBar, Text } from "@primer/react";
import Countdown from "react-countdown";
import { initializePublicMint } from "@/api/remint-nft.api";

const PublicMint = () => {
  const {
    collection,
    collectionDerug,
    candyMachine,
    setCandyMachine,
    derugRequest,
  } = useContext(CollectionContext);
  const [loading, toggleLoading] = useState(false);
  const [isMinting, toggleIsMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  const wallet = useAnchorWallet();

  const [nfts, setNfts] = useState<{ image: string; name: string }[]>([]);

  const { signMessage } = useWallet();

  const [mintedNft, setMintedNft] = useState<NftWithToken>();

  const [nftImage, setNftImage] = useState<string>();

  useEffect(() => {
    if (!nfts || nfts.length === 0) void getNfts();
  }, [wallet?.publicKey]);

  // const stopMint = useCallback(async () => {
  //   try {
  //     if (remintConfig && wallet) {
  //       await closeCandyMachine(remintConfig, wallet);

  //       setCandyMachine(undefined);
  //     }
  //   } catch (error) {
  //     toast.error("Failed to stop minting ");
  //   }
  // }, [remintConfig, wallet]);

  const getNfts = async () => {
    toggleLoading(true);
    try {
      if (wallet && derugRequest) {
        const nfts = await getNftsFromDeruggedCollection(
          wallet.publicKey,
          derugRequest
        );

        setNfts(nfts);
      }
    } catch (error) {
    } finally {
      toggleLoading(false);
    }
  };

  const mintNfts = async () => {
    setHasMinted(true);
    toggleIsMinting(true);
    setMintedNft(undefined);
    setNftImage(undefined);
    try {
      if (wallet && derugRequest) {
        const minted = candyMachine.whitelistingConfig?.isActive
          ? await mintNftFromCandyMachine(derugRequest, wallet, collectionDerug)
          : await mintPublic(derugRequest, wallet, collectionDerug);

        if (!minted) throw new Error();

        setNftImage(minted.json.image);
        setCandyMachine(await getDerugCandyMachine(wallet, derugRequest));
        toast.success(`Successfully minted ${minted.name}`);
        setNfts((prevValue) => [
          { name: minted.name, image: minted.json.image },
          ...prevValue,
        ]);
      }
    } catch (error: any) {
      toast.error(`Failed to mint:${error.message}`);
    } finally {
      toggleIsMinting(false);
    }
  };

  const renderNfts = useMemo(() => {
    return nfts.map((n, index) => {
      return (
        <div key={index} className="flex flex-col items-center justify-center">
          <img
            src={n.image}
            alt=""
            className="w-28 h-26 rounded-md border-[1px] border-main-blue"
          />
          <p className="text-white text-center text-sm w-full break-all">
            {n.name}
          </p>
        </div>
      );
    });
  }, [nfts, wallet]);

  const initializePublicMintHandler = useCallback(async () => {
    try {
      const messageSig = await signMessage(
        new TextEncoder().encode(
          `Init candy machine for derug ${collectionDerug.address.toString()}`
        )
      );
      await initializePublicMint(
        wallet,
        collectionDerug.address.toString(),
        messageSig
      );
    } catch (error) {
      console.log(error);

      toast.error(error.message);
    }
  }, [wallet]);

  // const showMintButton = useMemo(() => {
  //   return (
  //     (candyMachine.whitelistingConfig.isActive &&
  //       candyMachine.whitelistingConfig.isWhitelisted &&
  //       (candyMachine.whitelistingConfig.walletLimit
  //         ? //TODO:remove ekser
  //           3 - candyMachine.whitelistingConfig.walletLimit > 0
  //         : true)) ||
  //     !candyMachine.whitelistingConfig.isActive
  //   );
  // }, [candyMachine]);

  return (
    <>
      {" "}
      {candyMachine ? (
        <div className="m-auto grid grid-cols-3  m-10 mb-32">
          <div className="flex flex-col items-start ml-10">
            <p className="text-main-blue text-lg uppercase mb-2 flex font-mono">
              Your {derugRequest.newName ?? collection?.name} NFTs
            </p>
            <div className="overflow-y-scroll grid  w-full grid-cols-3 gap-5 max-h-[17.5em]">
              {loading
                ? generateSkeletonArrays(15).map((_, index) => (
                    <Skeleton
                      key={index}
                      height={100}
                      width={110}
                      baseColor="rgb(22,27,34)"
                      highlightColor="rgb(29,35,44)"
                    />
                  ))
                : renderNfts}
            </div>
          </div>
          <div className="flex flex-col gap-10 items-center">
            {collection ? (
              <img
                style={{ width: "15em" }}
                className="rounded-md"
                src={nftImage ?? collection.image}
                alt=""
              />
            ) : (
              <Skeleton
                height={128}
                width={156}
                baseColor="rgb(22,27,34)"
                highlightColor="rgb(29,35,44)"
              />
            )}
            {mintedNft && (
              <p className="text-main-blue font-bold">{mintedNft.name}</p>
            )}
            {true && (
              <button
                style={{ border: "1px solid rgb(9, 194, 246)" }}
                className="w-40 text-white py-1 
          flex flex-row items-center justify-center"
                onClick={mintNfts}
              >
                {isMinting ? (
                  <Oval
                    color="rgb(9, 194, 246)"
                    height={"1.1em"}
                    secondaryColor="transparent"
                  />
                ) : (
                  <span>Mint</span>
                )}
              </button>
            )}
          </div>
          <Box className="flex flex-col items-start gap-3 ">
            <p className="text-white text-lg">MINT DETAILS</p>
            <Box className="flex flex-col gap-3 items-start">
              <p className="text-bold text-green-color text-md">Private Mint</p>
              <Box className="flex gap-5 items-center">
                <ProgressBar
                  width={"100%"}
                  progress={
                    (collectionDerug.totalReminted /
                      collectionDerug.totalSupply) *
                    100
                  }
                  bg="#2DD4BF"
                  sx={{
                    width: "280px",
                    height: "8px",
                    color: "rgb(45, 212, 191)",
                    "@media (max-width: 768px)": {
                      width: "200px",
                    },
                  }}
                />
                <p>
                  {collectionDerug?.totalReminted ?? 200}/
                  {collectionDerug?.totalSupply ?? 400}
                </p>
              </Box>
            </Box>
            {candyMachine && (
              <Box className="flex flex-col gap-3 items-start">
                <p className="text-bold text-main-blue text-md">Public Mint</p>
                <Box className="flex gap-5 items-center">
                  <ProgressBar
                    width={"100%"}
                    progress={
                      (Number(candyMachine.candyMachine.itemsRedeemed) /
                        Number(candyMachine.candyMachine.data.itemsAvailable)) *
                      100
                    }
                    bg="rgb(9, 194, 246)"
                    sx={{
                      width: "280px",
                      height: "8px",
                      color: "rgb(45, 212, 191)",
                      "@media (max-width: 768px)": {
                        width: "200px",
                      },
                    }}
                  />
                  <p>
                    {Number(candyMachine.candyMachine.itemsRedeemed)}/
                    {Number(candyMachine.candyMachine.data.itemsAvailable)}
                  </p>
                </Box>
              </Box>
            )}
            {candyMachine &&
              candyMachine.whitelistingConfig &&
              candyMachine.whitelistingConfig?.isActive && (
                <Box className="flex flex-col gap-3">
                  <Text className="text-white font-mono text-md">
                    WL Only
                    {/* Public mint in:{" "} */}
                    {/* {
                <Countdown
                  className="font-mono text-sm
                    text-main-blue p-2"
                  onComplete={async () =>
                    setCandyMachine(
                      await getDerugCandyMachine(remintConfig, wallet)
                    )
                  }
                  date={candyMachine.whitelistingConfig.endDate}
                />
              } */}
                  </Text>

                  {candyMachine.whitelistingConfig.walletLimit >= 0 &&
                    candyMachine.whitelistingConfig.isWhitelisted && (
                      <Text className="text-white font-bold font-mono text-sm">
                        Remaining mints{" "}
                        {3 - candyMachine.whitelistingConfig?.walletLimit} / {3}
                      </Text>
                    )}

                  {!candyMachine.whitelistingConfig.isWhitelisted && (
                    <Text className="text-main-green text-sm text-white font-mono font-bold">
                      You are not whitelisted! Please wait for public mint
                    </Text>
                  )}
                </Box>
              )}
            <Box className="w-full flex">
              <Box className="flex gap-5 items-center">
                {candyMachine && (
                  <>
                    <p className="text-white text-lg">MINT PRICE : </p>
                    <p className="text-lg">
                      {candyMachine.whitelistingConfig?.isActive
                        ? candyMachine.whitelistingConfig.price
                        : candyMachine.publicConfig.price}
                    </p>
                    <p className="text-lg text-main-blue">
                      {candyMachine.whitelistingConfig?.isActive
                        ? candyMachine.whitelistingConfig.currency.name
                        : candyMachine.publicConfig.currency.name}
                    </p>

                    <img className="rounded-[50px] w-6" src={""} alt="" />
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <p>Public mint will be enabled soon!</p>
          {wallet?.publicKey.toString() ===
            derugRequest.derugger.toString() && (
            <button
              onClick={initializePublicMintHandler}
              className="bg-main-blue color-white px-3 py-1 align-end"
            >
              Initialize Public Mint
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default PublicMint;
