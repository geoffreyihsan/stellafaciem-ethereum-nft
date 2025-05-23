import React from "react";
import { ethers, BigNumber } from "ethers";
import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import detectEthereumProvider from "@metamask/detect-provider";
import NftContractType from "../lib/NftContractType";
import CollectionConfig from "../../../../smart-contract/config/CollectionConfig";
import CollectionStatus from "./CollectionStatus";
import MintWidget from "./MintWidget";
import Whitelist from "../lib/Whitelist";

const ContractAbi = require("../../../../smart-contract/artifacts/contracts/" +
  CollectionConfig.contractName +
  ".sol/" +
  CollectionConfig.contractName +
  ".json").abi;

interface Props {}

interface State {
  userAddress: string | null;
  network: ethers.providers.Network | null;
  totalSupply: number;
  maxSupply: number;
  maxMintAmountPerTx: number;
  tokenPrice: BigNumber;
  isPaused: boolean;
  isWhitelistMintEnabled: boolean;
  isUserInWhitelist: boolean;
  merkleProofManualAddress: string;
  merkleProofManualAddressFeedbackMessage: string | JSX.Element | null;
  etherscanUrl: string;
  errorMessage: string | JSX.Element | null;
  mintFeedback: string | JSX.Element | null;
}

const defaultState: State = {
  userAddress: null,
  network: null,
  totalSupply: 0,
  maxSupply: 0,
  maxMintAmountPerTx: 0,
  tokenPrice: BigNumber.from(0),
  isPaused: true,
  isWhitelistMintEnabled: false,
  isUserInWhitelist: false,
  merkleProofManualAddress: "",
  merkleProofManualAddressFeedbackMessage: null,
  etherscanUrl: "",
  errorMessage: null,
  mintFeedback: null,
};

export default class Dapp extends React.Component<Props, State> {
  provider!: Web3Provider;

  contract!: NftContractType;

  // private merkleProofManualAddressInput!: HTMLInputElement;

  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  componentDidMount = async () => {
    // Update the default state with a generic URL before we know the actual network through the connected wallet
    defaultState.etherscanUrl = this.generateEtherscanUrl();

    const browserProvider =
      (await detectEthereumProvider()) as ExternalProvider;

    if (browserProvider?.isMetaMask !== true) {
      this.setState({
        errorMessage: (
          <>
            We were not able to detect <strong>MetaMask</strong>. We value{" "}
            <strong>privacy and security</strong> a lot so we limit the wallet
            options on the DAPP.
            <br />
            <br />
            But don't worry! You can always interact with the smart-contract
            through{" "}
            <a href={defaultState.etherscanUrl} target="_blank">
              Etherscan
            </a>{" "}
            and{" "}
            <strong>
              we do our best to provide you with the best user experience
              possible
            </strong>
            , even from there.
            {/* <br />
            <br />
            You can also get your <strong>Whitelist Proof</strong> manually,
            using the tool below. */}
          </>
        ),
      });
    }

    this.provider = new ethers.providers.Web3Provider(browserProvider);

    this.registerWalletEvents(browserProvider);

    await this.initWallet();
  };

  async mintTokens(amount: number): Promise<void> {
    try {
      await this.contract.mint(amount, {
        value: this.state.tokenPrice.mul(amount),
      });

      return this.setState({
        mintFeedback: (
          <>
            <br />
            You are now the proud owner of a <strong>Stella Faciem NFT</strong>!
            <br />
            You will be able to see the NFT in your profile on{" "}
            <a href={this.generateOpenSeaUrl()} target="_blank">
              OpenSea
            </a>{" "}
            & Metamask.
            <br />
            <br />
            Or you can check it via this link:
            <br />
            <a href={this.generateNFTUrl()} target="_blank">
              https://opensea.io/assets/
              <br />
              (our_contract_address)/(your_tokenID*)
            </a>
            <br />
            <br />
            <strong>
              * change "your_tokenID" with your owned SF token ID.
            </strong>
          </>
        ),
      });
    } catch (e) {
      this.setError(e);
    }
  }

