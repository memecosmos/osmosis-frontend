import { AppCurrency, IBCCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import Image from "next/image";
import { FunctionComponent } from "react";
import { useBooleanWithWindowEvent, useFilteredData } from "../../hooks";
import { MobileProps } from "../types";

/** Will display balances if provided CoinPretty objects. Assumes denoms are unique. */
export const TokenSelect: FunctionComponent<
  {
    selectedTokenDenom: string;
    tokens: (CoinPretty | AppCurrency)[];
    onSelect: (tokenDenom: string) => void;
    sortByBalances?: boolean;
    getChainNetworkName?: (coinDenom: string) => string | undefined;
  } & MobileProps
> = ({
  selectedTokenDenom,
  tokens,
  onSelect,
  sortByBalances = false,
  getChainNetworkName,
  isMobile = false,
}) => {
  const [isSelectOpen, setIsSelectOpen] = useBooleanWithWindowEvent(false);
  const selectedToken = tokens.find((token) =>
    (token instanceof CoinPretty ? token.denom : token.coinDenom).includes(
      selectedTokenDenom
    )
  );

  const dropdownTokens = tokens
    .filter(
      (token) =>
        !(token instanceof CoinPretty ? token.denom : token.coinDenom).includes(
          selectedTokenDenom
        )
    )
    .sort((a, b) => {
      if (!(a instanceof CoinPretty) || !(b instanceof CoinPretty)) return 0;
      if (a.toDec().gt(b.toDec()) && sortByBalances) return -1;
      if (a.toDec().lt(b.toDec()) && sortByBalances) return 1;
      return 0;
    });

  const [searchValue, setTokenSearch, searchedTokens] = useFilteredData(
    dropdownTokens,
    ["denom"]
  );
  const selectedCurrency =
    selectedToken instanceof CoinPretty
      ? selectedToken.currency
      : selectedToken;
  const selectedDenom =
    selectedCurrency?.coinDenom.split(" ").slice(0, 1).join(" ") ?? "";

  const hasNeedTokenSelect = tokens.length > 1;

  return (
    <div className="flex md:justify-start justify-center items-center relative">
      {selectedCurrency && (
        <div
          className={`flex items-center group ${
            hasNeedTokenSelect ? "cursor-pointer" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasNeedTokenSelect) {
              setIsSelectOpen(!isSelectOpen);
            }
          }}
        >
          <div className="w-14 h-14 md:h-9 md:w-9 rounded-full border border-enabledGold flex items-center justify-center shrink-0 mr-3 md:mr-2">
            {selectedCurrency.coinImageUrl && (
              <div className="w-11 h-11 md:h-7 md:w-7 rounded-full overflow-hidden">
                <Image
                  src={selectedCurrency.coinImageUrl}
                  alt="token icon"
                  className="rounded-full"
                  width={isMobile ? 30 : 44}
                  height={isMobile ? 30 : 44}
                />
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center">
              {isMobile ? <h6>{selectedDenom}</h6> : <h5>{selectedDenom}</h5>}
              {hasNeedTokenSelect && (
                <div className="w-5 ml-3 md:ml-2 pb-1">
                  <Image
                    className={`opacity-40 group-hover:opacity-100 transition-transform duration-100 ${
                      isSelectOpen ? "rotate-180" : "rotate-0"
                    }`}
                    src="/icons/chevron-down.svg"
                    alt="select icon"
                    width={20}
                    height={8}
                  />
                </div>
              )}
            </div>
            <div className="subtitle2 md:caption text-iconDefault">
              {getChainNetworkName?.(selectedCurrency.coinDenom)}
            </div>
          </div>
        </div>
      )}

      {isSelectOpen && (
        <div
          className="absolute bottom-0 md:-left-3 -left-4 translate-y-full md:p-1 p-3.5 bg-surface rounded-b-2xl z-50 w-[28.5rem] md:w-[18.75rem] xs:w-[calc(100vw-64px)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center h-9 pl-4 mb-3 rounded-2xl bg-card">
            <div className="w-[1.125rem] h-[1.125rem]">
              <Image
                src="/icons/search.svg"
                alt="search"
                width={18}
                height={18}
              />
            </div>
            <input
              type="text"
              className="px-4 subtitle2 text-white-full bg-transparent font-normal"
              placeholder="Search tokens"
              onClick={(e) => e.stopPropagation()}
              value={searchValue}
              onInput={(e: any) => setTokenSearch(e.target.value)}
            />
          </div>

          <div className="token-item-list overflow-y-scroll max-h-80">
            {searchedTokens.map((token, index) => {
              const currency =
                token instanceof CoinPretty ? token.currency : token;
              const { coinDenom, coinImageUrl } = currency;
              const networkName = getChainNetworkName?.(coinDenom);
              const justDenom =
                coinDenom.split(" ").slice(0, 1).join(" ") ?? "";
              const channel =
                "paths" in currency
                  ? (currency as IBCCurrency).paths[0].channelId
                  : undefined;

              const showChannel = coinDenom.includes("channel");

              return (
                <div
                  key={index}
                  className="flex justify-between items-center rounded-2xl py-2.5 px-3 my-1 hover:bg-card cursor-pointer mr-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(coinDenom);
                    setIsSelectOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      {coinImageUrl && (
                        <div className="w-9 h-9 rounded-full mr-3">
                          <Image
                            src={coinImageUrl}
                            alt="token icon"
                            width={36}
                            height={36}
                          />
                        </div>
                      )}
                      <div>
                        <h6 className="text-white-full">{justDenom}</h6>
                        <div className="text-iconDefault md:caption font-semibold">
                          {showChannel ? channel : networkName}
                        </div>
                      </div>
                    </div>
                    <div className="md:text-sm">
                      {token instanceof CoinPretty &&
                        token.trim(true).hideDenom(true).toString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
