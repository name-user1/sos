import type { Coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import { useWallet } from '../../contexts/wallet'
import { useCallback, useEffect, useState } from 'react'
import { SignedInstance, SignedOperation } from './operation'
import { signed as initOperation } from './operation'

/*export interface InstantiateResponse {
  /** The address of the newly instantiated contract *-/
  readonly contractAddress: string
  readonly logs: readonly logs.Log[]
  /** Block height in which the transaction is included *-/
  readonly height: number
  /** Transaction hash (might be used as transaction ID). Guaranteed to be non-empty upper-case hex *-/
  readonly transactionHash: string
  readonly gasWanted: number
  readonly gasUsed: number
}*/

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface UseSignedOpetationProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[],
  ) => Promise<InstantiateResponse>
  query: (address: string, queryMsg: Record<string, unknown>) => Promise<string> | undefined 
  execute: (
    senderAddress: string, 
    contractAddress: string, 
    msg: Record<string, unknown>
  ) => Promise<any> | undefined  
  use: (customAddress: string) => SignedInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
}

export function useSignedOperation(): UseSignedOpetationProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [signed, setSigned] = useState<SignedOperation>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const SignedBaseContract = initOperation(wallet.getClient(), wallet.address)
    setSigned(SignedBaseContract)
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId: number, initMsg: Record<string, unknown>, label: string, admin?: string): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!signed) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        signed.instantiate(wallet.address, codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [signed, wallet],
  )

  const query = useCallback(
    (address: string, queryMsg: Record<string, unknown>): Promise<string> | undefined => {
      return signed?.query(address, queryMsg)
    },
    [signed, address],
  )

  const execute = useCallback(
    (senderAddress: string, contractAddress: string, msg: Record<string, unknown>): Promise<any> | undefined => {
      return signed?.execute(senderAddress, contractAddress, msg)
    },
    [signed, address],
  )

  const use = useCallback(
    (customAddress = ''): SignedInstance | undefined => {
      return signed?.use(address || customAddress)
    },
    [signed, address],
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  return {
    instantiate,
    query,
    execute,
    use,
    updateContractAddress,
    getContractAddress
  }
}
