pragma solidity ^0.7.6;
//pragma solidity ^0.6.12;
// SPDX-License-Identifier: Unlicensed
pragma experimental ABIEncoderV2;
import "./DaiToken.sol";

contract Donation_Upgrade {
    string public name = "Donation_Processor";
    //DaiToken public daiToken;
    address public owner;
    //address public final_currency = 0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7;////Pancakeswap simulator BUSD address
    //address public final_currency = 0x2963EEef46978C745b45B6Da29B78d9cC0708855;////convert all donations into stablecoins, currently set to fake stablecoin
    //address public final_currency = 0xb58A25294f399f7056a4cD5DAE3c2Fb9259e360d;//BSC USDC (6 decimals)
    address public final_currency = 0x07865c6E87B9F70255377e024ace6630C1Eaa37F;//Circle Ropsten USDC
    //address public final_currency = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;//Circle Mainnet USDC
    //address public final_currency = 0xaa57543e9246E67c82E45E7e9faf90548A6297F7;////Kovan testnet stablecoin
    uint public final_currency_decimal=6;
    using SafeMath for uint256;

    //mapping (address => donation_transaction[]) public donation_transactions;//record-keeping for charities
    //mapping (address => donation_transaction[]) public token_holder_donations;//record keeping for individuals
    uint public donation_transaction_fee;//in basis points - (i.e.300)
    uint public collected_transaction_fees;//in stablecoins
    IUniswapV2Router02 public uniswapV2Router;
    ISwapRouter public uniswapV3Router;
    mapping (address => uint) public donationAllocation;
    uint public total_withdraw_count;
    uint public wire_withdraw_count;
    mapping (address => bool) public is_admin;
    uint24 public constant poolFee = 3000;

    event Transaction(
        uint256 amount,
        uint256 converted_amount,
        uint256 received_amount,
        string currency,
        string org_name,
        address indexed donor_address,
        address indexed receiver,
        uint input_decimals,
        uint output_decimals,
        uint date
    );
    event Wire_Withdraw(
        uint256 indexed id,
        address indexed charity_address,
        uint256 amount,
        uint256 timestamp,
        uint output_decimals
    );


    /*struct donation_transaction{
        uint amount;
        uint converted_amount;
        uint received_amount;
        string currency;
        uint date;
        string org_name;
        uint org_ein;
        address donor_address;
        uint input_decimals;
        uint output_decimals;
    }
    struct wire_request{
        uint id;
        address charity_address;
        uint amount;
        uint timestamp;
        uint output_decimals;
    }
    wire_request[] wire_request_array;
    */

    constructor() public {
        owner = msg.sender;
    }
     //to recieve ETH from uniswapV2Router when swaping
    receive() external payable {}

    

    function process_donation(uint _amount,string calldata _currency, string calldata organization_name, uint organization_ein, address payable charity_wallet, address currency_address, uint decimals) external payable{
        
        uint stablecoin_amount=_amount;//by default, assumes the donation is in stablecoin
        IERC20 final_token = IERC20(final_currency);


        if(keccak256(abi.encodePacked(_currency)) == keccak256(abi.encodePacked("ETH"))){//convert ETH to Stablecoin
                
            uint256 initialBalance = final_token.balanceOf(address(this));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////UniSwapV2
           /* address[] memory path = new address[](2);
            path[0] = uniswapV2Router.WETH();//daiToken.uniswapV2Router()
            path[1] = final_currency;

            uniswapV2Router.swapExactETHForTokensSupportingFeeOnTransferTokens{value:_amount}(//.value(_amount)|||daiToken.uniswapV2Router()
                0, // accept any amount of stablecoins
                path,
                address(this),
                block.timestamp
            );
            */
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////UniSwapV3
            ISwapRouter.ExactInputSingleParams memory params =
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: uniswapV3Router.WETH9(),
                    tokenOut: final_currency,
                    fee: 3000,
                    recipient: address(this),
                    deadline: block.timestamp,
                    amountIn: _amount,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                });
            

            uniswapV3Router.exactInputSingle{value:_amount}(params);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


            uint256 post_conversion_Balance = final_token.balanceOf(address(this));
            stablecoin_amount = post_conversion_Balance.sub(initialBalance);
        }
        else{

            IERC20 this_token = IERC20(currency_address);
            this_token.transferFrom(msg.sender, address(this), _amount);///transfer in value first - in case user balance is not enough, function will revert here
            
            if(currency_address!=final_currency){//convert any coin into stablecoin (unless the coin itself is already the stablecoin)
                uint256 initialBalance = final_token.balanceOf(address(this));


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////UniSwapV2
                /*this_token.approve(address(uniswapV2Router), _amount);//daiToken.uniswapV2Router()


                address[] memory path = new address[](3);
                path[0] = currency_address;
                path[1] = uniswapV2Router.WETH();//daiToken.uniswapV2Router()
                path[2] = final_currency;

                uniswapV2Router.swapExactTokensForTokensSupportingFeeOnTransferTokens(//daiToken.uniswapV2Router()
                    _amount,
                    0, // accept any amount of stablecoins
                    path,
                    address(this),
                    block.timestamp
                );*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////UniSwapV3
                this_token.approve(address(uniswapV3Router), _amount);

                ISwapRouter.ExactInputParams memory params =
                    ISwapRouter.ExactInputParams({
                        path: abi.encodePacked(currency_address, poolFee, uniswapV3Router.WETH9(), poolFee, final_currency),
                        recipient: address(this),
                        deadline: block.timestamp,
                        amountIn: _amount,
                        amountOutMinimum: 0
                    });

                // Executes the swap.
                uniswapV3Router.exactInput(params);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                uint256 post_conversion_Balance = final_token.balanceOf(address(this));
                stablecoin_amount = post_conversion_Balance.sub(initialBalance);
            }
        }

        process_money_transfer(stablecoin_amount, charity_wallet, final_token);//always transfer out in stablecoin
        /*if(donation_reward_allocation>0 && currency_address!=address(daiToken)){//reward early users of the platform when they donate (except when they donate in GIFT token)
            reward_early_donors(stablecoin_amount);//1:1 reward ratio
        }*/
        store_donation_data(_amount, _currency, stablecoin_amount, charity_wallet, organization_name, organization_ein, decimals);
        return;
    }

    function return_donation_after_fee(uint _amount) internal view returns (uint){
        uint one_hundred=10000;//in basis points
        uint subtract_fee=one_hundred.sub(donation_transaction_fee);
        uint donation_after_fee=_amount.mul(subtract_fee);
        donation_after_fee=donation_after_fee.div(one_hundred);
        return donation_after_fee; 
    }
    function process_money_transfer(uint _amount, address payable charity_wallet, IERC20 _final_token) internal{
        
        uint return_donation_after_fee_calculated=return_donation_after_fee(_amount);
        uint fee_allocation=_amount.sub(return_donation_after_fee_calculated);


        collected_transaction_fees=collected_transaction_fees + fee_allocation; ///to be distributed to token holders , i.e. via open market buy backs
       
        donationAllocation[charity_wallet] = donationAllocation[charity_wallet].add(return_donation_after_fee_calculated);//Updated Workflow - keep donations in the smart contract for the charities to withdraw directly to Circle/their bank account
        //_final_token.transfer(charity_wallet, return_donation_after_fee_calculated);//transfer donation from smart contract to charity wallet address
        
    }
    function store_donation_data(uint _amount, string memory _currency,uint stablecoin_amount, address charity_wallet,string memory _org_name, uint _org_ein, uint _decimals) internal{

        uint return_donation_after_fee_calculated=return_donation_after_fee(stablecoin_amount);
        emit Transaction(_amount, stablecoin_amount, return_donation_after_fee_calculated, _currency, _org_name, msg.sender, charity_wallet, _decimals, final_currency_decimal, block.timestamp);
/*
        
        donation_transaction memory new_donation = donation_transaction({amount:_amount, converted_amount:stablecoin_amount, received_amount:return_donation_after_fee_calculated, currency:_currency, date:block.timestamp, org_name:_org_name, org_ein:_org_ein, donor_address:msg.sender, input_decimals:_decimals, output_decimals:final_currency_decimal});

        donation_transactions[charity_wallet].push(new_donation);
        token_holder_donations[msg.sender].push(new_donation);
*/
        return;
    }
    function execute_token_burn() external{
        //new_fee=address(this).balance;
    }
    function withdraw_donation(address _charity_address, address _withdraw_address, uint _amount) public{

        if(msg.sender!=_charity_address){//only the charity can withdraw funds
            return;
        }

        if(donationAllocation[_charity_address] <_amount){//can't withdraw more than the total allocation
            return;//fail
        }

        total_withdraw_count=total_withdraw_count+1;
        wire_withdraw_count=wire_withdraw_count+1;
        donationAllocation[_charity_address] = donationAllocation[_charity_address].sub(_amount);

        emit Wire_Withdraw(wire_withdraw_count.sub(1), msg.sender, _amount, block.timestamp, final_currency_decimal);

        //wire_request memory new_wire = wire_request({id:wire_request_array.length, charity_address:_charity_address, amount:_amount, timestamp:block.timestamp, output_decimals:final_currency_decimal});
        //wire_request_array.push(new_wire);


        IERC20 final_token = IERC20(final_currency);
        final_token.transfer(_withdraw_address, _amount);//withdraw donation from smart contract to charity|||USDC only only 6 decimal places
    }


    /*function reward_early_donors(uint _amount) internal{
        
        if(donation_reward_allocation>_amount){
            donation_reward_allocation=donation_reward_allocation.sub(_amount);
            daiToken.transfer(msg.sender, _amount);
        }
        else{
            uint left_over_rewards=donation_reward_allocation;
            donation_reward_allocation=0;
            daiToken.transfer(msg.sender, left_over_rewards);
        }
    }*/
    /*function process_donation(string[] calldata _concactenated_name,uint _amount,string calldata _currency, string calldata _formatted_date,string calldata organization_name, address payable charity_wallet) external payable{
        ///this version converts everything into ETH/BNB


        uint eth_amount=_amount;
        if(!(keccak256(abi.encodePacked(_currency)) == keccak256(abi.encodePacked("ETH")))){
            daiToken.transferFrom(msg.sender, address(this), _amount);///transfer in value first - in case user balance is not enough, function will revert here
            // capture the contract's current ETH balance.
            // this is so that we can capture exactly the amount of ETH that the
            // swap creates, and not make the liquidity event include any ETH that
            // has been manually sent to the contract
            uint256 initialBalance = address(this).balance;

            daiToken.approve(address(daiToken.uniswapV2Router()), _amount);//currently testing only using GIFT - but will need to get approval of any coin
            address[] memory path = new address[](2);
            path[0] = address(daiToken);//will need to be dynamic variable to match the donated coin
            path[1] = daiToken.uniswapV2Router().WETH();

            daiToken.uniswapV2Router().swapExactTokensForETHSupportingFeeOnTransferTokens(
                _amount,
                0, // accept any amount of ETH
                path,
                address(this),//msg.sender
                block.timestamp
            );

            eth_amount = address(this).balance.sub(initialBalance);
        }

        process_money_transfer(eth_amount, charity_wallet);//always transfer out in ETH
        store_donation_data(_concactenated_name[0], _concactenated_name[1], _amount, _currency, eth_amount, _formatted_date, charity_wallet, organization_name, msg.sender);
        return;
    }*/



}