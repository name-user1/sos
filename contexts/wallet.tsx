import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Decimal } from '@cosmjs/math'
import type { OfflineSigner } from '@cosmjs/proto-signing'
import type { Coin } from '@cosmjs/stargate'
import { NetworkListItem, NETWORK_LIST } from '../config'
import { keplrConfig } from '../config'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { createTrackedSelector } from 'react-tracked'
import create from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface KeplrWalletStore {
  accountNumber: number
  address: string
  balance: Coin[]
  client: SigningCosmWasmClient | undefined
  config: NetworkListItem
  initialized: boolean
  initializing: boolean
  name: string
  signer: OfflineSigner | undefined

  readonly clear: () => void

  readonly connect: (walletChange?: boolean | 'focus') => Promise<void>

  readonly disconnect: () => void | Promise<void>

  readonly getClient: () => SigningCosmWasmClient
  readonly getSigner: () => OfflineSigner

  readonly init: (signer?: OfflineSigner) => void

  readonly refreshBalance: (address?: string, balance?: Coin[]) => Promise<void>

  readonly setConfig: (config: NetworkListItem) => void

  readonly updateSigner: (singer: OfflineSigner) => void

  readonly setQueryClient: () => void
}

/**
 * Compatibility export for references still using `WalletContextType`
 *
 * @deprecated replace with {@link KeplrWalletStore}
 */
export type WalletContextType = KeplrWalletStore

/**
 * Keplr wallet store default values as a separate variable for reusability
 */
const defaultStates = {
  accountNumber: 0,
  address: '',
  balance: [],
  client: undefined,
  config: NETWORK_LIST[3],
  initialized: false,
  initializing: true,
  name: '',
  signer: undefined,
}

/**
 * Entrypoint for keplr wallet store using {@link defaultStates}
 */
export const useWalletStore = create(
  subscribeWithSelector<KeplrWalletStore>((set, get) => ({
    ...defaultStates,
    clear: () => set({ ...defaultStates }),
    connect: async (walletChange = false) => {
      try {
        if (walletChange !== 'focus') set({ initializing: true })
        const { config, init } = get()
        const signer = await loadKeplrWallet(config)
        init(signer)
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
    getSigner: () => get().signer!,
    init: (signer) => set({ signer }),
    refreshBalance: async (address = get().address, balance = get().balance) => {
      const { client, config } = get()
      if (!client) return
      balance.length = 0
      for (const denom in config.coinMap) {
        // eslint-disable-next-line no-await-in-loop
        const coin = await client.getBalance(address, denom)
        if (coin) balance.push(coin)
      }
      set({ balance })
    },
    setConfig: (config) => {
      set({ config })
      const { connect } = get()
      connect()
    },
    updateSigner: (signer) => set({ signer }),
    setQueryClient: async () => {
      try {
        const client = (await createQueryClient()) as SigningCosmWasmClient
        set({ client })
      } catch (err: any) {
        toast.error(err?.message)
        set({ initializing: false })
      }
    },
  })),
)

/**
 * Proxied keplr wallet store which only rerenders on called state values.
 *
 * Recommended if only consuming state; to set states, use {@link useWalletStore.setState}.
 *
 * @example
 *
 * ```ts
 * // this will rerender if any state values has changed
 * const { name } = useWalletStore()
 *
 * // this will rerender if only `name` has changed
 * const { name } = useWallet()
 * ```
 */
export const useWallet = createTrackedSelector<KeplrWalletStore>(useWalletStore)

/**
 * Keplr wallet store provider to easily mount {@link WalletSubscription}
 * to listen/subscribe various state changes.
 *
 */
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <WalletSubscription />
    </>
  )
}

/**
 * Keplr wallet subscriptions (side effects)
 */
const WalletSubscription = () => {
  /**
   * Dispatch reconnecting wallet on first mount and register events to refresh
   * on keystore change and window refocus.
   *
   */
  useEffect(() => {
    const walletAddress = window.localStorage.getItem('wallet_address')
    if (walletAddress) {
      void useWalletStore.getState().connect()
    } else {
      useWalletStore.setState({ initializing: false })
      useWalletStore.getState().setQueryClient()
    }

    const listenChange = () => {
      void useWalletStore.getState().connect(true)
    }
    const listenFocus = () => {
      if (walletAddress) void useWalletStore.getState().connect('focus')
    }

    window.addEventListener('keplr_keystorechange', listenChange)
    window.addEventListener('focus', listenFocus)

    return () => {
      window.removeEventListener('keplr_keystorechange', listenChange)
      window.removeEventListener('focus', listenFocus)
    }
  }, [])

  /**
   * Watch signer changes to initialize client state.
   *
   */
  useEffect(() => {
    return useWalletStore.subscribe(
      (x) => x.signer,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (signer) => {
        try {
          if (!signer) {
            useWalletStore.setState({
              client: (await createQueryClient()) as SigningCosmWasmClient,
            })
          } else {
            useWalletStore.setState({
              client: await createClient({ signer }),
            })
          }
        } catch (error) {
          console.log(error)
        }
      },
    )
  }, [])

  /**
   * Watch client changes to refresh balance and sync wallet states.
   *
   */
  useEffect(() => {
    return useWalletStore.subscribe(
      (x) => x.client,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (client) => {
        const { config, refreshBalance, signer } = useWalletStore.getState()
        if (!signer || !client) return
        if (!window.keplr) {
          throw new Error('window.keplr not found')
        }
        const balance: Coin[] = []
        const address = (await signer.getAccounts())[0].address
        const account = await client.getAccount(address)
        const key = await window.keplr.getKey(config.chainId)
        await refreshBalance(address, balance)
        window.localStorage.setItem('wallet_address', address)
        useWalletStore.setState({
          accountNumber: account?.accountNumber || 0,
          address,
          balance,
          initialized: true,
          initializing: false,
          name: key.name || '',
        })
      },
    )
  }, [])

  return null
}

/**
 * Function to create signing client based on {@link useWalletStore} resolved
 * config state.
 *
 * @param arg - Object argument requiring `signer`
 */
const createClient = ({ signer }: { signer: OfflineSigner }) => {
  const { config } = useWalletStore.getState()
  return SigningCosmWasmClient.connectWithSigner(config.rpcUrl, signer, {
    gasPrice: {
      amount: Decimal.fromUserInput('0.0025', 100),
      denom: config.feeToken,
    },
  })
}

const createQueryClient = () => {
  const { config } = useWalletStore.getState()
  return SigningCosmWasmClient.connect(config.rpcUrl)
}

/**
 * Function to load keplr wallet signer.
 *
 * @param config - Application configuration
 */
const loadKeplrWallet = async (config: NetworkListItem) => {
  if (!window.getOfflineSigner || !window.keplr || !window.getOfflineSignerAuto) {
    throw new Error('Keplr extension is not available')
  }

  await window.keplr.experimentalSuggestChain(keplrConfig(config))
  await window.keplr.enable(config.chainId)

  const signer = await window.getOfflineSignerAuto(config.chainId)
  Object.assign(signer, {
    signAmino: (signer as any).signAmino ?? (signer as any).sign,
  })

  return signer
}
