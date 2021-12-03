import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'
import { utils } from 'near-api-js'
const BN = require("bn.js");

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')
const nearConfig = getConfig(process.env.NODE_ENV || 'development')
const decimal = 8
const ownerAddress = "thohd.testnet"
    // after submitting the form, we want to show Notification
const GAS_DEFAULT = 300000000000000
export default function App() {
  // use React Hooks to store greeting in component state
  const [is_whitelisted, set_whitelisted_state] = React.useState(0)
  const [is_deposited, set_deposited_state] = React.useState(0)
  const [is_unlocked_deposit, set_unlocked_deposit_state] = React.useState(0)
  const [tge_time, set_tge_time] = React.useState(0)
  const [pool_amount, set_pool_amount] = React.useState(0)
  const [total_bought, set_total_bought] = React.useState(0)
  const [max_deposit, set_max_deposit] = React.useState(0)
  const [showNotification, setShowNotification] = React.useState(false)

  const childToParent = (childdata) => {
    setShowNotification (childdata);
  }

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js

        window.contract.is_whitelisted({ account_id: window.accountId })
          .then(is_whitelistedFromContract => {
            console.log("is_whitelistedFromContract", is_whitelistedFromContract)
            set_whitelisted_state(is_whitelistedFromContract ? 1 : 0)
        })
        window.contract.is_deposited({ account_id: window.accountId })
        .then(is_depositedFromContract => {
          console.log("is_depositedFromContract", is_depositedFromContract)
          set_deposited_state(is_depositedFromContract ? 1 : 0)
        })
        window.contract.is_unlock_deposit()
        .then(is_unlocked_depositFromContract => {
          console.log("is_unlocked deposit FromContract", is_unlocked_depositFromContract)
          set_unlocked_deposit_state(is_unlocked_depositFromContract ? 1 : 0)
        })
        window.contract.get_tge_time()
        .then(tge_time_fromContract => {
          let tge = Date(tge_time_fromContract/1000000).toString()
          console.log("tge_time_fromContract", tge)
          set_tge_time(tge_time_fromContract)
        })      
        window.contract.get_pool_amount()
        .then(pool_amount_fromContract => {
          console.log("pool_amount_fromContract", pool_amount_fromContract)
          set_pool_amount(pool_amount_fromContract)
        })      
        window.contract.get_max_deposit()
        .then(max_deposit_fromContract => {
          console.log("max_deposit_fromContract", max_deposit_fromContract)
          set_max_deposit(Math.round(max_deposit_fromContract/10**24))
        })      
        window.contract.get_total_bought()
        .then(total_bought_fromContract => {
          console.log("total_bought_fromContract", total_bought_fromContract)
          set_total_bought(total_bought_fromContract)
        })      
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEAR!</h1>
        <p>
          To make use of the NEAR blockchain, you need to sign in. The button
          below will sign you in using NEAR Wallet.
        </p>
        <p>
          By default, when your app runs in "development" mode, it connects
          to a test network ("testnet") wallet. This works just like the main
          network ("mainnet") wallet, but the NEAR Tokens on testnet aren't
          convertible to other currencies – they're just for testing!
        </p>
        <p>
          Go ahead and click the button below to try it out:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          <label
            style={{
              color: 'var(--secondary)',
              borderBottom: '2px solid var(--secondary)'
            }}
          >
            {nearConfig.contractName}
          </label>
          {' '/* React trims whitespace around tags; insert literal space character when needed */}
          {window.accountId}!<br/>
          <label>Whitelist Sale Contract</label><br/>
          <label>TGE Time: {new Date(tge_time/1000000).toString()}</label><br/>
          <label>Is Whitelisted: {is_whitelisted}</label><br/>
          <label>Pool: {pool_amount/10**decimal}</label><br/>
          <label>Filled: {total_bought/10**decimal} ({total_bought*100/pool_amount}%)</label>
        </h1>
        <ShowForm childToParent={childToParent} is_deposited={is_deposited}
            is_whitelisted={is_whitelisted}
            max_deposit={max_deposit} 
            is_unlocked_deposit={is_unlocked_deposit}/>
        <hr />
        <p>
          To keep learning, check out <a target="_blank" rel="noreferrer" href="https://docs.near.org">the NEAR docs</a> or look through some <a target="_blank" rel="noreferrer" href="https://examples.near.org">example apps</a>.
        </p>
      </main>
      {showNotification && <Notification />}
    </>
  )
}

