import { useCallback, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

import { useQueryClient, useWallet, useSigningClient } from '@sei-js/react'
import {   StdFee} from '@cosmjs/stargate' 
import Long from 'long'


const address = "sei129ekzf5pmmtf2ktkutzpkxch0pedkvq2sqqzkw";
const contractAddr = "sei14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sh9m79m";

const chainConfig = {
  chainId: "sei",
  rpcUrl: 'https://rpc.sei.autonomy.network/',
  restUrl: 'https://lcd.sei.autonomy.network/',
}

const fee: StdFee = {
  amount: [
    {
      denom: 'usei',
      amount: '2000',
    },
  ],
  gas: '200000',
};


function App() {
  const [count, setCount] = useState(0)

  const { offlineSigner } = useWallet(window, {
    inputWallet: 'keplr',
    autoConnect: true,
    chainConfiguration: chainConfig,
  })

  let { queryClient, isLoading } = useQueryClient(chainConfig.restUrl)
  const { signingClient } = useSigningClient(chainConfig.rpcUrl, offlineSigner)
  useEffect(() => {
    suggestChain()
    getAccountBalance();
    getShorBookAllQuery();
    getLongBookAllQuery();
    getOrdersOfAccount();
    msgPlaceOrder();
  }, [isLoading])

  const suggestChain = async () => {
    return window.keplr.experimentalSuggestChain({
      chainId: chainConfig.chainId,
      chainName: "Sei Devnet",
      rpc: chainConfig.rpcUrl,
      rest: chainConfig.restUrl,
      bip44: {
        coinType: 118,
      },
      bech32Config: {
        bech32PrefixAccAddr: "sei",
        bech32PrefixAccPub: "sei" + "pub",
        bech32PrefixValAddr: "sei" + "valoper",
        bech32PrefixValPub: "sei" + "valoperpub",
        bech32PrefixConsAddr: "sei" + "valcons",
        bech32PrefixConsPub: "sei" + "valconspub",
      },
      currencies: [
        {
          coinDenom: "SEI",
          coinMinimalDenom: "usei",
          coinDecimals: 6,
          coinGeckoId: "sei",
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "SEI",
          coinMinimalDenom: "usei",
          coinDecimals: 6,
          coinGeckoId: "sei",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      stakeCurrency: {
        coinDenom: "sei",
        coinMinimalDenom: "usei",
        coinDecimals: 6,
        coinGeckoId: "sei",
      },
    });

  }


  
  // Msg Place order for Long/Short SEI/USDC pair


  // CASE 1: Sell SEI
  const msgPlaceOrder = async () => {
    let msgOrder = {
      typeUrl: '/seiprotocol.seichain.dex.MsgPlaceOrders',
      value: {
        creator: address,
        funds: [{ denom: "usei", amount: "5000000" }], // Check this updat to usei
        contractAddr: contractAddr,
        orders: [{
          id: Long.fromNumber(0),
          status: 0,
          account: address,
          contractAddr: contractAddr,
          price:"100000000000000000",
          quantity: "2000000000000000000",
          priceDenom: "USDC",
          assetDenom: "SEI",
          orderType: 0,
          positionDirection: 1, // Long - 0 , Short -1
          data: "{\"leverage\":\"1\",\"position_effect\":\"Open\"}",
          statusDescription: ""
        }]
      }
    }

    const res = await signingClient.signAndBroadcast(address, [msgOrder], fee, "test msg place order")
    console.log("msg place order response", res)
  }


  // CASE 2: Buy SEI
  // const msgPlaceOrder = async () => {
  //   let msgOrder = {
  //     typeUrl: '/seiprotocol.seichain.dex.MsgPlaceOrders',
  //     value: {
  //       creator: address,
  //       funds: [{ denom: "uusdc", amount: "5000000" }], // Check this  update to uusdc
  //       contractAddr: contractAddr,
  //       orders: [{
  //         id: Long.fromNumber(0),
  //         status: 0,
  //         account: address,
  //         contractAddr: contractAddr,
  //         price:"100000000000000000",  // check the prices in orderbook  1 * 10 ^ 18
  //         quantity: "2000000000000000000", // 1 * 10 ^ 18
  //         priceDenom: "USDC",
  //         assetDenom: "SEI",
  //         orderType: 0,  // 0 -Limit, 1 - Market
  //         positionDirection: 0,  // Check this 0 - Long, 1 - Short 
  //         data: "{\"leverage\":\"1\",\"position_effect\":\"Open\"}",
  //         statusDescription: ""
  //       }]
  //     }
  //   }

  //   const res = await signingClient.signAndBroadcast(address, [msgOrder], fee, "test msg place order")
  //   console.log("msg place order response", res)
  // }


  const getAccountBalance = useCallback(async () => {
    if (!isLoading) {

      // const wallet = await DirectSecp256k1Wallet.fromKey(fromHex(privKey), 'sei');
      const accounts = await offlineSigner?.getAccounts();
      console.log("account address", accounts);

      // Use axios to call the faucet endpoint to get the tokens


      // Query the account balance
      const accountBalance = await queryClient.cosmos.bank.v1beta1.allBalances({ address: accounts[0].address });
      console.log("account Balance", accountBalance);

    }

  }, [isLoading])

  const getShorBookAllQuery = useCallback(async () => {

    if (!isLoading) {
      const query = await queryClient.seiprotocol.seichain.dex.shortBookAll({
        contractAddr: contractAddr,
        priceDenom: "USDC",
        assetDenom: "SEI"
      })
      console.log("get short book query", query)
    }

  }, [isLoading])


  const getLongBookAllQuery = useCallback(async () => {
    if (!isLoading) {
      const query = await queryClient.seiprotocol.seichain.dex.longBookAll({
        contractAddr: contractAddr,
        priceDenom: "USDC",
        assetDenom: "SEI"
      })
      console.log("get long book query", query)
    }

  }, [isLoading])

  const getOrdersOfAccount = useCallback(async () => {
    if (!isLoading) {
      const query = await queryClient.seiprotocol.seichain.dex.getOrders({
        contractAddr: contractAddr,
        account: address,
      })
      console.log("Get orders of the account", query)
    }

  }, [isLoading])


  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App