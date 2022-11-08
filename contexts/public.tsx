import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NetworkListItem, useSelectedChain } from '../config'
import { toast } from 'react-hot-toast'
import { createTrackedSelector } from 'react-tracked'
import { NETWORK } from '../utils/constants'
import create from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface PublicOperationStore {
  client: CosmWasmClient | undefined
  config: NetworkListItem
  initialized: boolean
  initializing: boolean
  name: string
  network: string

  readonly clear: () => void

  readonly connect: (walletChange?: boolean | 'focus') => Promise<void>

  readonly disconnect: () => void | Promise<void>

  readonly getClient: () => CosmWasmClient

  readonly init: (client?: CosmWasmClient) => void

  readonly setNetwork: (network: string) => void
}

export type PublicOperationType = PublicOperationStore

/**
 * Keplr wallet store default values as a separate variable for reusability
 */
const defaultStates = {
  client: undefined,
  config: useSelectedChain(),
  initialized: false,
  initializing: true,
  name: '',
  network: NETWORK,
}

/**
 * Entrypoint for keplr wallet store using {@link defaultStates}
 */
export const usePubOpsStore = create(
  subscribeWithSelector<PublicOperationStore>((set, get) => ({
    ...defaultStates,
    clear: () => set({ ...defaultStates }),
    connect: async (walletChange = false) => {
      try {
        if (walletChange !== 'focus') set({ initializing: true })
        const { config, init, network } = get()
        const client = await CosmWasmClient.connect(network)
        init(client)
        if (walletChange) set({ initializing: false })
      } catch (err: any) {
        toast.error(err?.message)
        set({ initializing: false })
      }
    },
    disconnect: () => {
      window.localStorage.clear()
      get().clear()
      set({ initializing: false })
    },
    getClient: () => get().client!,
    init: (client) => set({ client }),
    setNetwork: (network) => set({ network }),
  })),
)

export const usePublicOps = createTrackedSelector<PublicOperationStore>(usePubOpsStore)
