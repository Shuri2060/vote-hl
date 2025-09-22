import { ethers } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.15.0/ethers.min.js'  // https://docs.ethers.org/v6/getting-started
const encode = MessagePack.encode
import hyGovAbi from './hyGovAbi.json' with { type: 'json' }

const isMainnet = false
// HCore
const chainIdCore = 421614
const domain = 'hyperliquid-testnet.xyz'
const url = `https://app.${domain}`
const apiUrl = `https://api.${domain}`
// HEVM
const chainIdEVM = 998
const rpcUrl = `https://rpc.${domain}/evm`
const provider = new ethers.JsonRpcProvider(rpcUrl, chainIdEVM)

const hyGovContract = new ethers.Contract(
    '0x3Eb175779705aF2A54ed461BB2f962085f2379c6',
    hyGovAbi,
    provider,
)

loadPolls()

async function loadPolls() {
    const polls = []
    const pollCount = await hyGovContract.pollCount()
    for (let i = 0; i < pollCount; i++) {
        const { question, startDate, endDate, minStake, creator } = await hyGovContract.polls(i)
        const choices = await hyGovContract.getChoicesFromPoll(i)

        polls[i] = { id: i, question, choices, startDate, endDate, minStake, creator }
    }
    displayPolls(polls)
}

function exactStringUSDC(wei) {
    const value = wei * 1e-8
    return value.toFixed(8)
}

function displayPolls(polls) {
    for (const poll of polls) {
        const isActive = BigInt(Date.now()) < poll.endDate * 1000n
        const pollItem = document.createElement('div')
        pollItem.className = 'poll-item'

        const pollQuestion = document.createElement('h3')
        pollQuestion.textContent = poll.question
        pollItem.appendChild(pollQuestion)

        const voteInstruction = document.createElement('p')
        voteInstruction.className = 'vote-instruction'
        voteInstruction.style.display = 'none'
        pollItem.appendChild(voteInstruction)

        for (let i = 0; i < poll.choices.length; i++) {
            const optionContainer = document.createElement('div')
            optionContainer.className = 'poll-option'

            const optionParagraph = document.createElement('div')
            optionParagraph.innerHTML = '<label class="poll-label">' + `<input type="radio" name="${poll.id}" value="${i}"${isActive ? '' : ' disabled'}>` + poll.choices[i] + '</label>'

            const radioInput = optionParagraph.querySelector('input[type="radio"]')
            radioInput.addEventListener('change', () => {
                if (radioInput.checked) {
                    const wei = Number(radioInput.value) + 1
                    const address = poll.creator

                    const amountSpan = `<span onclick="navigator.clipboard.writeText(this.textContent)" style="background-color: #404040; cursor: pointer; padding: 1px 4px; border-radius:9999px;" title="Click to copy">${exactStringUSDC(wei)}</span>`
                    const addressSpan = `<span onclick="navigator.clipboard.writeText(this.textContent)" style="background-color: #404040; cursor: pointer; padding: 1px 4px; border-radius:9999px;" title="Click to copy">${address}</span>`
                    voteInstruction.innerHTML = `To vote for this option, send ${amountSpan} USDC (spot) to ${addressSpan} on HyperCore. You can do this using the official <a href="${url}" target="_blank" rel="noopener noreferrer">Hyperliquid frontend</a> or clicking Vote below.`
                    voteInstruction.style.display = 'block'
                } else {
                    voteInstruction.style.display = 'none'
                }
            })

            optionContainer.appendChild(optionParagraph)
            pollItem.appendChild(optionContainer)
        }

        if (isActive) {
            const voteButton = document.createElement('button')
            voteButton.textContent = 'Vote'
            voteButton.disabled = true
            pollItem.appendChild(voteButton)

            const radioInputs = pollItem.querySelectorAll('input[type="radio"]')
            radioInputs.forEach(radio => {
                radio.addEventListener('change', () => {
                    voteButton.disabled = !pollItem.querySelector('input[type="radio"]:checked')
                    if (radio.checked) {
                        const wei = Number(radio.value) + 1
                        const address = poll.creator
                        voteButton.onclick = () => submitVote(wei, address)
                    }
                })
            })
        }

        document.getElementById(isActive ? 'polls' : 'ended-polls')?.appendChild(pollItem)
    }
}

async function submitVote(wei, targetAddress) {
    const addresses = await walletConnect(chainIdCore)
    const address = addresses[0].toLowerCase()
    const nonce = Date.now()
    const action = {
        "type": "spotSend",
        "hyperliquidChain": "Testnet",
        "signatureChainId": "0x66eee",
        "destination": targetAddress.toLowerCase(),
        "token": "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        "amount": String(wei * 1e-8),
        "time": nonce,
    }
    const result = await postAsync({ url: apiUrl, endpoint: '/exchange', payload: await payloadExchangeWalletAsync({ isMainnet, address, action, nonce }) })
    console.log('result', result)
}

function chainIdHex(chainId) { return `0x${chainId.toString(16)}` }

async function walletConnect(chainId) {
    const addresses = await window.ethereum.request({ method: 'eth_requestAccounts' })
    if (window.ethereum.networkVersion !== chainId) await switchChain(chainId)
    return addresses
}

async function switchChain(chainId) {
    await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex(chainId) }],
    })
}

async function signWalletL1ActionAsync({ isMainnet, address, action }) {
    const { r, s, v } = ethers.Signature.from(await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [
            address,
            JSON.stringify({
                types: {
                    "EIP712Domain": [
                        { "name": "name", "type": "string" },
                        { "name": "version", "type": "string" },
                        { "name": "chainId", "type": "uint256" },
                        { "name": "verifyingContract", "type": "address" },
                    ],
                    "HyperliquidTransaction:SpotSend": [
                        { "name": "hyperliquidChain", "type": "string" },
                        { "name": "destination", "type": "string" },
                        { "name": "token", "type": "string" },
                        { "name": "amount", "type": "string" },
                        { "name": "time", "type": "uint64" },
                    ]
                },
                domain: {
                    "name": "HyperliquidSignTransaction",
                    "version": "1",
                    "chainId": chainIdCore,
                    "verifyingContract": "0x0000000000000000000000000000000000000000"
                },
                primaryType: 'HyperliquidTransaction:SpotSend',
                message: action,
            })
        ],
    }))
    return { r, s, v }
}

async function payloadExchangeWalletAsync({ isMainnet, address, action, nonce }) {
    const signature = await signWalletL1ActionAsync({ isMainnet, address, action })
    return { action, nonce, signature }
}

export async function postAsync({ url, endpoint = '', payload }) {
    return await fetch(url + endpoint, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then(response => {
        if (response.ok) {
            switch (response.status) {
                case 204:
                    break
                default:
                    return response.json()
            }
        } else {
            console.error(response)
            throw new Error(`HTTP Error ${response.status}`)
        }
    })
}

// console.log(await postAsync({
//     url, endpoint: '/info', payload: {
//         type: 'userNonFundingLedgerUpdates',
//         user: '0x697D4D5d5e1990710E558c7008C28d40af176651',
//         startTime: Date.now() - 1000 * 60 * 60 * 24 * 30,
//     }
// }))