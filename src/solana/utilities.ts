import { bundlrStorage, Metaplex } from "@metaplex-foundation/js";
import {
  AnchorProvider,
  Program,
  Wallet,
  getProvider,
} from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { DerugProgram, IDL } from "../solana/idl/derug_program";
import { DERUG_PROGRAM_ID, RPC_CONNECTION } from "../utilities/utilities";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
export const derugProgramFactory = () => {
  return new Program<DerugProgram>(
    IDL,
    new PublicKey(DERUG_PROGRAM_ID),
    new AnchorProvider(RPC_CONNECTION, {} as any, {})
  );
};

export const feeWallet = new PublicKey(
  "DRG3YRmurqpWQ1jEjK8DiWMuqPX9yL32LXLbuRdoiQwt"
);

export const metadataUploaderWallet = new PublicKey(
  "KQ1jcFYvnH9DNUzBfVbquRohP9uZ6C7DVJJDyqiGB4P"
);

//TODO:load from env
export const umi = createUmi(
  "https://mainnet.helius-rpc.com/?api-key=4ddbd31d-ca46-4ca1-b85b-49577053fbd7",
  {
    commitment: "confirmed",
  }
).use(mplCandyMachine());

//TODO mainnet: load this from env file
export const metaplex = new Metaplex(RPC_CONNECTION);

export const candyMachineProgramId = new PublicKey(
  "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"
);
