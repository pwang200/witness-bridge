const { ethers, getNamedAccounts } = require("hardhat")
const doorAbi = require("../artifacts/contracts/Door.sol/Door.json").abi;

async function main() {
    door1Address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    [, , witness1] = await hre.ethers.getSigners()

    const door1 = await ethers.getContractAt(doorAbi, door1Address, witness1)
    currentValue = await door1.reserve()
    console.log(`current value is: ${currentValue}`)

    const addReserveTx = await door1.addReserve({ value: ethers.utils.parseEther("0.33") })
    receipt = await addReserveTx.wait(1)
    console.log(`receipt ${receipt.toString()}`)
    currentValue = await door1.reserve()
    console.log(`Funded! current value is: ${currentValue}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })