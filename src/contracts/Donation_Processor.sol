pragma solidity ^0.7.6;
//pragma solidity ^0.6.12;
// SPDX-License-Identifier: Unlicensed
pragma experimental ABIEncoderV2;
import "./DaiToken.sol";

contract Donation_Processor {
    string public name = "Donation_Processor";
    //DaiToken public daiToken;
    address public owner;
    //address public final_currency = 0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7;////Pancakeswap simulator BUSD address
    //address public final_currency = 0x2963EEef46978C745b45B6Da29B78d9cC0708855;////convert all donations into stablecoins, currently set to fake stablecoin (BSC testnet)
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
    address public delegate_address;

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


    constructor() public {//DaiToken _daiToken
        //daiToken = _daiToken;
        owner = msg.sender;
        is_admin[msg.sender]=true;
        //setRouterAddress(0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506);
        setRouterAddress(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        //setRouterAddress(0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3);
        setuniswapV3RouterAddress(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    }
     //to recieve ETH from uniswapV2Router when swaping
    receive() external payable {}


    function process_donation(uint _amount,string calldata _currency, string calldata organization_name, uint organization_ein, address payable charity_wallet, address currency_address, uint decimals) external payable{
        //delegate_address.delegatecall(abi.encode(bytes4(keccak256("process_donation(uint256,string,string,uint256,address,address)")), _amount, _currency, organization_name, organization_ein, charity_wallet, currency_address)); 
        delegate_address.delegatecall(abi.encodeWithSignature("process_donation(uint256,string,string,uint256,address,address,uint256)", _amount, _currency, organization_name, organization_ein, charity_wallet, currency_address, decimals));

    }
    function execute_token_burn() external{
        //delegate_address.delegatecall(abi.encode(bytes4(keccak256("execute_token_burn()"))));
        delegate_address.delegatecall(abi.encodeWithSignature("execute_token_burn()"));

    }
    function withdraw_donation(address _charity_address, address _withdraw_address, uint _amount) public{

        delegate_address.delegatecall(abi.encodeWithSignature("withdraw_donation(address,address,uint256)", _charity_address, _withdraw_address, _amount));

    }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////Utility Functions///////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function get_available_withdraw_amount(address charity_address) public view returns (uint){
        return donationAllocation[charity_address];
    }
    /*function get_wire_transfer_array() external view returns (wire_request[] memory){
        return wire_request_array;
    }
    function get_donation_transactions(address fetch_account, uint fetch_type) external view returns (donation_transaction[] memory){//public
        if(fetch_type==0){
            return donation_transactions[fetch_account];
        }
        else{
            return token_holder_donations[fetch_account];
        }
    }*/
    function get_collected_transaction_fees() public view returns (uint){
        return collected_transaction_fees;
    }
    function set_donation_transaction_fee(uint _new_fee) external{
        if(msg.sender!=owner){//only owner can change
                return;
        }
        donation_transaction_fee=_new_fee;
        return;
    }
    function set_final_currency(address _contract_address) external{
        if(msg.sender!=owner){//only owner can change
                return;
        }
        final_currency=_contract_address;
        final_currency_decimal = IERC20(_contract_address).decimals();
        return;
    }

    function transfer_owner(address newOwner) public{//not tested yet
        if(msg.sender!=owner){
            return;
        }
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        owner = newOwner;
    }
    function set_delegate_address(address _contract_address) external{
        if(msg.sender!=owner){//only owner can change
                return;
        }
        delegate_address=_contract_address;
        return;
    }
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
    function setuniswapV3RouterAddress(address newRouter) public{
        if(msg.sender!=owner){
            return;
        }
        ISwapRouter _newuniswapRouter = ISwapRouter(newRouter);
        uniswapV3Router = _newuniswapRouter;

        //0xE592427A0AEce92De3Edee1F18E0157C05861564 - Uniswap v3 - All nets
    }
    function check_if_admin(address account) external view returns(bool) {
        return is_admin[account];
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
}