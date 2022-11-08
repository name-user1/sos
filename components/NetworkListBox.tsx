import { useState, Fragment, useEffect, useRef } from 'react'
import { Dialog, Listbox, Tab } from '@headlessui/react'
import { CosmWasmClient } from 'cosmwasm'
import { NETWORK_LIST, useSelectedChain } from '../config'
import List from './List'
import { useWalletStore } from '../contexts/wallet'

export interface NetworkListBoxProps {
  client: CosmWasmClient | undefined
}

export default function NetworkListBox( { client }: NetworkListBoxProps ) {
  const selectedNetwork = useSelectedChain()
  const [isOpen, setIsOpen] = useState(false)
  const [contractList, setContractList] = useState<string[]>([])

  const [lastCodeId, setLastCodeId] = useState(1)
  const codeIdRef = useRef<null | HTMLInputElement>(null);

  useEffect(() => {
    if (client) codes()
  }, [client])

  async function codes(){
    const bisi = await client?.getCodes()
    setLastCodeId(bisi ? bisi.length : 1)
  }

  async function conlis(){
    const bisi = await client?.getContracts(Number(codeIdRef.current?.value))
    let baska: string[] = []
    bisi?.forEach(con => {
      baska.push(con)
    })
    setContractList(baska)
  }

  return (
    <div>
      <div className='flex flex-row my-6'>
            <span className='text-2xl'>
              Get started by choosing network:
            </span>
            <div>
              <Listbox value={selectedNetwork} onChange={(value) => {
                useSelectedChain.setState(value, true)
                useWalletStore.getState().setConfig(value)
                }}>
                <Listbox.Button>{selectedNetwork.chainName}</Listbox.Button>
                <Listbox.Options>
                  {NETWORK_LIST.map((network) => (
                    /* Use the `active` state to conditionally style the active option. */
                    /* Use the `selected` state to conditionally style the selected option. */
                    <Listbox.Option key={network.chainName} value={network} as={Fragment}>
                      {({ active, selected }) => (
                        <li
                          className={`${
                            active ? 'bg-blue-500 text-white' : 'bg-white text-black'
                          }`}
                        >
                          {network.chainName}
                        </li>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Listbox>
            </div>
            <div>
              <button onClick={() => setIsOpen(true)}>Find Your Contract</button>
            </div>
      </div>
      <div className='absolute'>
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
          <Dialog.Panel>
            <Dialog.Title>Find Your Contract</Dialog.Title>
            <Dialog.Description>
              This will permanently deactivate your account
            </Dialog.Description>

            <div>
              <span> Code ID:</span>
              <input 
                ref={codeIdRef}
                type={'number'}
                ></input>
              <button onClick={conlis}>GO</button>
              <span>{lastCodeId}</span>
            </div>

            {/*
              You can render additional buttons to dismiss your dialog by setting
              `isOpen` to `false`.
            */}

            <div className="App">
              <h1>
                  Contract address list for code id 
              </h1>
              {contractList.map((address: string, index: number) => {
              return <List key={index} 
                  address={address} sira={(index + 1).toString()} />;
              })}
            </div>
            <button onClick={() => setIsOpen(false)}>Cancel</button>
          </Dialog.Panel>
        </Dialog>
      </div>
    </div>
    
  )
}