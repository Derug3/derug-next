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
import Toggle from "../Toggle";

const PublicMintConfig = () => {
  const methods = useForm<DerugForm>();
  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

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
        <div className="flex flex-col w-full">
          <Select
            className="flex w-full px-[4px] py-[2px] items-center self-stretch border border-gray-500 bg-[#1D2939] shadow-xs bg-transparent text-gray-400 text-sm font-mono text-normal"
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
    <div className="flex flex-col gap-8">
      <div className="mt-5 flex flex-col gap-5teps">
        <Toggle isChecked={isChecked} handleToggle={handleToggle} />
        {isChecked && <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-sm font-mono text-normal">
            Price
          </label>
          <div className="flex w-full gap-5">
            <input
              className="flex w-full px-[12px] py-[8px] items-center self-stretch border border-gray-500 bg-[#1D2939] shadow-xs bg-transparent text-gray-400 text-sm font-mono text-normal"
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
              min="0"
              step={"0.00001"}
              accept="number"
            />
            {renderSelect}
          </div>
        </div>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-gray-400 text-sm font-mono text-normal">
          Private mint duration
        </label>
        <div className="flex w-full gap-5 relative">
          <input
            className="flex w-full px-[12px] py-[8px] items-center self-stretch border border-gray-500 bg-[#1D2939] shadow-xs bg-transparent text-gray-400 text-sm font-mono text-normal"
            type={"number"}
            min="1"
            step={"1"}
          />
          <span className="absolute right-10 top-2 font-mono text-white">hours</span>
        </div>
      </div>
    </div>
  );
};

export default PublicMintConfig;
