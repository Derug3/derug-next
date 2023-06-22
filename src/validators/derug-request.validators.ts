import { PublicKey } from "@solana/web3.js";
import { Creator, ICreator } from "../interface/derug.interface";

export const validateCreators = (
  creators: Creator[],
  setError: (data: any, config: any) => void,
  clearErrors: (data: any) => void
) => {
  const feeSum = creators.reduce((acc, val) => acc + val.share, 0);
  if (feeSum > 100) {
    setError("creatorsFees", {
      message: "Creators fees in total cannot be greater than 100%",
    });
  } else if (feeSum !== 100) {
    setError("creatorsFees", {
      message: "Creator fees must be 100 in total sum!",
    });
  } else {
    clearErrors("creatorsFees");
  }
  if (creators.find((c) => c.address === "")) {
    setError("creatorsKey", {
      message: "Creator address cannot be empty",
    });
  } else {
    clearErrors("creatorsKey");
  }
  creators.forEach((c) => {
    try {
      new PublicKey(c.address);
    } catch (error) {
      setError("creatorsKey", {
        message: "Creator's key is invalid address!",
      });
    }
  });
  const nonUniqueCreators = creators.filter(
    (c, index) => creators.findIndex((cr) => cr.address === c.address) !== index
  );
  if (nonUniqueCreators.length > 0) {
    setError("creatorsKey", {
      message: `Creator ${nonUniqueCreators[0].address} is defined multiple times`,
    });
  }
};
