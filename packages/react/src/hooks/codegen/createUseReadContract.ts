import {
  type Config,
  type ReadContractErrorType,
  type ReadContractParameters,
  type ResolvedRegister,
} from '@wagmi/core'
import {
  type ScopeKeyParameter,
  type UnionEvaluate,
  type UnionOmit,
  type UnionPartial,
} from '@wagmi/core/internal'
import {
  type ReadContractData,
  type ReadContractQueryFnData,
  type ReadContractQueryKey,
} from '@wagmi/core/query'
import {
  type Abi,
  type Address,
  type ContractFunctionArgs,
  type ContractFunctionName,
} from 'viem'

import {
  type ConfigParameter,
  type QueryParameter,
} from '../../types/properties.js'
import { useAccount } from '../useAccount.js'
import { useChainId } from '../useChainId.js'
import {
  type UseReadContractReturnType,
  useReadContract,
} from '../useReadContract.js'

type stateMutability = 'pure' | 'view'

export type CreateUseReadContractParameters<
  abi extends Abi | readonly unknown[],
  address extends Address | Record<number, Address> | undefined = undefined,
  functionName extends
    | ContractFunctionName<abi, stateMutability>
    | undefined = undefined,
> = {
  abi: abi | Abi | readonly unknown[]
  address?: address | Address | Record<number, Address> | undefined
  functionName?:
    | functionName
    | ContractFunctionName<abi, stateMutability>
    | undefined
}

export type CreateUseReadContractReturnType<
  abi extends Abi | readonly unknown[],
  address extends Address | Record<number, Address> | undefined,
  functionName extends ContractFunctionName<abi, stateMutability> | undefined,
  ///
  omittedProperties extends 'abi' | 'address' | 'chainId' | 'functionName' =
    | 'abi'
    | (address extends undefined ? never : 'address')
    | (address extends Record<number, Address> ? 'chainId' : never)
    | (functionName extends undefined ? never : 'functionName'),
> = <
  name extends functionName extends ContractFunctionName<abi, stateMutability>
    ? functionName
    : ContractFunctionName<abi, stateMutability>,
  args extends ContractFunctionArgs<abi, stateMutability, name>,
  config extends Config = ResolvedRegister['config'],
  selectData = ReadContractData<abi, name, args>,
>(
  parameters?: UnionEvaluate<
    UnionPartial<
      UnionOmit<
        ReadContractParameters<abi, name, args, config>,
        omittedProperties
      >
    > &
      ScopeKeyParameter &
      ConfigParameter<config> &
      QueryParameter<
        ReadContractQueryFnData<abi, name, args>,
        ReadContractErrorType,
        selectData,
        ReadContractQueryKey<abi, name, args, config>
      >
  > &
    (address extends Record<number, Address>
      ? { chainId?: keyof address | undefined }
      : unknown),
) => UseReadContractReturnType<abi, name, args, selectData>

export function createUseReadContract<
  const abi extends Abi | readonly unknown[],
  const address extends
    | Address
    | Record<number, Address>
    | undefined = undefined,
  functionName extends
    | ContractFunctionName<abi, stateMutability>
    | undefined = undefined,
>(
  config: CreateUseReadContractParameters<abi, address, functionName>,
): CreateUseReadContractReturnType<abi, address, functionName> {
  if (config.address !== undefined && typeof config.address === 'object')
    return (parameters) => {
      const configChainId = useChainId()
      const account = useAccount()
      const chainId =
        (parameters as { chainId?: number })?.chainId ??
        account.chainId ??
        configChainId
      return useReadContract({
        ...(parameters as any),
        ...(config.functionName ? { functionName: config.functionName } : {}),
        address: config.address?.[chainId],
        abi: config.abi,
      })
    }

  return (parameters) => {
    return useReadContract({
      ...(parameters as any),
      ...(config.address ? { address: config.address } : {}),
      ...(config.functionName ? { functionName: config.functionName } : {}),
      abi: config.abi,
    })
  }
}