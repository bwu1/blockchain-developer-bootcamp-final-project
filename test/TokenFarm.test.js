const Web3 = require('web3');
const DappToken = artifacts.require('DappToken')
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

contract('Donation_Processor', ([owner, investor]) => {

	let dappToken, donation_Processor, donation_Upgrade

	before(async () => {

		dappToken = await DappToken.new();//standard ERC20 to be used later for testing purposes
		donation_Processor = await Donation_Processor.new();
		donation_Upgrade = await Donation_Upgrade.new();
		donation_Processor.set_delegate_address(donation_Upgrade.address);///link proxy contract and implementation contract
		
	})
	describe('Donation Processor Deployment', async() => {

		/// Updates the transaction fee that the protocol takes for processing donations
		it('set transaction fee successfully', async() => {
			var updated_transaction_fee=450;
			await donation_Processor.set_donation_transaction_fee(updated_transaction_fee); 
			var contract_stored_transaction_fee= await donation_Processor.donation_transaction_fee(); 
			
			assert.equal(updated_transaction_fee, contract_stored_transaction_fee)
		})
		/// Gives an Ethereum address admin privileges
		it('add admin privileges', async() => {
			var new_admin="0x03cAA949852054FB5B783114BfA60f7Da423cC99";
			await donation_Processor.add_remove_admin(new_admin,1); 
			var check_if_admin=await donation_Processor.check_if_admin(new_admin); 

			assert.equal(check_if_admin, true)
		})
		/// Removes admin privileges for an Ethereum address
		it('remove admin privileges', async() => {
			var existing_admin="0x03cAA949852054FB5B783114BfA60f7Da423cC99";
			await donation_Processor.add_remove_admin(existing_admin,0); 
			var check_if_admin=await donation_Processor.check_if_admin(existing_admin); 

			assert.equal(check_if_admin, false)
		})
		/// Updates the delegate address (for contract upgradability purposes)
		it('set new delegate address', async() => {
			var new_delegate_address="0xccC58DD0Dc7eDF437f0E51FbeD996E4e95575d08";
			await donation_Processor.set_delegate_address(new_delegate_address); 
			var contract_stored_delegate_address=await donation_Processor.delegate_address(); 

			assert.equal(new_delegate_address, contract_stored_delegate_address)
		})
		/// Updates the currency that all donations are converted into
		it('set new final currency to convert', async() => {
			var new_token_address=dappToken.address;
			await donation_Processor.set_final_currency(new_token_address); 
			var contract_stored_final_currency=await donation_Processor.final_currency(); 
			var contract_stored_final_currency_decimal=await donation_Processor.final_currency_decimal(); 

			assert.equal(new_token_address, contract_stored_final_currency)
			assert.equal(18, contract_stored_final_currency_decimal)
		})
		/// Transfer ownership to another Ethereum address
		it('transfer contract ownership', async() => {
			var new_contract_owner="0x03cAA949852054FB5B783114BfA60f7Da423cC99";
			await donation_Processor.transfer_owner(new_contract_owner); 
			var contract_stored_owner=await donation_Processor.owner(); 

			assert.equal(new_contract_owner, contract_stored_owner)
		})
	})
})