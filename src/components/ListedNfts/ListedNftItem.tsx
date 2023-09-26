import { FC, use, useContext, useEffect, useMemo, useState } from "react";
import magicEdenLogo from "../../assets/magicEdenLogo.png";
import tensorLogo from "../../assets/tensorLogo.png";
import { ListingSource } from "../../enums/collections.enums";
import { INftListing } from "../../interface/collections.interface";
import solanaArtLogo from "../../assets/solanart_logo.png";
import { CollectionContext } from "../../stores/collectionContext";
import Skeleton from "react-loading-skeleton";
import { metaplex } from "@/solana/utilities";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-hot-toast";

const ListedNftItem: FC<{ listedNft: INftListing }> = ({
  listedNft,
}) => {
  const { collection } = useContext(CollectionContext);
  const [hover, setHover] = useState(false);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [fallbackImage, setFallbackImage] = useState('');

  const handleImageLoaded = async (mint: string) => {
    try {
      const metadata = await metaplex.nfts().findByMint({
        mintAddress: new PublicKey(mint),
        loadJsonMetadata: true,
      })

      return metadata.json.image;
    } catch (error) {
      console.log(error);
      toast.error("Error loading image");

    }
  };

  useEffect(() => {
    if (!listedNft.imageUrl) {
      const fallbackSrc = async () => {
        const data = await handleImageLoaded(listedNft.mint);
        setFallbackImage(data);
      }

      fallbackSrc();
    }
  }, [listedNft]);


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
    console.log(collection, 'collection');

    switch (listedNft.soruce) {
      case ListingSource.MagicEden:
        return `https://magiceden.io/${collection?.symbol}`;
      case ListingSource.SolanaArt:
        return `https://solanart.io/nft/${listedNft.mint}`;
      case ListingSource.Tensor:
        return `https://www.tensor.trade/trade/${collection?.symbol}`;
    }
  }, []);

  return (
    <div
      className="flex relative flex-col gap-5 items-start flex p-2 flex-col items-start gap-4"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={listedNft.imageUrl || fallbackImage}
        alt="nftImg"
        className={`${hover ? "opacity-20" : "opacity-100"} transition-all duration-300 ease-in-out`}
        onLoad={() => setImageLoaded(true)}
      />
      {hover && (
        <div className="flex absolute flex-col w-full h-full gap-2 items-center justify-center text-white bg-white-100">
          <div className="flex flex-row  items-center">
            <div className="flex flex-col">
              <div
                className="text-sm font-bold"
              >
                {listedNft.price} SOL
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-5 items-center bg-white-500">
            <button
              className="font-bold text-lg"
              style={{
                // background: "transparent",
                padding: "1em",
              }}
              onClick={() => window.open(getUrl, "_blank")}
            >
              <div className="flex items-center justify-between cursor-pointer">
                <img
                  src={getImgLogo?.src}
                  alt="meLogo"
                  className="w-5 h-5 mr-2"
                />{" "}
                Details
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListedNftItem;
