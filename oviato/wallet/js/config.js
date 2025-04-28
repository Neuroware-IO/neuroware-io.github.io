let cortex =
{
    config:
    {
        sdk:
        {
            version: '0.0.0.1',
            apis:
            {
                dns: 'https://dns.google/resolve'
            }
        },
        currencies:
        {
            utxo:
            {
                bitcoin:
                {
                    symbol: 'BTC',
                    decimals: 8,
                    smallest: 'satoshis',
                    api: 'https://chain.so/api/v3',
                    api_symbol: 'BTC',
                    key: 'TnElQLPkJXXCh7g-CUG3GHLcWBRxZCxS',
                    formats: ['legacy', 'segwit', 'bech32', 'taproot'],
                    fees:
                    {
                        default: { rate: 10 },
                        pubkeyhash: { input: 148, output: 34, header: 10 },
                        scripthash: { input: 91, output: 32, header: 10.5 },
                        witness_v0_scripthash: { input: 91, output: 43, header: 10.5 },
                        witness_v0_keyhash: { input: 68, output: 31, header: 10.5 },
                        witness_v1_taproot: { input: 57.5, output: 43, header: 10.5 }
                        // https://bitcoinops.org/en/tools/calc-size/
                        // https://bitcoin.stackexchange.com/questions/87275/how-to-calculate-segwit-transaction-fee-in-bytes
                    }
                },
                bitcointestnet:
                {
                    symbol: 'BTC',
                    decimals: 8,
                    smallest: 'satoshis',
                    api: 'https://chain.so/api/v3',
                    api_symbol: 'BTCTEST',
                    key: 'TnElQLPkJXXCh7g-CUG3GHLcWBRxZCxS',
                    formats: ['legacy', 'segwit', 'bech32', 'taproot'],
                    station:
                    {
                        pub: '0320c82c4c6b385e51d52fc9b20c2a5579871e16dd0ae2af589e57becb578fb3e9',
                        priv: '6442bc9519fde2cb6257c50fc45a3844433d1ee17226f4a22cd3fe630c1c08b2'
                    },
                    fees:
                    {
                        default: { rate: 10 },
                        pubkeyhash: { input: 148, output: 34, header: 10 },
                        scripthash: { input: 91, output: 32, header: 10.5 },
                        witness_v0_scripthash: { input: 91, output: 43, header: 10.5 },
                        witness_v0_keyhash: { input: 68, output: 31, header: 10.5 },
                        witness_v1_taproot: { input: 57.5, output: 43, header: 10.5 }
                        // https://bitcoinops.org/en/tools/calc-size/
                        // https://bitcoin.stackexchange.com/questions/87275/how-to-calculate-segwit-transaction-fee-in-bytes
                    }
                }
            },
            solana:
            {
                solana:
                {
                    symbol: 'SOL',
                    decimals: 9,
                    smallest: 'lamports',
                    api: 'https://api.mainnet-beta.solana.com',
                    formats: ['pk']
                },
                solanatestnet:
                {
                    symbol: 'SOL',
                    decimals: 9,
                    smallest: 'lamports',
                    api: 'https://api.testnet.solana.com',
                    formats: ['pk']
                },
                solanadevnet:
                {
                    symbol: 'SOL',
                    decimals: 9,
                    smallest: 'lamports',
                    api: 'https://api.devnet.solana.com',
                    formats: ['pk'],
                    parent_mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
                    parent_symbol: 'USDC',
                    contracts:
                    {
                        ata: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                        memo: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
                        ms: 'SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf', // SQUADS v4
                        tp: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        usdc: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
                    }
                },
                usdcdevnet:
                {
                    id: 'solanadevnet',
                    symbol: 'USDC',
                    decimals: 6,
                    smallest: '',
                    api: 'https://api.devnet.solana.com',
                    parent: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
                    parent_symbol: 'SOL',
                    formats: ['stp'],
                    contracts:
                    {
                        ata: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                        memo: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
                        tp: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
                    }
                }
            }
        }
    }
};