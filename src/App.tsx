

import { useCallback, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

import { useQueryClient, useWallet, useSigningClient } from '@sei-js/react'
import { GasPrice, SigningStargateClient, StdFee, defaultRegistryTypes } from '@cosmjs/stargate'
import Long from 'long'
import {Registry} from '@cosmjs/proto-signing'

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



const gasPrice = GasPrice.fromString('0.002usei');
  const gasLimits = {
    send: 200000,
  };



function App() {
  const [count, setCount] = useState(0)

  const { offlineSigner } = useWallet(window, {
    inputWallet: 'keplr',
    autoConnect: true,
    chainConfiguration: chainConfig,
  })

  const { queryClient, isLoading } = useQueryClient(chainConfig.restUrl)
  const { signingClient } = useSigningClient(chainConfig.rpcUrl, offlineSigner)

  console.log("SigningClient",signingClient)
  const options = { gasPrice: gasPrice, gasLimits: gasLimits, registry: new Registry([...signingClient.registry]) };
  
  const stargateClient = async() =>{
      const client = await SigningStargateClient.connect(chainConfig.rpcUrl, offlineSigner, options)
      return client
  }

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
  const msgPlaceOrder = async () => {


    const client = await stargateClient()

    let msgOrder = {
      typeUrl: '/seiprotocol.seichain.dex.MsgPlaceOrders',
      value: {
        creator: address,
        funds: [{ denom: "uusdc", amount: "5000000" }],
        contractAddr: contractAddr,
        orders: [{
          id: 0,
          status: 0,
          account: address,
          contractAddr: contractAddr,
          price: "200000",
          quantity: "1",
          priceDenom: "USDC",
          assetDenom: "SEI",
          orderType: 0,
          positionDirection: 1,
          data: "{\"leverage\":\"1\",\"position_effect\":\"Open\"}",
          statusDescription: ""
        }]
      }
    }

    console.log("msg ", msgOrder)
    console.log("signingCLient", signingClient)
    const res = await client.signAndBroadcast(address, [msgOrder], fee, "test msg place order")
    console.log("msg place order response", res)
  }

  const getAccountBalance = useCallback(async () => {
    if (!isLoading) {

      // const wallet = await DirectSecp256k1Wallet.fromKey(fromHex(privKey), 'sei');
      const accounts = await offlineSigner?.getAccounts();
      console.log("account address", accounts);


      // Check whether account exist in blockchain or not 
      const account = await queryClient.sei.auth.v1beta1.account({ address: accounts[0].address });
      console.log("account info", account)

      // If account not exist call the faucet 



      // Query the account balance
      const accountBalance = await queryClient.sei.bank.v1beta1.allBalances({ address: accounts[0].address });
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
        priceDenom: "SEI",
        assetDenom: "USDC"
      })
      console.log("get long book query", query)
    }

  }, [isLoading])

  const getOrdersOfAccount = useCallback(async () => {
    if (!isLoading) {
      const query = await queryClient.seiprotocol.seichain.dex.getOrders({
        contractAddr: contractAddr,
        account: "sei1kn2cp4n0cfg9063ny7my3qznte8ea07qh3qqcs",
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