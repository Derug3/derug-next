import { useWallet } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import { FC, useContext, useMemo } from "react";
import { DerugStatus } from "../../enums/collections.enums";
import { CollectionContext } from "../../stores/collectionContext";

const getNavStyling = (tab: string, selected: string) => {
  return {
    backgroundColor: tab === selected ? "#1D2939" : "transparent",
    color: tab === selected ? "rgba(9, 194, 246)" : "white",
    fontSize: "1rem",
    padding: ".5em 1em",
    cursor: "pointer",
    borderBottom: "none",
  };
};

export const HeaderTabs: FC<{
  selectedData: string;
  setSelectedInfo: (s: string) => void;
  setSelectedData: (s: string) => void;
  openDerugModal: (value: boolean) => void;
}> = ({ openDerugModal, selectedData, setSelectedData }) => {
  const { traits, collectionDerug, derugRequest } =
    useContext(CollectionContext);
  const wallet = useWallet();

  const showAddDerugButton = useMemo(() => {
    if (!derugRequest) {
      return true;
    } else if (
      (collectionDerug &&
        collectionDerug.addedRequests.find((ar) => ar.winning)) ||
      collectionDerug?.status === DerugStatus.Reminting
    ) {
      return false;
    }
  }, [derugRequest, collectionDerug]);

  return (
    <>
      <div aria-label="Main" className="flex justify-start w-fit items-center">
        <div
          onClick={() => setSelectedData("listed")}
          style={getNavStyling(selectedData, "listed")}
          className="hover:scale-105 transition-all"
        >
          NFTS
        </div>
        {traits && traits.length > 0 && (
          <div
            onClick={() => setSelectedData("traits")}
            style={getNavStyling(selectedData, "traits")}
            className="hover:scale-105 transition-all"
          >
            TRAITS
          </div>
        )}
      </div>
      {/* {(wallet &&
        wallet.publicKey &&
        (!collectionDerug ||
          (collectionDerug &&
            dayjs(collectionDerug?.periodEnd).isAfter(dayjs()))) &&
        !derugRequests?.find(
          (dr) => dr.derugger.toString() === wallet.publicKey?.toString()
        )) || (
        )} */}
      {
        wallet.publicKey.toString() === '9wn4U5ATizKpKwxPN85RDLqwhVCGmNqY5BZViGSeLwnf' || wallet.publicKey.toString() === 'A6DHb3s8VKSKV3cC58xYzLooyVsLuKCrWwQEe2ZdbEZg' || wallet.publicKey.toString() === '6smu36j5E6AfW4NM2RQPpDbdzEpp9tKZvg7ZTE2KKgcL' && (
          <button
            className="py-2 px-3 text-white hover:text-main-blue transition-all hover:bg-[#1D2939] hover:scale-105"
            onClick={() => openDerugModal(true)}
          >
            <span className="text-sm uppercase">Add derug request</span>
          </button>
        )
      }
    </>
  );
};
