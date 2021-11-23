const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')
const TokenFarm_Upgrade = artifacts.require('TokenFarm_Upgrade')
const Donation_Processor = artifacts.require('Donation_Processor')
const Donation_Upgrade = artifacts.require('Donation_Upgrade')
const EthBridge = artifacts.require('EthBridge')
const EthBridge_Upgrade = artifacts.require('EthBridge_Upgrade')
const MaticBridge = artifacts.require('MaticBridge')


module.exports = async function(deployer, network, accounts) {


	// Deploy TokenFarm
	//await deployer.deploy(TokenFarm)
	//const tokenFarm = await TokenFarm.deployed()



	//Deploy Donation_Processor
	await deployer.deploy(Donation_Processor)
	const donation_Processor = await Donation_Processor.deployed()
	// Deploy Donation_Upgrade
	await deployer.deploy(Donation_Upgrade)
	const donation_Upgrade = await Donation_Upgrade.deployed()
	donation_Processor.set_delegate_address(donation_Upgrade.address);///link proxy contract and implementation contract





	//truffle migrate --reset// - Updates smart contract files
	//truffle migrate -f # --to # - Runs specific migration files
	//npm run start// - initiates React Server
	//npx kill-port 3000// - Stops React Server

};
