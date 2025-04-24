interface SaleConfig {
  price: number;
  maxMintAmountPerTx: number;
  maxMintPerAddr: number;
}
export default interface CollectionConfigInterface {
  contractName: string;
  tokenName: string;
  tokenSymbol: string;
  hiddenMetadataUri: string;
  maxSupply: number;
  maxReserve: number;
  whitelistSale: SaleConfig;
  preSale: SaleConfig;
  publicSale: SaleConfig;
  contractAddress: string | null;
  whitelistAddresses: string[];
  openSeaSlug: string | null;
}