  async whitelistMintTokens(amount: number): Promise<void> {
    try {
      await this.contract.whitelistMint(
        amount,
        Whitelist.getProofForAddress(this.state.userAddress!),
        { value: this.state.tokenPrice.mul(amount) }
      );
      return this.setState({
        mintFeedback: (
          <>
            <br />
            You are now the proud owner of a <strong>Stella Faciem NFT</strong>!
            <br />
            You will be able to see the NFT in your profile on{" "}
            <a href={this.generateOpenSeaUrl()} target="_blank">
              OpenSea
            </a>{" "}
            & Metamask.
            <br />
            <br />
            Or you can check it via this link:
            <br />
            <a href={this.generateNFTUrl()} target="_blank">
              https://opensea.io/assets/
              <br />
              (our_contract_address)/(your_tokenID*)
            </a>
            <br />
            <br />
            <strong>
              * change "your_tokenID" with your owned SF token ID.
            </strong>
          </>
        ),
      });
    } catch (e) {
      this.setError(e);
    }
  }

  private isWalletConnected(): boolean {
    return this.state.userAddress !== null;
  }

  private isContractReady(): boolean {
    return this.contract !== undefined;
  }

  private isSoldOut(): boolean {
    return (
      this.state.maxSupply !== 0 &&
      this.state.totalSupply < this.state.maxSupply
    );
  }

  private isNotMainnet(): boolean {
    return this.state.network !== null && this.state.network.chainId !== 1;
  }

  // private copyMerkleProofToClipboard(): void {
  //   const merkleProof = Whitelist.getRawProofForAddress(
  //     this.state.userAddress ?? this.state.merkleProofManualAddress
  //   );

  //   if (merkleProof.length < 1) {
  //     this.setState({
  //       merkleProofManualAddressFeedbackMessage:
  //         "The given address is not in the whitelist, please double-check.",
  //     });

  //     return;
  //   }

  //   navigator.clipboard.writeText(merkleProof);

  //   this.setState({
  //     merkleProofManualAddressFeedbackMessage: (
  //       <>
  //         <strong>Congratulations!</strong> <span className="emoji">🎉</span>
  //         <br />
  //         Your Merkle Proof <strong>has been copied to the clipboard</strong>.
  //         You can paste it into{" "}
  //         <a href={this.state.etherscanUrl} target="_blank">
  //           Etherscan
  //         </a>{" "}
  //         to claim your tokens.
  //       </>
  //     ),
  //   });
  // }

