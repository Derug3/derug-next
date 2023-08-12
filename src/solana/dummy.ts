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
          "9M54HUK5RLojGsz42WXaCVSqgLYDMKR8KQoEvQZNEkjw"
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
      collectionMint: "9M54HUK5RLojGsz42WXaCVSqgLYDMKR8KQoEvQZNEkjw",
      hasActiveDerugData,
      slug: "boogle_gen",
      totalSupply: 99,
      firstCreator: "7c6S1bQdmj1SLnNTj1DUzR56VcXAf4todmVa4QD9bRQv",
      derugDataAddress: derugData,
    };
  };
