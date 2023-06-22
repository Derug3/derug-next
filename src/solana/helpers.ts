import { PublicKey } from "@solana/web3.js";
import { UtilityAction } from "../interface/derug.interface";

export const mapUtilityAction = (action: UtilityAction) => {
  switch (action) {
    case UtilityAction.Add: {
      return { add: {} };
    }
    case UtilityAction.Remove: {
      return { remove: {} };
    }
    default:
      throw new Error("Not implemented");
  }
};

export function getTrimmedPublicKey(publicKey: PublicKey | string): string {
  const publicKeyString = publicKey.toString();
  return (
    publicKeyString.substring(0, 5) +
    "..." +
    publicKeyString.substring(publicKeyString.length - 5)
  );
}
