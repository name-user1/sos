import type { logs } from '@cosmjs/stargate'
import { usePublicOps } from '../../contexts/public'
import { useCallback, useEffect, useState } from 'react'
import { PublicInstance, PublicOperation } from './operation'
import { publicOp as initOperation } from './operation'
import { CosmWasmClient } from 'cosmwasm'

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

export interface UsePublicOperationProps {
  query: (address: string, queryMsg: Record<string, unknown>) => Promise<string> | undefined
  getClient: () =>  Promise<CosmWasmClient> | undefined
  use: () => PublicInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
}

export function usePublicOperation(): UsePublicOperationProps {
  const publicW = usePublicOps()
  const [address, setAddress] = useState<string>('')
  const [publicOp, setPublicOp] = useState<PublicOperation>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const PublicBaseContract = initOperation(publicW.getClient())
    setPublicOp(PublicBaseContract)
  }, [publicW])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const query = useCallback(
    (address: string, queryMsg: Record<string, unknown>): Promise<string> | undefined => {
      return publicOp?.query(address, queryMsg)
    },
    [publicOp, address],
  )

  const getClient = useCallback(
    ():  Promise<CosmWasmClient> | undefined => {
      return publicOp?.getClient()
    },
    [publicOp, address],
  )

  const use = useCallback(
    (): PublicInstance | undefined => {
      return publicOp?.use()
    },
    [publicOp, address],
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  return {
    query,
    getClient,
    use,
    updateContractAddress,
    getContractAddress
  }
}
