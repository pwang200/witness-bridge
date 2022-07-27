//const { inputToConfig } = require("@ethereum-waffle/compiler");
const { assert, expect } = require("chai");
const { ethers } = require("hardhat")

describe("Door contract tests", function () {
    //const { log } = deployments
    quorum = 2
    transferMin = 1_234_000_000n
    accountCreateMin = 2_000_000_000n
    sigRewardMin = 1_000_000_000n
    initReserve = ethers.utils.parseEther("1.0")

    let doorFactory, door1, door2, witness1, witness2, Alice, Bob
    beforeEach(async function () {
        [deployer1, deployer2, witness1, witness2, Alice, Bob] = await ethers.getSigners()
        witnesses = [witness1.address, witness2.address]

        //console.log(`deploying two doors from ${deployer1.address} and ${deployer2.address} ...`)
        doorFactory = await ethers.getContractFactory("Door", deployer1)
        door1 = await doorFactory.deploy(quorum, transferMin, accountCreateMin, sigRewardMin, witnesses, { value: initReserve });
        await door1.deployed()

        doorFactory = doorFactory.connect(deployer2)
        door2 = await doorFactory.deploy(quorum, transferMin, accountCreateMin, sigRewardMin, witnesses, { value: initReserve });
        await door2.deployed()
        //console.log(`deployed two doors at ${door1.address} and ${door2.address}`)
        //console.log(`Alice and Bob addresses ${Alice.address} ${Bob.address}`)
    })
    // describe("simpler", function () { }) // nest is ok

    it(`init reserve should be ${ethers.utils.formatUnits(initReserve, "gwei")} wei`, async function () {
        currentValue = await door1.reserve()
        assert.equal(currentValue.toString(), initReserve)
        const addReserveTx = await door1.addReserve({ value: initReserve })
        await addReserveTx.wait(1)
        currentValue = await door1.reserve()
        assert.equal(currentValue.toString(), initReserve * 2)

        currentValue = await door2.reserve()
        assert.equal(currentValue.toString(), initReserve)
    })

    it("claimId event", async function () {
        //const BobAddress = "BobAddress" //TODO Bob.address.toString() won't work
        const BobAddress = Bob.address
        await expect(door1.XChainClaimIdCreate(BobAddress))
            .to.emit(door1, "XChainClaimIdEvent")
            .withArgs(BobAddress, 1)

        // const tx = await door1.XChainClaimIdCreate("BobAddress")
        // const receipt = await tx.wait()
        // for (const event of receipt.events) {
        //     console.log(`Event ${event.event} with args ${event.args}`);
        // }
    })

    it("commit events", async function () {
        const BobAddress = Bob.address
        // enum XChainCommitType {
        //     createAccount,
        //     transferAsset
        // }
        // so createAccount's value is 0, and transferAsset's value is 1
        await expect(door2.XChainCommit(1, sigRewardMin, BobAddress, { value: transferMin }))
            .to.emit(door2, "XChainCommitEvent")
            .withArgs(1, 1, transferMin, sigRewardMin, BobAddress);

        await expect(door2.XChainCreateAccountCommit(sigRewardMin, BobAddress, { value: accountCreateMin }))
            .to.emit(door2, "XChainCommitEvent")
            .withArgs(0, 1, accountCreateMin, sigRewardMin, BobAddress);
    })

    it("transfer", async function () {
        BobAmount = ethers.BigNumber.from(await ethers.provider.getBalance(Bob.address));
        const BobAddress = Bob.address.toString()
        const AliceAddress = Alice.address.toString()

        tx = await door2.connect(Alice).XChainClaimIdCreate(AliceAddress)
        await tx.wait(1)
        tx = await door1.connect(Alice).XChainCommit(1, sigRewardMin, BobAddress, { value: transferMin })
        await tx.wait(1)
        tx = await door2.connect(witness1).XChainAddTransferAttestation(1, transferMin, sigRewardMin, Bob.address, AliceAddress)
        await tx.wait(1)
        tx = await door2.connect(witness2).XChainAddTransferAttestation(1, transferMin, sigRewardMin, Bob.address, AliceAddress)
        await tx.wait(1)

        BobAmountNew = ethers.BigNumber.from(await ethers.provider.getBalance(Bob.address));
        diff = BobAmountNew.sub(BobAmount)
        console.log(`Bob amount ${BobAmountNew} - ${BobAmount} = ${diff}`)
        assert.equal(diff, transferMin)
    })

    it("create account and witness rewards", async function () {
        clare = ethers.Wallet.createRandom()

        tx = await door1.connect(Alice).XChainCreateAccountCommit(sigRewardMin, clare.address, { value: accountCreateMin })
        await tx.wait(1)
        tx = await door2.connect(witness1).XChainAddCreateAccountAttestation(1, accountCreateMin, sigRewardMin, clare.address)
        await tx.wait(1)
        witness1Balance = ethers.BigNumber.from(await ethers.provider.getBalance(witness1.address))
        tx = await door2.connect(witness2).XChainAddCreateAccountAttestation(1, accountCreateMin, sigRewardMin, clare.address)
        await tx.wait(1)

        clareBalance = ethers.BigNumber.from(await ethers.provider.getBalance(clare.address))
        console.log(`clare address ${clare.address} balance ${clareBalance}`)
        assert.equal(clareBalance, accountCreateMin)

        witness1BalanceNew = ethers.BigNumber.from(await ethers.provider.getBalance(witness1.address))
        diff = witness1BalanceNew.sub(witness1Balance)
        expectDiff = ethers.BigNumber.from(sigRewardMin).div(2)
        console.log(`witness1 amount ${witness1BalanceNew} - ${witness1Balance} = ${diff}. expected diff = ${expectDiff}`)
        assert.isTrue(diff.eq(expectDiff))
    })
})
