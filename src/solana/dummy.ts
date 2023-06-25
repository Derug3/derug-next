import { IChainCollectionData } from "../interface/collections.interface";
import { PublicKey } from "@solana/web3.js";
import { derugDataSeed } from "./seeds";
import { derugProgramFactory } from "./utilities";
import { RPC_CONNECTION } from "../utilities/utilities";

// voting F7ehLXDAQqgWTQmxND3yEW6CxYMXh66PrM5g1DnMWjJ9
// winning 7mVFUBoaq5oSbBDbcSxYTu2HP6PYEhnzWFU6rL5tybqx
// no requests 9AiMvUTMiec1QfXb8ZJ1xUreNEuHu7nXpHb6g4YoFvtG

export const getDummyCollectionData =
  async (): Promise<IChainCollectionData> => {
    const derugProgram = derugProgramFactory();
    const [derugData] = PublicKey.findProgramAddressSync(
      [
        derugDataSeed,
        new PublicKey(
          "9P2aidVgTfSfKwMJwEUP7rTSTgYPmCj9eAHN1yccUL3U"
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
      collectionMint: "9P2aidVgTfSfKwMJwEUP7rTSTgYPmCj9eAHN1yccUL3U",
      hasActiveDerugData,
      slug: "boogle_gen",
      totalSupply: 99,
      firstCreator: "G6wLaE6jYvVB1QpjtBqUvfYGymnRmkof52WDKXJdAqKA",
      derugDataAddress: derugData,
    };
  };
