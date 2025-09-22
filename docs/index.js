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

async function loadPolls() {
    const polls = []
    const pollCount = await hyGovContract.pollCount()
    for (let i = 0; i < pollCount; i++) {
        const [question, choices, startDate, endDate, minStake, creator] = await hyGovContract.polls(pollCount)
        polls[i] = { question, choices, startDate, endDate, minStake, creator }

        // struct Poll {
        //     string question;
        //     string[] choices;
        //     uint256 startDate;
        //     uint256 endDate;
        //     uint256 minStake;
        //     address creator
        // }
    }
    return polls
}

function displayPolls(polls) {

}

////////////////////////////////////
// Test

console.log(await hyGovContract.oracle())

console.log('')

console.log(await hyGovContract.polls(0))
console.log((await hyGovContract.polls(0))[0]) // question
console.log((await hyGovContract.polls(0))[1]) // description
console.log((await hyGovContract.polls(0))[2]) // startdate
console.log((await hyGovContract.polls(0))[3]) // enddate
console.log((await hyGovContract.polls(0))[4]) // minstake
console.log((await hyGovContract.polls(0))[5]) // creator

console.log('')

console.log(await hyGovContract.votes(0))



//     struct Vote {
//     address[] voters
//     uint256[] choices;
//     uint256 timestamp