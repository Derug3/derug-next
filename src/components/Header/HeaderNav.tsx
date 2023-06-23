import derugPfp from "../../assets/derugPfp.png";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FC, useCallback, useEffect, useState } from "react";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { FaTwitter } from "react-icons/fa";
import toast from "react-hot-toast";
import { userStore } from "@/stores/userStore";
import {
  getUserTwitterData,
  authorizeTwitter,
  deleteTwitterData,
} from "@/api/twitter.api";
import { HOME, FADE_IN_ANIMATION_SETTINGS } from "@/utilities/constants";
import { useRouter } from "next/router";
const settings = ["Twitter", "Discord"];

const HeaderNav: FC = () => {
  const { push: navigate } = useRouter();

  const { setUserData, userData } = userStore();

  const router = useRouter();
  const slug = router.pathname;

  const wallet = useAnchorWallet();

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
    if (wallet && userData) {
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
        className="flex items-center w-full justify-between px-10  rounded-lg shadow-xl"
        style={{
          padding: "0.5em 1.5em",
          background: "transparent",
          // borderBottom: "1px solid  rgb(9, 194, 246)",
        }}
      >
        <div onClick={() => navigate(HOME)}>
          <img
            src={derugPfp.src}
            style={{
              width: "12em",
              paddingLeft: "1em",
              cursor: "pointer",
              filter: "drop-shadow(rgb(9, 194, 246) 0px 0px 1px)",
            }}
          />
        </div>
        <div className="flex">
          {/* <Header.Item full>
      <motion.button className="font-mono" {...FADE_IN_ANIMATION_SETTINGS}>
        
      </motion.button>
    </Header.Item> */}
          <div className="flex gap-10">
            {/* <motion.button
              className="font-mono"
              {...FADE_IN_ANIMATION_SETTINGS}
            > */}
            <WalletMultiButton
              className="p-4 border border-gray-200 rounded-lg shadow"
              style={{
                // backgroundColor: "rgba(0,183,234,15px)",
                fontSize: "1em",
                fontFamily: "monospace",
                // filter: "drop-shadow(rgb(9, 194, 246) 0px 0px 15px)",
              }}
            />
            {/* </motion.button> */}
            {wallet && wallet.publicKey && (
              <div
                className="flex flex-row gap-3 cursor-pointer"
                onClick={userData ? unlinkTwitter : linkTwitter}
              >
                <div className="w-full">
                  {userData && <img src={userData.image} className="w-10" />}
                  <p className="flex gap-3 text-md">
                    {userData && userData.twitterHandle ? (
                      userData.twitterHandle
                    ) : (
                      <>
                        <FaTwitter
                          style={{
                            fontSize: "1.25em",
                            color: "rgb(9, 194, 246) ",
                          }}
                        />
                        <span>link twitter </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              // <ActionMenu>
              //   <ActionMenu.Button
              //     sx={{
              //       background: "transparent",
              //       border: "none",
              //       "&:hover": {
              //         background: "transparen",
              //       },
              //     }}
              //   >
              //     {/* <FaUserCircle
              //       style={{
              //         fontSize: "2em",
              //         cursor: "pointer",
              //         color: "rgb(9, 194, 246) ",
              //       }}
              //     /> */}
              //   </ActionMenu.Button>
              //   <ActionMenu.Overlay
              //     className="z-20"
              //     onClick={(e) => e.preventDefault()}
              //     sx={{
              //       background: "black",
              //       padding: 0,
              //       borderRadius: 0,
              //     }}
              //   >
              //     <ActionList className="z-10">
              //       <ActionList.Item className="bg-red-200">
              //         <div
              //           onClick={userData ? unlinkTwitter : linkTwitter}
              //           className="w-full border-b-[1px] border-main-blue p-0
              //           flex justify-between items-center pb-2 z-20"
              //         >
              //           {userData && (
              //             <img
              //               src={userData.image}
              //               className="rounded-[50px] w-10"
              //             />
              //           )}
              //           <p className="text-main-blue font-bold text-md">
              //             {userData ? userData.twitterHandle : "Link twitter"}
              //           </p>
              //           {userData ? (
              //             <BsLink45Deg
              //               style={{
              //                 fontSize: "1.25em",
              //                 color: "red",
              //               }}
              //             />
              //           ) : (
              //             <FaTwitter
              //               style={{
              //                 fontSize: "1.25em",
              //                 color: "rgb(9, 194, 246) ",
              //               }}
              //             />
              //           )}
              //         </div>
              //       </ActionList.Item>
              //     </ActionList>
              //   </ActionMenu.Overlay>
              // </ActionMenu>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderNav;
