HyGov is a hypercore native system to start, track and participate in hyperliquid governance proposals. 

The project allows big validators to do large trustless votes. So for example for validator governance during the usdh vote, hypurr collective could have used this tool to easily and trustily gather the votes of their stakers. This has the potential to drastically improve the governance process in terms of visibility, trustlessness and efficiency.

Technical flow is as follows:

1. A vote creator who wishes to initiate a poll will create a poll on the hyperevm contract HyGov.sol using the following structure: 

    struct Poll {
        string question;
        string[] choices;
        uint256 startDate;
        uint256 endDate;
        uint256 minStake;
        address creator;
    }

This returns a pollId

2. Once made, voters will go to the UI and vote, the vote operates by sending USDC dust which is encoded with their choice number to the creator address. For example for choice 1, the voter will send 1 wei, choice 2, 2 wei etc.

3. These transfers will be tracked by an oracle system, and will be accounted for and pushed to the HyGov.sol votes variable. This represents the voter's intended choice.

4. Once the poll has ended, the endPoll function will be called, this will look at all the choices pushed by the voters and will weight each depending on their delegated balance on the validator, which is retrieved from the L1Read.sol contract.

5. Once the poll has concluded the winning choice of the vote can be retrieved.