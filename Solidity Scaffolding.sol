//pragma solidity ^0.5.0;
pragma solidity ^0.6.12;

contract Donation_Processor {


    //User donates crypto assets into Smart Contract on Ethereum
    function process_donation(uint _amount,string calldata _currency, string calldata organization_name, uint organization_ein, address payable charity_wallet, address currency_address, uint decimals) external payable{
        //User donates any ERC-20 token by sending it into the smart contract
        //Smart contract converts the donated crypto into stablecoins
    }

    //Accumulated stablecoins from the previous function are allocated to the recipient charity
    function process_money_transfer(uint _amount, address payable charity_wallet, IERC20 _final_token) internal{
        
        //Each charity has their own balance, which needs to be updated with every donation transaction
        
    }

    //Donation transaction is recorded on the blockchain with adequate information for tax reporting purposes
    function store_donation_data(uint _amount, string memory _currency,uint stablecoin_amount, address charity_wallet,string memory _org_name, uint _org_ein, uint _decimals) internal{
        //emit Events that the front-end can detect and display as transaction receipts
        
    }


    //Charity can withdraw accumulated donations into their wallets
    function withdraw_donation(address _charity_address, address _withdraw_address, uint _amount) public{

        //charity balance needs to be reduced
        //stablecoins are then transferrred to the charity's wallet address
    }

    
}

