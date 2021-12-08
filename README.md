# demo_near_ncdl1
Demo project for Near Certified Development Level 1
--
Project: Whitelist Sale 
Contract: WhitelistSale 
  Language: Rust
dApp: WhitelistSale
  Language React
  
  ---
  This demo is a simple version of WhitelistSale module which i develop for a project in bsc
  
  A ton of address will be add to WhitelistSale Contract from dApp, here in nearprotocol are accounts. 
  
  Any account which was added to WhitelistSale contract is called whitelisted account.
  
  Any whitelisted account can deposit Near (Maximum Deposit also defined in contract) to buy FT token which is main object to sell of whitelist round in many blockchain project.
  
  After whitelisted account deposited Near, his FT token claimable will be calculated and store into a vesting schedule, which also store in contract.
  
  Follow vesting schedule, account can claim an amount of FT token at specified time.
  
  ---
  Project can be run as "npm run dev"
