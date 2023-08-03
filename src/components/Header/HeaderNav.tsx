import derugPfp from "../../assets/derugPfp2.svg";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FC, useCallback, useEffect, useState } from "react";

import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { FaTwitter } from "react-icons/fa";
import toast from "react-hot-toast";
import { userStore } from "@/stores/userStore";
import {
  getUserTwitterData,
  authorizeTwitter,
  deleteTwitterData,
} from "@/api/twitter.api";
import Link from "next/link";
import { HOME } from "@/utilities/constants";
import { useRouter } from "next/router";
import { getTrimmedPublicKey } from "@/solana/helpers";
const settings = ["Twitter", "Discord"];

const HeaderNav: FC = () => {
  const { push: navigate } = useRouter();

  const { setUserData, userData } = userStore();

  const router = useRouter();
  const slug = router.pathname;

  const wallet = useAnchorWallet();

  const { connect, disconnect, connected, publicKey } = useWallet();

  useEffect(() => {
    if (wallet) void storeUserData();
  }, [wallet]);

  const storeUserData = async () => {
    try {
      setUserData(await getUserTwitterData(wallet?.publicKey.toString()!));
    } catch (error) {
      setUserData(undefined);
    }
  };

  const linkTwitter = useCallback(async () => {
    try {
      if (wallet)
        await authorizeTwitter(slug ?? "", wallet?.publicKey.toString()!);
    } catch (error) {
      toast.error("Failed to link twitter");
    }
  }, []);

  const unlinkTwitter = useCallback(async () => {
    if (wallet && userData && userData.twitterName) {
      try {
        await deleteTwitterData(wallet.publicKey.toString());
        setUserData(undefined);
        toast.success("Twitter succesfully unlinked");
      } catch (error) {
        toast.error("Failed to unlink twitter");
      }
    }
  }, [wallet, userData]);

  return (
    <>
      <header
        className="flex items-center w-full justify-between px-2 lg:px-10 rounded-lg shadow-xl"
        style={{
          // padding: "0.5em 6.5em",
          background: "#1D2939",
          // borderBottom: "1px solid  rgb(9, 194, 246)",
        }}
      >
        <Link
          href={{
            pathname: HOME,
          }}
        >
          <img
            src={derugPfp.src}
            style={{
              width: "12em",
              cursor: "pointer",
              // filter: "drop-shadow(#1D2939 0px 0px 13px)",
              boxShadow: "0px 0px 13px #1D2939",
              // border: '1px solid #101828'
            }}
          />
        </Link>

        <div className="flex">
          {/* <Header.Item full>
      <motion.button className="font-mono" {...FADE_IN_ANIMATION_SETTINGS}>
        
      </motion.button>
    </Header.Item> */}
          <div className="flex">
            {/* <WalletMultiButton
              className="w-full hover:bg-main-blue hover:text-white"
              style={{
                fontSize: "1em",
                fontFamily: "monospace",
                fontWeight: "bold",
              }}
            /> */}
            {wallet && wallet.publicKey && (
              <div
                className="flex flex-row gap-3 cursor-pointer"
                onClick={
                  userData && userData.twitterHandle
                    ? unlinkTwitter
                    : linkTwitter
                }
              >
                <div className="flex items-center w-full gap-3">
                  {userData && (
                    <img src={userData.image} className="w-8 rounded-[50%]" />
                  )}
                  <p className="flex gap-3 text-md">
                    {userData && userData.twitterHandle ? (
                      userData.twitterHandle
                    ) : (
                      <div className="flex gap-2 items-center">
                        <FaTwitter color="rgb(9, 194, 246)" />
                        <span>link twitter </span>
                      </div>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderNav;
