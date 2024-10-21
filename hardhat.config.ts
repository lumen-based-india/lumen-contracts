import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-ignition";
dotenv.config();

// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey =
  process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ??
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// If not set, it uses BuidlGuidl's Etherscan default API key.
const etherscanApiKey =
  process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  defaultNetwork: "localhost",
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [deployerPrivateKey],
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [deployerPrivateKey],
    },
  },
  etherscan: {
    apiKey: `${etherscanApiKey}`,
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api/",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
