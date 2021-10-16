const Web3 = require('web3');
const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')
const Donation_Processor = artifacts.require('Donation_Processor')
const Donation_Upgrade = artifacts.require('Donation_Upgrade')




require('chai')
	.use(require('chai-as-promised'))
	.should()

function tokens(n){
	return web3.utils.toWei (n, 'ether');
}
function from_wei(n){
	return web3.utils.fromWei (n, 'ether');
}		

contract('TokenFarm', ([owner, investor]) => {

	let daiToken, tokenFarm, donation_Processor, donation_Upgrade

	before(async () => {
		



		//Load Contracts
		//daiToken = await DaiToken.new()
		//dappToken = await DappToken.new()


		//tokenFarm = await TokenFarm.new(daiToken.address)

		//donation_Processor = await Donation_Processor.new()
		donation_Processor  = await Donation_Processor.deployed()
		//donation_Upgrade = await Donation_Upgrade.new()



		var amount="1000000000000000";
		var amount2="5000000000000000";
		var amount3="4000000000000000";
		var currency="UNI";//ETH
		var charity_name="GiveCrypto Team";
		var charity_ein="0";
		var charity_wallet="0x81328d7be958662782BAD7Fe825ebF59D68Cb8a2";
		var currency_address="0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";//ETH
		var decimals="18";//18
		var unlocked_account="0x69A8Ff64ed164eD3D757831D425Fdbe904186108";//0xAd6A5BD7ca49281912992be1B726eFDEF2a91294
 
		var web3_localhost =  new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
		const this_token= new web3_localhost.eth.Contract(DappToken.abi,currency_address);

		/*
		var total_supply = await this_token.methods.totalSupply().call();
		var token_name = await this_token.methods.name().call();
		console.log(total_supply);
		console.log(token_name);
		*/





		//await this_token.methods.transfer(owner,"1000000000000000000000").send({ from: unlocked_account});
		await this_token.methods.approve(donation_Processor.address, "1000000000000000000000000").send({ from: owner});


		var check_balanceof_recipient = await this_token.methods.balanceOf(owner).call();
		console.log(check_balanceof_recipient);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////ETH Donation Test
	   console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
	   var check_withdraw_balance=await donation_Processor.get_available_withdraw_amount(charity_wallet);
	   console.log(check_withdraw_balance);
	   //await donation_Processor.send("1000000000000000000");
	  	await donation_Processor.process_donation(amount,currency,charity_name,charity_ein,charity_wallet,currency_address,decimals, {value:amount, from: owner });
	   var check_withdraw_balance=await donation_Processor.get_available_withdraw_amount(charity_wallet);
	   console.log(check_withdraw_balance);


	   await donation_Processor.process_donation(amount2,currency,charity_name,charity_ein,charity_wallet,currency_address,decimals, {value:amount2, from: owner });
	   var check_withdraw_balance2=await donation_Processor.get_available_withdraw_amount(charity_wallet);
	   console.log(check_withdraw_balance2);

	   await donation_Processor.process_donation(amount3,currency,charity_name,charity_ein,charity_wallet,currency_address,decimals, {value:amount3, from: owner });
	   var check_withdraw_balance3=await donation_Processor.get_available_withdraw_amount(charity_wallet);
	   console.log(check_withdraw_balance3);
	   console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
	   
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//var check_balanceof_recipient_after_donation = await this_token.methods.balanceOf(owner).call();
		//console.log(check_balanceof_recipient_after_donation);
		return;
		

		
		/*var total_supply = await this_token.methods.totalSupply().call();
		var token_name = await this_token.methods.name().call();
		console.log(total_supply);
		console.log(token_name);

		var check_allowance = await this_token.methods.allowance(owner,donation_Processor.address).call();
		console.log(check_allowance);
		
		let approve_token=await this_token.methods.approve(donation_Processor.address, "88888").send({ from: owner});

		var check_allowance_two = await this_token.methods.allowance(owner,donation_Processor.address).call();
		console.log(check_allowance_two);*/

		var check_balanceof_sender = await this_token.methods.balanceOf(unlocked_account).call();
		console.log(check_balanceof_sender);

		var check_balanceof_recipient = await this_token.methods.balanceOf(owner).call();
		console.log(check_balanceof_recipient);


		await this_token.methods.transfer(owner,3000000000).send({ from: unlocked_account});//send $3000 USDC


		var check_balanceof_sender_two = await this_token.methods.balanceOf(unlocked_account).call();
		console.log(check_balanceof_sender_two);

		var check_balanceof_recipient_two = await this_token.methods.balanceOf(owner).call();
		console.log(check_balanceof_recipient_two);








		
	/*	await donation_Processor.process_donation("3","ETH", "2021-06-12 09:30","Org Name", "0x03cAA949852054FB5B783114BfA60f7Da423cC99", "0xe72341A2249B99600a90Fd083dcB73401515AC88")


		await daiToken.link_staking_farm(tokenFarm.address);
		await daiToken.excludeFromFee(donation_Processor.address);
		await daiToken.excludeFromFee(investor);

		// Send tokens to investor - inside test, need to pass in a 3rd variable - who is calling the function
		await daiToken.transfer(tokenFarm.address, tokens('40000000'), { from: owner })//
		await daiToken.transfer(investor, tokens('50000000'), { from: owner })
		//await daiToken.transfer(daiToken.address, tokens('370000'), { from: owner })//transfer coins to the daitoken adddress for testing purposes

		*/




















		/*let delete_charity=await tokenFarm.activate_deactivate_charity("0xdC990Ca62Babc72F597a15C3b34F028eeaCD1F07", 0);
		console.log(delete_charity);
		let check_if_admin=await tokenFarm.check_if_admin("0x1a2Bfa5c15fD81c59F08e76F60C9bB24D418961D");
		console.log(check_if_admin);

		await tokenFarm.add_remove_admin("0x1a2Bfa5c15fD81c59F08e76F60C9bB24D418961D","1");// add admin

		check_if_admin=await tokenFarm.check_if_admin("0x1a2Bfa5c15fD81c59F08e76F60C9bB24D418961D");
		console.log(check_if_admin);

		await tokenFarm.add_remove_admin("0x1a2Bfa5c15fD81c59F08e76F60C9bB24D418961D","0");// remove admin

		check_if_admin=await tokenFarm.check_if_admin("0x1a2Bfa5c15fD81c59F08e76F60C9bB24D418961D");
		console.log(check_if_admin);*/


		/*await daiToken.transfer("0x1a2Bfa5c15fD81c59F08e76F60C9bB24D418961D", tokens('1000000'), { from: investor })//test transfer tax

		let balance_investor = await daiToken.balanceOf(investor);
		balance_investor=from_wei(balance_investor);
		console.log(balance_investor);

		let taxed_account = await daiToken.balanceOf("0x1a2Bfa5c15fD81c59F08e76F60C9bB24D418961D");
		taxed_account=from_wei(taxed_account);
		console.log(taxed_account);*/
		
	/*	let balance_token_address = await daiToken.balanceOf(tokenFarm.address);
		balance_token_address=from_wei(balance_token_address);
		console.log(balance_token_address);

		let current_rewards =  await tokenFarm.current_rewards_for_charities();
		console.log(from_wei(current_rewards));

		let current_token_holder_rewards = await tokenFarm.current_rewards_for_token_holders();
		console.log(from_wei(current_token_holder_rewards));



		await daiToken.transfer("0x1a2Bfa5c15fD81c59F08e76F60C9bB24D418961D", tokens('50000'), { from: investor })//test transfer tax

		balance_token_address = await daiToken.balanceOf(tokenFarm.address);
		balance_token_address=from_wei(balance_token_address);
		console.log(balance_token_address);

		current_rewards =  await tokenFarm.current_rewards_for_charities();
		console.log(from_wei(current_rewards));

		current_token_holder_rewards = await tokenFarm.current_rewards_for_token_holders();
		console.log(from_wei(current_token_holder_rewards));





		await daiToken.transfer("0x1a2Bfa5c15fD81c59F08e76F60C9bB24D418961D", tokens('170000'), { from: investor })//test transfer tax

		balance_token_address = await daiToken.balanceOf(tokenFarm.address);
		balance_token_address=from_wei(balance_token_address);
		console.log(balance_token_address);

		current_rewards =  await tokenFarm.current_rewards_for_charities();
		console.log(from_wei(current_rewards));

		current_token_holder_rewards = await tokenFarm.current_rewards_for_token_holders();
		console.log(from_wei(current_token_holder_rewards));

*/

		/*let current_rewards =  await tokenFarm.current_rewards_for_charities();
		console.log(current_rewards);*/


		/*

		let balance_owner = await daiToken.balanceOf(owner);
		balance_owner=from_wei(balance_owner);
		console.log(balance_owner);

		let balance_farm = await daiToken.balanceOf(tokenFarm.address)
		balance_farm=from_wei(balance_farm);
		console.log(balance_farm);*/

		/*
				let balance_token_address = await daiToken.balanceOf(daiToken.address);
		balance_token_address=from_wei(balance_token_address);
		console.log(balance_token_address);
		*/
		
	})



/*	describe('Mock DAI deployment', async() => {
		it('has a name', async() => {
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})*/


/*	describe('Dapp Token deployment', async() => {
		it('has a name', async() => {
			const name = await dappToken.name()
			assert.equal(name, 'DApp Token')
		})
	})*/

	describe('Token Farm deployment', async() => {
		/*it('has a name', async() => {
			const name = await tokenFarm.name()

			assert.equal(name, 'Dapp Token Farm')
		})*/
		it('testing_solidity_function', async() => {

		/*	console.log("Uniswapv2router");
			let uniswapRouter=await daiToken.uniswapV2Router();
			console.log(uniswapRouter);

			console.log("Uniswapv2Factory");
			let fetch_fest_factory_address=await daiToken.test_factory_address();
			console.log(fetch_fest_factory_address);*/

			//let aprove_dai = daiToken.approve(tokenFarm.address, "100000000000000000000000", { from: owner })

			//let first_stake = await tokenFarm.add_stake_charity_allocation(tokens('2000'), "0");//tokens('787')
			

		/*	//console.log(await tokenFarm.get_charity_info(0));
			//console.log(await tokenFarm.get_user_stake_info());
			/*let supported_charities=await tokenFarm.get_user_stake_allocation();
			console.log("Supported charities: " + supported_charities.length);
			for(var i = 0; i < supported_charities.length; i++){
					console.log("Charity Allocation: " + supported_charities[i][0] +", Charity ID: " + supported_charities[i][1]);
			}*/


			//let second_stake = await tokenFarm.add_stake_charity_allocation(tokens('113'), "5");

			/*console.log("-------------------------------After staking (and charity reward distribution)");
			let test_reward_distribution=await tokenFarm.get_charity_uncollected_rewards("0");
			let test_reward_distribution2=await tokenFarm.get_charity_uncollected_rewards("5");
			console.log(from_wei(test_reward_distribution));
			console.log(from_wei(test_reward_distribution2));

			let test_collect_charity_reward=await tokenFarm.collect_charity_rewards();

			test_reward_distribution=await tokenFarm.get_charity_uncollected_rewards("0");
			test_reward_distribution2=await tokenFarm.get_charity_uncollected_rewards("5");
			console.log(from_wei(test_reward_distribution));
			console.log(from_wei(test_reward_distribution2));*/


		/*		//console.log(await tokenFarm.get_charity_info(0));
			//console.log(await tokenFarm.get_charity_info(1));
			//console.log(await tokenFarm.get_user_stake_info());
			supported_charities=await tokenFarm.get_user_stake_allocation();
			console.log("Supported charities: " + supported_charities.length);
			for(var i = 0; i < supported_charities.length; i++){
					console.log("Charity Allocation: " + supported_charities[i][0] +", Charity ID: " + supported_charities[i][1]);
			}*/

		//	let third_stake = await tokenFarm.add_stake_charity_allocation(tokens('700'), "5");



		/*	//console.log(await tokenFarm.get_charity_info(0));
			//console.log(await tokenFarm.get_charity_info(1));
			//console.log(await tokenFarm.get_user_stake_info());
			supported_charities=await tokenFarm.get_user_stake_allocation();
			console.log("Supported charities: " + supported_charities.length);
			for(var i = 0; i < supported_charities.length; i++){
					console.log("Charity Allocation: " + supported_charities[i][0] +", Charity ID: " + supported_charities[i][1]);
			}*/


			/*let remove_stake = await tokenFarm.remove_stake_charity_allocation(tokens("803"), "5");




			return;*/

		/*	supported_charities=await tokenFarm.get_user_stake_allocation();
			console.log("Supported charities: " + supported_charities.length);
			for(var i = 0; i < supported_charities.length; i++){
					console.log("Charity Allocation: " + supported_charities[i][0] +", Charity ID: " + supported_charities[i][1]);
			}*/
		/*	let check_charity_uncollected_rewards =   await tokenFarm.get_charity_uncollected_rewards(0);
			let check_charity_uncollected_rewards_index_one =   await tokenFarm.get_charity_uncollected_rewards(1);
			let unallocated_rewards =  await tokenFarm.unallocated_rewards();
			console.log("Charity Index 0 Rewards: "+from_wei(check_charity_uncollected_rewards));
			console.log("Charity Index 1 Rewards: "+from_wei(check_charity_uncollected_rewards_index_one));
			console.log("Unallocated rewards: "+from_wei(unallocated_rewards));


			let distribute_rewards =  await tokenFarm.distribute_rewards_charities();


			check_charity_uncollected_rewards =   await tokenFarm.get_charity_uncollected_rewards(0);
			check_charity_uncollected_rewards_index_one =   await tokenFarm.get_charity_uncollected_rewards(1);
			unallocated_rewards =  await tokenFarm.unallocated_rewards();
			console.log("Charity Index 0 Rewards: "+from_wei(check_charity_uncollected_rewards));
			console.log("Charity Index 1 Rewards: "+from_wei(check_charity_uncollected_rewards_index_one));
			console.log("Unallocated rewards: "+from_wei(unallocated_rewards));*/


		/*	let check_user_uncollected_rewards =  await tokenFarm.get_user_uncollected_rewards("0xe72341A2249B99600a90Fd083dcB73401515AC88");
			console.log("User 1 reward allocation: " + from_wei(check_user_uncollected_rewards));
			let check_user_uncollected_rewards2 =  await tokenFarm.get_user_uncollected_rewards("0x5Ec0BCC4e487d8CF4BACaFF17d7f95382076345A");
			console.log("User 2 reward allocation: " + from_wei(check_user_uncollected_rewards2));*/


		/*	let distribute_token_rewards =  await tokenFarm.distribute_rewards_token_holders();
			check_user_uncollected_rewards =  await tokenFarm.get_user_uncollected_rewards("0xe72341A2249B99600a90Fd083dcB73401515AC88");
			console.log("User 1 reward allocation: " + from_wei(check_user_uncollected_rewards));
			check_user_uncollected_rewards2 =  await tokenFarm.get_user_uncollected_rewards("0x5Ec0BCC4e487d8CF4BACaFF17d7f95382076345A");
			console.log("User 2 reward allocation: " + from_wei(check_user_uncollected_rewards2));
			let check_collect_rewards_process =  await tokenFarm.collect_staker_rewards();*/
		/*	let check_charity_uncollected_rewards =   await tokenFarm.get_charity_uncollected_rewards(0);
			console.log(from_wei(check_charity_uncollected_rewards));


			let distribute_rewards =  await tokenFarm.distribute_rewards_charities();
			check_charity_uncollected_rewards =   await tokenFarm.get_charity_uncollected_rewards(0);
			console.log(from_wei(check_charity_uncollected_rewards));


			let collect_charity_rewards =  await tokenFarm.collect_charity_rewards();
			check_charity_uncollected_rewards =   await tokenFarm.get_charity_uncollected_rewards(0);
			console.log(from_wei(check_charity_uncollected_rewards));*/

			/*let check_charity_uncollected_rewards =   await tokenFarm.get_user_uncollected_rewards("0x5Ec0BCC4e487d8CF4BACaFF17d7f95382076345A");
			console.log("Prior to Reward Distribution: " + from_wei(check_charity_uncollected_rewards));

			let time_to_distribute_rewards =  await tokenFarm.time_to_distribute_rewards();


			check_charity_uncollected_rewards =   await tokenFarm.get_user_uncollected_rewards("0x5Ec0BCC4e487d8CF4BACaFF17d7f95382076345A");
			console.log("Reward Distribution Cycle 1: " + from_wei(check_charity_uncollected_rewards));

			await tokenFarm.time_to_distribute_rewards();
			check_charity_uncollected_rewards =   await tokenFarm.get_user_uncollected_rewards("0x5Ec0BCC4e487d8CF4BACaFF17d7f95382076345A");
			console.log("Reward Distribution Cycle 2: " + from_wei(check_charity_uncollected_rewards));*/

			//let get_approved_charities=await tokenFarm.get_approved_charities_list();
			//console.log(get_approved_charities);

			/*let transer_amt=tokens('7').toString();
			let charity_id=5;
			charity_id=charity_id.toString();

			let aprove_dai = daiToken.approve(tokenFarm.address, transer_amt, { from: owner })
			let test_stake_function =   await tokenFarm.add_stake_charity_allocation(transer_amt,charity_id);
			//console.log(test_stake_function);


			let balance_owner = await daiToken.balanceOf(owner)
			balance_owner=from_wei(balance_owner);
			console.log(balance_owner);
			let balance_farm = await daiToken.balanceOf(tokenFarm.address)
			balance_farm=from_wei(balance_farm);
			console.log(balance_farm);


			transer_amt=tokens('2').toString();
			let test_unstake_function =   await tokenFarm.remove_stake_charity_allocation(transer_amt,charity_id);

			balance_owner = await daiToken.balanceOf(owner)
			balance_owner=from_wei(balance_owner);
			console.log(balance_owner);
			balance_farm = await daiToken.balanceOf(tokenFarm.address)
			balance_farm=from_wei(balance_farm);
			console.log(balance_farm);*/


			/*let user_data= await tokenFarm.get_user_data(owner);

			console.log(user_data);*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////test unstaking too much
		/*	let approve_amt=tokens('100').toString();
			let aprove_dai = daiToken.approve(tokenFarm.address, approve_amt, { from: owner })
			let stake_check = await tokenFarm.add_stake_charity_allocation(tokens('43').toString(), "0");
			let stake_check2 = await tokenFarm.add_stake_charity_allocation(tokens('22').toString(), "5");

			let balance_owner = await daiToken.balanceOf(owner)
			balance_owner=from_wei(balance_owner);
			console.log("balance_owner:");
			console.log(balance_owner);
			let balance_farm = await daiToken.balanceOf(tokenFarm.address)
			balance_farm=from_wei(balance_farm);
			console.log("balance_farm:");
			console.log(balance_farm);


			let remove_amt=tokens('30').toString();
			let unstake_too_much = await tokenFarm.remove_stake_charity_allocation(remove_amt, "0");//check if trying to unstake too much
			balance_owner = await daiToken.balanceOf(owner)
			balance_owner=from_wei(balance_owner);
			console.log("balance_owner:");
			console.log(balance_owner);
			balance_farm = await daiToken.balanceOf(tokenFarm.address)
			balance_farm=from_wei(balance_farm);
			console.log("balance_farm:");
			console.log(balance_farm);

			
			let user_data= await tokenFarm.get_user_data("0x03cAA949852054FB5B783114BfA60f7Da423cC99");
			console.log(user_data);*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////Test collecting rewards
		/*	let balance_farm = await daiToken.balanceOf(tokenFarm.address)
			balance_farm=from_wei(balance_farm);
			console.log("balance_farm:");
			console.log(balance_farm);


			let collect_rewards = await tokenFarm.collect_staker_rewards();


			balance_farm = await daiToken.balanceOf(tokenFarm.address)
			balance_farm=from_wei(balance_farm);
			console.log("balance_farm:");
			console.log(balance_farm);*/
			//let reward_balance=await tokenFarm.get_token_reward_pool_balance();
			//console.log(from_wei(reward_balance));
//////////////////////////////////////////////////////////////////////////////////////////////////////////Test safemath
		/*	let test_add=await tokenFarm.test_safemath(4,2,0);
			console.log(test_add);*/



		/*	let balance_owner = await daiToken.balanceOf(owner)
			balance_owner=from_wei(balance_owner);
			console.log(balance_owner);

			let balance_farm = await daiToken.balanceOf(tokenFarm.address)
			balance_farm=from_wei(balance_farm);
			console.log(balance_farm);



			let get_user_stake_allocation=await tokenFarm.get_user_stake_info();
			get_user_stake_allocation=from_wei(get_user_stake_allocation);
			console.log(get_user_stake_allocation);

			get_approved_charities=await tokenFarm.get_approved_charities_list();
			console.log(get_approved_charities);

*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////Test donations logic

/*



			let get_token_holder_donations= await tokenFarm.get_token_holder_donations(); 
			console.log(get_token_holder_donations);

			let test_donation= await tokenFarm.process_donation(["First","Last"],"5000000000000000000","ETH","2021-05-10 13:19","Organization Name","0xdC990Ca62Babc72F597a15C3b34F028eeaCD1F07");
			get_token_holder_donations= await tokenFarm.get_token_holder_donations(); 
			console.log(get_token_holder_donations);

			let test_donation2= await tokenFarm.process_donation(["Joe","Kim"],"2100000000000000000","ETH","2021-05-10 14:22","Organization Name","0xdC990Ca62Babc72F597a15C3b34F028eeaCD1F07");			get_token_holder_donations= await tokenFarm.get_token_holder_donations(); 
			get_token_holder_donations= await tokenFarm.get_token_holder_donations(); 
			console.log(get_token_holder_donations);

*/



			/*let collected_transaction_fees= await tokenFarm.get_collected_transaction_fees(); 
			console.log(from_wei(collected_transaction_fees));
			let charity_donations = await tokenFarm.get_donation_transactions("0xdC990Ca62Babc72F597a15C3b34F028eeaCD1F07");
			console.log(charity_donations);

			let test_donation= await tokenFarm.process_donation(["First","Last"],"5000000000000000000","ETH","2021-05-10 13:19","Organization Name","0xdC990Ca62Babc72F597a15C3b34F028eeaCD1F07");
			collected_transaction_fees= await tokenFarm.get_collected_transaction_fees(); 
			console.log(from_wei(collected_transaction_fees));
			let test_donation2=await tokenFarm.process_donation(["Joe","Kim"],"21000000000000000000","ETH","2021-05-10 14:15","Organization Name","0xdC990Ca62Babc72F597a15C3b34F028eeaCD1F07");


			charity_donations = await tokenFarm.get_donation_transactions("0xdC990Ca62Babc72F597a15C3b34F028eeaCD1F07");
			console.log(charity_donations);
			collected_transaction_fees= await tokenFarm.get_collected_transaction_fees(); 
			console.log(from_wei(collected_transaction_fees));*/


		})
		/*it('contract has tokens', async() => {
			let balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})*/

	})
	/*describe('Farming tokens', async() => {
		it('rewards investors for staking mDai tokens', async() => {
			let result

			//Check investor balance before staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

			// Stake Mock DAI Tokens
			await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
			await tokenFarm.stakeTokens(tokens('100'), { from: investor })

			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), 'Investor staking balance correct after staking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'Investor staking status correct after staking')

			await tokenFarm.issueTokens({ from: owner })

			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct after issuance')

			await tokenFarm.issueTokens({ from: investor }).should.be.rejected;



			// Unstake tokens
			await tokenFarm.unstakeTokens({ from: investor });

			result = await daiToken.balanceOf(investor);
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking');


			result = await daiToken.balanceOf(tokenFarm.address);
			assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking');
		})
	})*/



})