import { createContext, useContext, useEffect, useState } from "react";
import { connect, Contract, keyStores, WalletConnection } from "near-api-js";

import getConfig from "../config/near.config";

const nearConfig = getConfig("testnet");
const AppContext = createContext({});
export const  useAppContext = () => useContext(AppContext);

const AppProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [account, setAccount] = useState(null);
  const [mainContract, setMainContract] = useState(null);
  const [walletConnection, setWalletConnection] = useState(null);
  const [triedEager, setTriedEager] = useState(false);

  const initNear = async () => {
    const near = await connect(
      Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig)
    );
    const walletConnection = new WalletConnection(near);
    const account = walletConnection.account();
    const contract = await new Contract(account, nearConfig.contractName, {
      viewMethods: ["get_contracts_by_owner", "all_contracts"],
      changeMethods: ["create_new_whitelist_contract"],
    });

    return {
      walletConnection,
      accountId: walletConnection.getAccountId(),
      contract,
      account,
    };
  };

  const getContractWhitelist = async () => {
    if (mainContract && accountId) {
      const company = await mainContract.get_contracts_by_owner({
        owner_id: accountId,
      });
      if (company.length > 0) {
        const _contract = await connectContract(company[0]);
        return _contract;
      }
    }
  };

  const connectContract = async (contractName) => {
    console.log("Connecting to contract:", contractName);
    const near = await connect(
      Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig)
    );
    const walletConnection = new WalletConnection(near);
    const account = walletConnection.account();

    const contract = await new Contract(account, contractName, {
      viewMethods: [
        "get_metadata",
        "is_whitelisted",
        "is_deposited",
        "get_claimable_amount",
        "get_extra_meta"
      ],
      changeMethods: ["unlock_deposit_now", "deposit","claim_token", "add_whitelist"],
    });

    // setTicketContract(contract);
    return contract;
  };

  const login = (successUrl, failureUrl) => {
    if (!walletConnection) {
      return;
    }
    // walletConnection.requestSignIn(contractName ?? nearConfig.contractName, "B-Event App");
    walletConnection.requestSignIn({
      contractId: nearConfig.contractName,
      successUrl: successUrl ? successUrl : process.env.domain, //`${process.env.domain}/user-dashboard`,
      failureUrl: failureUrl ? failureUrl : process.env.domain//process.env.domain,
    });
  };

  const logout = () => {
    walletConnection.signOut();
    window.location.replace("/");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      initNear()
        .then(({ walletConnection, accountId, contract, account }) => {
          setWalletConnection(walletConnection);
          setMainContract(contract);
          if (walletConnection.isSignedIn()) {
            setIsAuth(true);
            setAccountId(accountId);
            setAccount(account);
          }
        })
        .finally(() => {
          setTriedEager(true);
        });
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        networkId: nearConfig.networkId,
        isAuth,
        login,
        logout,
        accountId,
        mainContract,
        account,
        connectContract,
        walletConnection,
        getContractWhitelist,
        triedEager,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
