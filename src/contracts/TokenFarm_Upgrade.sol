pragma solidity ^0.7.6;
//pragma solidity ^0.6.12;
// SPDX-License-Identifier: Unlicensed
pragma experimental ABIEncoderV2;
import "./DaiToken.sol";




contract TokenFarm_Upgrade {
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


	constructor() public {
		owner = msg.sender;
		is_admin[msg.sender]=true;
	}






function collect_staker_rewards() external{//Token Holders have to interact with our front-facing app to collect their rewards

    uint balance = stakingAllocation[msg.sender].uncollected_rewards;
    if(balance<=0){
    	return;//fail
    }
    
    stakingAllocation[msg.sender].uncollected_rewards = 0;
    daiToken.transfer(msg.sender, balance);
    return;
}

function collect_charity_rewards() external{//Charities have to interact with our front-facing app to collect their rewards
    
    //Fetch staking balance
    
    for(uint i =0; i<approved_charities.length; i++){ // loop through approved_charities and find the matching charity based on wallet address msg.sender; 
      if(approved_charities[i].wallet_address == msg.sender){
        uint balance = approved_charities[i].uncollected_rewards;
        if(balance<=0){
        	return;//fail
        }


        approved_charities[i].uncollected_rewards = 0;
        daiToken.transfer(msg.sender, balance);//transfer rewards to the charity's wallet
        return;//pass
      }
    }
    return;//should not reach here
}

function update_charity_vote_allocation(uint charity_id, uint vote_allocation, uint add_or_subtract) internal{////add_or_subtract 1 = add, 0 = subtract
    for(uint i =0; i<approved_charities.length; i++){

    	individual_charity memory this_charity = approved_charities[i];

      if(this_charity.id==charity_id){
        if(add_or_subtract==1){
            approved_charities[i].vote_allocation=approved_charities[i].vote_allocation.add(vote_allocation);
        }
        else{
            approved_charities[i].vote_allocation=approved_charities[i].vote_allocation.sub(vote_allocation);     
        }
        return;
      }
    }


}

function add_stake_charity_allocation(uint _amount, uint selected_charity_id) external{//each charity will have its own staking pool and users will choose what charities to support by staking
    
	
   // require(_amount > 0, "amount cannot be 0");
    daiToken.transferFrom(msg.sender, address(this), _amount);//transfer in value first - in case user balance is not enough, function will revert here


    individual_token_holder memory token_holder=stakingAllocation[msg.sender];//finds current user's stake allocation

	if(token_holder.exists == false){//if user has not staked before

		uint[] memory new_stake_allocation = new uint[](2);//structure of array: [allocation size, charity id]
		new_stake_allocation[0]=_amount;
		new_stake_allocation[1]=selected_charity_id;


	      update_charity_vote_allocation(selected_charity_id, _amount, 1);
	      staking_addresses.push(msg.sender);
	      stakingAllocation[msg.sender].supported_charities.push(new_stake_allocation);
	      stakingAllocation[msg.sender].total_staked=_amount;
	      stakingAllocation[msg.sender].exists=true;
	      total_charity_votes=total_charity_votes.add(_amount);
	      time_to_distribute_rewards();
	      return;
	    	//return 0;
    }
    else{///current user has already staked before

    	uint[][] memory existing_user_stake_allocation= stakingAllocation[msg.sender].supported_charities;

    	for(uint i =0; i<existing_user_stake_allocation.length; i++){
    		uint[] memory this_charity_allocation = existing_user_stake_allocation[i];//structure of array: [allocation size, charity id]



	         if(this_charity_allocation[1]==selected_charity_id){///user has already staked for this specific charity


	            update_charity_vote_allocation(selected_charity_id, _amount, 1);
    			this_charity_allocation[0]=this_charity_allocation[0].add(_amount);
	            stakingAllocation[msg.sender].supported_charities[i] = this_charity_allocation;
    			stakingAllocation[msg.sender].total_staked = stakingAllocation[msg.sender].total_staked.add(_amount);
	            total_charity_votes = total_charity_votes.add(_amount);
	            time_to_distribute_rewards();
	            return;
	            //return 1;
          	}
    	}
 	 	//////////////////////////////////////////user has staked before, but not for this specific charity    
 	 	uint[] memory new_stake_allocation = new uint[](2);
 		new_stake_allocation[0]=_amount;
	 	new_stake_allocation[1]=selected_charity_id;

		update_charity_vote_allocation(selected_charity_id, _amount, 1);
	    stakingAllocation[msg.sender].supported_charities.push(new_stake_allocation);
	    stakingAllocation[msg.sender].total_staked = stakingAllocation[msg.sender].total_staked.add(_amount);
    	total_charity_votes = total_charity_votes.add(_amount);
    	time_to_distribute_rewards();
    	return;
      	//return 1;
    }

}

function remove_stake_charity_allocation(uint _amount, uint selected_charity_id) external{

		if(stakingAllocation[msg.sender].total_staked <_amount){//can't unstake more than the total staked
			return;//fail
		}

		uint[][] memory existing_user_stake_allocation= stakingAllocation[msg.sender].supported_charities;//finds current user's stake allocation

      for(uint i =0; i<existing_user_stake_allocation.length; i++){
         if(existing_user_stake_allocation[i][1]==selected_charity_id){
         	if(stakingAllocation[msg.sender].supported_charities[i][0] <_amount){//can't unstake more than the amount staked for this charity
         		return;//fail
         	}

            update_charity_vote_allocation(selected_charity_id, _amount, 0);
            stakingAllocation[msg.sender].supported_charities[i][0] = stakingAllocation[msg.sender].supported_charities[i][0].sub(_amount);
            stakingAllocation[msg.sender].total_staked = stakingAllocation[msg.sender].total_staked.sub(_amount);
            total_charity_votes = total_charity_votes.sub(_amount);

            if(stakingAllocation[msg.sender].supported_charities[i][0] <= 0){//remove this specific charity from user's charity array
				for(uint j =i; j<stakingAllocation[msg.sender].supported_charities.length - 1; j++){///uses more gas than unordered deletion
					stakingAllocation[msg.sender].supported_charities[j]=stakingAllocation[msg.sender].supported_charities[j+1];
				}
				//stakingAllocation[msg.sender].supported_charities.length--;
				stakingAllocation[msg.sender].supported_charities.pop();
            }
            
            time_to_distribute_rewards();
            daiToken.transfer(msg.sender, _amount);//only transfer out tokens after passing the checks above

            return;//pass
          }
      }
}


function distribute_rewards_token_holders()internal{ //////////////////////////Rewards are distributed to token holders based on how much they stake
	if(total_charity_votes==0){/// no charity votes yet
		return;//fail
	}

	if(initial_token_staking_reward_allocation >= staking_reward_distribution_increment){

		initial_token_staking_reward_allocation = initial_token_staking_reward_allocation.sub(staking_reward_distribution_increment);
		current_rewards_for_token_holders = current_rewards_for_token_holders.add(staking_reward_distribution_increment);
	}



	if(current_rewards_for_token_holders<=minimum_distribution_threshold_token_holders){/// not enough rewards to distribute
		return;//fail
	}	    

    uint total_distributed_rewards = 0;
    for(uint i =0; i<staking_addresses.length; i++){//loops through each address that is staking
    	address this_address=staking_addresses[i];
    	individual_token_holder memory token_holder=stakingAllocation[this_address];
    	uint total_staked=token_holder.total_staked;

    	uint pre_div=total_staked.mul(current_rewards_for_token_holders);
    	uint new_rewards = pre_div.div(total_charity_votes);
    	//return new_rewards;
        stakingAllocation[this_address].uncollected_rewards = stakingAllocation[this_address].uncollected_rewards.add(new_rewards);
        total_distributed_rewards = total_distributed_rewards.add(new_rewards);
    }
   	current_rewards_for_token_holders= current_rewards_for_token_holders.sub(total_distributed_rewards);// should not just set to 0, incase math calculations cause rounding errors


	return;//pass
}
function distribute_rewards_charities()internal{
	if(total_charity_votes==0){/// no charity votes yet
		return;//fail
	}

	if(initial_charity_reward_allocation >= staking_reward_distribution_increment){

		initial_charity_reward_allocation = initial_charity_reward_allocation.sub(staking_reward_distribution_increment);
		current_rewards_for_charities = current_rewards_for_charities.add(staking_reward_distribution_increment);
	}


	if(current_rewards_for_charities<=minimum_distribution_threshold_charities){/// not enough rewards to distribute
		return;//fail
	}


    uint total_distributed_rewards = 0;

    for(uint i =0; i<approved_charities.length; i++){ //Rewards are distributed to charities based on allocation decided by token holders

        individual_charity memory this_charity = approved_charities[i];
        //uint old_uncollected_rewards = this_charity.uncollected_rewards;//unused variable
        uint charity_votes = this_charity.vote_allocation;

        uint pre_div=charity_votes.mul(current_rewards_for_charities);
        uint new_rewards = pre_div.div(total_charity_votes);
        approved_charities[i].uncollected_rewards = approved_charities[i].uncollected_rewards.add(new_rewards);
        total_distributed_rewards = total_distributed_rewards.add(new_rewards);
    }    

    current_rewards_for_charities= current_rewards_for_charities.sub(total_distributed_rewards);// should not just set to 0, incase math calculations cause rounding errors
    return;//pass
}

function time_to_distribute_rewards()  internal{ //distribute rewards based on a time interval
	//currently checks after every stake/unstake transaction whether to distribute rewards
	uint current_block = block.timestamp;


    if(current_block >= last_reward_block.add(reward_interval)){
      	distribute_rewards_charities();
      	distribute_rewards_token_holders();
      	last_reward_block = current_block;
    }
    return;
  
}


	
}