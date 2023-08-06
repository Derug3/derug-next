import { useWallet } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import { FC, useContext, useMemo, useRef, useState } from "react";
import { DerugStatus } from "../../enums/collections.enums";
import { IRequest } from "../../interface/collections.interface";
import { CollectionContext } from "../../stores/collectionContext";
import { FADE_DOWN_ANIMATION_VARIANTS } from "../../utilities/constants";

export const NoDerugRequests: FC<{
  openDerugModal: (value: boolean) => void;
}> = ({ openDerugModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<IRequest>();
  const returnFocusRef = useRef(null);

  const { derugRequest, collectionDerug } = useContext(CollectionContext);
  const wallet = useWallet();
  const showAddDerugButton = useMemo(() => {
    return (
      wallet &&
      wallet.publicKey &&
      (!collectionDerug ||
        (collectionDerug && dayjs(collectionDerug?.periodEnd).isAfter(dayjs())))
    );
  }, [collectionDerug, wallet]);

  return (
    <div
      className="flex w-full flex-col mt-5"
      style={{ boxShadow: "0 -10px 10px -10px rgba(9, 194, 246, 0.2)" }}
    >
      <div
        style={{
          width: "600px",
          filter: "drop-shadow(rgb(246, 242, 9) 0px 0px 10px)",
        }}
        aria-labelledby="header-id"
      >
        {currentRequest?.derugger.toString()}
      </div>
      <div className="w-full">
        <div className="text-base w-full flex items-center flex-col py-10 font-mono mt-3 text-white">
          There is no derug request yet.
          {showAddDerugButton && (
            <button
              className="font-mono text-lg mt-5 rounded-lg
              px-6 py-1"
              onClick={() => openDerugModal(true)}
              style={{ border: "1px solid rgb(9, 194, 246)" }}
            >
              Add derug request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoDerugRequests;
