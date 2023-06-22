import { Box, Text } from "@primer/react";
import React, { FC, useEffect, useState } from "react";
import { RemintingStatus } from "../../enums/collections.enums";
import { IDerugCollectionNft } from "../../interface/derug.interface";

const RemintNft: FC<{ nft: IDerugCollectionNft }> = ({ nft }) => {
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    void fetchImageUrl();
  }, []);

  const fetchImageUrl = async () => {
    try {
      const nftImage = await (await fetch(nft.metadata.data.uri)).json();

      setImageUrl(nftImage.image);
    } catch (error) {}
  };

  return (
    <Box
      sx={{
        border: `2.5px solid ${
          nft.remintingStatus === RemintingStatus.Succeded
            ? "rgb(45, 212, 191)"
            : nft.remintingStatus === RemintingStatus.Failed
            ? "#FD5D5D"
            : "rgb(9, 194, 246)"
        }`,
        padding: "0.5em",
        display: "flex",
        flexWrap: "wrap",
        paddingBottom: "1.25em",
      }}
    >
      {imageUrl && (
        <Box className="flex flex-col items-center gap-5">
          <img
            src={imageUrl}
            className={`w-full h-full ${
              nft.remintingStatus === RemintingStatus.InProgress && "blur-sm"
            }`}
          />
          <Text className="text-white">{nft.metadata.data.name}</Text>
        </Box>
      )}
    </Box>
  );
};

export default RemintNft;
