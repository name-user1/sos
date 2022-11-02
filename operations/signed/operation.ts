import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface SignedInstance {
  readonly contractAddress: string
}

export interface SignedOperation {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[],
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => SignedInstance

  query: (address: string, queryMsg: Record<string, unknown>) => Promise<string>

  execute: (
    senderAddress: string,
    contractAddress: string,
    msg: Record<string, unknown>,
  ) => Promise<any>
}

export const signed = (client: SigningCosmWasmClient, txSigner: string): SignedOperation => {
  const use = (contractAddress: string): SignedInstance => {

    return {
      contractAddress
    }
  }

  const instantiate = async (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
  ): Promise<InstantiateResponse> => {
    const result = await client.instantiate(senderAddress, codeId, initMsg, label, 'auto', {
      funds: [coin('1000000000', 'ustars')],
    })

    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
      logs: result.logs,
    }
  }

  const query = async (
    address: string,
    queryMsg: Record<string, unknown>,
  ): Promise<string> => {
    const res = await client.queryContractSmart(address, queryMsg)
    return res
  }

  const execute = async (
    senderAddress: string,
    contractAddress: string,
    msg: Record<string, unknown>,
  ): Promise<any> => {
    const res = await client.execute(senderAddress, contractAddress, msg, 'auto', '')
    return res
  }

  return { use, instantiate, query, execute }
}
