pragma solidity ^0.7.6;
//pragma solidity ^0.6.12;
// SPDX-License-Identifier: Unlicensed
pragma experimental ABIEncoderV2;
import "./DaiToken.sol";




contract TokenFarm {
	string public name = "Dapp Token Farm";
	DaiToken public daiToken;
	address public owner;
	using SafeMath for uint256;

	struct individual_charity{
	      uint id;
	      string name;
	      string description;
	      string details;
	      string url;
	      uint ein;
	      address wallet_address;
	      address deposit_address;
	      uint uncollected_rewards;
	      uint vote_allocation;
	      bool us_tax_deduction;
	      bool is_deleted;
	      uint genesis;
	}
	struct individual_token_holder{
	    uint[][] supported_charities;
	    uint uncollected_rewards;
	    uint total_staked;
	    bool exists;
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	  individual_charity[] approved_charities;//array of individual charities

	  uint public initial_charity_reward_allocation = 20000000 * 10**18;//initial token supply that is allocated to charity rewards (20% of total supply)
	  uint public current_rewards_for_charities;//rewards currently yet to be distributed to charities
	  uint public minimum_distribution_threshold_charities = 3 * 10**18;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	 uint public initial_token_staking_reward_allocation = 20000000 * 10**18;//initial token supply that is allocated to token holder rewards (20% of total supply)
	 uint public staking_reward_distribution_increment= 100 * 10**18; //amount of tokens rewarded every reward cycle
	 uint public current_rewards_for_token_holders;//rewards currently yet to be distributed to stakers
	 uint public minimum_distribution_threshold_token_holders = 3 * 10**18;
	 mapping (address => individual_token_holder) public stakingAllocation;
	 address[] staking_addresses;
	 mapping (address => bool) public is_admin;
	 uint public total_charity_votes;//total number of token holder votes that determine charity fund allocation
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	 uint public last_reward_block;//integer
	 uint public reward_interval; //integer
	 address public delegate_address;

	constructor() public {//DaiToken _daiToken
		//daiToken = _daiToken;
		owner = msg.sender;
		is_admin[msg.sender]=true;
		last_reward_block=0;
		reward_interval=1;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//add_charity("Our Dev Team", "Project Development", "This is a community-driven project. You can support us simply by staking. Our allocated rewards will go towards project development.", "https://google.com", "ourplanet_logo.png", msg.sender, false);
		//add_charity("Ocean CleanUp", "Environmental Restoration", "The Ocean Cleanup is a non-profit organization developing advanced technologies to rid the oceans of plastic.", "https://theoceancleanup.com", "ocean_cleanup_foundation.jpg", 0x03cAA949852054FB5B783114BfA60f7Da423cC99, true);
		//add_charity("World Wildlife Fund", "Wildlife Conservation", "Our mission is to conserve nature and reduce the most pressing threats to the diversity of life on Earth.", "https://www.worldwildlife.org", "wwf.jpg", 0xdC990Ca62Babc72F597a15C3b34F028eeaCD1F07, true);
 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   
		add_remove_admin(0xb36536a3241097374cB4408aB4d936e3C6254aCC,1);//set Brady to admin
		//add_remove_admin(0x03cAA949852054FB5B783114BfA60f7Da423cC99,1);//set Ganache2 to admin

	}
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


function add_charity(string memory _name, string memory _description, string memory _details, string memory _url, uint _ein, address _charity_address, bool _is_tax_deductible) public returns (bool){//add charity to approved charities - only dev team can access. Later will be managed by DAO
	
	//require(is_admin[msg.sender] == false, "only admin can access");
	if(is_admin[msg.sender] == false){
			return false;
	}

	individual_charity memory charity_to_add = individual_charity({id:approved_charities.length, name:_name, description:_description, details:_details, url:_url, ein:_ein, wallet_address:_charity_address, deposit_address:_charity_address, uncollected_rewards:0, vote_allocation:0, us_tax_deduction:_is_tax_deductible, is_deleted:false, genesis:block.timestamp});


	for(uint i =0; i<approved_charities.length; i++){
		address address_check=approved_charities[i].wallet_address;
		if(address_check==_charity_address){
			return false;//fail - each wallet can only have 1 associated charity
		}
	}

	approved_charities.push(charity_to_add);
	return true;
}

function update_charity_info(string memory _name, string memory _description, string memory _details, string memory _url, uint _ein, address _charity_address, address _deposit_address, bool _is_tax_deductible)  public returns (bool){// update info associated with an approved charity (can only change certain variables - NOT the associated wallet address)

	if(is_admin[msg.sender] == false){
			return false;
	}

	address address_to_change = _charity_address;
	for(uint i =0; i<approved_charities.length; i++){
		if(address_to_change==approved_charities[i].wallet_address){
			approved_charities[i].name=_name;
			approved_charities[i].description=_description;
			approved_charities[i].details=_details;
			approved_charities[i].url=_url;
			approved_charities[i].ein=_ein;
			approved_charities[i].deposit_address=_deposit_address;
			approved_charities[i].us_tax_deduction=_is_tax_deductible;
			return true;
		}
	}
	return false;

}

function activate_deactivate_charity(address charity_wallet_address, uint _type) public returns (bool){//remove charity from approved charities - only dev team OR the charity itself can access. Later will be managed by DAO
	if(is_admin[msg.sender] == false && msg.sender!=charity_wallet_address){
		return false;
	}
	address address_to_delete = charity_wallet_address;

	for(uint i =0; i<approved_charities.length; i++){
		if(address_to_delete==approved_charities[i].wallet_address){
			if(_type==0){//deactivate
				approved_charities[i].is_deleted=true;
			}
			else{//reactivate
				approved_charities[i].is_deleted=false;
			}
			
			return true;
		}			
	}
	return false;
}



//////////////////////////////////////////////////////////Do Not include in Donation Only MVP////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function transfer_tax_to_reward_pool(uint _amount) external{

	daiToken.transferFrom(address(daiToken), address(this), _amount);

	uint token_holder_allocation=_amount.div(2);
	uint charity_allocation=_amount-token_holder_allocation;

	current_rewards_for_token_holders = current_rewards_for_token_holders.add(token_holder_allocation);
	current_rewards_for_charities = current_rewards_for_charities.add(charity_allocation);

	return;
}
function collect_staker_rewards() external{//Token Holders have to interact with our front-facing app to collect their rewards
	delegate_address.delegatecall(abi.encodeWithSignature("collect_staker_rewards()"));
}

function collect_charity_rewards() external{//Charities have to interact with our front-facing app to collect their rewards
    delegate_address.delegatecall(abi.encodeWithSignature("collect_charity_rewards()"));
}
function add_stake_charity_allocation(uint _amount, uint selected_charity_id) external{//each charity will have its own staking pool and users will choose what charities to support by staking
 	delegate_address.delegatecall(abi.encodeWithSignature("add_stake_charity_allocation(uint256,uint256)", _amount, selected_charity_id));   
}

function remove_stake_charity_allocation(uint _amount, uint selected_charity_id) external{
	delegate_address.delegatecall(abi.encodeWithSignature("remove_stake_charity_allocation(uint256,uint256)", _amount, selected_charity_id));
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////Utility Functions - leave as public for now/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function link_protocol_token(DaiToken _daiToken) public {
	if(msg.sender!=owner){
		return;
	}
	daiToken = _daiToken;
}
function transfer_owner(address newOwner) public{//not tested yet
	if(msg.sender!=owner){
		return;
	}
	require(newOwner != address(0), "Ownable: new owner is the zero address");
	owner = newOwner;
}

function set_staking_reward_distribution_increment(uint _amount) public{
	if(msg.sender!=owner){
		return;
	}
	staking_reward_distribution_increment=_amount * 10**18;
}
function set_minimum_distribution_threshold(uint _min_amount) public{
	if(msg.sender!=owner){
		return;
	}
	minimum_distribution_threshold_charities=_min_amount * 10**18;
	minimum_distribution_threshold_token_holders=_min_amount * 10**18;
}
function set_reward_interval(uint _new_interval) public{
	if(msg.sender!=owner){
		return;
	}
	reward_interval=_new_interval;
}
function add_remove_admin(address _address, uint _type) public{
	if(msg.sender!=owner){//only owner can add new admins
		return;
	}

	if(_type==1){///add
		is_admin[_address]=true;
	}
	else{///remove
		is_admin[_address]=false;
	}
	return;
}
function check_if_admin(address account) external view returns(bool) {
	return is_admin[account];
}
function get_user_data(address user_account) external view returns (individual_token_holder memory){
	return stakingAllocation[user_account];
}
function get_approved_charities_list() external view returns (individual_charity[] memory){
	return approved_charities;
}

function get_user_uncollected_rewards(address user_address) external view returns (uint){
	return stakingAllocation[user_address].uncollected_rewards;
}
function get_total_charity_votes() external view returns (uint){
	return total_charity_votes;
}
function set_delegate_address(address _contract_address) external{
    if(msg.sender!=owner){//only owner can change
            return;
    }
    delegate_address=_contract_address;
    return;
}

	
}