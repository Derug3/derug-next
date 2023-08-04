import { DerugForm } from "@/interface/derug.interface";
import { selectStyles } from "@/utilities/styles";
import Select from "react-select";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import {
  ITreasuryTokenAccInfo,
  mint,
  usdcMint,
  usdtMint,
} from "../CollectionLayout/MintDetails";
import { PublicKey } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import { TokenListProvider } from "@solana/spl-token-registry";
import useDebounce from "@/hooks/useDebounce";

const PublicMintConfig = () => {
  const methods = useForm<DerugForm>();

  const {
    register,
    clearErrors,
    formState: { errors },
  } = useFormContext<DerugForm>();

  const [availableTokensList, setAvailableTokenList] =
    useState<ITreasuryTokenAccInfo[]>();

  useEffect(() => {
    void getAllMintsInfo();
  }, []);

  const [searchLoading, toggleSearchLoading] = useState(false);
  const [searchValue, setSearchValue] = useState<string>();

  const { name } = useDebounce(searchValue);

  const handleFilerCurrency = async () => {
    toggleSearchLoading(true);
    if (name && name.length > 0) {
      const tokens = await new TokenListProvider().resolve();

      const filteredTokens = tokens
        .getList()
        .filter(
          (t) =>
            t.name.toLocaleLowerCase().startsWith(name.toLocaleLowerCase()) ||
            t.symbol.toLocaleLowerCase().startsWith(name.toLocaleLowerCase())
        );

      setAvailableTokenList(
        filteredTokens.map((t) => {
          return { ...t, address: new PublicKey(t.address) };
        })
      );
    } else {
      await getAllMintsInfo();
    }
    toggleSearchLoading(false);
  };

  useEffect(() => {
    void handleFilerCurrency();
  }, [name]);

  const getAllMintsInfo = async () => {
    const availableToken: ITreasuryTokenAccInfo[] = [];
    const tokens = await new TokenListProvider().resolve();

    const tokenList = tokens
      .getList()
      .filter((item) => item.logoURI !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name));

    const solToken = tokenList.find(
      (item) => item.address === NATIVE_MINT.toString()
    );
    const usdcToken = tokenList.find(
      (item) => item.address === usdcMint.toString()
    );
    const unqToken = tokenList.find((item) => item.address === mint.toString());
    const usdtToken = tokenList.find(
      (item) => item.address === usdtMint.toString()
    );
    solToken &&
      availableToken.push({
        decimals: solToken.decimals,
        logoURI: solToken.logoURI,
        address: new PublicKey(solToken.address),
        name: "Solana",
        symbol: solToken.symbol,
        tags: solToken?.tags,
        chainId: solToken?.chainId,
        extensions: solToken?.extensions,
      });

    usdcToken &&
      availableToken.push({
        decimals: usdcToken.decimals,
        logoURI: usdcToken.logoURI,
        address: new PublicKey(usdcToken.address),
        name: usdcToken.name,
        symbol: usdcToken.symbol,
        tags: usdcToken?.tags,
        chainId: usdcToken?.chainId,
        extensions: usdcToken?.extensions,
      });

    unqToken &&
      availableToken.push({
        decimals: unqToken.decimals,
        logoURI: unqToken.logoURI,
        address: new PublicKey(unqToken.address),
        name: unqToken.name,
        symbol: unqToken.symbol,
        tags: unqToken?.tags,
        chainId: unqToken?.chainId,
        extensions: unqToken?.extensions,
      });

    usdtToken &&
      availableToken.push({
        decimals: usdtToken.decimals,
        logoURI: usdtToken.logoURI,
        address: new PublicKey(usdtToken.address),
        name: "Tether",
        symbol: usdtToken.symbol,
        tags: usdtToken?.tags,
        chainId: usdtToken?.chainId,
        extensions: usdtToken?.extensions,
      });
    setAvailableTokenList(availableToken);
  };

  const renderSelect = useMemo(() => {
    return (
      availableTokensList?.length && (
        <div className="flex flex-col w-full gap-4">
          <Select
            className="border border-gray-700 rounded-lg shadow-lg px-2"
            placeholder="select token"
            isLoading={searchLoading}
            onInputChange={(e) => setSearchValue(e)}
            onChange={(e) => {
              clearErrors("selectedMint");
            }}
            defaultValue={availableTokensList[0]}
            styles={selectStyles}
            options={availableTokensList}
            getOptionLabel={(option: ITreasuryTokenAccInfo) => option.name}
            getOptionValue={(option: ITreasuryTokenAccInfo) => option.symbol}
            formatOptionLabel={(e: any) => (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: "0.5em",
                  zIndex: 100,
                  gap: "1em",
                }}
              >
                <img
                  style={{ width: "1.5em", height: "1.5em" }}
                  src={e.logoURI}
                />
                <h3 className="text-white">{e.name}</h3>
              </div>
            )}
          />
          {errors.selectedMint?.message && (
            <p className="text-red-500">
              {errors.selectedMint.message as string}
            </p>
          )}
        </div>
      )
    );
  }, [availableTokensList, searchLoading]);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-[5%]">
        <input
          className="bg-gray-800"
          {...methods.register("price", {
            min: {
              value: 0,
              message: "Minimum price is 0",
            },
            required: {
              value: true,
              message: "Price can't be empty in public mint",
            },
          })}
          type={"number"}
          placeholder="price"
          min="0"
          step={"0.00001"}
          accept="number"
        />
        {renderSelect}
      </div>
    </div>
  );
};

export default PublicMintConfig;
