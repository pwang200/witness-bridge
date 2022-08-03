//require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
require("@nomiclabs/hardhat-ethers")

const DEPLOYER_SK = process.env.DEPLOYER_SK
const XRPL_EVM_URL = process.env.XRPL_EVM_URL
const LOCAL_GETH_URL = process.env.LOCAL_GETH_URL
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.8",
      },
      {
        version: "0.6.6",
      },
    ],
  },

  // etherscan: {
  //   apiKey: ETHERSCAN_API_KEY,
  // },
  gasReporter: {
    enabled: true,
    //    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  networks: {
    // localhost: {
    //   url: "http://127.0.0.1:8545/",
    //   // accounts: hardhat create already
    //   chainId: 31337,
    // },
    // rinkeby: {
    //   url: ALCHEMY_RINKEBY_URL,
    //   accounts: [RINKEBY_PRIV_KEY],
    //   chainId: 4,
    // },
    xrpl_evm: {
      url: XRPL_EVM_URL,
      accounts: [DEPLOYER_SK],
      chainId: 60,
    },
    local_geth: {
      url: LOCAL_GETH_URL,
      accounts: [DEPLOYER_SK],
      chainId: 3512,
    }
  },
  // namedAccounts: {
  //   deployer: {
  //     default: 0, // here this will by default take the first account as deployer
  //     1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
  //   },
  //   // deployer2: {
  //   //   default: 1,
  //   // },
  //   witness1: {
  //     default: 1,
  //   },
  //   witness2: {
  //     default: 2,
  //   },
  // },
};
