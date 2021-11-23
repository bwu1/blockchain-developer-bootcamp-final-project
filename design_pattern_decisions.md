# Design Pattern Decisions


1. Inter-Contract Execution

-When accepting donation payments, my application connects to Uniswap's V3 router and programmatically executes token swaps, converting the donated ERC-20 tokens into stablecoins (USDC)


2. Upgradable Contracts

- There are 2 smart contracts at the core of the app - Donation_Processor and Donation_Upgrade. 
- Donation_Processor is responsible for storing the contract's data. 
- Donation_Upgrade is responsible for executing the contract's logic via a delegate_call from Donation_Processor
-The contracts can be upgraded by deploying a newer version of Donation_Upgrade and updating Donation_Processor's "delegate_address" variable