const url = 'https://api.hyperliquid-testnet.xyz'

console.log(await postAsync({
    url, endpoint: '/info', payload: {
        type: 'userNonFundingLedgerUpdates',
        user: '0x697D4D5d5e1990710E558c7008C28d40af176651',
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 30,
    }
}))

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
