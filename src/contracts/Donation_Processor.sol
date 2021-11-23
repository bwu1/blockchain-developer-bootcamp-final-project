// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.7.6;

pragma experimental ABIEncoderV2;
import "./DaiToken.sol";


/// @title A contract that processes ERC20 donations
/// @author Bofan Wu
/// @dev All function calls are currently implemented without side effects
contract Donation_Processor {
    /// @notice Name of contract
    string public name = "Donation_Processor";
    /// @notice contract owner
    address public owner;
    /// @notice donations are converted into the USDC stablecoin via a DEX swap
    address public final_currency = 0x07865c6E87B9F70255377e024ace6630C1Eaa37F;//Circle Ropsten USDC
    /// @notice USDC decimal precision
    uint public final_currency_decimal=6;
    using SafeMath for uint256;

    /// @notice transaction fee that the smart contract charges in basis points
    uint public donation_transaction_fee;
    /// @notice total transaction fee that the smart contract has collected
    uint public collected_transaction_fees;
    /// @notice pointer to UniswapV2
    IUniswapV2Router02 public uniswapV2Router;
    /// @notice pointer to UniswapV3
    ISwapRouter public uniswapV3Router;
    /// @notice tracks accumulation of donations for recipient charities
    mapping (address => uint) public donationAllocation;
    /// @notice tracks total amount of times businesses withdraw their funds
    uint public total_withdraw_count;
    /// @notice tracks total amount of times businesses initiate wire requests via Circle integration
    uint public wire_withdraw_count;
    mapping (address => bool) public is_admin;
    /// @notice UniswapV3 poolFee
    uint24 public constant poolFee = 3000;
    /// @notice tracks number of donations for each user
    mapping (address => uint) public donation_count;

    /// @notice event recording a donation transaction
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

    /// @notice event recording a wire withdraw
    event Wire_Withdraw(
        uint256 indexed id,
        address indexed charity_address,
        uint256 amount,
        uint256 timestamp,
        uint output_decimals
    );
    /// @notice pointer to delegate_call smart contract for upgradability
    address public delegate_address;

    constructor() public {
        owner = msg.sender;
        is_admin[msg.sender]=true;

        //setRouterAddress(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        setuniswapV3RouterAddress(0xE592427A0AEce92De3Edee1F18E0157C05861564);
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

        delegate_address.delegatecall(abi.encodeWithSignature("process_donation(uint256,string,string,uint256,address,address,uint256)", _amount, _currency, organization_name, organization_ein, charity_wallet, currency_address, decimals));

    }

    /// @notice A charity calls this function to withdraw accumulated donations
    /// @param _charity_address  address of the charity
    /// @param _withdraw_address  address to withdraw to
    /// @param _amount  amount to withdraw
    function withdraw_donation(address _charity_address, address _withdraw_address, uint _amount) public{

        delegate_address.delegatecall(abi.encodeWithSignature("withdraw_donation(address,address,uint256)", _charity_address, _withdraw_address, _amount));

    }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////Utility Functions///////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// @notice A charity calls this function to see how much funds are available to be withdrawn
    /// @param charity_address  address of the charity
    function get_available_withdraw_amount(address charity_address) public view returns (uint){
        return donationAllocation[charity_address];
    }


    /// @notice Fetch the total collected transaction fees by the smart contract

    function get_collected_transaction_fees() public view returns (uint){
        return collected_transaction_fees;
    }
    /// @notice Sets the transaction fee rate of the smart contract
    /// @param _new_fee  new fee 
    function set_donation_transaction_fee(uint _new_fee) external{
        if(msg.sender!=owner){//only owner can change
                return;
        }
        donation_transaction_fee=_new_fee;
        return;
    }
    /// @notice Sets the final currency that all donations are converted into (i.e. a stablecoin)
    /// @param _contract_address  address of the new ERC20 token 
    function set_final_currency(address _contract_address) external{
        if(msg.sender!=owner){//only owner can change
                return;
        }
        final_currency=_contract_address;
        final_currency_decimal = IERC20(_contract_address).decimals();
        return;
    }
    /// @notice Sets the new owner of the smart contract
    /// @param newOwner  address of the new owner
    function transfer_owner(address newOwner) public{
        if(msg.sender!=owner){
            return;
        }
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        owner = newOwner;
    }
    /// @notice Updates the delegate_call address to enable smart contract upgradability 
    /// @param _contract_address  address of the delegate smart contract
    function set_delegate_address(address _contract_address) external{
        if(msg.sender!=owner){//only owner can change
                return;
        }
        delegate_address=_contract_address;
        return;
    }
    /// @notice Updates the DEX router address used for token conversions - for UniswapV2 and its forks
    /// @param newRouter  address of the new router
    function setRouterAddress(address newRouter) public{
        if(msg.sender!=owner){
            return;
        }
        IUniswapV2Router02 _newPancakeRouter = IUniswapV2Router02(newRouter);
        uniswapV2Router = _newPancakeRouter;

        //0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F - BSC Pancake Mainnet (0x10ED43C718714eb63d5aA57B78B54704E256024E)
        //0xD99D1c33F9fC3444f8101754aBC46c52416550D1 - BSC Pancake Testnet Router address
        //0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3 - BSC Pancake Testnet Simulator address

        //0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D - Uniswap v2 - All nets
        //0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506 - SushiSwap - All nets

    }
    /// @notice Updates the DEX router address used for token conversions - for UniswapV3
    /// @param newRouter  address of the new router
    function setuniswapV3RouterAddress(address newRouter) public{
        if(msg.sender!=owner){
            return;
        }
        ISwapRouter _newuniswapRouter = ISwapRouter(newRouter);
        uniswapV3Router = _newuniswapRouter;

        //0xE592427A0AEce92De3Edee1F18E0157C05861564 - Uniswap v3 - All nets
    }
    /// @notice Checks if user has admin privilages
    /// @param account  address of user to be checked
    function check_if_admin(address account) external view returns(bool) {
        return is_admin[account];
    }

    /// @notice Give or take away admin privilages
    /// @param _address  address of user in question
    /// @param _type  1 to enable admin priviliges, 0 to remove admin priviliges
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
}