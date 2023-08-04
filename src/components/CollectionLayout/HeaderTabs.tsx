import { useWallet } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import { FC, useContext, useMemo } from "react";
import { DerugStatus } from "../../enums/collections.enums";
import { CollectionContext } from "../../stores/collectionContext";

const getNavStyling = (tab: string, selected: string) => {
  return {
    backgroundColor: tab === selected ? "rgba(9, 194, 246,.35)" : "transparent",
    color: tab === selected ? "rgba(9, 194, 246)" : "white",
    fontSize: "1rem",
    padding: ".5em 1em",
    borderRadius: "1.5em",
    // fontWeight: "bold",
    fontFamily: "monospace",
    cursor: "pointer",
    borderBottom: "none",
    "&:hover": {
      color: tab === selected ? "black" : "rgba(9, 194, 246)",
    },
  };
};

export const HeaderTabs: FC<{
  selectedData: string;
  setSelectedInfo: (s: string) => void;
  setSelectedData: (s: string) => void;
  openDerugModal: (value: boolean) => void;
}> = ({ openDerugModal, selectedData, setSelectedData }) => {
  const { traits, collectionDerug, derugRequests } =
    useContext(CollectionContext);
  const wallet = useWallet();

  const showAddDerugButton = useMemo(() => {
    if (!derugRequests || derugRequests.length === 0) {
      return true;
    } else if (
      (collectionDerug &&
        collectionDerug.addedRequests.find((ar) => ar.winning)) ||
      collectionDerug?.status === DerugStatus.Reminting
    ) {
      return false;
    }
  }, [derugRequests, collectionDerug]);

  return (
    <>
      {(wallet &&
        wallet.publicKey &&
        (!collectionDerug ||
          (collectionDerug &&
            dayjs(collectionDerug?.periodEnd).isAfter(dayjs()))) &&
        !derugRequests?.find(
          (dr) => dr.derugger.toString() === wallet.publicKey?.toString()
        )) || (
        <button
          className="rounded-lg py-2 px-3 text-white border border-white hover:bg-white hover:text-main-dark transition-all"
          onClick={() => openDerugModal(true)}
        >
          <span className="text-sm uppercase rounded-lg">
            Add derug request
          </span>
        </button>
      )}
      <div
        aria-label="Main"
        className="sticky flex justify-end w-fit items-center"
      >
        <div
          onClick={() => setSelectedData("listed")}
          style={getNavStyling(selectedData, "listed")}
        >
          NFTS
        </div>
        {traits && traits.length > 0 && (
          <div
            onClick={() => setSelectedData("traits")}
            style={getNavStyling(selectedData, "traits")}
          >
            TRAITS
          </div>
        )}
      </div>
    </>
  );
};