function AddWhitelistForm({childToParent}){
    // when the user has not yet interacted with the form, disable the button
  const [buttonAddWhitelistDisabled, setButtonAddWhitelistDisabled] = React.useState(true)

  return (

  <form onSubmit={async event => {
    event.preventDefault()

    // get elements from the form using their id attribute
    const { fieldset, accounts } = event.target.elements

    // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
    const newAccounts = accounts.value

    // disable the form while the value gets updated on-chain
    fieldset.disabled = true

    try {
      let accs = newAccounts.split(",")
      // make an update call to the smart contract
      await window.contract.add_whitelist({
        // pass the value that the user entered in the greeting field
        accounts: accs
      })
    } catch (e) {
      alert(
        'Something went wrong! ' +
        'Maybe you need to sign out and back in? ' +
        'Check your browser console for more info.'
      )
      throw e
    } finally {
      // re-enable the form, whether the call succeeded or failed
      fieldset.disabled = false
    }


    // show Notification
    childToParent(true)

    // remove Notification again after css animation completes
    // this allows it to be shown again next time the form is submitted
    setTimeout(() => {
      childToParent(false)
    }, 11000)
  }}>
    <fieldset id="fieldset">
      <label
        htmlFor="accounts"
        style={{
          display: 'block',
          color: 'var(--gray)',
          marginBottom: '0.5em'
        }}
      >
        Add Whitelist Account
      </label>
      <div style={{ display: 'flex' }}>
        <input
          autoComplete="off"
          defaultValue=""
          id="accounts"
          onChange={e => setButtonAddWhitelistDisabled(e.target.value.length == 0)}
          style={{ flex: 1 }}
        />
        <button
          disabled={buttonAddWhitelistDisabled}
          style={{ borderRadius: '0 5px 5px 0' }}
        >
          Save
        </button>
      </div>
    </fieldset>
  </form>
  )
}
function ClaimButton(){
    return(
      <button>Claim</button>
    )
}
function UnlockDepositButton(){
  return(
    <button onClick = {async event => {
      event.preventDefault()
      await window.contract.unlock_deposit_now({})
      }
    }
    >UnlockDeposit</button>
  )
}
function ShowForm({childToParent, is_whitelisted, is_deposited, max_deposit, is_unlocked_deposit}){
      return (
        <div>
        {window.accountId === ownerAddress &&<AddWhitelistForm childToParent={childToParent}/>}
        {(window.accountId === ownerAddress && !is_unlocked_deposit) &&<UnlockDepositButton/>}
        
        {!is_whitelisted && <label>Whitelist is not open</label>}
        {(is_whitelisted && !is_deposited) && <DepositForm childToParent={childToParent} max_deposit={max_deposit}/>}
        {(is_whitelisted && is_deposited) && <ClaimButton/>}
        </div>
        )
}
function DepositForm({setShowNotification, max_deposit}){
    // when the user has not yet interacted with the form, disable the button
    const [buttonDepositDisabled, setButtonDepositDisabled] = React.useState(true)
    return (
  <form onSubmit={async event => {
    event.preventDefault()

    // get elements from the form using their id attribute
    const { fieldset, amount } = event.target.elements

    // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
    const depositAmount = amount.value

    // disable the form while the value gets updated on-chain
    fieldset.disabled = true

    try {
      let DEPOSIT_AMOUNT =  utils.format.parseNearAmount(depositAmount) + GAS_DEFAULT
      console.log("deposit", DEPOSIT_AMOUNT)
      // make an update call to the smart contract
      await window.contract.deposit({},GAS_DEFAULT,  
         (new BN(depositAmount)).mul(new BN(10).pow(new BN(24)))
      );
    } catch (e) {
      alert(
        'Something went wrong! ' +
        'Maybe you need to sign out and back in? ' +
        'Check your browser console for more info.'
      )
      throw e
    } finally {
      // re-enable the form, whether the call succeeded or failed
      fieldset.disabled = false
    }


    // show Notification
    setShowNotification(true)

    // remove Notification again after css animation completes
    // this allows it to be shown again next time the form is submitted
    setTimeout(() => {
      setShowNotification(false)
    }, 11000)
  }}>
    <fieldset id="fieldset">
      <label
        htmlFor="amount"
        style={{
          display: 'block',
          color: 'var(--gray)',
          marginBottom: '0.5em'
        }}
      >
        Deposit NEAR (Max:{max_deposit}NEAR)
      </label>
      <div style={{ display: 'flex' }}>
        <input
          type = "text"
          autoComplete="off"
          defaultValue=""
          id="amount"
          onKeyPress={(event) => {
            if (!/[0-9]/.test(event.key)) {
              event.preventDefault();
            }
          }}
    
          onChange={e => {
            let v = parseInt(e.target.value)
            setButtonDepositDisabled(v <= 0 || v>10)
            // if (v < 0 || v > 10) {
            //   setErrorText("Maximum deposit is 10 Near")
            // } else {
            //   setErrorText("")
            // }
          }
          }
          style={{ flex: 1 }}
        />
        <button
          disabled={buttonDepositDisabled}
          style={{ borderRadius: '0 5px 5px 0' }}
        >
          Deposit
        </button>
      </div>
    </fieldset>
  </form>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called a method in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
