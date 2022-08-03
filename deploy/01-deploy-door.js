//const { door1 } = require("../bridgeParameter.js")
let bridgeParameter = require("../bridgeParameter.js")

module.exports = async ({ getNamedAccounts }) => {
    const [deployer, witness1, witness2] = await hre.ethers.getSigners()
    let witnesses = [witness1.address, witness2.address]
    doorFactory = await ethers.getContractFactory("Door", deployer)
    door1 = await doorFactory.deploy(
        bridgeParameter.quorum,
        bridgeParameter.transferMin,
        bridgeParameter.accountCreateMin,
        bridgeParameter.sigRewardMin,
        witnesses, { value: bridgeParameter.initReserve });
    await door1.deployed()
    door2 = await doorFactory.deploy(
        bridgeParameter.quorum,
        bridgeParameter.transferMin,
        bridgeParameter.accountCreateMin,
        bridgeParameter.sigRewardMin,
        witnesses, { value: bridgeParameter.initReserve });
    await door2.deployed()
    bridgeParameter.door1 = door1.address
    bridgeParameter.door2 = door2.address
    console.log(`deployers ${deployer.address} `)
    console.log(`two doors ${bridgeParameter.door1} ${bridgeParameter.door2}`)
    //console.log(`two doors ${door1.address} ${door2.address}`)
    console.log(`witnesses ${witness1.address} ${witness2.address}`)
}
//connect(deployer2).

/* two other ways of deploying */

// function deployFunc(hre) {
//     const {getNamedAccounts, deployments} = hre
//     //  hre.getNamedAccounts
//     console.log("hi");
// }
// module.exports.default = deployFunc

// module.exports = async ({ getNamedAccounts, deployments }) => {
//     const { deploy, log } = deployments
//     const { deployer } = await getNamedAccounts()
//     log(`Deploying...${deployer}`)
// quorum = 1
// transferMin = 2
// accountCreateMin = 10
// sigRewardMin = 1
// witnesses = ["0x16DD346Aa1483264DBb0Dde64235081C867fb3f2"]
//     await deploy("Door", {
//         contract: "Door",
//         from: deployer,
//         log: true,
//         args: [quorum, transferMin, accountCreateMin, sigRewardMin, witnesses],
//     })
// }

    // quorum = 2
    // transferMin = 10_000_000_000_000_000n
    // accountCreateMin = 20_000_000_000_000_000n
    // sigRewardMin = 10_000_000_000_000_000n
    // initReserve = ethers.utils.parseEther("20")
    // witnesses = [witness1.address, witness2.address]
   // [deployer1, deployer2, witness1, witness2, Alice, Bob] = await ethers.getSigners()
    // //    const { deployer, deployer2, witness1, witness2 } = await getNamedAccounts()
    // console.log(`${deployer} and ${deployer2} and ${witness1}, ${witness2}`)

