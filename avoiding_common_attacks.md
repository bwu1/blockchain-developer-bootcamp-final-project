# Avoiding Common Attacks


1. Proper use of .call and .delegateCall

- There are 2 smart contracts at the core of the app - Donation_Processor and Donation_Upgrade. 
- Donation_Processor is responsible for storing the contract's data, while Donation_Upgrade is responsible for executing the contract's logic via a delegate_call from Donation_Processor
- The contracts are set up so that Donation_processor properly calls Donaton_Upgrade when executing function logic. This enables upgradable smart contracts because newer versions of Donation_Upgrade (which hosts the function logic) can be deployed. 
- After changing the "delegate_address" variable inside Donation_Processor, new function logic can be executed while maintaining the existing stored data


2. Forcibly Sending Ether

- The smart contract has this code "receive() external payable {}" to prevent maliciously/forcibly sent Ether (and also to recieve ETH from UniSwap when swaping)