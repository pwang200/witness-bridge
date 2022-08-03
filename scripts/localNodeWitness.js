const { ethers } = require("hardhat")
const doorAbi = require("../artifacts/contracts/Door.sol/Door.json").abi;
const bridgeParameter = require("../bridgeParameter.js")
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
    [, witness1, witness2] = await hre.ethers.getSigners()
    const door1 = await ethers.getContractAt(doorAbi, bridgeParameter.door1, witness1)
    const door2 = await ethers.getContractAt(doorAbi, bridgeParameter.door2, witness1)
    // const door22 = await ethers.getContractAt(doorAbi, bridgeParameter.door2, witness2)

    filter = {
        address: door1.address,
        topics: [
            // the name of the event, parnetheses containing the data type of each event, no spaces
            // ethers.utils.id("FundEvent(address,uint256)")
            ethers.utils.id("XChainCommitEvent(uint8,uint32,uint256,uint256,bytes)")
        ]
    }

    door1.on(filter, (t, cid, amount, reward, source) => {
        console.log(`XChainCommitEvent! ${t} ${cid} ${amount} ${reward} ${source}`)
        //tx = await 
        //door1.XChainCommit(a, bridgeParameter.sigRewardMin, bob.address, { value: bridgeParameter.transferMin })
        //await tx.wait(1)
        //console.log(`XChainCommit sent!`)
    })

    // tx = await door2.XChainClaimIdCreate(alice.address)
    // console.log(`tx ${tx.toString()}`)
    // r = await tx.wait(1)
    // console.log(`r ${r.toString()}`)
    for (; ;) {
        await sleep(1000)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })



//     const { ethers, getNamedAccounts } = require("hardhat")
// const doorAbi = require("../artifacts/contracts/Door.sol/Door.json").abi;

// async function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function main() {
//     //    door1Address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//     door1Address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

//     [, , witness1] = await hre.ethers.getSigners()

//     const door1 = await ethers.getContractAt(doorAbi, door1Address, witness1)
//     currentValue = await door1.reserve()
//     console.log(`current value is: ${currentValue}`)

//     filter = {
//         address: door1Address,
//         topics: [
//             // the name of the event, parnetheses containing the data type of each event, no spaces
//             // ethers.utils.id("FundEvent(address,uint256)")
//             ethers.utils.id("XChainClaimIdEvent(bytes,uint32)")
//         ]
//     }

//     await door1.on(filter, (source, a) => {
//         console.log(`FundEventFund! ${ethers.utils.isBytes(source)} ${a}`)
//         console.log(`FundEventFund! ${ethers.utils.isBytesLike(source)} ${a}`)
//         console.log(`FundEventFund! ${ethers.utils.isHexString(source)} ${a}`)
//         console.log(`FundEventFund! ${source} ${a}`)
//     })

//     //TODO
//     for (; ;) {
//         await sleep(1000)
//     }
// }

// main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.error(error)
//         process.exit(1)
//     })