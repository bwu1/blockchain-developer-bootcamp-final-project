const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')
const Donation_Processor = artifacts.require('Donation_Processor')
const AutoStaking = artifacts.require('AutoStaking')



module.exports = async function(deployer, network, accounts) {
	//const tokenFarm = await TokenFarm.deployed()
	//const donation_Processor = await Donation_Processor.deployed()
	//const daiToken = await DaiToken.deployed()
/*
	console.log("upgrade contract tokenFarm:" + tokenFarm.address);
	console.log("upgrade contract donation_Processor:" + donation_Processor.address);
	console.log("upgrade contract daiToken:" + daiToken.address);


	await deployer.deploy(AutoStaking);
	const autoStaking = await AutoStaking.deployed();
	console.log("autoStaking" + autoStaking.address);

	autoStaking.link_staking_farm(tokenFarm.address);
	autoStaking.link_protocol_token(daiToken.address);


	await daiToken.transfer(autoStaking.address, '10000000000000000000000')//10,000
*/

/*

//////////////////////////////////////////////////////////////////////////////////////////////////////////Deploy v1 of TokenFarm Implementation
	// Deploy TokenFarm_Upgrade
	await deployer.deploy(TokenFarm_Upgrade)
	const tokenFarm_Upgrade = await TokenFarm_Upgrade.deployed()
	tokenFarm.set_delegate_address(tokenFarm_Upgrade.address);///link proxy contract and implementation contract
///////////////////////////////////////////////////////////////////////////////////////////////////////////





//////////////////////////////////////////////////////////////////////////Deploy Protocol Token
	await deployer.deploy(DaiToken)
	const daiToken = await DaiToken.deployed()
	await tokenFarm.link_protocol_token(daiToken.address);
	await daiToken.link_staking_farm(tokenFarm.address);//link staking contract and allow normal transfer

	console.log("upgrade contract daiToken:" + daiToken.address);
	//await daiToken.excludeFromFee(donation_Processor.address);//allow normal transfer
	//await daiToken.excludeFromFee("0x03cAA949852054FB5B783114BfA60f7Da423cC99");//allow normal transfer
	//await daiToken.transfer(tokenFarm.address, '40000000000000000000000000')//40% of total supply allocated to staking rewards
	//await daiToken.transfer(donation_Processor.address, '10000000000000000000000000')//10% of total supply allocated to donor rewards//
	//await daiToken.transfer("0x03cAA949852054FB5B783114BfA60f7Da423cC99", '40000000000000000000000000')//Send 40 Million to Ganache account #2
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



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
