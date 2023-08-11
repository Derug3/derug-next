import { IChainCollectionData } from "../interface/collections.interface";
import { PublicKey } from "@solana/web3.js";
import { derugDataSeed } from "./seeds";
import { derugProgramFactory } from "./utilities";
import { RPC_CONNECTION } from "../utilities/utilities";

export const getDummyCollectionData =
  async (): Promise<IChainCollectionData> => {
    const derugProgram = derugProgramFactory();
    const [derugData] = PublicKey.findProgramAddressSync(
      [
        derugDataSeed,
        new PublicKey(
          "2DnXsZEfUWVGH1jLSGkmkhdfrDBrJNpbaEpxDPGkerrA"
        ).toBuffer(),
      ],
      derugProgram.programId
    );

    let hasActiveDerugData = false;

    try {
      const derugDataAccount = await RPC_CONNECTION.getAccountInfo(derugData);

      if (derugDataAccount && derugDataAccount.data.length > 0) {
        hasActiveDerugData = true;
      }
    } catch (error) {
      hasActiveDerugData = false;
    }

    return {
      collectionMint: "2DnXsZEfUWVGH1jLSGkmkhdfrDBrJNpbaEpxDPGkerrA",
      hasActiveDerugData,
      slug: "boogle_gen",
      totalSupply: 99,
      firstCreator: "Gv2XWaeCj8AFNNSux6fY1oe1UHoiF51jna52ZCmxPNic",
      derugDataAddress: derugData,
    };
  };
