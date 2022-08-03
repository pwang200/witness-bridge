const { run, network } = require("hardhat");
const hre = require("hardhat");
const bridgeParameter = require("../bridgeParameter.js")
require("dotenv").config()

async function main() {
    let witnesses = [process.env.WITNESS1, process.env.WITNESS2]
    const doorFactory = await hre.ethers.getContractFactory("Door");
    const door = await doorFactory.deploy(
        bridgeParameter.quorum,
        bridgeParameter.transferMin,
        bridgeParameter.accountCreateMin,
        bridgeParameter.sigRewardMin,
        witnesses, { value: bridgeParameter.initReserve });
    await door.deployed();
    console.log("Door deployed to:", door.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