  render() {
    return (
      <>
        <div className="container">
          <div className="logo">
            <a href="https://stellafaciem.com/">
              <img src="/build/images/sf-logo.svg" alt="Stella Faciem Logo" />
            </a>
          </div>
          <div className="preview">
            <img src="/build/images/preview.gif" alt="Collection preview" />
          </div>

          {this.isNotMainnet() ? (
            <div className="not-mainnet">
              You are not connected to the main network.
              <span className="small">
                Current network: <strong>{this.state.network?.name}</strong>
              </span>
            </div>
          ) : null}

          {this.state.errorMessage ? (
            <div className="error">
              <p>{this.state.errorMessage}</p>
              <button onClick={() => this.setError()}>Close</button>
            </div>
          ) : null}

          {this.isWalletConnected() ? (
            <>
              {this.isContractReady() ? (
                <>
                  <div className="container-above">
                    {this.state.mintFeedback ? (
                      <div className="mintFeedback">
                        <p>{this.state.mintFeedback}</p>
                        <button onClick={() => this.closeMintFeedback()}>
                          Close
                        </button>
                      </div>
                    ) : null}
                    {this.state.totalSupply < this.state.maxSupply ? (
                      <MintWidget
                        maxSupply={this.state.maxSupply}
                        totalSupply={this.state.totalSupply}
                        tokenPrice={this.state.tokenPrice}
                        maxMintAmountPerTx={this.state.maxMintAmountPerTx}
                        isPaused={this.state.isPaused}
                        isWhitelistMintEnabled={
                          this.state.isWhitelistMintEnabled
                        }
                        isUserInWhitelist={this.state.isUserInWhitelist}
                        mintTokens={(mintAmount) => this.mintTokens(mintAmount)}
                        whitelistMintTokens={(mintAmount) =>
                          this.whitelistMintTokens(mintAmount)
                        }
                      />
                    ) : null}
                    {this.state.totalSupply == this.state.maxSupply ? (
                      <div className="collection-sold-out">
                        <h2>
                          Tokens have been <strong>sold out</strong>!{" "}
                          <span className="emoji">🥳</span>
                        </h2>
                        You can buy from our beloved holders on{" "}
                        <a href={this.generateOpenSeaUrl()} target="_blank">
                          OpenSea
                        </a>
                        .
                      </div>
                    ) : null}
                  </div>
                  <div className="container-below">
                    <CollectionStatus
                      userAddress={this.state.userAddress}
                      maxSupply={this.state.maxSupply}
                      totalSupply={this.state.totalSupply}
                      isPaused={this.state.isPaused}
                      isWhitelistMintEnabled={this.state.isWhitelistMintEnabled}
                      isUserInWhitelist={this.state.isUserInWhitelist}
                    />
                  </div>

                  {/* <div className="collection-on-etherscan">
                    <div className="use-etherscan">
                      Hi Stellars, if you're looking for a{" "}
                      <strong>safe experience</strong>,
                      <br />
                      You can interact with the smart-contract{" "}
                      <strong>directly</strong> through{" "}
                      <a href={this.state.etherscanUrl} target="_blank">
                        Etherscan
                      </a>
                      <br />
                      <br />
                      Stay safe!
                      <br />
                      <br />
                      Or you can buy from our beloved holders on{" "}
                      <a href={this.generateOpenSeaUrl()} target="_blank">
                        OpenSea
                      </a>
                    </div>
                  </div> */}
                </>
              ) : (
                <div className="collection-not-ready">
                  <svg
                    className="spinner"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading collection data...
                </div>
              )}
            </>
          ) : null}

          {!this.isWalletConnected() || !this.isSoldOut() ? (
            <div className="no-wallet">
              {!this.isWalletConnected() ? (
                <button
                  className="secondary"
                  disabled={this.provider === undefined}
                  onClick={() => this.connectWallet()}
                >
                  Connect Wallet
                </button>
              ) : null}

              <div className="use-etherscan">
                Hi Stellars, if you're looking for a{" "}
                <strong>safe experience</strong>,{" "}
                {/* <span className="emoji">😃</span> */}
                <br />
                You can interact with the smart-contract{" "}
                <strong>directly</strong> through{" "}
                <a href={this.state.etherscanUrl} target="_blank">
                  Etherscan
                </a>
                {/* <span className="emoji">🚀</span> */}
                <br />
                <br />
                Stay safe!
                {/* <span className="emoji">❤️</span> */}
              </div>

              {/* {!this.isWalletConnected() || this.state.isWhitelistMintEnabled ? (
              <div className="merkle-proof-manual-address">
                <h2>Whitelist Proof</h2>
                <p>
                  Anyone can generate the proof using any public address in the
                  list, but <strong>only the owner of that address</strong> will
                  be able to make a successful transaction by using it.
                </p>
                {this.state.merkleProofManualAddressFeedbackMessage ? (
                  <div className="feedback-message">
                    {this.state.merkleProofManualAddressFeedbackMessage}
                  </div>
                ) : null}
                <label htmlFor="merkle-proof-manual-address">
                  Public address:
                </label>
                <input
                  id="merkle-proof-manual-address"
                  type="text"
                  placeholder="0x000..."
                  disabled={this.state.userAddress !== null}
                  value={
                    this.state.userAddress ??
                    this.state.merkleProofManualAddress
                  }
                  ref={(input) => (this.merkleProofManualAddressInput = input!)}
                  onChange={() => {
                    this.setState({
                      merkleProofManualAddress:
                        this.merkleProofManualAddressInput.value,
                    });
                  }}
                />{" "}
                <button onClick={() => this.copyMerkleProofToClipboard()}>
                  Generate and copy to clipboard
                </button>
              </div>
            ) : null} */}
            </div>
          ) : null}
        </div>
      </>
    );
  }

