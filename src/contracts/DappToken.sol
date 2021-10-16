pragma solidity ^0.7.6;
//pragma solidity ^0.6.12;
// SPDX-License-Identifier: Unlicensed
contract DappToken {
    string  public name = "DApp Token";
    string  public symbol = "DAPP";
    uint256 public totalSupply = 1000000*10**18; // 1 million tokens
    uint8   public decimals = 18;
    //address[] public existing_holders; array of all current token holders with a balance > 0

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() public {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }


    /*function burn(){//////////////sends token to burn address

    }*/

/*
    //1. After contract creation, manually transfer tokens needed for staking from owner's wallet to this smart contract
    //2. Call stake function below to stake this smart contract's initial token balance

    function claim_rewards() public returns (bool success) {
        //use a cron job to repeatedly call this function externally

        //1. check amount of claimable rewards of the target protocol
        //2. if above a certain amount, claim rewards to this smart contract
        //3. programmatically sell this smart contract's accumulated rewards on a DEX
        //4. (optional) call the stake function below to auto-compound staking 
        return true;
    }
    function unstake(uint256 amount) public returns (bool success) {
        //1. execute unstaking logic in the target protocol
        return true;
    }
    function stake(uint256 amount) public returns (bool success) {
        //1. execute staking logic in the target protocol
        return true;
    }
    function terminate_staking() public returns (bool success) {
        //1. call unstake function
        //2. transfer tokens from this smart contract back into the owner's wallet address
        return true;
    }




*/


}
