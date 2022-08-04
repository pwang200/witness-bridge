const { ethers } = require("hardhat")
const doorAbi = require("../artifacts/contracts/Door.sol/Door.json").abi;
const bridgeParameter = require("../bridgeParameter.js")

const account_sk = process.env.ALICE_SK
const bob_address = process.env.BOB

async function main() {
    let provider1 = ethers.getDefaultProvider("http://127.0.0.1:8545")
    let wallet_facing1 = new ethers.Wallet(account_sk, provider1)
    const door1 = await ethers.getContractAt(doorAbi, bridgeParameter.door1, wallet_facing1)

    tx = await
        door1.XChainCreateAccountCommit(bridgeParameter.sigRewardMin,
            bob_address, { value: bridgeParameter.accountCreateMin })
    r = await tx.wait(1)
    console.log(`r ${JSON.stringify(r, null, 2)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })