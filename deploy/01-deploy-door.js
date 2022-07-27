// function deployFunc(hre) {
//     const {getNamedAccounts, deployments} = hre
//     //  hre.getNamedAccounts
//     console.log("hi");
// }

// module.exports.default = deployFunc

quorum = 1
transferMin = 2
accountCreateMin = 10
sigRewardMin = 1
witnesses = ["0x16DD346Aa1483264DBb0Dde64235081C867fb3f2"]

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log(`Deploying...${deployer}`)

    await deploy("Door", {
        contract: "Door",
        from: deployer,
        log: true,
        args: [quorum, transferMin, accountCreateMin, sigRewardMin, witnesses],
    })

}