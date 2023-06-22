import { Box, Button, Text } from "@primer/react";
import { FC, useContext, useMemo, useState } from "react";
import magicEdenLogo from "../../assets/magicEdenLogo.png";
import tensorLogo from "../../assets/tensorLogo.png";
import { ListingSource } from "../../enums/collections.enums";
import { INftListing } from "../../interface/collections.interface";
import solanaArtLogo from "../../assets/solanart_logo.png";
import { CollectionContext } from "../../stores/collectionContext";
import Skeleton from "react-loading-skeleton";
import Image from "next/image";

const ListedNftItem: FC<{ listedNft: INftListing; imageUrl: string }> = ({
  listedNft,
  imageUrl,
}) => {
  const { collection } = useContext(CollectionContext);
  const [hover, setHover] = useState(false);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isValidSrc, setIsValidSrc] = useState(!!imageUrl);

  const getImgLogo = useMemo(() => {
    switch (listedNft.soruce) {
      case ListingSource.MagicEden:
        return magicEdenLogo;
      case ListingSource.Tensor:
        return tensorLogo;
      case ListingSource.SolanaArt:
        return solanaArtLogo;
    }
  }, [listedNft]);

  const getUrl = useMemo(() => {
    switch (listedNft.soruce) {
      case ListingSource.MagicEden:
        return `https://magiceden.io/item-details/${listedNft.mint}`;
      case ListingSource.SolanaArt:
        return `https://solanart.io/nft/${listedNft.mint}`;
      case ListingSource.Tensor:
        return `https://www.tensor.trade/trade/${collection?.symbol}`;
    }
  }, []);

  return (
    <Box
      className="flex relative flex-col gap-5 items-start border-cyan-500 ease-in duration-300"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {isValidSrc ? (
        <img
          src={listedNft.imageUrl}
          //@ts-ignore
          preload
          as="image"
          type="image/jpeg"
          alt="nftImg"
          className="rounded-lg p-3"
          style={{ opacity: hover ? 0.2 : 1, borderRadius: "2em" }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setIsValidSrc(false)}
        />
      ) : (
        <Skeleton
          height={128}
          width={156}
          baseColor="rgb(22,27,34)"
          highlightColor="rgb(29,35,44)"
        />
      )}
      {isValidSrc && !imageLoaded && (
        <div className="smooth-preloader">
          <Skeleton
            height={128}
            width={156}
            baseColor="rgb(22,27,34)"
            highlightColor="rgb(29,35,44)"
          />
        </div>
      )}
      {hover && (
        <Box className="flex absolute flex-col w-full h-full gap-2 items-center justify-center text-white font-mono">
          <Box className="flex flex-row  items-center">
            <Box className="flex flex-col">
              <Text
                className="text-sm font-bold"
                sx={{ color: "rgba(9, 194, 246)" }}
              >
                {listedNft.price} SOL
              </Text>
            </Box>
          </Box>
          <Box className="flex flex-row gap-5 items-center">
            <Button
              className="bg-transparent font-mono font-bold text-lg"
              sx={{
                bg: "transparent",
                fontFamily: "monospace",
                padding: "1em",
              }}
              onClick={() => window.open(getUrl, "_blank")}
            >
              <div
                className="flex align-centar justify-between cursor-pointer"
                style={{ color: "rgba(9, 194, 246)" }}
              >
                <img
                  src={getImgLogo?.src}
                  alt="meLogo"
                  className="w-5 h-5 mr-2"
                />{" "}
                Details
              </div>
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ListedNftItem;
