const { ethers } = require("hardhat")
const doorAbi = require("../artifacts/contracts/Door.sol/Door.json").abi;
const bridgeParameter = require("../bridgeParameter.js")
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const account_sk = process.env.ALICE_SK
const bob_address = process.env.BOB

async function main() {
    let provider1 = ethers.getDefaultProvider("http://127.0.0.1:8545")
    let provider2 = ethers.getDefaultProvider("http://34.217.71.3:8545")
    let wallet_facing1 = new ethers.Wallet(account_sk, provider1)
    let wallet_facing2 = new ethers.Wallet(account_sk, provider2)
    const door1 = await ethers.getContractAt(doorAbi, bridgeParameter.door1, wallet_facing1)
    const door2 = await ethers.getContractAt(doorAbi, bridgeParameter.door2, wallet_facing2)

    filter = {
        address: door2.address,
        topics: [
            // the name of the event, parnetheses containing the data type of each event, no spaces
            // ethers.utils.id("FundEvent(address,uint256)")
            ethers.utils.id("XChainClaimIdEvent(bytes,uint32)")
        ]
    }

    door2.on(filter, (source, a) => {
        console.log(`XChainClaimIdEvent! ${source} ${a}`)
        //tx = await 
        door1.XChainCommit(a, bridgeParameter.sigRewardMin, bob_address, { value: bridgeParameter.transferMin })
        //await tx.wait(1)
        console.log(`XChainCommit sent!`)
    })

    tx = await door2.XChainClaimIdCreate(wallet_facing1.address)
    console.log(`tx ${tx.toString()}`)
    r = await tx.wait(1)
    console.log(`r ${r.toString()}`)

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