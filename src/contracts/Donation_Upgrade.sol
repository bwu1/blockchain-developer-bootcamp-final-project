pragma solidity ^0.7.6;
//pragma solidity ^0.6.12;
// SPDX-License-Identifier: Unlicensed
pragma experimental ABIEncoderV2;
import "./DaiToken.sol";


/// @title Smart contract implementing the delegate call function for Donation_Processor
/// @author Bofan Wu
/// @dev All function calls are currently implemented without side effects
contract Donation_Upgrade {
    string public name = "Donation_Processor";
    address public owner;
    address public final_currency = 0x07865c6E87B9F70255377e024ace6630C1Eaa37F;//Circle Ropsten USDC
    uint public final_currency_decimal=6;
    using SafeMath for uint256;

    uint public donation_transaction_fee;//in basis points - (i.e.300)
    uint public collected_transaction_fees;//in stablecoins
    IUniswapV2Router02 public uniswapV2Router;
    ISwapRouter public uniswapV3Router;
    mapping (address => uint) public donationAllocation;
    uint public total_withdraw_count;
    uint public wire_withdraw_count;
    mapping (address => bool) public is_admin;
    uint24 public constant poolFee = 3000;
    mapping (address => uint) public donation_count;

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

    constructor() public {
        owner = msg.sender;
    }
     //to recieve ETH from uniswapV2Router when swaping
    receive() external payable {}

    
    /// @notice Processes a donation from a user
    /// @param _amount  amount of the donated ERC20 token
    /// @param _currency  name of the donated ERC20 token
    /// @param organization_name  name of the organization to receive the donation
    /// @param organization_ein  EIN of the organization to receive the donation
    /// @param charity_wallet  Ethereum address of the organization to receive the donation
    /// @param currency_address  Ethereum address of the donated ERC20 token
    /// @param decimals decimal precision of the donated ERC20 token
    function process_donation(uint _amount,string calldata _currency, string calldata organization_name, uint organization_ein, address payable charity_wallet, address currency_address, uint decimals) external payable{
        
        uint stablecoin_amount=_amount;//by default, assumes the donation is in stablecoin
        IERC20 final_token = IERC20(final_currency);


        if(keccak256(abi.encodePacked(_currency)) == keccak256(abi.encodePacked("ETH"))){//convert ETH to Stablecoin
                
            uint256 initialBalance = final_token.balanceOf(address(this));
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
        store_donation_data(_amount, _currency, stablecoin_amount, charity_wallet, organization_name, organization_ein, decimals);
        return;
    }

    /// @notice Calculate donation amount after subtracting transaction fee
    /// @param _amount  amount donated prior to subtracting fee
    function return_donation_after_fee(uint _amount) internal view returns (uint){
        uint one_hundred=10000;//in basis points
        uint subtract_fee=one_hundred.sub(donation_transaction_fee);
        uint donation_after_fee=_amount.mul(subtract_fee);
        donation_after_fee=donation_after_fee.div(one_hundred);
        return donation_after_fee; 
    }

    /// @notice Accumulate donated funds for the respective recipient charity
    /// @param _amount  amount donated prior to subtracting fee
    /// @param charity_wallet  address the recipient charity
    /// @param _final_token  token that all donations are converted into
    function process_money_transfer(uint _amount, address payable charity_wallet, IERC20 _final_token) internal{
        
        uint return_donation_after_fee_calculated=return_donation_after_fee(_amount);
        uint fee_allocation=_amount.sub(return_donation_after_fee_calculated);


        collected_transaction_fees=collected_transaction_fees + fee_allocation; ///to be distributed to token holders , i.e. via open market buy backs
       
        donationAllocation[charity_wallet] = donationAllocation[charity_wallet].add(return_donation_after_fee_calculated);//Updated Workflow - keep donations in the smart contract for the charities to withdraw directly to Circle/their bank account
        //_final_token.transfer(charity_wallet, return_donation_after_fee_calculated);//transfer donation from smart contract to charity wallet address
        
    }

    /// @notice Store the donation transaction on the blockchain by emitting an event
    /// @param _amount  amount of the original donated ERC20 token
    /// @param _currency  name of the original donated ERC20 token
    /// @param stablecoin_amount  amount of stablecoins post DEX conversion
    /// @param charity_wallet  recipient charity wallet
    /// @param _org_name  recipient charity organization name
    /// @param _org_ein  recipient charity EIN number
    /// @param _decimals  decimal precision of the original donated ERC20 token
    function store_donation_data(uint _amount, string memory _currency,uint stablecoin_amount, address charity_wallet,string memory _org_name, uint _org_ein, uint _decimals) internal{

        uint return_donation_after_fee_calculated=return_donation_after_fee(stablecoin_amount);
        donation_count[msg.sender]=donation_count[msg.sender]+1;
        emit Transaction(_amount, stablecoin_amount, return_donation_after_fee_calculated, _currency, _org_name, msg.sender, charity_wallet, _decimals, final_currency_decimal, block.timestamp);
        return;
    }

    /// @notice A charity calls this function to withdraw accumulated donations
    /// @param _charity_address  address of the charity
    /// @param _withdraw_address  address to withdraw to
    /// @param _amount  amount to withdraw 
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



}