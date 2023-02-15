import { useCallback, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

import {useQueryClient, }from '@sei-js/react'
import { DirectSecp256k1Wallet} from '@cosmjs/proto-signing'
import {fromHex} from '@cosmjs/encoding';
import { coins, GasPrice } from '@cosmjs/stargate'
import {SigningStargateClient} from '@cosmjs/stargate'
import {getSigningClient} from '@sei-js/core'




const privKey = "5f609f16cbde54ce24f3b3c04bc330ae78c6cf61a609a863a12f242f1648a868";
const address  = "sei1g3up87c3ae95nt9ae3lu6jdsak3xd2n9yd6m6d";


const gasPrice = GasPrice.fromString('0.01usei');
const gasLimits = {
  send: 200000,
};

 function App() {

  const [count, setCount] = useState(0)
  const { queryClient, isLoading } = useQueryClient("https://sei-testnet-rest.brocha.in")

  useEffect(()=>{
      getAccountBalance();
        getShorBookAllQuery();
        getSigningClientO();
        getSeiSigningClient();
      sendTokens();
  },[])


  
  const getSigningClientO = async () =>{
    const options = { gasPrice: gasPrice, gasLimits: gasLimits , registry: await (await getSeiSigningClient()).registry };

    const wallet = await DirectSecp256k1Wallet.fromKey(fromHex(privKey), 'sei');
    
    const client = await SigningStargateClient.connectWithSigner("localhost:26657",wallet,options);
    console.log(client)
    return client
  }

  const getSeiSigningClient= async () =>{
    const wallet = await DirectSecp256k1Wallet.fromKey(fromHex(privKey), 'sei');

    const seiClient = await getSigningClient("localhost:26657",wallet)
    return seiClient
  }

  const sendTokens = async () =>{
    const client = await getSigningClientO()
    const resSend = await client.sendTokens(address, address, coins(1000000, 'usei'), "auto","test token transfer");
  console.log(resSend);
}

  const getAccountBalance = useCallback(async () =>{
    if (!isLoading){

      const wallet = await DirectSecp256k1Wallet.fromKey(fromHex(privKey), 'sei');
      const [account] = await wallet.getAccounts();
      console.log(account.address);
      const accountBalance = await queryClient.cosmos.bank.v1beta1.allBalances({address: account.address});
      console.log("account Balance",accountBalance);
    }
 
    },[isLoading])

  const getShorBookAllQuery = useCallback (async () =>{

    if (!isLoading){
      const query = await queryClient.seiprotocol.seichain.dex.shortBookAll({contractAddr: "sei1466nf3zuxpya8q9emxukd7vftaf6h4psr0a07srl5zw74zh84yjqpeheyc",
      priceDenom:"UST2",
      assetDenom:"ATOM" })
      console.log(query)
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
