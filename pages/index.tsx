import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { WalletLoader } from '../components/WalletLoader'
import NetworkListBox from '../components/NetworkListBox'
import { Contract, CosmWasmClient, GasPrice, SigningCosmWasmClient } from 'cosmwasm'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useWallet } from '../contexts/wallet'
import List from '../components/List'
//import { useSignedOperation } from '../operations/signed'
//import { usePublicOperation } from '../operations/public'

export default function Home() {
  //const signedOps = useSignedOperation()
  //const publicOps = usePublicOperation()
  const wallet = useWallet()
  
  const [client, setClient] = useState<CosmWasmClient>()
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient>()
  const [contractAddress, setContractAddress] = useState("juno137ja66awdmqv2j95073llsslafv58knjkle90yw6934k02r58unscvzy89")
  const [contract, setContract] = useState<Contract>()
  const [rpcEndpoint, setRpcEndpoint] = useState("https://rpc.elgafar-1.stargaze-apis.com/") //"https://rpc-test.osmosis.zone/"//https://rpc.uni.juno.deuslabs.fi/
  const [contractQueryFunctions, setContractQueryFunctions] = useState('') 
  const [contractExecuteFunctions, setContractExecuteFunctions] = useState('')
  const [contractStates, setContractStates] = useState<{ keyo: string; valo: string; }[]>() 
  const msg = {
      z:""
  };
  
  //const pubOps = useMemo(() => publicOps?.use(), [publicOps, rpcEndpoint])

  async function getClients() {
    const res = await CosmWasmClient.connect(rpcEndpoint)
    setClient(res)
    const signer = await wallet.getSigner()
    const reso = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, signer, {
      prefix: "juno",
      gasPrice: GasPrice.fromString("0.0025ujunox"),
    })
    setSigningClient(reso)
  }

  useEffect(() => {
    getClients()
  }, [rpcEndpoint])

  const contractAddressRef = useRef<null | HTMLInputElement>(null);

  useEffect(() => {
    conqur()
  }, [contract])
  
  async function errToObject(gon: boolean){
    let donen = ""
    try{
      if (gon)
        await client?.queryContractSmart(contract ? contract.address : contractAddress, msg)
      else
        await signingClient?.execute(wallet.address, contract ? contract.address : contractAddress, msg, 'auto')
    } catch (error: any) {
      const ilk = error.toString().split('expected')
      const ikinci = ilk[1].split(": query")
      donen = ikinci[0].split(',')
    }
    return donen
  }

  async function con(){
    if (contractAddressRef.current && contractAddressRef.current.value !== '')
      setContract(await client?.getContract(contractAddressRef.current?.value))
  }

  async function conqur(){
    setContractQueryFunctions(await errToObject(true))
    setContractExecuteFunctions(await errToObject(false))
    if (client) {
      const res = await client["queryClient"].wasm.getAllContractState(contract ? contract.address : contractAddress)
      const son = []
      for (let i = 0; i < res.models.length; i++){
        let keyo = ""
        let valo = ""
        Object.keys(res.models[i].key).forEach(nn => {
          keyo += String.fromCharCode(res.models[i].key[nn])
        })
        Object.keys(res.models[i].value).forEach(nn => {
          valo += String.fromCharCode(res.models[i].value[nn])
        })
        son.push({keyo, valo})
      }
      setContractStates(son)
    }
  }

  return (
    <div className={styles.container}>
      
      <Head>
        <title>Constract Spy</title>
        <meta name="description" content="Spy any Cosmos Contract" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <WalletLoader />
      </div>
      
      <main >
        <h1 className={styles.title}>
          Contract Spy
        </h1>

        <NetworkListBox client={client} />

        <div className={styles.grid}>
          <span> Contract Address:</span>
          <input ref={contractAddressRef} ></input>
          <button onClick={con} >GO</button>
        </div>

        <div className="flex flex-col">
          <span> Contract Info: </span>
          <span>admin: {contract?.admin}</span>
          <span>code Id: {contract?.codeId}</span>
          <span>ibc Port Id:{contract?.ibcPortId}</span>
          <span>label: {contract?.label}</span>
          {contractStates?.map((value: {keyo: string, valo: string}, index: number) => {
              return <List key={index} 
                  address={value.valo} sira={value.keyo} />;
              })}
        </div>

        <div className={styles.grid}>
          <span> Contract Query Actions: {contractQueryFunctions}</span>
          <span> Contract Execute Actions: {contractExecuteFunctions}</span>
        </div>

      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}
