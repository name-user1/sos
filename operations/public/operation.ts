import type { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { logs } from '@cosmjs/stargate'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface PublicInstance {
  
}

export interface PublicOperation {
  use: () => PublicInstance
  getClient: () => Promise<CosmWasmClient>
  query: (address: string, queryMsg: Record<string, unknown>,) => Promise<string>
}

export const publicOp = (client: CosmWasmClient): PublicOperation => {
  const use = (): PublicInstance => {
    return {
      
    }
  }

  const getClient = async (): Promise<CosmWasmClient> => {
    return client
  }

  const query = async (
    address: string,
    queryMsg: Record<string, unknown>,
  ): Promise<string> => {
    const res = await client.queryContractSmart(address, queryMsg)
    return res
  }

  return { use, getClient, query }
}
