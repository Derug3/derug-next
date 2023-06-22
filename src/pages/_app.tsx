import "../styles/globals.css";
import App, { AppContext, AppProps } from "next/app";
import WalletWrapper from "@/components/WalletWrapper/WalletWrapper";
import { gqlClient } from "@/utilities/utilities";
import { ApolloProvider } from "@apollo/client";
import { Header } from "@primer/react";
import { Toaster } from "react-hot-toast";
import { Router } from "react-router";
import HeaderNav from "@/components/Header/HeaderNav";

function DerugApp({ Component, pageProps }: any) {
  return (
    <>
      <ApolloProvider client={gqlClient}>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "",
            style: {
              border: "1px solid rgb(9, 194, 246",
              padding: "16px",
              background: "#0d1117",
              color: "white",
            },
          }}
        />
        <WalletWrapper>
          <>
            <HeaderNav />
            <Header />
            <Component {...pageProps} />
          </>
        </WalletWrapper>
      </ApolloProvider>
    </>
  );
}

export default DerugApp;
