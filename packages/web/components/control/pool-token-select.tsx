import Image from "next/image";
import { FunctionComponent, useState } from "react";
import classNames from "classnames";
import { Token, PoolAssetInfo } from "../assets";
import { CustomClasses, MobileProps } from "../types";

/** Used to select a token token from within a pool. */
export const PoolTokenSelect: FunctionComponent<
  {
    tokens: PoolAssetInfo[];
    selectedTokenDenom: string;
    onSelectToken: (coinDenom: string) => void;
  } & CustomClasses &
    MobileProps
> = ({
  tokens,
  selectedTokenDenom,
  onSelectToken,
  className,
  isMobile = false,
}) => {
  const selectedToken = tokens.find(
    (token) => token.coinDenom === selectedTokenDenom
  );
  const tokenIndex = (denom: string) =>
    tokens.findIndex((token) => token.coinDenom === denom);
  let [isToggleOpen, setToggleOpen] = useState(false);

  if (!selectedToken) return null;

  return (
    <div>
      <div
        className={classNames(
          "md:p-1 p-3 flex hover:bg-card cursor-pointer",
          {
            "bg-card rounded-t-xl md:w-48 w-64": isToggleOpen,
            "rounded-xl": !isToggleOpen,
          },
          className
        )}
      >
        <div
          className="relative flex md:gap-1 gap-3"
          onClick={() => setToggleOpen(!isToggleOpen)}
        >
          <Token
            {...selectedToken}
            ringColorIndex={tokenIndex(selectedToken.coinDenom)}
            isMobile={isMobile}
          />
          <div
            className={classNames("my-auto transition shrink-0", {
              "rotate-180": isToggleOpen,
            })}
          >
            <Image
              alt=""
              src="/icons/chevron-down.svg"
              height={isMobile ? 15 : 20}
              width={isMobile ? 15 : 20}
            />
          </div>
        </div>
      </div>
      {isToggleOpen && (
        <TokensDropdown
          tokens={tokens.filter(
            (token) => token.coinDenom !== selectedTokenDenom
          )}
          onSelect={(coinDenom) => {
            setToggleOpen(false);
            onSelectToken(coinDenom);
          }}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

const TokensDropdown: FunctionComponent<
  {
    tokens: PoolAssetInfo[];
    onSelect: (coinDenom: string) => void;
  } & MobileProps
> = ({ tokens, onSelect, isMobile = false }) => (
  <div className="absolute flex flex-col bg-card rounded-b-xl z-50 md:w-52 w-64">
    {tokens.map((token, index) => (
      <div
        className={classNames(
          "hover:bg-white-faint cursor-pointer p-5 md:p-2 border-t border-dashed border-white-faint",
          { "rounded-b-xl": index === tokens.length - 1 }
        )}
        key={token.coinDenom}
        onClick={() => onSelect(token.coinDenom)}
      >
        <Token {...token} ringColorIndex={index} isMobile={isMobile} />
      </div>
    ))}
  </div>
);
