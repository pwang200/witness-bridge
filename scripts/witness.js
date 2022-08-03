const { ethers } = require("hardhat")
const doorAbi = require("../artifacts/contracts/Door.sol/Door.json").abi;
const bridgeParameter = require("../bridgeParameter.js")
require("dotenv").config()
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const account_sk = process.env.WITNESS1_SK

async function main() {
    let provider1 = ethers.getDefaultProvider("http://127.0.0.1:8545")
    let provider2 = ethers.getDefaultProvider("http://34.217.71.3:8545")
    let wallet_facing1 = new ethers.Wallet(account_sk, provider1)
    let wallet_facing2 = new ethers.Wallet(account_sk, provider2)
    const door1 = await ethers.getContractAt(doorAbi, bridgeParameter.door1, wallet_facing1)
    const door2 = await ethers.getContractAt(doorAbi, bridgeParameter.door2, wallet_facing2)

    filter1 = {
        address: door1.address,
        topics: [
            // the name of the event, parnetheses containing the data type of each event, no spaces
            // ethers.utils.id("FundEvent(address,uint256)")
            ethers.utils.id("XChainCommitEvent(uint8,uint32,uint256,uint256,address,bytes)")
        ]
    }

    door1.on(filter1, async (t, cid, amount, reward, source, dest) => {
        console.log(`XChainCommitEvent! ${t} ${cid} ${amount} ${reward} ${source} ${dest}`)
        if (t == 1) {
            tx = await door2.XChainAddTransferAttestation(cid, amount, reward, dest, source)
            await tx.wait(1)
            console.log(`door2 XChainAddTransferAttestation sent!`)
        }
        else {
            tx = await door2.XChainAddCreateAccountAttestation(cid, amount, reward, dest)
            await tx.wait(1)
            console.log(`door2 XChainAddCreateAccountAttestation sent!`)
        }
    })
    filter2 = {
        address: door2.address,
        topics: [
            // the name of the event, parnetheses containing the data type of each event, no spaces
            // ethers.utils.id("FundEvent(address,uint256)")
            ethers.utils.id("XChainCommitEvent(uint8,uint32,uint256,uint256,address,bytes)")
        ]
    }
    door2.on(filter2, async (t, cid, amount, reward, source, dest) => {
        console.log(`XChainCommitEvent! ${t} ${cid} ${amount} ${reward} ${source} ${dest}`)
        if (t == 1) {
            tx = await door1.XChainAddTransferAttestation(cid, amount, reward, dest, source)
            await tx.wait(1)
            console.log(`door1 XChainAddTransferAttestation sent!`)
        }
        else {
            tx = await door1.XChainAddCreateAccountAttestation(cid, amount, reward, dest)
            await tx.wait(1)
            console.log(`door1 XChainAddCreateAccountAttestation sent!`)
        }
    })

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


        //tx = await 
        //door1.XChainCommit(a, bridgeParameter.sigRewardMin, bob.address, { value: bridgeParameter.transferMin })
        //await tx.wait(1)
    // tx = await door2.XChainClaimIdCreate(alice.address)
    // console.log(`tx ${tx.toString()}`)
    // r = await tx.wait(1)
    // console.log(`r ${r.toString()}`)

//     const { ethers, getNamedAccounts } = require("hardhat")
// const doorAbi = require("../artifacts/contracts/Door.sol/Door.json").abi;

// async function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function main() {
//     //    door1Address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//     door1Address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

//     [, , witness] = await hre.ethers.getSigners()

//     const door1 = await ethers.getContractAt(doorAbi, door1Address, witness)
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