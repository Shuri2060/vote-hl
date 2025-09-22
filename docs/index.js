import { ethers } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.15.0/ethers.min.js'  // https://docs.ethers.org/v6/getting-started
const encode = MessagePack.encode
import hyGovAbi from './hyGovAbi.json' with { type: 'json' }

// HCore
const domain = 'hyperliquid-testnet.xyz'
const url = `https://app.${domain}`
const apiUrl = `https://api.${domain}`
// HEVM
const chainId = 998
const rpcUrl = `https://rpc.${domain}/evm`
const provider = new ethers.JsonRpcProvider(rpcUrl, chainId)

const hyGovContract = new ethers.Contract(
    '0x3Eb175779705aF2A54ed461BB2f962085f2379c6',
    hyGovAbi,
    provider,
)

loadPolls()

async function loadPolls() {
    const polls = []
    const pollCount = await hyGovContract.pollCount()
    console.info('pollCount', pollCount)
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

function submitVote(wei, address) {
    console.log(wei, address)
}
