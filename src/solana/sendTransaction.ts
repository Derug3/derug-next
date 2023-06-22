import { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { IDerugInstruction } from "../interface/derug.interface";
import { toast } from "react-hot-toast";
import nftStore from "../stores/nftStore";
import { RemintingStatus } from "../enums/collections.enums";
import { derugProgramFactory } from "./utilities";
import { parseTransactionError } from "../common/helpers";
export const sendTransaction = async (
  connection: Connection,
  instructions: IDerugInstruction[],
  wallet: WalletContextState
) => {
  try {
    const transactions: VersionedTransaction[] = [];

    const { nfts, setNfts } = nftStore.getState();

    for (const instructionSet of instructions) {
      const versionedMessage = new TransactionMessage({
        instructions: instructionSet.instructions,
        payerKey: wallet.publicKey!,
        recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      }).compileToV0Message();

      const versionedTransaction = new VersionedTransaction(versionedMessage);
      if (instructionSet.partialSigner) {
        versionedTransaction.sign(instructionSet.partialSigner);
      }
      transactions.push(versionedTransaction);
    }

    const sigendTransactions = await wallet.signAllTransactions!(transactions);

    for (const [index, tx] of sigendTransactions.entries()) {
      const txSim = await connection.simulateTransaction(tx);

      console.log(txSim, "TX SIM");

      const savedNfts = [...nfts];

      try {
        await toast.promise(sendVersionedTx(connection, tx), {
          error: (data) => {
            if (instructions[index].remintingNft) {
              savedNfts.push({
                mint: instructions[index].remintingNft?.mint!,
                status: RemintingStatus.Failed,
              });
              setNfts(savedNfts);
            }

            return "Failed to send transaction:" + parseTransactionError(data);
          },
          loading: instructions[index].pendingDescription,
          success: (data) => {
            if (instructions[index].remintingNft) {
              savedNfts.push({
                mint: instructions[index].remintingNft?.mint!,
                status: RemintingStatus.Succeded,
              });
              setNfts(savedNfts);
            }

            return instructions[index].successDescription;
          },
        });
      } catch (error) {}
    }
  } catch (error: any) {
    toast.error("Failed to send transaction:", error.message);
    console.log(error);
  }
};

export const sendVersionedTx = async (
  connection: Connection,
  tx: VersionedTransaction | Transaction
) => {
  try {
    const txSig = await connection.sendRawTransaction(tx.serialize(), {
      preflightCommitment: "confirmed",
    });
    await connection.confirmTransaction(txSig);
  } catch (error) {
    throw error;
  }
};
