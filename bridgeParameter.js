const { ethers } = require("hardhat")

// let bridgeParameter = 1;
// {
//     quorum: 2,
//     transferMin: ethers.utils.parseEther("0.001"),
//     // accountCreateMin: hre.ethers.utils.parseEther("0.02"),
//     // sigRewardMin: hre.thers.utils.parseEther("0.001"),
//     // initReserve: hre.ethers.utils.parseEther("200"),
//     //witnesses: [witness1.address, witness2.address]
// }

//[_, witness1, witness2] = await ethers.getSigners()

module.exports = {
    //const { deployer, witness1, witness2 } = await getNamedAccounts()
    quorum: 2,
    transferMin: ethers.utils.parseEther("0.001"),
    accountCreateMin: ethers.utils.parseEther("0.02"),
    sigRewardMin: ethers.utils.parseEther("0.001"),
    initReserve: ethers.utils.parseEther("10"),
    door1: "0xB3055B349C843eEcb73AF7A84981fF432a709d9D",
    door2: "0xa96F66F08E2e3665578ebEcFef61042c6e4EaFF3",
    // door1: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    // door2: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    //witnesses: [witness1.address, witness2.address]
};
