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
use near_sdk::{env, near_bindgen, setup_alloc, AccountId, Balance};
use near_sdk::collections::{LookupMap, LookupSet};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{ext_contract};
use std::time::{SystemTime, UNIX_EPOCH};

const YOCTO: Balance = 1_000_000_000_000_000_000_000_000;
const TOKEN_DECIMAL: Balance = 100_000_000;
const SECONDS_IN_DAY: Timestamp = 86400000;

/// Raw type for timestamp in nanoseconds
pub type Timestamp = u64;

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

#[ext_contract(ext_self)]
trait WhitelistSale {
    fn ft_balance_callback(&self) -> String;
}

// Note: the names of the structs are not important when calling the smart contract, but the function names are
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct WhitelistSale {
    pub whitelist: LookupMap<AccountId, WhitelistInfo>,
    pub whitelist_accounts: LookupSet<AccountId>,
    pub pool_amount: Balance, 
    pub conversion_rate: u64,
    pub max_deposit: Balance,
    pub tge_unlock: u64,
    pub vesting: u64,
    pub cliff: u64,
    pub total_bought: Balance,
    pub unlock_deposit: bool,
    pub tge_time: Timestamp,
}

impl Default for WhitelistSale {
  fn default() -> Self {
    Self {
        tge_unlock: 20, // %
        cliff: 3, // month
        vesting: 20, //% monthly
        max_deposit: 10*YOCTO, // 10 NEAR
        conversion_rate: 2, // 1N = 5000token 
        pool_amount: 500_000_000_000_000, // 5M token, 8 decimals number 
        total_bought: 0,
        whitelist: LookupMap::new(b"l".to_vec()),
        whitelist_accounts: LookupSet::new(b"w".to_vec()),
        unlock_deposit: false,
        tge_time: SystemTime::now().duration_since(UNIX_EPOCH).expect("time backward").as_secs()+SECONDS_IN_DAY,
    }
  }
}

