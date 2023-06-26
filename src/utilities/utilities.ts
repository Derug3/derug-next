import { ApolloClient, InMemoryCache } from "@apollo/client";
import { Connection, PublicKey } from "@solana/web3.js";

export const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT as string;
export const gqlClient = new ApolloClient({
  uri: "https://graphql.tensor.trade/graphql",
  cache: new InMemoryCache(),
});

export const MAINNET_RPC_CONNECTION = new Connection(
  "https://mainnet.helius-rpc.com/?api-key=4ddbd31d-ca46-4ca1-b85b-49577053fbd7"
);

export const METAPLEX_PROGRAM = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const MAGIC_EDEN_URL = "https://api-mainnet.magiceden.dev/v2";

export const DERUG_PROGRAM_ID = process.env.NEXT_PUBLIC_DERUG_PROGRAM as string;

//TODO:load from env
export const RPC_CONNECTION = new Connection(
  "https://mainnet.helius-rpc.com/?api-key=4ddbd31d-ca46-4ca1-b85b-49577053fbd7",
  "confirmed"
);