  private setError(error: any = null): void {
    let errorMessage = "Unknown error...";

    if (null === error || typeof error === "string") {
      errorMessage = error;
    } else if (typeof error === "object") {
      // Support any type of error from the Web3 Provider...
      if (error?.error?.message !== undefined) {
        errorMessage = error.error.message;
      } else if (error?.data?.message !== undefined) {
        errorMessage = error.data.message;
      } else if (error?.message !== undefined) {
        errorMessage = error.message;
      }
    }

    this.setState({
      errorMessage:
        null === errorMessage
          ? null
          : errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
    });
  }

  private closeMintFeedback(): void {
    this.setState({
      mintFeedback: null,
    });
  }

  private generateEtherscanUrl(): string {
    return `https://etherscan.io/address/${CollectionConfig.contractAddress}`;
  }

  private generateOpenSeaUrl(): string {
    return (
      `https://opensea.io/` +
      (CollectionConfig.openSeaSlug
        ? "collection/" + CollectionConfig.openSeaSlug
        : null)
    );
  }

  private generateNFTUrl(): string {
    return (
      `https://opensea.io/` +
      (CollectionConfig.contractAddress
        ? "assets/" + CollectionConfig.contractAddress
        : null) +
      "/"
    );
  }

  // private generateNFTUrl(): string {
  //   const subdomain = this.state.network?.chainId === 1 ? "www" : "testnets";

  //   return (
  //     `https://${subdomain}.opensea.io/` +
  //     (CollectionConfig.contractAddress
  //       ? "assets/" + CollectionConfig.contractAddress
  //       : null) +
  //     "/"
  //   );
  // }

  private async connectWallet(): Promise<void> {
    try {
      await this.provider.provider.request!({ method: "eth_requestAccounts" });

      this.initWallet();
    } catch (e) {
      this.setError(e);
    }
  }

  private async initWallet(): Promise<void> {
    const walletAccounts = await this.provider.listAccounts();

    this.setState(defaultState);

    if (walletAccounts.length === 0) {
      return;
    }

    this.setState({
      userAddress: walletAccounts[0],
      network: await this.provider.getNetwork(),
    });

    if (
      (await this.provider.getCode(CollectionConfig.contractAddress!)) === "0x"
    ) {
      this.setState({
        errorMessage:
          "Could not find the contract, are you connected to the right chain?",
      });

      return;
    }

    this.contract = new ethers.Contract(
      CollectionConfig.contractAddress!,
      ContractAbi,
      this.provider.getSigner()
    ) as NftContractType;

    this.setState({
      maxSupply: (await this.contract.maxSupply()).toNumber(),
      totalSupply: (await this.contract.totalSupply()).toNumber(),
      maxMintAmountPerTx: (await this.contract.maxMintAmountPerTx()).toNumber(),
      tokenPrice: await this.contract.cost(),
      isPaused: await this.contract.paused(),
      isWhitelistMintEnabled: await this.contract.whitelistMintEnabled(),
      isUserInWhitelist: Whitelist.contains(this.state.userAddress ?? ""),
      etherscanUrl: this.generateEtherscanUrl(),
    });
  }

  private registerWalletEvents(browserProvider: ExternalProvider): void {
    // @ts-ignore
    browserProvider.on("accountsChanged", () => {
      this.initWallet();
    });

    // @ts-ignore
    browserProvider.on("chainChanged", () => {
      window.location.reload();
    });
  }
}
