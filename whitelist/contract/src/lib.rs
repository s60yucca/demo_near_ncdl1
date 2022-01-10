/*
 * This is an example of a Rust smart contract with two simple, symmetric functions:
 *
 * 1. set_greeting: accepts a greeting, such as "howdy", and records it for the user (account_id)
 *    who sent the request
 * 2. get_greeting: accepts an account_id and returns the greeting saved for it, defaulting to
 *    "Hello"
 *
 * Learn more about writing NEAR smart contracts with Rust:
 * https://github.com/near/near-sdk-rs
 *
 */
/// The contract keeps at least 3.5 NEAR in the account to avoid being transferred out to cover
/// contract code storage and some internal state.
pub const MIN_BALANCE_FOR_STORAGE: u128 = 3_500_000_000_000_000_000_000_000;

// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, setup_alloc, AccountId, Balance, ext_contract, Timestamp, BorshStorageKey, PanicOnDefault};
use near_sdk::collections::{LookupMap, LookupSet};
use near_sdk::serde::{Deserialize, Serialize};

const YOCTO: Balance = 1_000_000_000_000_000_000_000_000;
const TOKEN_DECIMAL: Balance = 1000_000_000;
const NANOSECONDS_IN_DAY: Timestamp = 86400_000_000_000; //nanoseconds
// const TGE_IN_NANO: Timestamp = 1638489600_000_000_000; // 2021_12_03

setup_alloc!();
// Structs in Rust are similar to other languages, and may include impl keyword as shown below
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct WhitelistInfo {
    pub total_deposit: Balance, // Near deposit max 10N
    pub total_claimable: Balance, //
    pub claimed: Balance,
}

#[ext_contract(ext_ft)]
trait FungibleToken {
    // change methods
    fn ft_transfer(&mut self, receiver_id: String, amount: String, memo: Option<String>);
    fn ft_transfer_call(&mut self, receiver_id: String, amount: String, memo: Option<String>, msg: String) -> U128;

    // view methods
    fn ft_total_supply(&self) -> String;
    fn ft_balance_of(&self, account_id: String) -> String;
}


// Note: the names of the structs are not important when calling the smart contract, but the function names are
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct WhitelistSale {
    pub owner_id: AccountId,
    pub whitelist: LookupMap<AccountId, WhitelistInfo>,
    pub whitelist_accounts: LookupSet<AccountId>,
    pub metadata: WhitelistSaleMetadata, 
    pub unlock_deposit: bool,
    pub total_bought: Balance, // required, total_bought in whitelist sale round

}
#[ext_contract(ext_self)]
trait WhitelistSale {
    fn ft_balance_callback(&self) -> String;
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    // FungibleToken,
    // Metadata,
    WhitelistInfo,
    WhitelistAccount
}

#[near_bindgen]
impl WhitelistSale {
    #[init]
    pub fn new(owner_id: AccountId, metadata: WhitelistSaleMetadata) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            owner_id,
            metadata: metadata,
            whitelist: LookupMap::new(StorageKey::WhitelistInfo),
            whitelist_accounts: LookupSet::new(StorageKey::WhitelistAccount),
            unlock_deposit: false,
            total_bought: 0,
        }
    }
    // get unlock deposit status 
    pub fn get_metadata(&self) -> WhitelistSaleMetadata{
        self.metadata.clone()
    }

    // Add account to whitelist 
    pub fn add_whitelist(&mut self, accounts: Vec<AccountId>){
        for account in accounts.iter() {
            if !self.is_whitelisted(account.to_string()) {
                self.whitelist_accounts.insert(&account);
            }
        }
    }
    /// Returns `true` if the given account ID is whitelisted.
    pub fn is_whitelisted(&self, account_id: AccountId) -> bool {
        assert!(
            env::is_valid_account_id(account_id.as_bytes()),
            "The given account ID is invalid"
        );
        self.whitelist_accounts.contains(&account_id)
    }

    /// Returns `true` if the given account ID already deposited.
    pub fn is_deposited(&self, account_id: AccountId) -> bool {
        assert!(
            env::is_valid_account_id(account_id.as_bytes()),
            "The given account ID is invalid"
        );
        self.whitelist.contains_key(&account_id)
    }
    pub fn get_extra_meta(&self) -> (bool, u128) {
        (self.unlock_deposit, self.total_bought)
    }
    // unlock deposit into the contract
    pub fn unlock_deposit_now(&mut self) {
        assert!(!self.unlock_deposit, "Already Unlock");
        self.unlock_deposit = true;
    }
    /// deposit to contract 
    #[payable]
    pub fn deposit(&mut self){
        assert!(
            self.is_whitelisted(env::predecessor_account_id()),
            "Your account is not whitelisted"
        );
        assert!(
            !self.is_deposited(env::predecessor_account_id()),
            "You can deposit only one time."
        );
        assert!(
            env::attached_deposit() <= self.metadata.max_deposit ,
            "Max deposit is {}", self.metadata.max_deposit
        );
        assert! (
            self.unlock_deposit,
            "Not unlock deposit yet"
        );
        let amount = env::attached_deposit();
        let _total_deposit = amount;
        let _total_claimable = (amount * 10000/YOCTO) * TOKEN_DECIMAL / (self.metadata.conversion_rate as Balance) ; // 1NEAR = 5000 Token
        
        assert!(
            self.total_bought + _total_claimable< self.metadata.pool_amount,
            "Pool is full"
        );
        self.total_bought += _total_claimable;
        let wl_info = WhitelistInfo{total_deposit: _total_deposit, total_claimable: _total_claimable, claimed: 0};

        self.whitelist.insert(&env::signer_account_id(), &wl_info);
    }
    // return claimable amount of ft token for signer account id
    pub fn get_claimable_amount(&self, account_id: AccountId) -> Balance {
        assert!(
            self.is_whitelisted(account_id.clone()),
            "Your account is not whitelisted"
        );
        assert!(
            self.is_deposited(account_id.clone()),
            "You didn't deposit yet."
        );
        let wl_info = self.whitelist.get(&account_id).unwrap();
        let delta = env::block_timestamp() - self.metadata.tge_time;
        assert! (delta > 0, 
                "Not claim time.");
        let month = delta/(NANOSECONDS_IN_DAY*30);
        let mut claimable = wl_info.total_claimable*(self.metadata.tge_unlock as u128)/100;
        if month > self.metadata.cliff.into() {
            claimable += wl_info.total_claimable*(((month - self.metadata.cliff) * self.metadata.vesting) as u128)/100;
        }
        claimable -= wl_info.claimed;
        claimable
    }
    // Signer account id claim token after open 
    pub fn claim_token(&mut self){
        let account = env::signer_account_id();
        let claimable = self.get_claimable_amount(account);
        assert! (claimable > 0, 
            "Nothing to claim.");
        let mut wl_info = self.whitelist.get(&env::signer_account_id()).unwrap();
        wl_info.claimed += claimable;
        ext_ft::ft_transfer(env::signer_account_id(), claimable.to_string(), None, &"ft.thohd.testnet", 0, 5_000_000_000_000);
    }

}
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub struct WhitelistSaleMetadata {
    pub fttoken_contract: AccountId,   // required, fttoken contract account id"
    pub pool_amount: Balance,   // required, pool amount in whitelist sale round
    pub tge_time: Timestamp,
    pub conversion_rate: f64, // price in near 
    pub tge_unlock: u64,
    pub cliff: u64, 
    pub vesting: u64,
    pub max_deposit: Balance,
}
