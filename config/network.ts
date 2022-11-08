import create from 'zustand'

export interface MappedCoin {
  readonly denom: string
  readonly fractionalDigits: number
}

export type CoinMap = Readonly<Record<string, MappedCoin>>

export interface FeeOptions {
  upload: number
  exec: number
  init: number
}

export type NetworkType = typeof NETWORK_TYPES[number]

export const NETWORK_TYPES = [
  'stargaze-1',
  'elgafar-1',
  'juno-1',
  'uni-5',
  'osmosis',
] as const

export interface NetworkListItem {
  chainId: NetworkType
  chainName: string
  addressPrefix: string
  rpcUrl: string
  httpUrl: string | undefined
  feeToken: string
  stakingToken: string
  coinMap: CoinMap
  gasPrice: number
  fees: FeeOptions
}

export const NETWORK_LIST: NetworkListItem[] = [
  {
    chainId: 'stargaze-1',
    chainName: 'Stargaze',
    addressPrefix: 'stars',
    rpcUrl: 'https://rpc.stargaze-apis.com/',
    httpUrl: undefined,
    feeToken: 'ustars',
    stakingToken: 'ustars',
    coinMap: {
      ustars: { denom: 'STARS', fractionalDigits: 6 },
    },
    gasPrice: 0.025,
    fees: {
      upload: 1500000,
      init: 500000,
      exec: 200000,
    },
  },
  {
    chainId: 'elgafar-1',
    chainName: 'elgafar-1',
    addressPrefix: 'stars',
    rpcUrl: 'https://rpc.elgafar-1.stargaze-apis.com/',
    httpUrl: undefined,
    feeToken: 'ustars',
    stakingToken: 'ustars',
    coinMap: {
      ustars: { denom: 'STARS', fractionalDigits: 6 },
    },
    gasPrice: 0.025,
    fees: {
      upload: 1500000,
      init: 500000,
      exec: 200000,
    },
  },
  {
    chainId: 'juno-1',
    chainName: 'Juno',
    addressPrefix: 'juno',
    rpcUrl: 'https://rpc.juno-1.deuslabs.fi',
    httpUrl: undefined,
    feeToken: 'ujuno',
    stakingToken: 'ujuno',
    coinMap: {
      ujuno: { denom: 'JUNO', fractionalDigits: 6 },
    },
    gasPrice: 0.025,
    fees: {
      upload: 1500000,
      init: 500000,
      exec: 200000,
    },
  },
  {
    chainId: 'uni-5',
    chainName: 'Uni',
    addressPrefix: 'juno',
    rpcUrl: 'https://rpc.uni.juno.deuslabs.fi',
    httpUrl: undefined,
    feeToken: 'ujunox',
    stakingToken: 'ujunox',
    coinMap: {
      ujunox: { denom: 'JUNOX', fractionalDigits: 6 },
    },
    gasPrice: 0.025,
    fees: {
      upload: 1500000,
      init: 500000,
      exec: 200000,
    },
  },
  {
    chainId: 'osmosis',
    chainName: 'Osmosis',
    addressPrefix: 'osmo',
    rpcUrl: 'https://rpc-test.osmosis.zone/',
    httpUrl: undefined,
    feeToken: 'ujunox',
    stakingToken: 'ujunox',
    coinMap: {
      ujunox: { denom: 'JUNOX', fractionalDigits: 6 },
    },
    gasPrice: 0.025,
    fees: {
      upload: 1500000,
      init: 500000,
      exec: 200000,
    },
  }
]

export const useSelectedChain = create<NetworkListItem>(() => ({
  chainId: 'uni-5',
  chainName: 'Uni',
  addressPrefix: 'juno',
  rpcUrl: 'https://rpc.uni.juno.deuslabs.fi',
  httpUrl: undefined,
  feeToken: 'ujunox',
  stakingToken: 'ujunox',
  coinMap: {
    ujunox: { denom: 'JUNOX', fractionalDigits: 6 },
  },
  gasPrice: 0.025,
  fees: {
    upload: 1500000,
    init: 500000,
    exec: 200000,
  },
}))
