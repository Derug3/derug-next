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
          "F6oGCNCqThNBrvpe9KpG7mg9Ya2LRyDyfx9gCpNy2NPK"
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
      collectionMint: "F6oGCNCqThNBrvpe9KpG7mg9Ya2LRyDyfx9gCpNy2NPK",
      hasActiveDerugData,
      slug: "boogle_gen",
      totalSupply: 99,
      firstCreator: "A6DHb3s8VKSKV3cC58xYzLooyVsLuKCrWwQEe2ZdbEZg",
      derugDataAddress: derugData,
    };
  };
