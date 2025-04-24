import CollectionConfigInterface from "../lib/CollectionConfigInterface";
import whitelistAddresses from "./whitelist.json";

const CollectionConfig: CollectionConfigInterface = {
  // The contract name can be updated using the following command:
  // yarn rename-contract NEW_CONTRACT_NAME
  // Please DO NOT change it manually!
  contractName: "StellaFaciem",
  tokenName: "StellaFaciem Faciem NFT",
  tokenSymbol: "SF",
  hiddenMetadataUri:
    "https://stellafaciem.mypinata.cloud/ipfs/QmdqefdwFy35x1UNnC6Md5nW2AqfvKKbrrZUQuyr6wMJT8/",
  maxSupply: 9999,
  maxReserve: 10,
  whitelistSale: {
    price: 0.0,
    maxMintAmountPerTx: 1,
    maxMintPerAddr: 1, // whitelist open
  },
  preSale: {
    price: 0.025,
    maxMintAmountPerTx: 5, // pre sale open
    maxMintPerAddr: 10,
  },
  publicSale: {
    price: 0.05,
    maxMintAmountPerTx: 5,
    maxMintPerAddr: 20, // public sale open
  },
  contractAddress: "0xE1eB84Fab87a8f19967a024c19b25078f4D905B9", // Change after deploy
  openSeaSlug: "sf-faciem-nft",
  whitelistAddresses: whitelistAddresses,
};

export default CollectionConfig;
