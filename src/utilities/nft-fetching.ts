import { PublicKey } from "@solana/web3.js";
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
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { IDerugCollectionNft } from "../interface/derug.interface";

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

  const allMetadataAddresses: PublicKey[] = [];

  const derugNfts: IDerugCollectionNft[] = [];

  for (const walletNft of walletNfts) {
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        metadataSeed,
        METAPLEX_PROGRAM.toBuffer(),
        new PublicKey(walletNft.account.data.parsed.info.mint).toBuffer(),
      ],
      METAPLEX_PROGRAM
    );
    allMetadataAddresses.push(metadataAddress);
  }

  const chunkedMetadataAddresses = chunk(allMetadataAddresses, 100);

  for (const metadataAddressesBatch of chunkedMetadataAddresses) {
    const multipleAccInfo = (
      await RPC_CONNECTION.getMultipleAccountsInfo(metadataAddressesBatch)
    ).filter((md) => md && md.data.byteLength > 0);

    multipleAccInfo.forEach((mai, index) => {
      const [metadata] = Metadata.fromAccountInfo(mai!);
      console.log(metadata);

      if (
        (metadata.collection &&
          metadata.collection.key.toString() ===
            chainCollectionData.collectionMint) ||
        metadata.data.creators?.find(
          (c) => c.address.toString() === chainCollectionData.collectionMint
        )
      ) {
        derugNfts.push({
          metadata,
          mint: metadata.mint,
          tokenAccount: walletNfts.find(
            (v) => v.account.data.parsed.info.mint === metadata.mint.toString()
          )?.pubkey!,
        });
      }
    });
  }

  return derugNfts;
};