#[near_bindgen]
impl WhitelistSale {
    // Add account to whitelist 
    pub fn add_whitelist(&mut self, accounts: &[AccountId]){
        for account in accounts {
            if !self.is_whitelisted(account.into()) {
                self.whitelist_accounts.insert(account);
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
    /// deposit to contract 
    pub fn deposit(&mut self){
        assert!(
            self.is_whitelisted(env::signer_account_id()),
            "Your account is not whitelisted"
        );
        assert!(
            !self.is_deposited(env::signer_account_id()),
            "You can deposit only one time."
        );
        assert!(
            env::attached_deposit() - self.max_deposit <= 0,
            "Max deposit is {}", self.max_deposit
        );
        assert! (
            self.unlock_deposit,
            "Not unlock deposit yet"
        );
        let amount = env::attached_deposit();
        let _total_deposit = amount;
        let _total_claimable = (amount * 10000/YOCTO) * TOKEN_DECIMAL / (self.conversion_rate as Balance) ; // 1NEAR = 5000 Token
        self.total_bought += _total_claimable;
        assert!(
            self.total_bought < self.pool_amount,
            "Pool is full"
        );
        let wl_info = WhitelistInfo{total_deposit: _total_deposit, total_claimable: _total_claimable, claimed: 0};

        self.whitelist.insert(&env::signer_account_id(), &wl_info);
    }
    // return claimable amount of ft token for signer account id
    pub fn get_claimable_amount(&self) -> Balance {
        assert!(
            self.is_whitelisted(env::signer_account_id()),
            "Your account is not whitelisted"
        );
        assert!(
            self.is_deposited(env::signer_account_id()),
            "You didn't deposit yet."
        );
        let wl_info = self.whitelist.get(&env::signer_account_id()).unwrap();
        let now = SystemTime::now().duration_since(UNIX_EPOCH).expect("time backward").as_secs();
        let delta = now - self.tge_time;
        assert! (delta > 0, 
                "Not claim time.");
        let month = delta/(SECONDS_IN_DAY*30);
        let mut claimable = wl_info.total_claimable*(self.tge_unlock as u128)/100;
        if month > self.cliff {
            claimable += wl_info.total_claimable*(((month - self.cliff) * self.vesting) as u128)/100;
        }
        claimable -= wl_info.claimed;
        claimable
    }
    // Signer account id claim token after open 
    pub fn claim_token(&self){
        let claimable = self.get_claimable_amount();
        assert! (claimable > 0, 
            "Nothing to claim.");
        let mut wl_info = self.whitelist.get(&env::signer_account_id()).unwrap();
        wl_info.claimed += claimable;
        ext_ft::ft_transfer(env::signer_account_id(), claimable.to_string(), None, &"ft.thohd.testnet", 0, 5_000_000_000_000);
    }

}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 *
 * To run from contract directory:
 * cargo test -- --nocapture
 *
 * From project root, to run in combination with frontend tests:
 * yarn test
 *
 */
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    pub struct VMContextBuilder {
        context: VMContext,
    }

    impl VMContextBuilder {
        pub fn new() -> Self {
            Self {
                context: VMContext {
                    current_account_id: "".to_string(),
                    signer_account_id: "".to_string(),
                    signer_account_pk: vec![0, 1, 2],
                    predecessor_account_id: "".to_string(),
                    input: vec![],
                    block_index: 0,
                    epoch_height: 0,
                    block_timestamp: 0,
                
                    account_balance: 0,
                    account_locked_balance: 0,
                    storage_usage: 10u64.pow(6),
                    attached_deposit: 0,
                    prepaid_gas: 10u64.pow(18),
                    random_seed: vec![0, 1, 2],
                    is_view: false,
                    
                    output_data_receivers: vec![],
                },
            }
        }

        pub fn current_account_id(mut self, account_id: AccountId) -> Self {
            self.context.current_account_id = account_id;
            self
        }

        #[allow(dead_code)]
        pub fn signer_account_id(mut self, account_id: AccountId) -> Self {
            self.context.signer_account_id = account_id;
            self
        }

        pub fn predecessor_account_id(mut self, account_id: AccountId) -> Self {
            self.context.predecessor_account_id = account_id;
            self
        }


        pub fn attached_deposit(mut self, amount: Balance) -> Self {
            self.context.attached_deposit = amount;
            self
        }

        pub fn account_balance(mut self, amount: Balance) -> Self {
            self.context.account_balance = amount;
            self
        }

        #[allow(dead_code)]
        pub fn account_locked_balance(mut self, amount: Balance) -> Self {
            self.context.account_locked_balance = amount;
            self
        }

        pub fn finish(self) -> VMContext {
            self.context
        }
    }

    #[test]
    fn add_whitelist() {
        testing_env!(VMContextBuilder::new()
        .current_account_id("alice_near".to_string())
        .signer_account_id("bob_near".to_string())
        .finish());
        let mut contract = WhitelistSale::default();
        let accs = &["thohd.testnet".to_string(), "alice.thohd.testnet".to_string()];
        contract.add_whitelist(accs);
        for acc in accs {
            assert!(
                contract.whitelist_accounts.contains(acc)
            );
        }

    }
    #[test]
    #[should_panic]
    fn test_is_whitelist() {
        testing_env!(VMContextBuilder::new()
        .current_account_id("alice_near".to_string())
        .signer_account_id("bob_near".to_string())
        .finish());
        let mut contract = WhitelistSale::default();
        contract.add_whitelist(&["thohd.testnet".to_string()]);
        assert!(
            contract.is_whitelisted("tim.thohd.testnet".to_string())
        );
    }
    #[test]
    #[should_panic]
    fn test_deposit() {
        testing_env!(VMContextBuilder::new()
        .current_account_id("alice_near".to_string())
        .signer_account_id("bob_near".to_string())
        .finish());
        let mut contract = WhitelistSale::default();
        contract.add_whitelist(&[env::signer_account_id()]);    // remove panic
        let deposit = 10*YOCTO; // panic 11 NEAR 
        testing_env!(VMContextBuilder::new()
        .current_account_id("alice_near".to_string())
        .signer_account_id("bob_near".to_string())
        .attached_deposit(deposit)
        .finish());
        contract.deposit();
        assert_eq!(env::account_balance(), deposit, "Money gone");
        let wl = contract.whitelist.get(&env::signer_account_id()).unwrap();
        assert_eq!(wl.total_deposit, env::account_balance(), "deposit gone");
        assert_eq!(wl.total_claimable, 5_000_000_000_001, "wrong formula gone");
    }
    #[test]
    #[should_panic]
    fn test_deposit_again() {
        testing_env!(VMContextBuilder::new()
        .current_account_id("alice_near".to_string())
        .signer_account_id("bob_near".to_string())
        .finish());
        let mut contract = WhitelistSale::default();
        contract.add_whitelist(&[env::signer_account_id()]);    // remove panic
        let deposit = 10*YOCTO; // panic 11 NEAR 
        testing_env!(VMContextBuilder::new()
        .current_account_id("alice_near".to_string())
        .signer_account_id("bob_near".to_string())
        .attached_deposit(deposit)
        .finish());
        contract.deposit();
        assert_eq!(env::account_balance(), deposit, "Money gone");
        let wl = contract.whitelist.get(&env::signer_account_id()).unwrap();
        assert_eq!(wl.total_deposit, env::account_balance(), "deposit gone");
        assert_eq!(wl.total_claimable, 5_000_000_000_000, "wrong formula gone");

        testing_env!(VMContextBuilder::new()
        .current_account_id("alice_near".to_string())
        .signer_account_id("bob_near".to_string())
        .account_balance(deposit)
        .attached_deposit(deposit)
        .finish());
        contract.deposit();

    }
}
