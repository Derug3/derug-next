import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";
import {
  IChainCollectionData,
  ICollectionDerugData,
  ICollectionRecentActivities,
} from "../interface/collections.interface";
import { gqlClient, METAPLEX_PROGRAM, RPC_CONNECTION } from "./utilities";
import { RECENT_ACTIVITIES_QUERY } from "../api/graphql/query";
import { TENSOR_LIST_FILTER } from "../common/constants";
import { mapRecentActivities } from "../api/graphql/mapper";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { metadataSeed } from "../solana/seeds";
import { chunk } from "lodash";
import {
  fetchMetadata,
  findMetadataPda,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { IDerugCollectionNft } from "../interface/derug.interface";
import { umi } from "@/solana/utilities";
import { publicKey, unwrapOption } from "@metaplex-foundation/umi";

export const generateSkeletonArrays = (quantity: number) => [
  ...Array(quantity).keys(),
];

export const fetchWhileHasActivities = async (
  firstBatch: ICollectionRecentActivities[],
  nextCursor: string,
  slug: string,
  txAt: number
) => {
  let response: any;
  do {
    response = await gqlClient.query({
      query: RECENT_ACTIVITIES_QUERY,
      variables: {
        filter: {
          txType: TENSOR_LIST_FILTER,
        },
        limit: 100,
        slug,
        cursor: {
          txKey: nextCursor,
          txAt,
        },
      },
    });

    nextCursor = response.data.recentTransactions.page.endCursor.txKey;
    txAt = response.data.recentTransactions.page.endCursor.txAt;
    firstBatch = [...firstBatch, ...mapRecentActivities(response.data)];
  } while (response && response.data.recentTransactions.page.hasMore);

  return firstBatch.reverse();
};

export const getAllNftsFromCollection = async (
  wallet: WalletContextState,
  derug: ICollectionDerugData,
  chainCollectionData: IChainCollectionData
) => {
  const walletNfts = (
    await RPC_CONNECTION.getParsedTokenAccountsByOwner(wallet.publicKey!, {
      programId: TOKEN_PROGRAM_ID,
    })
  ).value.filter((ta) => ta.account.data.parsed.info.tokenAmount.uiAmount > 0);

  const allMetadataAddresses: string[] = [];

  let derugNfts: (IDerugCollectionNft | null)[] = [];

  const tokenAccounts: {
    pubkey: PublicKey;
    account: AccountInfo<ParsedAccountData>;
  }[] = [];

  for (const walletNft of walletNfts) {
    try {
      const [metadata] = findMetadataPda(umi, {
        mint: publicKey(walletNft.account.data.parsed.info.mint),
      });

      allMetadataAddresses.push(metadata.toString());
      tokenAccounts.push(walletNft);
    } catch (error) {
      console.log(error);
    }
  }

  derugNfts = await Promise.all(
    allMetadataAddresses.map(async (meta, index) => {
      try {
        const metadataAccount = await fetchMetadata(umi, publicKey(meta));

        if (
          (unwrapOption(metadataAccount.collection) as any).key.toString() ===
          "9FNQwziLT6YUt3tkLcvbdKk1XyT3M42E1vE3XTkyngzp"
        ) {
          return {
            mint: new PublicKey(metadataAccount.mint),
            metadata: metadataAccount,
            tokenAccount: tokenAccounts.find(
              (w) =>
                w.account.data.parsed.info.mint ===
                metadataAccount.mint.toString()
            ).pubkey,
          };
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    })
  );

  return derugNfts.filter((nft) => nft !== null);
};
