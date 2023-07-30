import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import { FC, useContext, useMemo, useRef, useState } from "react";
import { IRequest } from "../../interface/collections.interface";
import { CollectionContext } from "../../stores/collectionContext";
import { FADE_DOWN_ANIMATION_VARIANTS } from "../../utilities/constants";
import DerugRequestItem from "./DerugRequestItem";
// import WinningRequest from "./WinningRequest";

export const DerugRequest: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<IRequest>();
  const returnFocusRef = useRef(null);

  const { derugRequests, collectionDerug } = useContext(CollectionContext);

  const wallet = useWallet();
  const renderDerugRequests = useMemo(() => {
    return derugRequests?.map((dr, index) => {
      return (
        <>
          <DerugRequestItem
            derugRequest={dr}
            index={index}
            key={dr.address.toString()}
          />
        </>
      );
    });
  }, [derugRequests]);

  const getPercentage = () => {
    if (collectionDerug?.addedRequests.length == 1) {
      return 2;
    }
    if (collectionDerug && collectionDerug?.addedRequests.length < 5) {
      return collectionDerug.addedRequests.length;
    }
    return 5;
  };

  const getWinningRequest = useMemo(() => {
    const currUnix = dayjs().unix() * 1000;
    if (
      wallet &&
      wallet.publicKey &&
      collectionDerug &&
      dayjs(collectionDerug.periodEnd).unix() * 1000 > currUnix
    ) {
      const percentage = getPercentage();
      const majorWinner = collectionDerug?.addedRequests
        .sort((a, b) => (a.voteCount > b.voteCount ? -1 : 1))
        .find((ac) => ac.voteCount > collectionDerug.totalSupply / percentage);
      if (majorWinner) {
        const request = derugRequests?.find(
          (dr) => dr.address.toString() === majorWinner.request.toString()
        );
        if (request?.derugger.toString() === wallet.publicKey.toString()) {
          return request;
        }
      }
    }
  }, [wallet, collectionDerug, derugRequests]);

  return (
    <div
      className="flex w-full flex-col mt-5"
      style={{ boxShadow: "0 -10px 10px -10px rgba(9, 194, 246, 0.2)" }}
    >
      {/* <Dialog
        returnFocusRef={returnFocusRef}
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        sx={{
          width: "600px",
          filter: "drop-shadow(rgb(246, 242, 9) 0px 0px 10px)",
          borderRadius: "10px",
        }}
        aria-labelledby="header-id"
      >
        <Dialog.Header id="header-id">Derug request</Dialog.Header>
        {currentRequest?.derugger.toString()}
      </Dialog> */}
      <div className="w-full">
        <div className="flex w-full flex-col gap-1 items-center justify-around p-3">
          {derugRequests && (
            <>
              {renderDerugRequests}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DerugRequest;
