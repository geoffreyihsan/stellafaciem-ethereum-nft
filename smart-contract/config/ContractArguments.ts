import { utils } from "ethers";
import CollectionConfig from "./CollectionConfig";

// Update the following array if you change the constructor arguments...
const ContractArguments = [
  CollectionConfig.tokenName,
  CollectionConfig.tokenSymbol,
  utils.parseEther(CollectionConfig.whitelistSale.price.toString()),
  CollectionConfig.maxSupply,
  CollectionConfig.maxReserve,
  CollectionConfig.whitelistSale.maxMintAmountPerTx,
  CollectionConfig.whitelistSale.maxMintPerAddr,
  CollectionConfig.hiddenMetadataUri,
] as const;

export default ContractArguments;
