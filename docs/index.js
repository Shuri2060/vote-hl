import { ethers } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.5/ethers.min.js'  // https://docs.ethers.org/v6/getting-started
const encode = MessagePack.encode
import hyGovAbi from './hyGovAbi.json' with { type: 'json' }

// HCore
const apiUrl = 'https://api.hyperliquid-testnet.xyz'
// HEVM
const chainId = 998
const rpcUrl = 'https://rpc.hyperliquid-testnet.xyz/evm'
const provider = new ethers.JsonRpcProvider(rpcUrl, chainId)

const hyGovContract = new ethers.Contract(
    '0x18659C4EAd62aF2ba3321C6190A0acb324360bc5',
    hyGovAbi,
    provider,
)

console.log(await hyGovContract.oracle())
