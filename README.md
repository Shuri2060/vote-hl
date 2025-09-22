HyGov allows validators to create stake-weighted polls for their stakers during Hyperliquid Governance proposals. This solves a problem a few validators such as HypurrCollective had, as they did not have a system to hold stake-weighted polls.

Validators create polls by interacting with the HyGov EVM contract (deployed on testnet at 0x3Eb175779705aF2A54ed461BB2f962085f2379c6).
Stakers can check out ongoing polls at https://shuri2060.github.io/vote-hl/. On this UI, stakers select the choice they want to vote on the poll. The UI then informs them how much USDC (spot) dust they need to send to the validator's address over HyperCore. They can either do this on that page, or do this using the official Hyperliquid interface, making the UI trustless.

The validator ends a poll by calling a function on the smart contract. The function then reads off the Oracle the votes while the poll was ungoing using the above process. Using Hyperliquid's CoreReader, the function checks how much stake each voter has with the validator (the validator set a minimum amount staked to vote upon poll creation) and tots up to determine the result of the poll.

The backend of the project pushes to the Oracle which user has voted for which option. This is determined by the amount of USDC (spot) wei sent over HyperCore to the validator address. To do this, the backend makes a `userNonFundingLedgerUpdates` info request to Hyperliquid's API with the address of the validator. The backend then filters through these transactions to determine user votes. The amount of wei corresponds to the vote options (eg. option 2 would be 2 wei).

Notes / Caveats / Areas of Improvement:
- Each validator can only hold one active poll
- The frontend is coded using vanilla html and js for maximum simplicity and minimum dependency reliance. It only depends on 1 js libraries: ethers.js. While simple, there are multiple areas for improvement that are not yet implemented due to time constraints:
  - display results of previous polls
  - display ongoing results of current polls
  - display historical votes of a connected user
- If there are over 10000 transactions in `userNonFundingLedgerUpdates` in the duration of the poll, then it is not possible for the backend to fetch all of the votes, due to the constraints of Hyperliquid's API. This currently breaks HyGov's polling system (eg. a malicious user can spam transactions to the validator to mess with the poll). This can be fixed by having the backend checking this endpoint much more frequently and updating the oracle, or by running a Hyperliquid node with its own API which would not have this limitation.
- A backend is currently required to push vote information to the Oracle. CoreReader and CoreWriter are relatively new features of HyperEVM and there is yet much to be added to them. Missing is a way to verify in some way Core transactions occurred (in this case, transfers between addresses). There is no way to do this with the current CoreReader functionality; checking balance is not quite sufficient. As a result, we had to resort to using an oracle + backend, which is a centralized process to circumvent this. To improve on this, we could upgrade the Oracle to requiring a multisig to push the results, but overall we wish the functionality of CoreReader to be improved so this is not necessary. This is our feedback to the Hyperliquid team.
