use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::collections::UnorderedMap;

use near_sdk::{env, ext_contract, near_bindgen, AccountId, Balance, Gas, PanicOnDefault, Promise, log, PromiseResult};
/// Raw type for timestamp in nanoseconds
pub type Timestamp = u64;
near_sdk::setup_alloc!();
const CODE: &[u8] = include_bytes!("../../contract/res/contract.wasm");
const INITIAL_BALANCE: Balance = 2_000_000_000_000_000_000_000_000;
const PREPARE_GAS: Gas = 25_000_000_000_000;
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub owner_id: AccountId,
    pub contracts_by_owner: UnorderedMap<AccountId, Vec<(AccountId, String)>>,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        Self {
            owner_id,
            contracts_by_owner: UnorderedMap::new(b"contracts_by_owner".to_vec())
        }
    }
    #[payable]
    pub fn create_new_whitelist_contract(&mut self, prefix: String, metadata: WhitelistSaleMetadata) -> Promise {
        assert!(
            env::attached_deposit() == INITIAL_BALANCE,
            "Please deposit exactly contract creation fee"
        );
        let subaccount_id = format!("{}.{}", prefix, env::current_account_id());
        log!("{}", format!("Creating new ticket contract at account {}", subaccount_id));
        Promise::new(subaccount_id.clone())
            .create_account()
            .transfer(INITIAL_BALANCE)
            .add_full_access_key(env::signer_account_pk())
            .deploy_contract(CODE.to_vec())
            .then(new_whitelistsale_contract::new(
                env::predecessor_account_id(),
                metadata.clone(),
                &subaccount_id,
                0,
                PREPARE_GAS,
            ))
            .then(ex_self::check_create_new_contract(
                env::predecessor_account_id(),
                subaccount_id,
                metadata.title,
                &env::current_account_id(),
                0,
                5_000_000_000_000
            ))
    }
    #[private]
    pub fn check_create_new_contract(&mut self, creater_account: AccountId, subcontract: AccountId, title: String) {
        let mut result: bool = true;
        for i in 0..env::promise_results_count(){
            if env::promise_result(i) == PromiseResult::Failed {
                result = false; 
                break
            }
        };
        if result == false {
            log!("Fail to create new whitelistsale contract");
            Promise::new(creater_account).transfer(INITIAL_BALANCE);
        } else {
            let mut contracts = self.contracts_by_owner.get(&creater_account).unwrap_or_else(|| Vec::new());
            contracts.push((subcontract, title));
            self.contracts_by_owner.insert(&creater_account, &contracts);
        }
    }

    pub fn get_contracts_by_owner(&self, owner: AccountId) -> Vec<(AccountId, String)> {
        self.contracts_by_owner.get(&owner).unwrap()
    }
    pub fn all_contracts(&self) -> Vec<(AccountId, String)>{
        let vecs = self.contracts_by_owner.values_as_vector();
        let size = vecs.iter().fold(0, |a, b| a + b.len());
        vecs.iter().fold(Vec::with_capacity(size), |mut acc, v| {
            acc.extend(v); acc
        })
    }
}

#[ext_contract(new_whitelistsale_contract)]
trait ExtWhitelistContract {
    fn new(owner_id: AccountId, metadata: WhitelistSaleMetadata) -> Self;
}
#[ext_contract(ex_self)]
trait ExtContract{
    fn check_create_new_contract(&mut self, creater_account: AccountId, subcontract: AccountId, title: String);
}


#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub struct WhitelistSaleMetadata {
    pub title: String,
    pub fttoken_contract: AccountId,   // required, fttoken contract account id"
    pub pool_amount: Balance,   // required, pool amount in whitelist sale round
    pub tge_time: Timestamp,
    pub conversion_rate: f64, // price in near 
    pub tge_unlock: u64,
    pub cliff: u64, 
    pub vesting: u64,
    pub max_deposit: Balance
}
