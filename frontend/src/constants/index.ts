import { Address } from "viem";
import { hardhat } from "viem/chains";

export const DECIMAL_PLACES = 6
export const LIQUIDITY_POOL_ADDRESS = process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS as Address
export const BLTM_ADDRESS = process.env.NEXT_PUBLIC_BLTM_ADDRESS as Address
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as Address
export const SUPPORTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || hardhat.id
export const FROM_BLOCK = BigInt(process.env.NEXT_PUBLIC_FROM_BLOCK || 0n)
