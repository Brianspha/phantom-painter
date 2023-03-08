require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-dependency-compiler");
require('dotenv').config({})
module.exports = {
  networks: {
    hardhat: {},
    "mantle-testnet": {
      url: "https://rpc.testnet.mantle.xyz/",
      accounts: [process.env.PRIVATE_KEY] // Uses the private key from the .env file
    },
    local: {
      url: "http://localhost:8545",
      chainId: 31337,
      live: true,
      saveDeployments: true,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.6.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5000,
          },
        },
      },
      {
        version: "0.8.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5000,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5000,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5000,
          },
        },
      },
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5000,
          },
        },
      },
    ],
  },
  dependencyCompiler: {
    paths: [
      "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol",
      "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol",
      "solmate/src/tokens/WETH.sol",
    ],
  },
};
