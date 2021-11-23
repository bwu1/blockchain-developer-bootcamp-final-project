const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')
const TokenFarm_Upgrade = artifacts.require('TokenFarm_Upgrade')
const Donation_Processor = artifacts.require('Donation_Processor')
const Donation_Upgrade = artifacts.require('Donation_Upgrade')



module.exports = async function(deployer, network, accounts) {





/*


	const tokenFarm = await TokenFarm.deployed()
	const donation_Processor = await Donation_Processor.deployed()


//////////////////////////////////////////////////////////////////////////////////////////////////////////Deploy v1 of TokenFarm Implementation
	// Deploy TokenFarm_Upgrade
	await deployer.deploy(TokenFarm_Upgrade)
	const tokenFarm_Upgrade = await TokenFarm_Upgrade.deployed()
	tokenFarm.set_delegate_address(tokenFarm_Upgrade.address);///link proxy contract and implementation contract
///////////////////////////////////////////////////////////////////////////////////////////////////////////

*/









///////////////////////////////////////////////////////////////////////////////////////////////////Deploy v2+ of Donation Implementation
/*
	// Deploy Upgraded Donation Version
	await deployer.deploy(Donation_Upgrade)
	const donation_Upgrade = await Donation_Upgrade.deployed()
	donation_Processor.set_delegate_address(donation_Upgrade.address);///link proxy contract and implementation contract
*/
///////////////////////////////////////////////////////////////////////////////////////////////////////////

};
