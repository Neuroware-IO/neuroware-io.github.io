(function(exports){

// DEPENDENICES
    
// ECC: https://github.com/sadoprotocol/ordit.io/blob/master/js/ecc.js
// BIP32: https://github.com/sadoprotocol/ordit.io/blob/master/js/bip32.js
// BIP39: https://github.com/sadoprotocol/ordit.io/blob/master/js/bip39.js
// BUFFER: https://github.com/sadoprotocol/ordit.io/blob/master/js/buffer.js
// BITCOINJS: https://github.com/sadoprotocol/ordit.io/blob/master/js/bitcoin-tap.js
// SATSCONNECT: https://github.com/sadoprotocol/ordit.io/blob/master/js/sats.js

btc.initEccLib(ecc); // bitcoinjs dependency requires ecc
var bip32ecc = bip32.BIP32Factory(ecc); // bip32 dependency requires ecc

exports.sdk = 
{
    config:
    {
        version: '0.0.0.14',
        apis:
        {
            mainnet:
            {
                rpc: 'https://mainnet.ordit.io/rpc',
                dns: 'https://dns.google/resolve',
                orderbook: '1H4vvBnr62YWQmvNSt8Z4pDw3Vcv1n5xz7',
                formats:
                [
                    {
                        type: 'p2pkh',
                        name: 'legacy',
                        reg: /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/
                    },
                    {
                        type: 'p2sh',
                        name: 'segwit',
                        reg: /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/
                    },
                    {
                        type: 'p2wpkh',
                        name: 'bech32',
                        reg: /^(bc1q)[a-zA-HJ-NP-Z0-9]{14,74}$/
                    },
                    {
                        type: 'p2tr',
                        name: 'taproot',
                        reg: /^(bc1p)[a-zA-HJ-NP-Z0-9]{14,74}$/
                    }
                ],
                ipfs: 'http://ipfs-gateway.ordit.io/'
            },
            regtest:
            {
                rpc: 'https://regtest.ordit.io/rpc',
                dns: 'https://dns.google/resolve',
                orderbook: 'bcrt1q2ys7qws8g072dqe3psp92pqz93ac6wmztexkh5',
                formats:
                [
                    {
                        type: 'p2pkh',
                        name: 'legacy',
                        reg: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/
                    },
                    {
                        type: 'p2sh',
                        name: 'segwit',
                        reg: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/
                    },
                    {
                        type: 'p2wpkh',
                        name: 'bech32',
                        reg: /^(tb1q|bcrt1q)[a-zA-HJ-NP-Z0-9]{14,74}$/
                    },
                    {
                        type: 'p2tr',
                        name: 'taproot',
                        reg: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/
                    }
                ],
                ipfs: 'http://ipfs-gateway.ordit.io/'
            },
            testnet:
            {
                rpc: 'https://testnet.ordit.io/rpc',
                dns: 'https://dns.google/resolve',
                orderbook: 'tb1qfnw26753j7kqu3q099sd48htvtk5wm4e0enmru',
                formats:
                [
                    {
                        type: 'p2pkh',
                        name: 'legacy',
                        reg: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/
                    },
                    {
                        type: 'p2sh',
                        name: 'segwit',
                        reg: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/
                    },
                    {
                        type: 'p2wpkh',
                        name: 'bech32',
                        reg: /^(tb1q|bcrt1q)[a-zA-HJ-NP-Z0-9]{14,74}$/
                    },
                    {
                        type: 'p2tr',
                        name: 'taproot',
                        reg: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/
                    }
                ],
                ipfs: 'http://ipfs-gateway.ordit.io/'
            }
        }
    },
    collection: function(request = false, params = {})
    {
        return new Promise((resolve, reject) => 
        {
            if(typeof ordit.sdk.collections[request] == 'function')
            {
                ordit.sdk.collections[request](params, function(res)
                {
                    if(res.success)
                    {
                        resolve(res.data);
                    }
                    else
                    {
                        reject(res.message);
                    }
                });
            }
            else
            {
                reject('Invalid collection request');
            }
        });
    },
    collections:
    {
        publish: function(params = {}, callback = false)
        {
            // Generate OIP data array ...?
            
            var options = 
            {
                seed: false,
                key: false,
                
                title: false,
                description: false,
                slug: false,
                url: 'http://ordzaar.com',
                destination: false,
                
                publishers: false, // a required array of addresses
                inscriptions: false, // a required array of inscription objects
                
                postage: 10000, // can optional be changed
                creator: false, // an optional name for creator
                email: false, // an optional email address for creator
                media_content: 'OIP-2', // optionally updated for collection cover
                media_type: 'text/plain;charset=utf-8', // optionally updated for collection cover
                
                network: 'testnet'
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid inputs for collections.prepare',
                data: options
            };
            if
            (
                (options.seed || options.key)
                && options.media_type && options.media_content && options.destination
                && typeof options.publishers == 'object' && options.publishers.length > 0
                && typeof options.inscriptions == 'object' && options.inscriptions.length > 0
                &&
                (
                    options.network == 'mainnet'
                    || options.network == 'testnet'
                    || options.network == 'regtest'
                )
                && typeof callback == 'function'
            )
            {
                // Validate inscriptions ...
                var valid_inscriptions = [];
                for(ins = 0; ins < options.inscriptions.length; ins++)
                {
                    if
                    (
                        typeof options.inscriptions[ins].iid != 'undefined'
                        && typeof options.inscriptions[ins].lim != 'undefined'
                    )
                    {
                        var valid_inscription = {
                            iid: options.inscriptions[ins].iid,
                            lim: options.inscriptions[ins].lim
                        }
                        if(typeof options.inscriptions[ins].sri != 'undefined')
                        {
                            valid_inscription.sri = options.inscriptions[ins].sri;
                        }
                        valid_inscriptions.push(valid_inscription);
                    }
                }

                if(valid_inscriptions.length == options.inscriptions.length)
                {
                    var get_options = 
                    {
                        network: options.network,
                        format: 'p2pkh'
                    };
                    if(options.key)
                    {
                        get_options.key = options.key;
                    }
                    else
                    {
                        get_options.seed = options.seed;
                    }
                    ordit.sdk.wallet.get(get_options,  function(w)
                    {
                        if(w.success)
                        {
                            var creator = 
                            {
                                address: w.data.addresses[0].address // legacy address from seed ?
                            }

                            if(options.creator)
                            {
                                creator.name = options.creator;
                            }
                            if(options.email)
                            {
                                creator.email = options.email;
                            }

                            // Need to get address belonging to input (seed) ?

                            var data = 
                            {
                                p: "vord", // protocol
                                v: 1, // version
                                ty: 'col',
                                title: options.title,
                                desc: options.description,
                                url: options.url,
                                slug: options.slug,
                                creator: creator,
                                publ: options.publishers,
                                insc: valid_inscriptions
                            };
                            
                            var inscribe_options = JSON.parse(JSON.stringify(get_options));
                            inscribe_options.media_content = options.media_content,
                            inscribe_options.media_type = options.media_type,
                            inscribe_options.meta = data,

                            ordit.sdk.inscription.address(inscribe_options,  function(commit)
                            {
                                if(commit.success)
                                {
                                    commit.data.meta = data;
                                    
                                    var psbt_options = JSON.parse(JSON.stringify(inscribe_options));
                                    psbt_options.destination = options.destination;
                                    psbt_options.change_address = creator.address;
                                    psbt_options.fees = commit.data.fees;

                                    ordit.sdk.inscription.psbt(psbt_options,  function(reveal)
                                    {
                                        if(reveal.success && options.key)
                                        {
                                            callback(reveal);
                                        }
                                        else if(reveal.success)
                                        {
                                            var tweaked = false;
                                            ordit.sdk.psbt.sign({
                                                seed: options.seed, 
                                                hex: reveal.data.hex,
                                                network: options.network,
                                                tweaked: tweaked
                                            }, 
                                            function(signed)
                                            {
                                                if(signed.success)
                                                {
                                                    ordit.sdk.txid.get({
                                                        hex: signed.data.hex,
                                                        network: options.network
                                                    }, 
                                                    function(relayed)
                                                    {
                                                        if(relayed.success)
                                                        {
                                                            results.success = true;
                                                            results.message = 'TXID attached to data';
                                                            results.data = 
                                                            {
                                                                txid: relayed.data.txid
                                                            };
                                                            callback(results);
                                                        }
                                                        else
                                                        {
                                                            results.message = 'Unable to relay commit';
                                                            callback(results);
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    results.message = 'Unable to sign commit';
                                                    callback(results);
                                                }
                                            });
                                        }
                                        else
                                        {
                                            var sats = (commit.data.fees + options.postage);
                                            var btc = parseFloat(sats / (10 ** 8));
                                            results.message = reveal.message;
                                            results.data = {
                                                sats: sats,
                                                btc: btc,
                                                address: commit.data.address
                                            };
                                            callback(results);
                                        }
                                    });
                                }
                                else
                                {
                                    results.message = commit.message;
                                    callback(results);
                                }
                            });
                        }
                        else
                        {
                            results.message = w.message;
                            callback(results);
                        }
                    });
                }
                else
                {
                    if(valid_inscriptions.length == options.inscriptions.length)
                    {
                        results.message = 'Invalid creators address and key combo';
                    }
                    else
                    {
                        results.message = 'Invalid inscription object array';
                    }
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        mint: function(params = {}, callback = false)
        {   
            var options = 
            {
                seed: false, // todo - add support for other input types
                destination: false, // location of collection inscription
                collection: false, // location of collection inscription
                inscription: false, // inscription ID as defined by collection
                nonce: 0, // auto incrementing integer of sequence from limit
                publisher: 0, // integer index from pub array
                postage: 10000, // integer index from pub array
                media_type: false,
                media_content: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid inputs for collections.mint',
                data: options
            };
            if
            (
                options.seed && options.inscription && options.destination
                && options.collection && options.collection.indexOf(':') > 0
                &&
                (
                    options.network == 'mainnet'
                    || options.network == 'testnet'
                    || options.network == 'regtest'
                )
            )
            {
                // Get / validate collection ?
                
                var location = options.collection.split(':');
                var txid = location[0];
                var vout = location[1];
                
                ordit.sdk.apis.transaction({
                    txid: txid,
                    network: options.network
                },  function(transaction)
                {
                    if(transaction.success)
                    {
                        var tx = transaction.data;
                        var meta = false;
                        
                        try
                        {
                            var m = transaction.data.vout[vout].inscriptions[0].meta;
                            // TODO - more validation where possible ?
                            
                            var valid_inscription = false;
                            for(i = 0; i < m.insc.length; i++)
                            {
                                if
                                (
                                    m.insc[i].iid == options.inscription
                                    && typeof m.publ[parseInt(options.publisher)] != 'undefined'
                                    && parseInt(options.nonce) < parseInt(m.insc[i].lim)
                                )
                                {
                                    valid_inscription = true;
                                }
                            }

                            if(valid_inscription)
                            {   
                                meta = 
                                {
                                    p: "vord",
                                    v: 1,
                                    ty: "insc",
                                    col: options.collection,
                                    iid: options.inscription,
                                    publ: m.publ[options.publisher],
                                    nonce: options.nonce
                                }
                            }
                        }
                        catch(e){}
                        
                        if(typeof meta == 'object')
                        {
                            // now need to add "sig" to meta ...
                            ordit.sdk.message.sign({
                                seed: options.seed, 
                                message: options.collection + ' ' + options.inscription + ' ' + options.nonce,
                                network: options.network
                            }, async function(sigs)
                            {
                                if(sigs.success)
                                {
                                    meta.sig = sigs.data.hex;
                            
                                    // Generate new inscription address / deposit modal flow 
                                    // like collections.publish ...
                                    
                                    ordit.sdk.inscription.address({
                                        seed: options.seed,
                                        media_content: options.media_content,
                                        media_type: options.media_type,
                                        network: options.network,
                                        meta: meta
                                    },  function(commit)
                                    {
                                        if(commit.success)
                                        {
                                            commit.data.meta = meta;

                                            ordit.sdk.inscription.psbt({
                                                seed: options.seed,
                                                media_content: options.media_content,
                                                media_type: options.media_type,
                                                destination: options.destination,
                                                change_address: commit.data.address,
                                                fees: commit.data.fees,
                                                network: options.network,
                                                meta: commit.data.meta
                                            },  function(reveal)
                                            {
                                                if(reveal.success)
                                                {
                                                    var tweaked = false;
                                                    ordit.sdk.psbt.sign({
                                                        seed: options.seed, 
                                                        hex: reveal.data.hex,
                                                        network: options.network,
                                                        tweaked: tweaked
                                                    }, 
                                                    function(signed)
                                                    {
                                                        if(signed.success)
                                                        {
                                                            ordit.sdk.txid.get({
                                                                hex: signed.data.hex,
                                                                network: options.network
                                                            }, 
                                                            function(relayed)
                                                            {
                                                                if(relayed.success)
                                                                {
                                                                    results.success = true;
                                                                    results.message = 'TXID attached to data';
                                                                    results.data = 
                                                                    {   
                                                                        txid: relayed.data.txid
                                                                    };
                                                                    callback(results);
                                                                }
                                                                else
                                                                {
                                                                    results.message = 'Unable to relay commit';
                                                                    callback(results);
                                                                }
                                                            });
                                                        }
                                                        else
                                                        {
                                                            results.message = 'Unable to sign commit';
                                                            callback(results);
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    var sats = (commit.data.fees + options.postage);
                                                    var btc = parseFloat(sats / (10 ** 8));
                                                    results.message = reveal.message;
                                                    results.data = {
                                                        sats: sats,
                                                        btc: btc,
                                                        address: commit.data.address
                                                    };
                                                    callback(results);
                                                }
                                            });
                                        }
                                        else
                                        {
                                            results.message = commit.message;
                                            callback(results);
                                        }
                                    });
                                }
                                else
                                {
                                    results.message = sigs.message;
                                    callback(results);
                                }
                            });
                        }
                        else
                        {
                            results.message = 'Invalid OIP2 Meta';
                            callback(results);
                        }
                    }
                    else
                    {
                        results.message = transaction.message;
                        callback(results);
                    }
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        }
    },
    get: function(request = false, params = {})
    {
        return new Promise((resolve, reject) => 
        {
            if(typeof ordit.sdk[request].get == 'function')
            {
                ordit.sdk[request].get(params, function(res)
                {
                    if(res.success)
                    {
                        resolve(res.data);
                    }
                    else
                    {
                        reject(res.message);
                    }
                });
            }
            else
            {
                reject('Invalid get request');
            }
        });
    },
    instant:
    {
        buy: function(params = {}, callback = false)
        {   
            var options = 
            {
                key: false, // todo - add support for other input types
                psbt: false, // seller psbt
                location: false, // TXID:VOUT - the "vout" is required :-(
                fees: 10, // sats per byte
                postage: 10000, // sats
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid inputs for instant.buy',
                data: false
            };
            Object.assign(options, params);
            if
            (
                options.key && options.psbt 
                && parseInt(options.postage) > 599
                && typeof options.location == 'string'
                && options.location.indexOf(':') > 0
                && typeof callback == 'function'
                &&
                (
                    options.network == 'mainnet'
                    || options.network == 'testnet'
                    || options.network == 'regtest'
                )
            )
            {
                var psbt = false;
                var net_obj = ordit.sdk.network(options.network);
                try
                {
                    psbt = btc.Psbt.fromHex(options.psbt, { network: net_obj});
                }
                catch(err){ error = err }
                
                try
                {
                    var finalized_hex = psbt.finalizeAllInputs().toHex();
                    psbt = btc.Psbt.fromHex(finalized_hex, { network: net_obj});
                }
                catch(final_error)
                {
                    console.info('final_error', final_error);
                    psbt = false;
                }
                
                if(psbt)
                {
                    var locs = options.location.split(':');
                    var tx_id = locs[0];
                    var vout = locs[1];
                    
                    var txid = Buffer.from(psbt.data.globalMap.unsignedTx.tx.ins[0].hash).reverse().toString('hex');
                    
                    if(txid == tx_id)
                    {
                        options.format = 'p2tr';
                        ordit.sdk.balance.get(options, function(balances)
                        {
                            if(balances.success)
                            {
                                var address = balances.data.addresses[0].address;
                                var xkey = balances.data.addresses[0].xkey;
                                var spendables = balances.data.spendables;
                                var seller_address = false;

                                var psbt_ready = function(final_psbt)
                                {   
                                    results.success = true;
                                    results.message = 'Unsigned PSBT attached to data';
                                    results.data = 
                                    {
                                        hex: final_psbt.toHex(),
                                        base64: final_psbt.toBase64()
                                    }
                                    callback(results);
                                }

                                var merged_psbts = function(merged_psbt, to_spend)
                                {
                                    //merged_psbt.finalizeInput(2);
                                    
                                    var sats_to_send = merged_psbt.data.globalMap.unsignedTx.tx.outs[2].value;

                                    var fees = 0;
                                    var ins_used = 0;
                                    var txs_to_use = [];
                                    for(t = 0; t < to_spend.length; t++)
                                    {
                                        fees = JSON.parse(JSON.stringify((80 + ((t+1) * 180)) * options.fees));
                                        if(ins_used < (sats_to_send + fees))
                                        {
                                            txs_to_use.push(to_spend[t]);
                                            ins_used+= to_spend[t].sats;
                                        }
                                    }
                                    
                                    async function loop() 
                                    {
                                        for(un = 0; un < txs_to_use.length; un++)
                                        { 
                                            await new Promise(next => 
                                            {
                                                var tx_to_use = txs_to_use[un];
                                                ordit.sdk.apis.transaction({
                                                    txid: tx_to_use.txid,
                                                    network: options.network
                                                }, function(this_tx)
                                                {
                                                    if(this_tx.success)
                                                    {
                                                        var raw = btc.Transaction.fromHex(this_tx.data.hex);
                                                        var d = 
                                                        {
                                                            hash: this_tx.data.txid,
                                                            index: parseInt(tx_to_use.n),
                                                            nonWitnessUtxo: Buffer.from(this_tx.data.hex, 'hex'),
                                                            sequence: 0xfffffffd // Needs to be at least 2 below max int value to be RBF
                                                        };
                                                        var sats = Math.round(parseFloat(this_tx.data.vout[tx_to_use.n].value) * (10 ** 8));

                                                        var p2tr = btc.payments.p2tr({
                                                            internalPubkey: Buffer.from(xkey, 'hex'),
                                                            network: net_obj
                                                        });

                                                        d.tapInternalKey = Buffer.from(xkey, 'hex');
                                                        d.witnessUtxo = 
                                                        {
                                                            script: p2tr.output,
                                                            value: sats
                                                        };
                                                        
                                                        //d.sighashType = 131;

                                                        merged_psbt.addInput(d);

                                                        next();
                                                    }
                                                    else
                                                    {
                                                        results.message = this_tx.message;
                                                        callback(results);
                                                    }
                                                });
                                            });
                                        }
                                    }
                                    loop().then(() => 
                                    {
                                        // Got change ...?
                                        var change = ins_used - (sats_to_send + fees);

                                        if(change >= 0)
                                        {
                                            if(change > 599)
                                            {
                                                merged_psbt.addOutput({
                                                    address: address,
                                                    value: change
                                                });
                                            }
                                            psbt_ready(merged_psbt);
                                        }
                                        else
                                        {
                                            results.message = 'Not enough input value to cover costs';
                                            callback(results);
                                        }
                                    });
                                }

                                function compare( a, b ) {
                                  if ( a.sats < b.sats ){
                                    return -1;
                                  }
                                  if ( a.sats > b.sats ){
                                    return 1;
                                  }
                                  return 0;
                                }
                                spendables.sort(compare);

                                if(spendables.length > 2)
                                {
                                    ordit.sdk.apis.transaction({
                                        txid: txid,
                                        network: options.network
                                    }, function(transaction)
                                    {
                                        if(transaction.success)
                                        {
                                            seller_address = transaction.data.vout[vout].scriptPubKey.address;

                                            var dummy_txs = [];
                                            var spendable_txs = [];

                                            for(t = 0; t < spendables.length; t++)
                                            {
                                                if(t < 2)
                                                {
                                                    dummy_txs.push(spendables[t])
                                                }
                                                else
                                                {
                                                    spendable_txs.push(spendables[t]);
                                                }
                                            }

                                            function compared( a, b ) {
                                              if ( a.sats > b.sats ){
                                                return -1;
                                              }
                                              if ( a.sats < b.sats ){
                                                return 1;
                                              }
                                              return 0;
                                            }
                                            spendable_txs.sort(compared);

                                            var ord_tx = transaction.data;
                                            var net_obj = ordit.sdk.network(options.network);

                                            var prepare_dummy_txs = function(txs, this_callback)
                                            {
                                                ordit.sdk.apis.transaction({
                                                    txid: txs[0].txid,
                                                    network: options.network
                                                }, function(tx1)
                                                {
                                                    if(tx1.success)
                                                    {
                                                        ordit.sdk.apis.transaction({
                                                            txid: txs[1].txid,
                                                            network: options.network
                                                        }, function(tx2)
                                                        {
                                                            if(tx2.success)
                                                            {
                                                                var raw_tx1 = btc.Transaction.fromHex(tx1.data.hex);
                                                                var raw_tx2 = btc.Transaction.fromHex(tx2.data.hex);
                                                                var data1 = 
                                                                {
                                                                    hash: tx1.data.txid,
                                                                    index: parseInt(txs[0].n),
                                                                    nonWitnessUtxo: Buffer.from(tx1.data.hex, 'hex'),
                                                                    sequence: 0xfffffffd // Needs to be at least 2 below max int value to be RBF
                                                                };
                                                                var data2 = 
                                                                {
                                                                    hash: tx2.data.txid,
                                                                    index: parseInt(txs[1].n),
                                                                    nonWitnessUtxo: Buffer.from(tx2.data.hex, 'hex'),
                                                                    sequence: 0xfffffffd // Needs to be at least 2 below max int value to be RBF
                                                                };
                                                                var sats1 = Math.round(parseFloat(tx1.data.vout[txs[0].n].value) * (10 ** 8));
                                                                var sats2 = Math.round(parseFloat(tx2.data.vout[txs[1].n].value) * (10 ** 8));
                                                                var total_sats = sats1 + sats2;

                                                                var p2tr = btc.payments.p2tr({
                                                                    internalPubkey: Buffer.from(xkey, 'hex'),
                                                                    network: net_obj
                                                                });

                                                                data1.tapInternalKey = Buffer.from(xkey, 'hex');
                                                                data2.tapInternalKey = Buffer.from(xkey, 'hex');
                                                                data1.witnessUtxo = 
                                                                {
                                                                    script: p2tr.output,
                                                                    value: sats1
                                                                };
                                                                data2.witnessUtxo = 
                                                                {
                                                                    script: p2tr.output,
                                                                    value: sats2
                                                                };

                                                                var data = 
                                                                {
                                                                    inputs: [],
                                                                    outputs: []
                                                                }

                                                                data.inputs.push(data1);
                                                                data.inputs.push(data2);
                                                                data.outputs.push({
                                                                    address: address,
                                                                    value: total_sats
                                                                });

                                                                this_callback(data);
                                                            }
                                                            else
                                                            {
                                                                results.message = tx2.message;
                                                                callback(results);
                                                            }
                                                        });
                                                    }
                                                    else
                                                    {
                                                        results.message = tx1.message;
                                                        callback(results);
                                                    }
                                                });
                                            }
                                            
                                            prepare_dummy_txs(dummy_txs, function(data)
                                            {   
                                                var new_psbt = new btc.Psbt({network: net_obj});

                                                for(ins = 0; ins < data.inputs.length; ins++)
                                                {
                                                    new_psbt.addInput(data.inputs[ins]);
                                                }
                                                for(out = 0; out < data.outputs.length; out++)
                                                {
                                                    new_psbt.addOutput(data.outputs[out]);
                                                }

                                                // Add ordinal output ...
                                                new_psbt.addOutput({
                                                    address: address,
                                                    value: options.postage
                                                });

                                                // Now need to cover price of ordinal ?

                                                var seller_psbt = btc.Psbt.fromHex(options.psbt, { network: net_obj });

                                                // inputs
                                                new_psbt.data.globalMap.unsignedTx.tx.ins[2] = seller_psbt.data.globalMap.unsignedTx.tx.ins[0];

                                                new_psbt.data.inputs[2] = seller_psbt.data.inputs[0];

                                                // outputs
                                                new_psbt.data.globalMap.unsignedTx.tx.outs[2] = seller_psbt.data.globalMap.unsignedTx.tx.outs[0];

                                                new_psbt.data.outputs[2] = seller_psbt.data.outputs[0];

                                                merged_psbts(new_psbt, spendable_txs);
                                            })

                                           
                                        }
                                        else
                                        {
                                            results.message = transaction.message;
                                            callback(results);
                                        }
                                    });
                                }
                                else
                                {
                                    results.message = 'Minimum of 3 spendables required for instant buy';
                                    callback(results);
                                }
                            }
                            else
                            {
                                results.message = balances.message;
                                callback(results);
                            }
                        });
                    }
                    else
                    {
                        results.message = 'Invalid location for instant buy';
                        callback(results);
                    }
                }
                else
                {
                    results.message = 'Invalid PSBT for instant buy';
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        sell: function(params = {}, callback = false)
        {   
            var options = 
            {
                key: false, // todo - add support for other input types
                location: false, // TXID:VOUT of unspent to sell
                price: 0, // Must be more than 599 satoshis
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid inputs for instant.sell',
                data: false
            };
            Object.assign(options, params);
            if
            (
                options.key
                && parseInt(options.price) > 599
                && options.location.indexOf(':') > 0
                && typeof callback == 'function'
                &&
                (
                    options.network == 'mainnet'
                    || options.network == 'testnet'
                    || options.network == 'regtest'
                )
            )
            {   
                options.format = 'p2tr';
                ordit.sdk.balance.get(options, function(balances)
                {
                    if(balances.success)
                    {
                        var txid = options.location.split(':')[0];
                        var address = balances.data.addresses[0].address;
                        var xkey = balances.data.addresses[0].xkey;
                        var unspendables = balances.data.unspendables;
                        var spendables = balances.data.spendables;
                        var tx = unspendables.find(unspent => unspent.txid == txid);

                        if(typeof tx == 'object')
                        {
                            // instant.sell 
                            
                            ordit.sdk.apis.transaction({
                                txid: txid,
                                network: options.network
                            },  function(transaction)
                            {
                                if(transaction.success)
                                {
                                    var net_obj = ordit.sdk.network(options.network);
                                    var full_tx = transaction.data;
                                    var raw_tx = btc.Transaction.fromHex(full_tx.hex);
                                    
                                    if (typeof options.format != 'undefined' && options.format !== "p2tr") 
                                    {
                                        for (const output in raw_tx.outs) 
                                        {
                                          try {
                                            raw_tx.setWitness(parseInt(output), []);
                                          } catch {}
                                        }
                                    }

                                    var data = 
                                    {
                                        hash: tx.txid,
                                        index: parseInt(tx.n),
                                        nonWitnessUtxo: Buffer.from(full_tx.hex, 'hex'),
                                        sequence: 0xfffffffd // Needs to be at least 2 below max int value to be RBF
                                    };
                                    var postage = tx.sats;

                                    // Seller sigs ...
                                    var sighashType = btc.Transaction.SIGHASH_SINGLE | btc.Transaction.SIGHASH_ANYONECANPAY;

                                    var p2tr = btc.payments.p2tr({
                                        internalPubkey: Buffer.from(xkey, 'hex'),
                                        network: net_obj
                                    });

                                    data.tapInternalKey = Buffer.from(xkey, 'hex');
                                    data.witnessUtxo = 
                                    {
                                        script: p2tr.output,
                                        value: postage
                                    };
                                    
                                    data.sighashType = sighashType;

                                    var inputs = [];
                                    var outputs = [];

                                    inputs.push(data);
                                    
                                    outputs.push({
                                        address: address,
                                        value: parseInt(options.price) + postage
                                    });

                                    var psbt = new btc.Psbt({network: net_obj});

                                    for(ins = 0; ins < inputs.length; ins++)
                                    {
                                        psbt.addInput(inputs[ins]);
                                    }
                                    for(out = 0; out < outputs.length; out++)
                                    {
                                        psbt.addOutput(outputs[out]);
                                    }

                                    results.success = true;
                                    results.message = 'Unsigned PSBT attached to data';
                                    results.data = 
                                    {
                                        hex: psbt.toHex(),
                                        base64: psbt.toBase64()
                                    };
                                    callback(results);
                                }
                                else
                                {
                                    results.message = transaction.message;
                                    callback(results);
                                }
                            });
                        }
                        else
                        {
                            results.message = 'Unable to find sell location';
                            callback(results);
                        }
                    }
                    else
                    {
                        results.message = balances.message;
                        callback(results);
                    }
                })
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        }
    },
    sign: function(request = false, params = {})
    {
        return new Promise((resolve, reject) => 
        {
            if(typeof ordit.sdk[request].sign == 'function')
            {
                ordit.sdk[request].sign(params, function(res)
                {
                    if(res.success)
                    {
                        resolve(res.data);
                    }
                    else
                    {
                        reject(res.message);
                    }
                });
            }
            else
            {
                reject('Invalid sign request');
            }
        });
    },
    inscribe: function(request = false, params = {})
    {
        return new Promise((resolve, reject) => 
        {
            if(typeof ordit.sdk.inscription[request] == 'function')
            {
                ordit.sdk.inscription[request](params, function(res)
                {
                    if(res.success)
                    {
                        resolve(res.data);
                    }
                    else
                    {
                        reject(res.message);
                    }
                });
            }
            else
            {
                reject('Invalid inscribe request');
            }
        });
    },
    api: function(params = {}, callback = false)
    {
        var options = 
        {
            uri: false,
            url: false,
            data: false,
            network: 'testnet'
        };
        Object.assign(options, params);
        if(options.uri && options.data && options.network && typeof callback == 'function')
        {   
            try
            {
                var uri = ordit.sdk.config.apis[options.network].batter + options.uri;
                if(typeof options.url != 'undefined' && options.url)
                {
                    uri = options.url;
                }
                fetch
                (
                    uri, 
                    {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(options.data)
                    }
                )
                .then(response => response.json())
                .then(response => callback(response))
                .catch(response => callback(false))
            }
            catch(err)
            {
                callback(false, err);
            }
        }
    },
    apis:
    {
        brc20: function(params = {}, callback = false)
        {
            var options = 
            {
                symbol: false,
                address: false,
                transfers: true,
                network: 'testnet'
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for apis.brc20',
                data: options
            }
            if
            (
                (
                    options.symbol 
                    ||
                    options.address
                )
                && options.network 
                && typeof callback == 'function'
            )
            {    
                var brc20_request = false
                
                if(options.address)
                {
                    brc20_request = 
                    {
                        method: 'Brc20.Address.GetTokens',
                        network: options.network,
                        data: { address: options.address, include: ["token"] },
                        pagination: 
                        {
                            limit: 25
                        }
                    }
                    if(options.transfers && options.symbol)
                    {
                        brc20_request = 
                        {
                            method: 'Brc20.Address.GetTransferables',
                            network: options.network,
                            data: { address: options.address, tick: options.symbol, include: ["token"] },
                            pagination: 
                            {
                                limit: 25
                            }
                        }
                    }
                }
                else
                {
                    brc20_request = 
                    {
                        method: 'Brc20.GetToken',
                        network: options.network,
                        data: { tick: options.symbol }
                    }
                }
                
                ordit.sdk.rpc(brc20_request, function(brc20)
                {
                    if(brc20.success)
                    {
                        results.success = true;
                        results.message = 'BRC20 data attached to data';
                        
                        var these_tokens = brc20.rdata;
                        
                        if(options.transfers && options.symbol && options.address)
                        {
                            results.data = these_tokens;
                            callback(results);
                        }
                        else
                        {
                            if
                            (
                                typeof options.address == 'string'
                                && typeof options.symbol == 'string'
                            )
                            {
                                var original_tokens = JSON.parse(JSON.stringify(these_tokens));
                                these_tokens = [];
                                for(t = 0 ; t < original_tokens.length; t++)
                                {
                                    if(original_tokens[t].tick == options.symbol)
                                    {
                                        these_tokens.push(original_tokens[t]);
                                    }
                                }
                            }

                            for(t = 0 ; t < these_tokens.length; t++)
                            {
                                var decimal = 0;
                                these_tokens[t].type = 'BRC20';
                                if
                                (
                                    typeof these_tokens[t].token == 'object'
                                )
                                {
                                    if(typeof these_tokens[t].token.decimal != 'undefined')
                                    {
                                        decimal = these_tokens[t].token.decimal;
                                    }
                                    else
                                    {
                                        these_tokens[t].token.decimal = decimal;
                                    }

                                    these_tokens[t].display = 
                                    {
                                        available: ordit.sdk.utils.float(these_tokens[t].available, decimal),
                                        total: ordit.sdk.utils.float(these_tokens[t].total, decimal),
                                        transferable: ordit.sdk.utils.float(these_tokens[t].transferable, decimal)
                                    }

                                    var remaining = these_tokens[t].token.max - these_tokens[t].token.amount;
                                    these_tokens[t].token.remaining = remaining;

                                    these_tokens[t].display.max = ordit.sdk.utils.float(these_tokens[t].token.max, decimal);

                                    these_tokens[t].display.amount = ordit.sdk.utils.float(these_tokens[t].token.amount, decimal);

                                    these_tokens[t].display.limit = ordit.sdk.utils.float(these_tokens[t].token.limit, decimal);
                                    these_tokens[t].display.remaining = ordit.sdk.utils.float(these_tokens[t].token.remaining, decimal);
                                }
                            }
                            results.data = these_tokens;
                            callback(results);
                        }
                    }
                    else
                    {
                        results.message = 'Unable to get BRC20 data';
                        if(typeof brc20.message)
                        {
                            results.message = brc20.message;
                        }
                        callback(results);
                    }
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        fees: function(params = {}, callback = false)
        {
            var options = 
            {
                block: false,
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid options for apis.fees',
                data: false
            }
            Object.assign(options, params);
            if(options.network && typeof callback == 'function')
            {    
                var block_request = 
                {
                    method: 'Blockchain.GetBlockStats',
                    network: options.network,
                    data: {}
                }
                if(options.block)
                {
                    block_request.data.hashOrHeight = options.block;
                }
                ordit.sdk.rpc(block_request, function(block)
                {
                    if(block.success)
                    {
                        var fees = 
                        {
                            average: block.rdata.avgFeeRate,
                            percentiles: block.rdata.feeratePercentiles
                        }
                        results.success = true;
                        results.message = 'Fees attached to data';
                        results.data = fees;
                    }
                    else
                    {
                        results.message = 'Unable to get transaction';
                        if(typeof block.message)
                        {
                            results.message = block.message;
                        }
                    }
                    callback(results);
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        inscriptions: function(params = {}, callback = false)
        {
            var options = 
            {
                address: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for apis.inscriptions',
                data: options
            }
            
            if(options.address && options.network && typeof callback == 'function')
            {
                var total_inscriptions = [];
                var check_for_inscriptions = function(page)
                {
                    var inscription_options = 
                    {
                        method: 'Ordinals.GetInscriptions',
                        data: 
                        { 
                            filter: 
                            {
                                owner: options.address
                            },
                            pagination: 
                            {
                                limit: 25
                            }
                        },
                        network: options.network
                    };
                    
                    if(page)
                    {
                        inscription_options.data.pagination.next = page;
                    }
                    ordit.sdk.rpc(inscription_options, function(these_ins)
                    {
                        if(these_ins.success)
                        {
                            var next = false;
                            if
                            (
                                typeof these_ins.rdata.pagination == 'object'
                                && typeof these_ins.rdata.pagination.next == 'string'
                            )
                            {
                                next = these_ins.rdata.pagination.next;
                            }
                            if(total_inscriptions.length < 1)
                            {
                                total_inscriptions = these_ins.rdata.inscriptions;
                            }
                            else
                            {
                                for(i = 0; i < these_ins.rdata.inscriptions.length; i++)
                                {
                                    total_inscriptions.push(these_ins.rdata.inscriptions[i]);
                                }
                            }
                            if(next)
                            {
                                check_for_inscriptions(next);
                            }
                            else
                            {
                                results.success = true;
                                results.message = 'Inscriptions attached to data';
                                results.data = 
                                {
                                    inscriptions: total_inscriptions
                                };
                                callback(JSON.parse(JSON.stringify(results)));
                            }
                        }
                        else
                        {
                            results.message = 'Unable to get inscriptions';
                            if(typeof these_ins.message)
                            {
                                results.message = these_ins.message;
                            }
                            callback(JSON.parse(JSON.stringify(results)));
                        }
                    });
                }
                check_for_inscriptions(false);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        orderbook: function(params = {}, callback = false)
        {
            var options = 
            {
                address: false,
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid options for apis.orderbook',
                data: false
            }
            Object.assign(options, params);
            
            if(options.address && options.network && typeof callback == 'function')
            {    
                ordit.sdk.rpc({
                    method: 'Sado.GetOrderbook',
                    data: 
                    { 
                        address: options.address,
                        pagination: 
                        {
                            limit: 50
                        }
                    },
                    network: options.network
                }, function(so)
                {
                    if(so.success)
                    {
                        results.success = true;
                        results.message = 'Orderbook attached to data';
                        results.data = so.rdata;
                    }
                    else
                    {
                        results.message = 'Unable to get orderbook';
                        if(typeof so.message)
                        {
                            results.message = so.message;
                        }
                    }
                    callback(results);
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        ordinals: function(params = {}, callback = false)
        {
            var options = 
            {
                address: false,
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid options for apis.ordinals',
                data: false
            }
            Object.assign(options, params);
            
            if(options.address && options.network && typeof callback == 'function')
            {   
                ordit.sdk.rpc({
                    method: 'Ordinals.GetOrdinals',
                    data: 
                    { 
                        address: options.address
                    },
                    network: options.network
                }, function(ord)
                {
                    if(ord.success)
                    {
                        results.success = true;
                        results.message = 'Ordinals attached to data';
                        results.data = ord.rdata;
                    }
                    else
                    {
                        results.message = 'Unable to get ordinals';
                        if(typeof ord.message)
                        {
                            results.message = ord.message;
                        }
                    }
                    callback(results);
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        relay: function(params = {}, callback = false)
        {
            var options = 
            {
                hex: false,
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid options for apis.relay',
                data: false
            }
            Object.assign(options, params);
            
            if(options.hex && options.network && typeof callback == 'function')
            {    
                ordit.sdk.rpc({
                    method: 'Transactions.Relay',
                    data: 
                    {
                        hex: options.hex
                    },
                    network: options.network
                }, function(tx)
                {
                    if(tx.success)
                    {
                        results.success = true;
                        results.message = 'Transaction ID attached to data';
                        results.data = tx.rdata;
                    }
                    else
                    {
                        results.message = 'Unable to relay transaction';
                        if(typeof tx.message != 'undefined')
                        {
                            results.message = tx.message;
                        }
                    }
                    callback(results);
                });
            }
            else if(typeof callback == 'function')
            {
                results.data = options;
                callback(results);
            }
        },
        transaction: function(params = {}, callback = false)
        {
            var options = 
            {
                txid: false,
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid options for apis.transaction',
                data: false
            }
            Object.assign(options, params);
            
            if(options.txid && options.network && typeof callback == 'function')
            {    
                ordit.sdk.rpc({
                    method: 'Transactions.GetTransaction',
                    data: 
                    { 
                        txid: options.txid,
                        options:
                        {
                            ord: true,
                            hex: true
                        }
                    },
                    network: options.network
                }, function(tx)
                {
                    if(tx.success)
                    {
                        results.success = true;
                        results.message = 'Transaction attached to data';
                        results.data = tx.rdata;
                    }
                    else
                    {
                        results.message = 'Unable to get transaction';
                        if(typeof tx.message)
                        {
                            results.message = tx.message;
                        }
                    }
                    callback(results);
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        transactions: function(params = {}, callback = false)
        {
            var options = 
            {
                address: false,
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid options for apis.transactions',
                data: false
            }
            Object.assign(options, params);
            
            if(options.address && options.network && typeof callback == 'function')
            {    
                ordit.sdk.rpc({
                    method: 'Address.GetTransactions',
                    data: 
                    { 
                        address: options.address,
                        options:
                        {
                            ord: true,
                            hex: true
                        }
                    },
                    network: options.network
                }, function(tx)
                {
                    if(tx.success)
                    {
                        results.success = true;
                        results.message = 'Transactions attached to data';
                        results.data = tx.rdata;
                    }
                    else
                    {
                        results.message = 'Unable to get transactions';
                        if(typeof tx.message)
                        {
                            results.message = tx.message;
                        }
                    }
                    callback(results);
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        unspents: function(params = {}, callback = false)
        {
            var options = 
            {
                address: false,
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid options for apis.unspents',
                data: false
            }
            Object.assign(options, params);
            
            if(options.address && options.network && typeof callback == 'function')
            {
                var all_unspents = [];
                var check_for_unspents = function(page)
                {
                    // api.unspents
                    
                    var unspent_options =
                    {
                        method: 'Address.GetUnspents',
                        data: 
                        { 
                            address: options.address,
                            format: 'next',
                            options:
                            {
                                ord: true,
                                oips: true,
                                txhex: true,
                                safetospend: false,
                                allowedrarity: ['common', 'uncommon']
                            },
                            pagination: 
                            {
                                limit: 15
                            }
                        },
                        network: options.network
                    };
                    
                    if(page)
                    {
                        unspent_options.data.pagination.next = page;
                    }
                    
                    ordit.sdk.rpc(unspent_options, function(unspent)
                    {
                        var next = false;
                        var prev = false;
                        if(unspent.success)
                        {
                            next = unspent.rdata.pagination.next;
                            prev = unspent.rdata.pagination.prev;
                            
                            if(typeof unspent.rdata.unspents == 'object' && unspent.rdata.unspents.length > 0)
                            {
                                for(u = 0; u < unspent.rdata.unspents.length; u++)
                                {
                                    var un = unspent.rdata.unspents[u];
                                    all_unspents.push(un);
                                }
                            }

                            if(next)
                            {
                                check_for_unspents(next);
                            }
                            else
                            {
                                results.success = true;
                                results.message = 'Unspents attached to data';
                                results.data = all_unspents;
                                callback(results);
                            }
                        }
                        else
                        {
                            if(next)
                            {
                                check_for_unspents(next);
                            }
                            else
                            {
                                results.success = true;
                                results.message = 'Unspents attached to data';
                                results.data = all_unspents;
                                callback(results);
                            }
                        }
                    });
                }
                check_for_unspents();
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        }
    },
    rpc: function(params = {}, callback = false)
    {
        var options = 
        {
            method: false,
            data: false,
            sado: false,
            key: false,
            network: 'testnet'
        };
        Object.assign(options, params);
        if(options.method && options.data && options.network && typeof callback == 'function')
        { 
            var normalized_callback = function(resolved)
            {   
                var these_results = 
                {
                    success: false,
                    rdata: false
                };
                if(typeof resolved.result != 'undefined')
                {
                    these_results.success = true;
                    these_results.rdata = resolved.result;
                }
                if(typeof resolved.message != 'undefned')
                {
                    these_results.message = resolved.message;
                    if(typeof resolved.data != 'undefined' && typeof resolved.data != 'object')
                    {
                        these_results.message+= ': ' + resolved.data;
                    }
                }
                if(typeof resolved.error != 'undefined' && typeof resolved.error.message != 'undefined')
                {
                    these_results.message = resolved.error.message;
                    if(typeof resolved.error.data != 'undefined')
                    {
                        these_results.message+= ': ' + resolved.error.data;
                    }
                }
                callback(JSON.parse(JSON.stringify(these_results)));
            }
            try
            {
                var uri = ordit.sdk.config.apis[options.network].rpc;
                
                
                var json_request = 
                {
                    jsonrpc: "2.0",
                    method: options.method,
                    params: options.data,
                    id: 0
                };
                
                var full_request = 
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(json_request)
                }
                
                if(options.key)
                {
                    full_request.headers.authorization = options.key;
                }
                fetch
                (
                    uri, 
                    full_request
                )
                .then(response => response.json())
                .then(response => normalized_callback(response))
            }
            catch(err)
            {
                var error = err.message;
                if(typeof err.data != 'undefined' && err.data)
                {
                    error+= ': ' + err.data;
                }
                console.info('error', error);
                callback({
                    success: false,
                    data: false,
                    message: error
                });
            }
        }
        else if(typeof callback == 'function')
        {
            callback({
                success: false,
                data: options,
                message: 'Invalid options for rpc'
            });
        }
    },
    dnkeys: function(host = false, callback = false)
    {
        if(host && callback && typeof callback == 'function')
        {
            var url = ordit.sdk.config.apis['testnet'].dns + '?name=' + host + '&type=TXT';
            jQuery.ajax({
                url: url,
                dataType: 'json',
                async: true,
                success: function(data)
                {
                    var results = false;
                    if(data && typeof data.Answer == 'object' && data.Answer.length > 0)
                    {
                        results = {};
                        var res = [];
                        var dnk_count = 0;
                        jQuery.each(data.Answer, function(d)
                        {
                            if(data.Answer[d].data.indexOf('dnkey-') > -1)
                            {
                                var dn = data.Answer[d].data.split('dnkey-');
                                var dx = dn[1].split('=');
                                var v = dx[1];
                                if(dx.length > 2)
                                {
                                    for(dx2 = 2; dx2 < dx.length; dx2++)
                                    {
                                        if(
                                            dx[dx2] == ''
                                            || dx[dx2].indexOf('....') > -1
                                        ){
                                            v = v + '=';
                                            if(dx[dx2].indexOf('....') > -1)
                                            {
                                                v = v + dx[dx2];
                                            }
                                        }
                                        else
                                        {
                                            v = v + dx[dx2];
                                        }
                                    }
                                }

                                results[dx[0]] = v;

                                res.push({k: dx[0], v: dx[1]});
                                dnk_count++;

                                if(dnk_count == data.Answer.length)
                                {
                                    results.dnkeys = res;
                                    callback(results);
                                }
                            }
                            else
                            {
                                dnk_count++;

                                if(dnk_count == data.Answer.length)
                                {
                                    results.dnkeys = res;
                                    callback(results);
                                }
                            }
                        });
                    }
                    else
                    {
                        callback(results);
                    }
                }
            });
        }
    },
    network: function(network)
    {
        var chain = false;
        var net_word = network;
        if(network == 'mainnet')
        {
            net_word = 'bitcoin';
        }
        try
        {
            chain = btc.networks[net_word];
        }
        catch(e){}
        return chain;
    },
    keys:
    {
        get: function(params = {}, callback = false)
        {
            var options = 
            {
                seed: false,
                bip39: false,
                path: false,
                format: 'all',
                network: 'testnet'
            };
            Object.assign(options, params);
            if((options.seed || options.bip39) && options.network && options.format && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'Invalid network for getting keys',
                    data: false
                };
                var net_obj = ordit.sdk.network(options.network);
                
                if(net_obj)
                {
                    var s = false;
                    var seeds = false;
                    var msg = false;

                    async function get_seed()
                    {
                        if(options.bip39)
                        {
                            try
                            {
                                msg = 'Invalid 24 BIP39 words';
                                s = await bip39.mnemonicToEntropy(options.bip39);
                                seeds = s.toString('hex');
                            }
                            catch(e){}
                        }
                        else
                        {
                            try
                            {
                                var b = btc.crypto.sha256(Buffer.from(options.seed), 'utf8').toString('hex');
                                var m = bip39.entropyToMnemonic(Buffer.from(b, 'hex'), bip39.wordlists.english);
                                s = await bip39.mnemonicToEntropy(m);
                                seeds = s.toString('hex');
                            }
                            catch(e){}
                        }

                        if(seeds)
                        {
                            var root = bip32ecc.fromSeed
                            (
                                Buffer.from(seeds, 'hex'),
                                net_obj
                            );
                                
                            var words = root;
                            var parent = root;

                            if(options.seed)
                            {
                                words = bip39.entropyToMnemonic(Buffer.from(seeds, 'hex'), bip39.wordlists.english);
                            }

                            if(typeof options.path == 'object' && options.path.length > 0)
                            {
                                for(p = 0; p < options.path.length; p++)
                                {
                                    parent = parent.derive(parseInt(options.path[p]));
                                }
                            }
                            var keys = 
                            {
                                pub: Buffer.from(parent.publicKey).toString('hex'),
                                hd: parent.neutered().toBase58()
                            }
                            
                            try
                            {
                                keys.xkey = parent.publicKey.slice(1, 33);
                            }
                            catch(e){}

                            if(options.seed)
                            {
                                keys.bip39 = words;
                            }
                            results.success = true;
                            results.message = 'Keys attached to data';
                            results.data = keys;
                            callback(results);
                        }
                        else
                        {
                            results.message = 'Unable to construct seed';
                            if(msg)
                            {
                                results.message+= ': ' + msg;
                            }
                            callback(results);
                        }
                    };
                    get_seed();
                }
                else
                {
                    callback(results);
                }
            }
        }
    },
    addresses:
    {
        format: function(address = false, network = false)
        {
            var format = 'unknown';
            if(address && network)
            {
                var formats = false;
                try
                {
                    formats = ordit.sdk.config.apis[network].formats;
                }
                catch(e){}
                if(typeof formats == 'object' && formats.length > 0)
                {
                    for(f = 0; f < formats.length; f++)
                    {
                        if(formats[f].reg.test(address))
                        {
                            format = formats[f].name;
                        }
                    }
                }
            }
            return format;
        },
        get: function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                seed: false,
                bip39: false,
                path: false,
                network: 'testnet',
                format: 'all'
            };
            Object.assign(options, params);
            if((options.seed || options.key || options.bip39) && options.network && options.format && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'Invalid network for getting address',
                    data: false
                };
                var net_obj = ordit.sdk.network(options.network);
                
                if(net_obj)
                {
                    var getAddresses = function(key)
                    {
                        var addresses = [];
                        var chain_code = new Buffer(32);
                        chain_code.fill(1);
                        
                        var childNodeXOnlyPubkey = false;
                        var keys = false;

                        try
                        {
                            
                            keys = bip32ecc.fromPublicKey
                            (
                                Buffer.from(key, 'hex'),
                                chain_code,
                                net_obj
                            );
                            childNodeXOnlyPubkey = keys.publicKey.slice(1, 33);
                            
                        }
                        catch(e)
                        {
                            childNodeXOnlyPubkey = Buffer.from(key, 'hex');
                            keys = false;
                        }
                        
                        var error = false;
                        
                        if(keys && (options.format == 'all' || options.format == 'p2pkh'))
                        {
                            try
                            {
                                var p2pkh = btc.payments.p2pkh({ pubkey: keys.publicKey, network: net_obj });
                                addresses.push({
                                    address: p2pkh.address,
                                    format: 'legacy',
                                    pub: keys.publicKey.toString('hex')
                                });
                            }
                            catch(e){ error = e }
                        }
                        if(keys && (options.format == 'all' || options.format == 'p2sh'))
                        {
                            try
                            {
                                var p2sh = btc.payments.p2sh({
                                    redeem: btc.payments.p2wpkh({ pubkey: keys.publicKey, network: net_obj }),
                                    network: net_obj
                                });
                                addresses.push({
                                    address: p2sh.address,
                                    format: 'segwit',
                                    pub: keys.publicKey.toString('hex')
                                });
                            }
                            catch(e){ error = e }
                        }
                        if(keys && (options.format == 'all' || options.format == 'p2wpkh'))
                        {
                            try
                            {
                                var p2wpkh = btc.payments.p2wpkh({ pubkey: keys.publicKey, network: net_obj });
                                addresses.push({
                                    address: p2wpkh.address,
                                    format: 'bech32',
                                    pub: keys.publicKey.toString('hex')
                                });
                            }
                            catch(e){ error = e }
                        }
                        if(childNodeXOnlyPubkey && (options.format == 'all' || options.format == 'p2tr'))
                        {
                            try
                            {
                                var pub = false;
                                if(keys)
                                {
                                    pub = keys.publicKey.toString('hex');
                                }
                                var p2tr = btc.payments.p2tr({
                                    internalPubkey: childNodeXOnlyPubkey,
                                    network: net_obj
                                });
                                addresses.push({
                                    address: p2tr.address,
                                    xkey: childNodeXOnlyPubkey.toString('hex'),
                                    format: 'taproot',
                                    pub: pub
                                });
                            }
                            catch(e){ error = e; console.info('error', error) }
                        }
                        if(addresses.length > 0)
                        {
                            results.success = true;
                            results.message = 'Addresses attached to data';
                            results.data = addresses;
                            callback(results);
                        }
                        else
                        {
                            results.message = 'Invalid address format';
                            if(error)
                            {
                                results.message+= ': ' + error;
                            }
                            callback(results);
                        }
                    }
                    
                    if(options.seed || options.bip39)
                    {
                        ordit.sdk.keys.get(options, function(k)
                        {
                            if(k.success)
                            {
                                getAddresses(k.data.pub);
                            }
                            else
                            {
                                results.message = k.message;
                                callback(results);
                            }
                        })
                    }
                    else
                    {
                        getAddresses(options.key);
                    }
                }
                else
                {
                    callback(results);
                }
            }
        }
    },
    wallet:
    {
        get: function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                seed: false,
                connect: false,
                bip39: false,
                path: false,
                network: 'testnet',
                format: 'all'
            };
            Object.assign(options, params);
            if
            (
                (options.seed || options.key || options.connect || options.bip39) 
                && options.network && options.format && typeof callback == 'function'

                // be sure only one of the four inputs is used ...
                
                && ! (options.seed && options.key && options.bip39 && options.connect) 
                && ! (options.key && options.bip39 && options.connect) 
                && ! (options.seed && options.key && options.connect) 
                && ! (options.seed && options.key && options.bip39) 
                && ! (options.bip39 && options.connect) 
                && ! (options.seed && options.connect) 
                && ! (options.key && options.connect) 
                && ! (options.seed && options.bip39) 
                && ! (options.key && options.bip39) 
                && ! (options.seed && options.key) 
            )
            {
                var results =
                {
                    success: false,
                    message: 'Unable to get addresses',
                    data: false
                };
                
                var get_addresses = function(opt, keys, specified_address = false)
                {
                    if(opt.connect)
                    {
                        var wallet = 
                        {
                            counts:
                            {
                                addresses: keys.length
                            },
                            keys: keys,
                            addresses: keys
                        };
                        results.success = true;
                        results.message = 'Wallet attached to data';
                        results.data = wallet;
                        callback(results);
                    }
                    else
                    {
                        ordit.sdk.addresses.get(opt, function(a)
                        {
                            if(a.success)
                            {
                                var addresses = a.data;
                                if(specified_address)
                                {
                                    new_addresses = [];
                                    for(a = 0; a < addresses.length; a++)
                                    {
                                        if(addresses[a].address == specified_address)
                                        {
                                            new_addresses.push(addresses[a]);
                                        }
                                    }
                                    addresses = JSON.parse(JSON.stringify(new_addresses));
                                }
                                var wallet = 
                                {
                                    counts:
                                    {
                                        addresses: addresses.length
                                    },
                                    keys: keys,
                                    addresses: addresses
                                };
                                results.success = true;
                                results.message = 'Wallet attached to data';
                                results.data = wallet;
                                callback(results);
                            }
                            else
                            {
                                results.message = a.message;
                                callback(results);
                            }
                        });
                    }
                }
                if(options.seed || options.bip39)
                {
                    ordit.sdk.keys.get(options, function(k)
                    {
                        if(k.success)
                        {
                            var keys = k.data;
                            options.seed = false;
                            options.key = keys.pub;
                            get_addresses(options, [keys]);
                        }
                        else
                        {
                            results.message = k.message;
                            callback(results);
                        }
                    });
                }
                else if(options.connect)
                {
                    ordit.sdk.connect.key(options, function(k)
                    {
                        if(k.success)
                        {
                            var keys = k.data;
                            var address = false;
                            options.seed = false;
                            options.key = keys.pub;
                            if(typeof keys.address)
                            {
                                address = keys.address;
                            }
                            get_addresses(options, keys, address);
                        }
                        else
                        {
                            results.message = k.message;
                            callback(results);
                        }
                    });
                }
                else
                {
                    get_addresses(options, [{ pub: options.key}]);
                }
            }
            else if(typeof callback == 'function')
            {
                callback({
                    success: false,
                    message: 'Invalid options for wallet.get function',
                    data: false
                })
            }
        }
    },
    balance:
    {
        get: function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                seed: false,
                connect: false,
                bip39: false,
                path: false,
                network: 'testnet',
                ordinals: true,
                tokens: true,
                format: 'all'
            };
            Object.assign(options, params);
            if
            (
                (options.seed || options.key || options.connect || options.bip39 || options.address) 
                && options.network && options.format && typeof callback == 'function'

                // be sure only one of the four inputs is used ...
                
                && ! (options.seed && options.key && options.bip39 && options.connect) 
                && ! (options.key && options.bip39 && options.connect) 
                && ! (options.seed && options.key && options.connect) 
                && ! (options.seed && options.key && options.bip39) 
                && ! (options.bip39 && options.connect) 
                && ! (options.seed && options.connect) 
                && ! (options.key && options.connect) 
                && ! (options.seed && options.bip39) 
                && ! (options.key && options.bip39) 
                && ! (options.seed && options.key) 
            )
            {
                var results =
                {
                    success: false,
                    message: 'Unable to get wallet',
                    data: false
                };
                ordit.sdk.wallet.get(options, function(w)
                {
                    if(!w.success && options.address)
                    {
                        w.success = true;
                        w.data = 
                        {
                            addresses: [
                                {
                                    address: options.address
                                }
                            ]
                        }
                    }
                    if(w.success)
                    {
                        var ordinals = [];
                        var collections = [];
                        var inscriptions = [];
                        var spendables = [];
                        var unspendables = [];
                        var verifieds = [];
                        var wallet = w.data;
                        if(typeof wallet.counts != 'object')
                        {
                            wallet.counts = 
                            {
                                addresses: wallet.addresses.length
                            }
                        }
                        wallet.counts.unspents = 0;
                        wallet.counts.satoshis = 0;
                        wallet.counts.cardinals = 0;
                        wallet.counts.spendables = 0;
                        wallet.counts.unspendables = 0;
                        wallet.counts.ordinals = 0;
                        wallet.counts.inscriptions = 0;
                        wallet.counts.collections = 0;
                        wallet.counts.verifieds = 0;
                        
                        var completed = 0;
                        
                        var shorten_address = function(str)
                        {
                            var front = str.slice(0, 5);
                            var back = str.substr(str.length - 5);
                            return front + '...' + back;
                        }
                        
                        jQuery.each(wallet.addresses, function(i)
                        {
                            var address = wallet.addresses[i].address;
                            var short_address = shorten_address(address);
                            var wallet_unspents = 0;
                            var wallet_satoshis = 0;
                            var wallet_cardinals = 0;
                            var wallet_spendables = 0;
                            var wallet_unspendables = 0;
                            var wallet_collections = 0;

                            // balance.get
                            
                            ordit.sdk.apis.unspents({
                                address: address,
                                network: options.network,
                                ordinals: true
                            },  function(unspent)
                            {
                                if(unspent.success)
                                {
                                    ordit.sdk.apis.inscriptions({
                                        address: address,
                                        network: options.network
                                    },  function(insc)
                                    {
                                        var inscriptions = [];
                                        if
                                        (
                                            insc.success 
                                            && typeof insc.data == 'object'
                                            && typeof insc.data.inscriptions == 'object'
                                            && insc.data.inscriptions.length > 0
                                        )
                                        {
                                            inscriptions = insc.data.inscriptions;
                                        }


                                        wallet.addresses[i].unspents = [];
                                        wallet.addresses[i].short_address = short_address;

                                        var these_ordinals = [];
                                        var these_tokens = [];
                                        var got_tokens = false;

                                        var unspents_ready = function()
                                        {
                                            if(typeof unspent.data == 'object' && unspent.data.length > 0)
                                            {
                                                for(u = 0; u < unspent.data.length; u++)
                                                {
                                                    var un = unspent.data[u];

                                                    un.fees = parseFloat(un.sats / (10 ** 8)).toFixed(8);

                                                    wallet.counts.satoshis+= un.sats;
                                                    wallet_satoshis+= un.sats;
                                                    if(un.safeToSpend)
                                                    {
                                                        wallet.counts.cardinals+= un.sats;
                                                        wallet_cardinals+= un.sats;
                                                        wallet.counts.spendables++;
                                                        wallet_spendables++;
                                                        spendables.push(un);
                                                    }
                                                    else
                                                    {
                                                        wallet.counts.unspendables++;
                                                        wallet_unspendables++;
                                                        unspendables.push(un);
                                                    }
                                                    
                                                    un.ordinals = [];
                                                    un.inscriptions = [];
                                                    
                                                    for(in1 = 0; in1 < inscriptions.length; in1++)
                                                    {
                                                        
                                                        var outpoint = un.txid + ':' + un.n;
                                                        if(outpoint == inscriptions[in1].outpoint)
                                                        {
                                                            un.inscriptions.push(inscriptions[in1]);
                                                        }
                                                    }
                                                    for(or1 = 0; or1 < these_ordinals.length; or1++)
                                                    {
                                                        
                                                        var output = un.txid + ':' + un.n;
                                                        if(output == these_ordinals[or1].output)
                                                        {
                                                            un.ordinals.push(these_ordinals[or1]);
                                                        }
                                                    }

                                                    var ord = un.ordinals;
                                                    var ins = un.inscriptions;

                                                    for(od = 0; od < ord.length; od++)
                                                    {
                                                        ord[od].address = address;
                                                        ord[od].unspent = un.txid;
                                                        ord[od].value = parseFloat(ord[od].size / (10 ** 8));

                                                        var safeToSpend = true;
                                                        for(is1 = 0; is1 < ins.length; is1++)
                                                        {
                                                            if
                                                            (
                                                                ins[is1].sat == ord[od].number
                                                                || 
                                                                (
                                                                    ord[od].rarity != 'common'
                                                                    &&
                                                                    ord[od].rarity != 'uncommon'
                                                                )
                                                            )
                                                            {
                                                                safeToSpend = false;
                                                            }
                                                        }
                                                        ord[od].safeToSpend = safeToSpend;

                                                        ordinals.push(ord[od]);
                                                    }
                                                    for(is = 0; is < ins.length; is++)
                                                    {
                                                        ins[is].fake = false;
                                                        ins[is].verified = false;
                                                        ins[is].unspent = un.txid;
                                                        ins[is].sid = un.txid + ':' + un.n;
                                                        ins[is].fees = parseFloat(ins[is].fee / (10 ** 8)).toFixed(8);

                                                        if
                                                        (
                                                            typeof jQuery != 'undefined' 
                                                            && typeof jQuery.timeago == 'function'
                                                        )
                                                        {
                                                            ins[is].ago = jQuery.timeago(ins[is].timestamp * 1000);
                                                        }

                                                        if
                                                        (
                                                            typeof ins[is].meta == 'object'
                                                            && typeof ins[is].meta.p != 'undefined'
                                                            && typeof ins[is].meta.ty != 'undefined'
                                                            && ins[is].meta.ty == 'col'
                                                            && ins[is].meta.p == 'vord'
                                                        )
                                                        {
                                                            collections.push(ins[is]);
                                                            wallet_collections++;
                                                        }
                                                        else if
                                                        (
                                                            typeof ins[is].meta == 'object'
                                                            && typeof ins[is].meta.p != 'undefined'
                                                            && typeof ins[is].meta.ty != 'undefined'
                                                            && typeof ins[is].meta.sig != 'undefined'
                                                            && ins[is].meta.ty == 'insc'
                                                            && ins[is].meta.p == 'vord'
                                                        )
                                                        {   
                                                            ordit.sdk.message.verify({
                                                                key: ins[is].meta.publ,
                                                                message: ins[is].meta.col + ' ' + ins[is].meta.iid + ' ' + ins[is].meta.nonce,
                                                                signature: ins[is].meta.sig,
                                                                network: options.network
                                                            },  function(verified)
                                                            {
                                                                if(verified.success)
                                                                {
                                                                    ins[is].verified = true;
                                                                    verifieds.push(ins[is]);
                                                                }
                                                                else
                                                                {
                                                                    ins[is].fake = true;
                                                                }
                                                            })
                                                        }
                                                        ins[is].address = address;
                                                        ins[is].value = parseFloat((ins[is].fee + un.sats) / (10 ** 8));

                                                        if(typeof ins[is].media_type == 'undefined' && typeof ins[is].mediaType != 'undefined')
                                                        {
                                                            ins[is].media_type = ins[is].mediaType;
                                                        }
                                                        if(typeof ins[is].media_content == 'undefined' && typeof ins[is].mediaContent != 'undefined')
                                                        {
                                                            ins[is].media_content = ins[is].mediaContent;
                                                        }
                                                        if(typeof ins[is].media_size == 'undefined' && typeof ins[is].mediaSize != 'undefined')
                                                        {
                                                            ins[is].media_size = ins[is].mediaSize;
                                                        }

                                                        ins[is].formats = 
                                                        {
                                                            image: false,
                                                            audio: false,
                                                            video: false,
                                                            html: false,
                                                            text: false
                                                        }
                                                        if(ins[is].media_type.indexOf('text/html') === 0)
                                                        {
                                                            ins[is].formats.html = true;
                                                            ins[is].type = 'html';
                                                        }
                                                        else if(ins[is].media_type.indexOf('image') === 0)
                                                        {
                                                            ins[is].formats.image = true;
                                                            ins[is].type = 'image';
                                                        }
                                                        else if(ins[is].media_type.indexOf('audio') === 0)
                                                        {
                                                            ins[is].formats.audio = true;
                                                            ins[is].type = 'audio';
                                                        }
                                                        else if(ins[is].media_type.indexOf('video') === 0)
                                                        {
                                                            ins[is].formats.video = true;
                                                            ins[is].type = 'video';
                                                        }
                                                        else if
                                                        (
                                                            ins[is].media_type.indexOf('text') === 0
                                                            || ins[is].media_type.indexOf('json') > -1
                                                        )
                                                        {
                                                            ins[is].formats.text = true;
                                                            ins[is].type = 'text';
                                                        }
                                                    }
                                                    wallet.addresses[i].unspents.push(un);
                                                }
                                            }

                                            wallet.counts.unspents+= unspent.data.length;
                                            wallet_unspents+= unspent.data.length;

                                            wallet.spendables = spendables;
                                            wallet.unspendables = unspendables;
                                            wallet.ordinals = ordinals;
                                            wallet.inscriptions = inscriptions;
                                            wallet.collections = collections;
                                            wallet.verifieds = verifieds;
                                            wallet.tokens = these_tokens;

                                            wallet.counts.ordinals = ordinals.length;
                                            wallet.counts.inscriptions = inscriptions.length;
                                            wallet.counts.collections = collections.length;
                                            wallet.counts.verifieds = verifieds.length;
                                            wallet.counts.tokens = these_tokens.length;
                                            
                                            if(these_tokens.length > 0)
                                            {
                                                got_tokens = true;
                                            }
                                            
                                            wallet.got_tokens = got_tokens;

                                            wallet.addresses[i].counts = 
                                            {
                                                unspents: wallet_unspents,
                                                satoshis: wallet_satoshis,
                                                cardinals: wallet_cardinals,
                                                spendables: wallet_spendables,
                                                unspendables: wallet_unspendables,
                                                collections: wallet_collections
                                            };

                                            completed++;
                                            if(completed == wallet.addresses.length)
                                            {
                                                wallet.dashboard = 
                                                {
                                                    satoshis: wallet.counts.satoshis.toLocaleString('en-GB'),
                                                    cardinals: wallet.counts.cardinals.toLocaleString('en-GB'),
                                                }
                                                results.success = true;
                                                results.message = 'Wallet lookup attached to data';
                                                results.data = wallet;
                                                callback(JSON.parse(JSON.stringify(results)));
                                            }

                                        }
                                        if(options.ordinals)
                                        {
                                            ordit.sdk.apis.ordinals({
                                                address: wallet.addresses[i].address,
                                                network: options.network
                                            },  function(ord)
                                            {
                                                if(ord.success && typeof ord.data == 'object')
                                                {
                                                    these_ordinals = ord.data;
                                                }
                                                if(options.tokens)
                                                {
                                                    ordit.sdk.tokens.get({
                                                        address: wallet.addresses[i].address,
                                                        network: options.network
                                                    },  function(tokens)
                                                    {
                                                        if(tokens.success)
                                                        {
                                                            these_tokens = tokens.data;
                                                        }
                                                        unspents_ready();
                                                    });
                                                }
                                                else
                                                {
                                                    unspents_ready();
                                                }
                                            });
                                        }
                                        else
                                        {
                                            if(options.tokens)
                                            {
                                                ordit.sdk.tokens.get({
                                                    address: wallet.addresses[i].address,
                                                    network: options.network
                                                },  function(tokens)
                                                {
                                                    unspents_ready();
                                                });
                                            }
                                            else
                                            {
                                                unspents_ready();
                                            }
                                        }
                                    });
                                }
                                else
                                {
                                    completed++;
                                    if(completed == wallet.addresses.length)
                                    {
                                        wallet.dashboard = 
                                        {
                                            satoshis: wallet.counts.satoshis.toLocaleString('en-GB'),
                                            cardinals: wallet.counts.cardinals.toLocaleString('en-GB'),
                                        }
                                        results.success = true;
                                        results.message = 'Wallet lookup attached to data';
                                        results.data = wallet;
                                        callback(JSON.parse(JSON.stringify(results)));
                                    }
                                }
                            });
                        });
                    }
                    else
                    {
                        results.message = w.message;
                        callback(results);
                    }
                });
            }
            else if(typeof callback == 'function')
            {
                callback({
                    success: false,
                    message: 'Invalid options for balance.get function',
                    data: false
                })
            }
        }
    },
    psbt:
    {
        get: function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                seed: false,
                bip39: false,
                connect: false,
                path: false,
                network: 'testnet',
                format: 'all',
                ins: [],
                outs: []
            };
            Object.assign(options, params);
            if
            (
                (options.seed || options.key || options.bip39 || options.connect) 
                && options.network && options.format && typeof callback == 'function'
                && typeof options.ins == 'object' && options.ins.length > 0
                && typeof options.outs == 'object' && options.outs.length > 0

                // be sure only one of the four inputs is used ...
                
                && ! (options.seed && options.key && options.bip39 && options.connect) 
                && ! (options.key && options.bip39 && options.connect) 
                && ! (options.seed && options.key && options.connect) 
                && ! (options.seed && options.key && options.bip39) 
                && ! (options.bip39 && options.connect) 
                && ! (options.seed && options.connect) 
                && ! (options.key && options.connect) 
                && ! (options.seed && options.bip39) 
                && ! (options.key && options.bip39) 
                && ! (options.seed && options.key) 
            )
            {
                var results =
                {
                    success: false,
                    message: 'Unable to construct transaction',
                    data: false
                };
                
                ordit.sdk.balance.get(options, function(w)
                {   
                    var net_obj = ordit.sdk.network(options.network);
                    
                    if(w.success && net_obj)
                    {
                        var wallet = w.data;
                        
                        var fees = 0;
                        var change = 0;
                        var dust = 600;
                        var inputs_used = 0;
                        var sats_per_byte = 10;
                        var total_cardinals_to_send = 0;
                        var total_cardinals_available = 0;
                        var unsupported_inputs = [];
                        var unspents_to_use = [];
                        var xverse_inputs = [];
                        
                        var psbt = new btc.Psbt({network: net_obj});
                        
                        var send_specific_unspent = false;
                        
                        for(o = 0; o < options.outs.length; o++)
                        {
                            try
                            {
                                if
                                (
                                    typeof options.outs[o].cardinals != 'undefined'
                                    && options.outs[o].cardinals > dust
                                )
                                {
                                    total_cardinals_to_send+= parseInt(options.outs[o].cardinals);
                                    psbt.addOutput({ 
                                        address: options.outs[o].address, 
                                        value: parseInt(options.outs[o].cardinals)
                                    });
                                }
                                else if(typeof options.outs[o].location != 'undefined')
                                {
                                    fees = JSON.parse(JSON.stringify((80 + (1 * 180)) * sats_per_byte));
                                    var unspents = saline.db.wallet.addresses[0].unspents;
                                    for(u = 0; u < unspents.length; u++)
                                    {
                                        if(unspents[u].txid + ':' + unspents[u].n == options.outs[o].location)
                                        {
                                            total_cardinals_to_send+= unspents[u].sats - fees;
                                            psbt.addOutput({ 
                                                address: options.outs[o].address, 
                                                value: total_cardinals_to_send
                                            });
                                            wallet.spendables = [unspents[u]];
                                        }
                                    }
                                }
                            }
                            catch(output_error)
                            {
                                console.info('output_error', output_error);
                            }
                        }
                        
                        for(i = 0; i < options.ins.length; i++)
                        {
                            if(typeof options.ins[i].address != 'undefined')
                            {
                                for(ws = 0; ws < wallet.spendables.length; ws++)
                                {
                                    var sats = wallet.spendables[ws].sats;
                                    var a = wallet.spendables[ws].scriptPubKey.address;
                                    
                                    fees = JSON.parse(JSON.stringify((80 + ((ws + 1) * 180)) * sats_per_byte));
                                    
                                    if
                                    (
                                        (
                                            a == options.ins[i].address
                                            || options.ins[i].address == 'any'
                                        )
                                        && total_cardinals_available <= (total_cardinals_to_send + fees)
                                    )
                                    {   
                                        
                                        var error = false;
                                        var supported = false;
                                        var spendable = wallet.spendables[ws];
                                        var t = spendable.scriptPubKey.type;
                                        
                                        if(options.ins[i].address == 'any')
                                        {
                                            options.ins[i].address = a;
                                        }
                                        
                                        spendable.pub = wallet.addresses[0].pub;
                                        
                                        if(t == 'witness_v1_taproot')
                                        {
                                            try
                                            {
                                                var childNodeXOnlyPubkey = false;
                                                
                                                try
                                                {
                                                    var chain_code = new Buffer(32);
                                                    chain_code.fill(1);
                                                    var pkey = bip32ecc.fromPublicKey(
                                                        Buffer.from(spendable.pub, 'hex'),
                                                        chain_code,
                                                        net_obj
                                                    );
                                                    childNodeXOnlyPubkey = pkey.publicKey.slice(1, 33);
                                                }
                                                catch(e)
                                                {
                                                    childNodeXOnlyPubkey = Buffer.from(spendable.pub, 'hex');
                                                }
                                                
                                                var p2tr = btc.payments.p2tr({
                                                    internalPubkey: childNodeXOnlyPubkey,
                                                    network: net_obj
                                                });
                                                psbt.addInput({
                                                    hash: spendable.txid,
                                                    index: parseInt(spendable.n),
                                                    tapInternalKey: childNodeXOnlyPubkey,
                                                    witnessUtxo:
                                                    {
                                                        script: p2tr.output, 
                                                        value: parseInt(spendable.sats)
                                                    }
                                                }); 
                                                supported = true;
                                            }
                                            catch(e){ error = e }
                                        }
                                        else if(t == 'witness_v0_keyhash')
                                        {
                                            try
                                            {
                                                var p = btc.payments.p2wpkh({ 
                                                    pubkey: Buffer.from(spendable.pub, 'hex'), 
                                                    network: net_obj 
                                                });
                                                psbt.addInput({
                                                    hash: spendable.txid,
                                                    index: parseInt(spendable.n),
                                                    witnessUtxo:
                                                    {
                                                        script: p.output, 
                                                        value: parseInt(spendable.sats)
                                                    }
                                                }); 
                                                supported = true;
                                            }
                                            catch(e){ error = e }
                                        }
                                        else if(t == 'scripthash')
                                        {
                                            try
                                            {
                                                var p2sh = btc.payments.p2sh({
                                                  redeem: btc.payments.p2wpkh({ 
                                                      pubkey: Buffer.from(spendable.pub, 'hex'),
                                                      network: net_obj 
                                                  }),
                                                  network: net_obj
                                                });
                                                psbt.addInput({
                                                    hash: spendable.txid,
                                                    index: parseInt(spendable.n),
                                                    redeemScript: p2sh.redeem.output,
                                                    witnessUtxo:
                                                    {
                                                        script: p2sh.output, 
                                                        value: parseInt(spendable.sats)
                                                    }
                                                }); 
                                                supported = true;
                                            }
                                            catch(e){ error = e }
                                        }
                                        else if(t == 'pubkeyhash')
                                        {
                                            try
                                            {
                                                psbt.addInput({
                                                    hash: spendable.txid,
                                                    index: parseInt(spendable.n),
                                                    nonWitnessUtxo: Buffer.from(spendable.txhex, 'hex')
                                                });
                                                supported = true;
                                            }
                                            catch(e){ error = e }
                                        }
                                        else
                                        {
                                            error = 'Unsupported input type';
                                        }
                                        if(supported)
                                        {
                                            unspents_to_use.push(wallet.spendables[ws]);
                                            total_cardinals_available+= sats;
                                            xverse_inputs.push({
                                                address: a,
                                                signingIndexes: [inputs_used]
                                            });
                                            inputs_used++;
                                        }
                                        else
                                        {
                                            wallet.spendables[ws].error = error;
                                            unsupported_inputs.push(wallet.spendables[ws]);
                                        }
                                    }
                                }
                            }
                        }
                        
                        change = total_cardinals_available - (total_cardinals_to_send + fees);
                        
                        if(unsupported_inputs.length > 0)
                        {
                            console.info('unsupported_inputs', unsupported_inputs);
                        }
                        
                        if
                        (
                            unspents_to_use.length > 0 
                            && change >= 0
                        )
                        {
                            if(change >= dust)
                            {
                                psbt.addOutput({ 
                                    address: options.ins[0].address, 
                                    value: change
                                });
                            }
                            var psbt_hex = psbt.toHex();
                            var psbt_base64 = psbt.toBase64();
                            
                            results.success = true;
                            results.message = 'Unsigned PSBT formats attached to data';
                            results.data = 
                            {
                                hex: psbt_hex,
                                base64: psbt_base64
                            };
                            
                            if(options.connect == 'xverse')
                            {
                                results.data.inputs = xverse_inputs;
                            }
                            
                            callback(results);
                        }
                        else
                        {
                            results.message = 'Not enough input value to cover outputs and fees. Total cardinals available: ' + total_cardinals_available + '. Cardinals to send: ' + total_cardinals_to_send + '. Estimated fees: ' + fees + '.';
                            callback(results);
                        }
                    }
                    else
                    {
                        results.message = w.message;
                        callback(results);
                    }
                });
            }
            else if(typeof callback == 'function')
            {
                callback({
                    success: false,
                    message: 'Invalid options for tx.get function',
                    data: false
                })
            }
        },
        sign: function(params = {}, callback = false)
        {
            var options = 
            {
                seed: false,
                bip39: false,
                connect: false,
                path: false,
                hex: false,
                base64: false,
                network: 'testnet',
                extracted: true,
                finalized: false,
                sighashType: false,
                signingIndexes: false,
                noSignIndexes: false
            };
            Object.assign(options, params);
            if
            (
                (options.hex || options.base64) 
                && (options.seed || options.bip39 || options.connect) 
                && options.network && typeof callback == 'function'
                && ! (options.hex && options.base64)
                
                // be sure only one of the three inputs is used ...
                
                && ! (options.seed && options.bip39 && options.connect) 
                && ! (options.bip39 && options.connect) 
                && ! (options.seed && options.connect) 
                && ! (options.seed && options.bip39) 
            )
            {
                var results =
                {
                    success: false,
                    message: 'Unable to reconstruct PSBT',
                    data: false
                };
                var error = false;
                var psbt = false;
                
                var net_obj = ordit.sdk.network(options.network);
                
                if(options.hex && net_obj)
                {
                    try
                    {
                        psbt = btc.Psbt.fromHex(options.hex, { network: net_obj});
                    }
                    catch(err){ error = err }
                }
                else
                {
                    if(!psbt && net_obj)
                    {
                        try
                        {
                            psbt = btc.Psbt.fromBase64(options.base64, { network: net_obj});
                        }
                        catch(err){ error = err }
                    }
                }
                if(psbt)
                {
                    if(options.seed || options.bip39)
                    {
                        var net_obj = ordit.sdk.network(options.network);
                        
                        // TODO - re-construct private keys and sign ???
                        
                        async function get_keys()
                        {
                            if(options.bip39)
                            {

                                s = await bip39.mnemonicToEntropy(options.bip39);
                                seeds = s.toString('hex');
                            }
                            else
                            {
                                try
                                {
                                    var b = btc.crypto.sha256(Buffer.from(options.seed), 'utf8').toString('hex');
                                    var m = bip39.entropyToMnemonic(Buffer.from(b, 'hex'), bip39.wordlists.english);
                                    s = await bip39.mnemonicToEntropy(m);
                                    seeds = s.toString('hex');
                                }
                                catch(e){}
                            }

                            var root = bip32ecc.fromSeed
                            (
                                Buffer.from(seeds, 'hex'),
                                net_obj
                            );

                            var parent = root;

                            if(typeof options.path == 'object' && options.path.length > 0)
                            {
                                for(p = 0; p < options.path.length; p++)
                                {
                                    parent = parent.derive(parseInt(options.path[p]));
                                }
                            }
                            var keys = 
                            {
                                pub: Buffer.from(parent.publicKey).toString('hex'),
                                priv: Buffer.from(parent.privateKey).toString('hex'),
                                wif: parent.toWIF(),
                                parent: parent
                            }
                            
                            return keys;
                        }
                        get_keys().then(async (full_keys) =>
                        {   
                            if
                            (
                                typeof psbt == 'object' 
                                && typeof psbt.inputCount != 'undefined'
                                && psbt.inputCount > 0
                            )
                            {
                                var error = false;
                                
                                var xkey = full_keys.parent.publicKey.slice(1, 33);
                                
                                var tweaked_key = full_keys.parent.tweak(
                                    btc.crypto.taggedHash(
                                        "TapTweak", 
                                        xkey
                                    )
                                );
                                
                                var test_auto_tweaking_for_dummies = true;
                                
                                for(i = 0; i < psbt.inputCount; i++)
                                {
                                    var needs_tweaking = false;
                                    if(typeof options.signingIndexes == 'object')
                                    {
                                        for(si = 0; si < options.signingIndexes.length; si++)
                                        {
                                            if(options.signingIndexes[si] == i)
                                            {
                                                needs_tweaking = true;
                                            }
                                        }
                                    }
                                    
                                    var definitely_sign = true;
                                    if(typeof options.noSignIndexes == 'object')
                                    {
                                        for(nsi = 0; nsi < options.noSignIndexes.length; nsi++)
                                        {
                                            if(parseInt(options.noSignIndexes[nsi]) == i)
                                            {
                                                definitely_sign = false;
                                            }
                                        }
                                    }
                                    
                                    if
                                    (
                                        // TODO - enable options for selecting which inputs to sign ?
                                        
                                        (typeof options.tweaked != 'undefined' && options.tweaked === true)
                                        ||
                                        needs_tweaking
                                        ||
                                        (
                                            test_auto_tweaking_for_dummies
                                            && 
                                            (
                                                i == 1 || i == 2
                                            )
                                            && psbt.data.globalMap.unsignedTx.tx.ins.length == 3
                                            //&& psbt.data.globalMap.unsignedTx.tx.outs.length == 2
                                            && psbt.data.inputs.length == 3
                                            && typeof psbt.data.inputs[0].tapLeafScript != 'undefined'
                                            && typeof psbt.data.inputs[1].tapLeafScript == 'undefined'
                                            && typeof psbt.data.inputs[2].tapLeafScript == 'undefined'
                                        )
                                    )
                                    {
                                        try
                                        {
                                            if(options.sighashType)
                                            {
                                                if(definitely_sign)
                                                {
                                                    psbt.signInput(i, tweaked_key, [options.sighashType]);
                                                }
                                            }
                                            else
                                            {
                                                if(definitely_sign)
                                                {
                                                    psbt.signInput(i, tweaked_key);
                                                }
                                            }
                                        }
                                        catch(e){ error = e; console.info('e1?', e); }
                                    }
                                    else if(typeof options.tweaked == 'undefined' || !options.tweaked)
                                    {
                                        try
                                        {
                                            if(typeof options.signingIndexes != 'object')
                                            {
                                                if(options.sighashType)
                                                {
                                                    if(definitely_sign)
                                                    {
                                                        psbt.signInput(i, full_keys.parent, [options.sighashType]);
                                                    }
                                                }
                                                else
                                                {
                                                    if(definitely_sign)
                                                    {
                                                        psbt.signInput(i, full_keys.parent);
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                //psbt.signInput(i, full_keys.parent);
                                            }
                                        }
                                        catch(e){ error = e; console.info('e2?', e); }
                                    }
                                }
                                
                                if(error)
                                {
                                    results.message = 'Error signing: ' + error;
                                    callback(results);
                                }
                                else
                                {
                                    var psbt_hex = psbt.toHex();
                                    var psbt_base64 = psbt.toBase64();

                                    if
                                    (
                                        (options.hex && options.hex != psbt_hex)
                                        ||
                                        (options.base64 && options.base64 != psbt_base64)
                                    ){
                                        results.success = true;
                                        results.message = 'Signed PSBT attached to data';
                                        var hex = false;
                                        var psbt_data = false;
                                        
                                        if(options.extracted)
                                        {
                                            try
                                            {
                                                
                                                for(i = 0; i < psbt.inputCount; i++)
                                                {
                                                    var definitely_sign = true;
                                                    if(typeof options.noSignIndexes == 'object')
                                                    {
                                                        for(nsi = 0; nsi < options.noSignIndexes.length; nsi++)
                                                        {
                                                            if(parseInt(options.noSignIndexes[nsi]) == i)
                                                            {
                                                                definitely_sign = false;
                                                            }
                                                        }
                                                    }
                                                    if(definitely_sign)
                                                    {
                                                        psbt.finalizeInput(i);
                                                    }
                                                }
                                                hex = psbt.finalizeAllInputs().extractTransaction().toHex();
                                                results.message = 'Finalized raw TX hex attached to data';
                                            }
                                            catch(e)
                                            {
                                                console.info('sign.e', e);
                                                psbt_data = 
                                                {
                                                    hex: psbt_hex,
                                                    base64: psbt_base64
                                                };
                                            }
                                        }
                                        else
                                        {
                                            try
                                            {
                                                if(options.finalized)
                                                {
                                                    psbt.finalizeAllInputs();
                                                }
                                                psbt_data = 
                                                {
                                                    hex: psbt.toHex(),
                                                    base64: psbt.toBase64()
                                                };
                                            }
                                            catch(e)
                                            {
                                                psbt_data = 
                                                {
                                                    hex: psbt_hex,
                                                    base64: psbt_base64
                                                };
                                            }
                                        }
                                        
                                        if(options.extracted)
                                        {
                                            try
                                            {
                                                var new_psbt = btc.Psbt.fromHex(psbt_data.hex);
                                                hex = new_psbt.finalizeAllInputs().extractTransaction().toHex();
                                            }
                                            catch(ex){ console.info('ex', ex)}
                                        }
                                        var signed_response = 
                                        {
                                            hex: hex,
                                            psbt: psbt_data
                                        };
                                        results.data = signed_response;
                                        callback(results);
                                    }
                                    else
                                    {
                                        results.message = 'Signed PSBT same as input PSBT';
                                        callback(results);
                                    }
                                }
                            }
                            else
                            {
                                results.message = 'Unable to count inputs';
                                callback(results);
                            }
                        });
                    }
                    else if(options.connect)
                    {
                        options.psbt = psbt;
                        ordit.sdk.connect.sign(options, function(s)
                        {
                            callback(s);
                        });
                    }
                }
                else
                {
                    if(error)
                    {
                        results.message+= ': ' + error;
                    }
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback({
                    success: false,
                    message: 'Invalid options for signature.get function',
                    data: options
                })
            }
        }
    },
    txid:
    {
        get: function(params = {}, callback = false)
        {
            var options = 
            {
                hex: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            if(options.hex && options.network && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'Unable to relay transaction',
                    data: false
                };
                
                ordit.sdk.apis.relay({
                    hex: options.hex,
                    network: options.network
                },  function(response)
                {   
                    if
                    (
                        typeof response == 'object' 
                        && typeof response.success != 'undefined' 
                        && response.success === true 
                        && typeof response.data != 'undefined' 
                        && response.data
                    )
                    {
                        var txid = response.data;
                        results.success = true;
                        results.message = 'Transaction ID attached to data';
                        results.data = 
                        {
                            txid: txid
                        };
                    }
                    else
                    {
                        if(response.message)
                        {
                            results.message+= ': ' + response.message;
                        }
                    }
                    callback(results);
                });
            }
            else if(typeof callback == 'function')
            {
                callback({
                    success: false,
                    message: 'Invalid options for txid.get function',
                    data: false
                })
            }
        }
    },
    message:
    {
        sign: function(params = {}, callback = false)
        {
            var options = 
            {
                seed: false,
                bip39: false,
                connect: false,
                path: false,
                message: false,
                format: 'core',
                network: 'testnet'
            };
            var results = 
            {
                data: false,
                success: false,
                message: 'Invalid options for message.sign'
            };
            Object.assign(options, params);
            if
            (
                (options.seed || options.bip39 || options.connect) 
                && options.network && options.message && options.format
                && typeof callback == 'function'
                &&
                (
                    options.format == 'core'
                )

                // be sure only one of the three inputs is used ...
                
                && ! (options.seed && options.bip39 && options.connect) 
                && ! (options.bip39 && options.connect) 
                && ! (options.seed && options.connect) 
                && ! (options.seed && options.bip39) 
            )
            {   
                results.message = 'Invalid options for signature';
                
                if(options.seed || options.bip39)
                {
                    var net_obj = ordit.sdk.network(options.network);
                
                    async function get_keys()
                    {
                        if(options.bip39)
                        {

                            s = await bip39.mnemonicToEntropy(options.bip39);
                            seeds = s.toString('hex');
                        }
                        else
                        {
                            try
                            {
                                var b = btc.crypto.sha256(Buffer.from(options.seed), 'utf8').toString('hex');
                                var m = bip39.entropyToMnemonic(Buffer.from(b, 'hex'), bip39.wordlists.english);
                                s = await bip39.mnemonicToEntropy(m);
                                seeds = s.toString('hex');
                            }
                            catch(e){}
                        }

                        var root = bip32ecc.fromSeed
                        (
                            Buffer.from(seeds, 'hex'),
                            net_obj
                        );

                        var parent = root;

                        if(typeof options.path == 'object' && options.path.length > 0)
                        {
                            for(p = 0; p < options.path.length; p++)
                            {
                                parent = parent.derive(parseInt(options.path[p]));
                            }
                        }
                        var keys = 
                        {
                            pub: Buffer.from(parent.publicKey).toString('hex'),
                            priv: Buffer.from(parent.privateKey).toString('hex'),
                            wif: parent.toWIF(),
                            parent: parent
                        }

                        return keys;
                    }
                    get_keys().then(async (full_keys) =>
                    {   
                        var error = false;
                        var signature = false;
                        var signing_address = false;
                        
                        try
                        {
                            var chain_id = options.network;
                            if(options.network == 'mainnet') chain_id = 'bitcoin';
                            else chain_id = 'bitcointestnet';
                            var blockchain = bitcoin.networks[chain_id];
                            var message_key = bitcoin.ECKey.fromWIF(full_keys.wif);
                            signing_address = message_key.pub.getAddress(blockchain);
                            signature = bitcoin.Message.sign(
                                message_key, 
                                options.message, 
                                blockchain
                            );
                        }
                        catch(e){ error = e }
                        
                        if(signature)
                        {
                            results.success = true;
                            results.message = 'Signature attached to data';
                            results.data = 
                            {
                                hex: signature.toString('hex'),
                                base64: signature.toString('base64'),
                                address: signing_address.toString('hex'),
                                pub: full_keys.pub
                            }
                            callback(results);
                        }
                        else
                        {
                            results.message = 'Unable to sign message:<hr><code>' + error + '</code>';
                            callback(results);
                        }
                    });
                }
                else
                {
                    ordit.sdk.connect.message(options, function(s)
                    {
                        if(s.success)
                        {
                            var signatures = s.data;
                            results.success = true;
                            results.message = 'Signatures attached to data';
                            results.data = signatures;
                        }
                        else
                        {
                            results.message = s.message;
                        }
                        callback(results);
                    });
                }
            }
            else if(typeof callback == 'function')
            {
                results.data = options;
                callback(results);
            }
        },
        verify: function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                address: false,
                message: false,
                signature: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            if
            (
                (
                    options.address 
                    || options.key
                )
                && options.message && options.signature && options.network
                && typeof callback == 'function'
            )
            {
                var results = 
                {
                    success: false,
                    data: false,
                    message: 'Unable to verify message'
                }
                var error = false;
                var verified = false;
                
                if(!options.address && options.key)
                {
                    try
                    {
                        var net_obj = ordit.sdk.network(options.network);
                        var addresses = [];
                        var chain_code = new Buffer(32);
                        chain_code.fill(1);
                        
                        var addresses = [];
    
                        var keys = bip32ecc.fromPublicKey
                        (
                            Buffer.from(options.key, 'hex'),
                            chain_code,
                            net_obj
                        );

                        var p2pkh = btc.payments.p2pkh({ pubkey: keys.publicKey, network: net_obj });
                        options.address = p2pkh.address;
                    }
                    catch(e){}
                }
                
                try
                {
                    var chain_id = options.network;
                    if(options.network == 'mainnet') chain_id = 'bitcoin';
                    else chain_id = 'bitcointestnet';
                    var blockchain = bitcoin.networks[chain_id];
                    verified = bitcoin.Message.verify(
                        options.address,
                        options.signature, 
                        options.message, 
                        blockchain
                    );
                }
                catch(e){ error = e; verified = false; }
                
                if(!verified)
                {
                    try
                    {
                        var chain_id = options.network;
                        if(options.network == 'mainnet') chain_id = 'bitcoin';
                        else chain_id = 'bitcointestnet';
                        var blockchain = bitcoin.networks[chain_id];

                        var base64 = Buffer.from(options.signature, 'hex').toString('base64');
                        
                        verified = bitcoin.Message.verify(
                            options.address,
                            base64,
                            options.message,
                            blockchain
                        );
                        if(verified)
                        {
                            error = false;
                        }
                    }
                    catch(e)
                    { 
                        error = e;
                    }
                }
                
                if(error)
                {
                    results.message = error.message;
                }
                else
                {
                    results.success = true;
                    results.message = 'Verification attached to data';
                    results.data =
                    {
                        verified: verified
                    }
                }
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback({
                    data: false,
                    success: false,
                    message: 'Invalid options for message.verify'
                })
            }
        }
    },
    connect:
    {
        supported: function(wallet = false, network = false)
        {
            var supported = false;
            if
            (
                (
                    (
                        wallet == 'unisat'
                        || wallet == 'xverse'
                    )
                    && 
                    (
                        network == 'mainnet'
                        || network == 'testnet'
                    )
                )
                || 
                ( 
                    (
                        wallet == 'metamask'
                        || wallet == 'saline'
                    )
                    &&
                    (
                        network == 'mainnet'
                        || network == 'testnet'
                        || network == 'regtest'
                    )
                )
            )
            {
                supported = true;
            }
            return supported;
        },
        key: function(params = {}, callback = false)
        {
            var options = 
            {
                connect: false,
                network: 'testnet',
                format: 'all'
            };
            Object.assign(options, params);
            if(options.connect && options.network && options.format && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'The ' + options.connect + ' wallet cannot support get on  ' + options.network,
                    data: false
                };
                if
                (
                    ordit.sdk.connect.supported(options.connect, options.network)
                    && typeof ordit.sdk[options.connect] == 'object'
                    && typeof ordit.sdk[options.connect].key == 'function'
                )
                {
                    ordit.sdk[options.connect].key(options, function(k)
                    {
                        if(k.success)
                        {
                            callback(k);
                        }
                        else
                        {
                            results.message = k.message;
                            callback(results);
                        }
                    })
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for connect.key',
                        data: false
                    });
                }
            }
        },
        message: function(params = {}, callback = false)
        {
            var options = 
            {
                connect: false,
                message: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            if
            (
                options.connect
                && options.network 
                && options.message 
                && typeof callback == 'function'
            )
            {
                var results =
                {
                    success: false,
                    message: 'The ' + options.connect + ' wallet cannot support message signing on ' + options.network,
                    data: false
                };
                if
                (
                    ordit.sdk.connect.supported(options.connect, options.network)
                    && typeof ordit.sdk[options.connect] == 'object'
                    && typeof ordit.sdk[options.connect].message == 'function'
                )
                {
                    ordit.sdk[options.connect].message(options, function(s)
                    {
                        if(s.success)
                        {
                            callback(s);
                        }
                        else
                        {
                            results.message = s.message;
                            callback(results);
                        }
                    })
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for connect.sign',
                        data: false
                    })
                }
            }
        },
        sign: function(params = {}, callback = false)
        {
            var options = 
            {
                connect: false,
                psbt: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            if
            (
                options.connect
                && options.network 
                && typeof options.psbt == 'object' 
                && typeof callback == 'function'
            )
            {
                var results =
                {
                    success: false,
                    message: 'The ' + options.connect + ' wallet cannot support sign on  ' + options.network,
                    data: false
                };
                if
                (
                    ordit.sdk.connect.supported(options.connect, options.network)
                    && typeof ordit.sdk[options.connect] == 'object'
                    && typeof ordit.sdk[options.connect].sign == 'function'
                )
                {
                    ordit.sdk[options.connect].sign(options, function(s)
                    {
                        if(s.success)
                        {
                            callback(s);
                        }
                        else
                        {
                            results.message = s.message;
                            callback(results);
                        }
                    })
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for connect.sign',
                        data: false
                    })
                }
            }
        }
    },
    metamask:
    {
        key: function(params = {}, callback = false)
        {
            var options = 
            {
                path: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            if(options.network && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'Metamask not installed',
                    data: false
                };
                if(typeof window.MetaMaskSDK != 'undefined')
                {
                    var MMSDK = new MetaMaskSDK.MetaMaskSDK();
                    var ethereum = MMSDK.getProvider() // You can also access via window.ethereum
                    
                    async function get_accounts()
                    {
                        return await ethereum.request({method: 'eth_requestAccounts'});
                    }
                    get_accounts().then(async (accounts) =>
                    {
                        var address = accounts[0];
                        var msg = 'Generate Bitcoin Addresses from ' + address + '?';
                        var signature = await ethereum.request({method: 'personal_sign', params: [msg, address]});   
                        var wallet_options = 
                        {
                            seed: signature,
                            path: options.path,
                            network: options.network,
                            format: 'all'
                        };
                        ordit.sdk.wallet.get(wallet_options, function(w)
                        {
                            if(w.success)
                            {
                                results.success = true;
                                results.message = 'Key attached to data';
                                results.data = w.data.addresses;
                            }
                            else
                            {
                                results.message = w.message;
                            }
                            callback(results);
                        })
                    });
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for metamask.key',
                        data: false
                    })
                }
            }
        },
        sign: function(params = {}, callback = false)
        {
            var options = 
            {
                psbt: false
            };
            Object.assign(options, params);
            if(typeof options.psbt == 'object' && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'Metamask not installed for signing',
                    data: false
                };
                
                if(typeof window.MetaMaskSDK != 'undefined')
                {
                    var MMSDK = new MetaMaskSDK.MetaMaskSDK();
                    var ethereum = MMSDK.getProvider() // You can also access via window.ethereum
                    
                    var net_obj = ordit.sdk.network(options.network);
                    
                    var psbt = options.psbt;
                    
                    async function get_accounts()
                    {
                        return await ethereum.request({method: 'eth_requestAccounts'});
                    }
                    get_accounts().then(async (accounts) =>
                    {
                        var address = accounts[0];
                        var msg = 'Generate Bitcoin Addresses from ' + address + '?';
                        var signature = await ethereum.request({method: 'personal_sign', params: [msg, address]}); 
                        
                        async function get_keys()
                        {
                            var s = false;
                            var seeds = false;
                            
                            try
                            {
                                var b = btc.crypto.sha256(Buffer.from(signature), 'utf8').toString('hex');
                                var m = bip39.entropyToMnemonic(Buffer.from(b, 'hex'), bip39.wordlists.english);
                                s = await bip39.mnemonicToEntropy(m);
                                seeds = s.toString('hex');
                            }
                            catch(e){}

                            var root = bip32ecc.fromSeed
                            (
                                Buffer.from(seeds, 'hex'),
                                net_obj
                            );

                            var parent = root;

                            if(typeof options.path == 'object' && options.path.length > 0)
                            {
                                for(p = 0; p < options.path.length; p++)
                                {
                                    parent = parent.derive(parseInt(options.path[p]));
                                }
                            }
                            var keys = 
                            {
                                pub: Buffer.from(parent.publicKey).toString('hex'),
                                priv: Buffer.from(parent.privateKey).toString('hex'),
                                wif: parent.toWIF(),
                                parent: parent
                            }
                            
                            return keys;
                        }
                        get_keys().then(async (full_keys) =>
                        {   
                            if
                            (
                                typeof psbt == 'object' 
                                && typeof psbt.inputCount != 'undefined'
                                && psbt.inputCount > 0
                            )
                            {
                                var error = false;
                                
                                for(i = 0; i < psbt.inputCount; i++)
                                {
                                    try
                                    {
                                        psbt.signInput(i, full_keys.parent);
                                    }
                                    catch(e){ error = e }
                                }
                                
                                if(error)
                                {
                                    results.message = 'Error signing:<hr><code>' + error + '</code>';
                                    callback(results);
                                }
                                else
                                {
                                    var psbt_hex = psbt.toHex();
                                    var psbt_base64 = psbt.toBase64();

                                    if
                                    (
                                        (options.hex && options.hex != psbt_hex)
                                        ||
                                        (options.base64 && options.base64 != psbt_base64)
                                    ){
                                        results.success = true;
                                        results.message = 'Signed PSBT attached to data';
                                        var hex = false;
                                        var psbt_data = false;
                                        try
                                        {
                                            psbt.finalizeAllInputs();
                                            hex = psbt.extractTransaction().toHex();
                                            results.message = 'Finalized raw TX hex attached to data';
                                        }
                                        catch(e)
                                        {
                                            psbt_data = 
                                            {
                                                hex: psbt_hex,
                                                base64: psbt_base64
                                            };
                                        }
                                        var signed_response = 
                                        {
                                            hex: hex,
                                            psbt: psbt_data
                                        };
                                        results.data = signed_response;
                                        callback(results);
                                    }
                                    else
                                    {
                                        results.message = 'Signed PSBT same as input PSBT';
                                        callback(results);
                                    }
                                }
                            }
                            else
                            {
                                results.message = 'Unable to count inputs';
                                callback(results);
                            }
                        });
                    });
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for unisat.sign',
                        data: false
                    })
                }
            }
        },
        message: function(params = {}, callback = false)
        {
            var options = 
            {
                connect: false,
                message: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            if
            (
                options.connect == 'metamask'
                && options.network 
                && options.message 
                && typeof callback == 'function'
            )
            {
                var results =
                {
                    success: false,
                    message: 'The metamask wallet cannot support message signing',
                    data: false
                };
                
                if(typeof window.MetaMaskSDK != 'undefined')
                {
                    var MMSDK = new MetaMaskSDK.MetaMaskSDK();
                    var ethereum = MMSDK.getProvider() // You can also access via window.ethereum
                    
                    async function get_accounts()
                    {
                        return await ethereum.request({method: 'eth_requestAccounts'});
                    }
                    get_accounts().then(async (accounts) =>
                    {
                        var address = accounts[0];
                        var msg = 'Generate Bitcoin Addresses from ' + address + '?';
                        var signature = await ethereum.request({method: 'personal_sign', params: [msg, address]}); 
                        
                        async function get_keys()
                        {
                            var s = false;
                            var seeds = false;
                            
                            try
                            {
                                var b = btc.crypto.sha256(Buffer.from(signature), 'utf8').toString('hex');
                                var m = bip39.entropyToMnemonic(Buffer.from(b, 'hex'), bip39.wordlists.english);
                                s = await bip39.mnemonicToEntropy(m);
                                seeds = s.toString('hex');
                            }
                            catch(e){}

                            options.connect = false;
                            options.seed = seeds;
                            ordit.sdk.message.sign(options, function(signed)
                            {
                                callback(signed);
                            })
                        }
                        get_keys();
                    });
                }
                else
                {
                    results.message = 'Metamask not installed for messages';
                }
            }
            else if(typeof callback == 'function')
            {
                callback({
                    data: false,
                    success: false,
                    message: 'Invalid options for metamask.message'
                })
            }
        }
    },
    saline:
    {
        key: function(params = {}, callback = false)
        {
            var options = 
            {
                path: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            if(options.network && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'Saline not installed',
                    data: false
                };
                if(typeof window.SalineSDK != 'undefined')
                {
                    window.SalineSDK({action: 'getAddresses', options: options}, function(d)
                    {
                        var data = false;
                        try
                        {
                            data = JSON.parse(d);
                        }
                        catch(e){}
                        callback(data);
                    });
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for saline.key',
                        data: false
                    })
                }
            }
        },
        sign: function(params = {}, callback = false)
        {
            var options = 
            {
                psbt: false,
                msg: false
            };
            Object.assign(options, params);
            if(typeof options.psbt == 'object' && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'Saline not installed for signing',
                    data: false
                };
                
                if(typeof window.SalineSDK != 'undefined')
                {
                    window.SalineSDK
                    (
                        {
                            action: 'signTransaction', 
                            options: options
                        },  function(d)
                    {
                        var data = false;
                        try
                        {
                            data = JSON.parse(d);
                        }
                        catch(e){}
                        var res = JSON.parse(data.options);
                        res.action = 'signTransaction';
                        callback(res);
                    });
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for saline.sign',
                        data: false
                    })
                }
            }
        },
        message: function(params = {}, callback = false)
        {
            var options = 
            {
                connect: false,
                message: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            if
            (
                options.connect == 'saline'
                && options.network 
                && options.message 
                && typeof callback == 'function'
            )
            {
                var results =
                {
                    success: false,
                    message: 'The saline wallet cannot support message signing',
                    data: false
                };
                
                if(typeof window.SalineSDK != 'undefined')
                {
                    window.SalineSDK
                    (
                        {
                            action: 'signMessage', 
                            options: options
                        },  function(d)
                    {
                        var data = false;
                        var res = {};
                        try
                        {
                            data = JSON.parse(d);
                        }
                        catch(e){}
                        try
                        {
                            res = JSON.parse(data.options);
                        }
                        catch(e){}
                        res.action = 'signMessage';
                        callback(res);
                    });
                }
                else
                {
                    results.message = 'Saline not installed for messages';
                }
            }
            else if(typeof callback == 'function')
            {
                callback({
                    data: false,
                    success: false,
                    message: 'Invalid options for saline.message'
                })
            }
        }
    },
    unisat:
    {
        key: function(params = {}, callback = false)
        {
            var options = 
            {
                network: false
            };
            Object.assign(options, params);
            if(options.network && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'Unisat not installed',
                    data: false
                };
                if(typeof window.unisat != 'undefined')
                {
                    var uninet = false;
                    async function getnet() 
                    {
                        uninet = await window.unisat.getNetwork();
                        var unisatnet = 'livenet';
                        if(options.network == 'testnet')
                        {
                            unisatnet = options.network;
                        }
                        if(uninet != unisatnet)
                        {
                            await window.unisat.switchNetwork(unisatnet);
                        }
                    }
                    getnet().then(() =>
                    {            
                        var address = false;
                        var public_key = false;
                        async function connect() 
                        {
                            let accounts = await window.unisat.requestAccounts();
                            if(typeof accounts == 'object' && accounts.length > 0)
                            {
                                address = accounts[0];
                            }
                        }
                        connect().then(async () => 
                        {
                            public_key = await window.unisat.getPublicKey();
                            results.success = true;
                            results.message = 'Key attached to data';
                            results.data = 
                            [{ 
                                pub: public_key,
                                address: address,
                                format: ordit.sdk.addresses.format(address, options.network)
                            }];
                            
                            if(ordit.sdk.addresses.format(address, options.network) == 'taproot')
                            {
                                var chain_code = new Buffer(32);
                                chain_code.fill(1);

                                var childNodeXOnlyPubkey = false;

                                try
                                {

                                    var net_obj = ordit.sdk.network(options.network);
                                    var keys = bip32ecc.fromPublicKey
                                    (
                                        Buffer.from(public_key, 'hex'),
                                        chain_code,
                                        net_obj
                                    );
                                    childNodeXOnlyPubkey = keys.publicKey.slice(1, 33);

                                }
                                catch(e)
                                {
                                    childNodeXOnlyPubkey = Buffer.from(public_key, 'hex');
                                }
                                
                                if(childNodeXOnlyPubkey)
                                {
                                    results.data[0].xkey = childNodeXOnlyPubkey.toString('hex');
                                }
                            }
                            
                            callback(results);
                        });
                    });
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for unisat.key',
                        data: false
                    })
                }
            }
        },
        sign: function(params = {}, callback = false)
        {
            var options = 
            {
                psbt: false
            };
            Object.assign(options, params);
            if(typeof options.psbt == 'object' && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'Unisat not installed for signing',
                    data: false
                };
                if(typeof window.unisat != 'undefined')
                {
                    var finalize = true;
                    var psbt = options.psbt;
                    var psbt_hex = psbt.toHex();
                    if(typeof options.finalized != 'undefined')
                    {
                        finalize = options.finalized;
                    }
                    async function sign() 
                    {
                        return await window.unisat.signPsbt(psbt_hex, {autoFinalized: finalize});
                    }
                    sign().then(async (signed_tx) => 
                    {   
                        if(signed_tx)
                        {
                            var final_psbt = btc.Psbt.fromHex(signed_tx);
                            
                            var data = 
                            {
                                hex: false,
                                psbt: false
                            }
                            var final_hex = false;
                            var msg = 'Unfinalized PSBT attached to data';
                            
                            try
                            {
                                if(finalize)
                                {
                                    final_hex = final_psbt.extractTransaction().toHex();
                                    msg = 'Finalized raw TX hex attached to data';
                                    data.hex = final_hex;
                                }
                                else
                                {
                                    data.psbt = 
                                    {
                                        hex: final_psbt.toHex(),
                                        base64: final_psbt.toBase64()
                                    }
                                }
                            }
                            catch(e)
                            {
                                final_hex = signed_tx;
                                data.psbt = 
                                {
                                    hex: final_psbt.toHex(),
                                    base64: final_psbt.toBase64()
                                }
                            }

                            if(psbt_hex != final_psbt.toHex())
                            {
                                results.data = data;
                                results.message = msg;
                                results.success = true;
                                callback(results);
                            }
                            else
                            {
                                results.message = 'Signed PSBT is the same as input PSBT';
                                callback(results);
                            }
                        }
                        else
                        {
                            results.message = 'Unable to sign using unisat';
                            callback(results);
                        }
                    }).catch(function(e)
                    {
                        console.info('unisat.e', e);
                        results.message = 'Unisat rejected signing process';
                        callback(results);
                    });
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for unisat.sign',
                        data: false
                    })
                }
            }
        },
        message: function(params = {}, callback = false)
        {
            var options = 
            {
                message: false
            };
            Object.assign(options, params);
            if(options.message && typeof callback == 'function')
            {
                var results =
                {
                    success: false,
                    message: 'Unisat not installed for message signing',
                    data: false
                };
                if(typeof window.unisat != 'undefined')
                {
                    var signed_message = false;
                    
                    async function sign() 
                    {
                        return await window.unisat.signMessage(options.message);
                    }
                    sign().then(async (signed_message) => 
                    {   
                        if(signed_message)
                        {
                            results.success = true;
                            results.message = 'Signatures attached to data';
                            results.data = 
                            {
                                base64: signed_message,
                                hex: Buffer.from(signed_message, 'base64').toString('hex'),
                                address: false
                            }
                        }
                        else
                        {
                            results.message = 'Unable to sign message via unisat';
                        }
                        callback(results);
                    });
                }
                else
                {
                    results.message = 'Unisat not installed for messages';
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback({
                    data: false,
                    success: false,
                    message: 'Invalid options for unisat.message'
                })
            }
        }
    },
    xverse:
    {
        key: function(params = {}, callback = false)
        {
            var options = 
            {
                network: false,
                payload:
                {
                    message: 'Provide access to 2 address formats'
                }
            };
            Object.assign(options, params);
            if
            (
                options.network 
                && typeof callback == 'function'
                && typeof options.payload == 'object'
                && typeof options.payload.message != 'undefined'
            )
            {
                var results =
                {
                    success: false,
                    message: 'xVerse not installed',
                    data: false
                };
                if(typeof window.satsConnect != 'undefined')
                {
                    const xverse_options = 
                    {
                        payload: 
                        {
                            purposes: ['ordinals', 'payment'],
                            message: options.payload.message,
                            network: 
                            {
                                type: options.network.charAt(0).toUpperCase() + options.network.slice(1)
                            },
                        },
                        onFinish: (response) => 
                        {
                            var address = false;
                            var public_key = false;
                            var addresses = response;
                            if
                            (
                                typeof addresses == 'object' 
                                && typeof addresses.addresses == 'object' 
                                && addresses.addresses.length == 2
                            )
                            {
                                results.success = true;
                                results.message = 'Key attached to data';
                                results.data = [];

                                for(a = 0; a < addresses.addresses.length; a++)
                                {
                                    results.data.push({
                                        pub: addresses.addresses[a].publicKey,
                                        address: addresses.addresses[a].address,
                                        format: ordit.sdk.addresses.format
                                        (
                                            addresses.addresses[a].address, 
                                            options.network
                                        )
                                    })
                                    
                                    if(ordit.sdk.addresses.format(addresses.addresses[a].address, options.network) == 'taproot')
                                    {
                                        var chain_code = new Buffer(32);
                                        chain_code.fill(1);

                                        var childNodeXOnlyPubkey = false;

                                        try
                                        {
                                            var public_key = addresses.addresses[a].publicKey;
                                            var net_obj = ordit.sdk.network(options.network);
                                            var keys = bip32ecc.fromPublicKey
                                            (
                                                Buffer.from(public_key, 'hex'),
                                                chain_code,
                                                net_obj
                                            );
                                            childNodeXOnlyPubkey = keys.publicKey.slice(1, 33);

                                        }
                                        catch(e)
                                        {
                                            childNodeXOnlyPubkey = Buffer.from(public_key, 'hex');
                                        }

                                        if(childNodeXOnlyPubkey)
                                        {
                                            results.data[0].xkey = childNodeXOnlyPubkey.toString('hex');
                                        }
                                    }
                                }
                            }
                            else
                            {
                                results.message = 'Invalid address format';
                            }
                            callback(results);
                        },
                        onCancel: () => 
                        {
                            results.message = 'Request canceled by xVerse';
                            callback(results);
                        },
                        onError: (e) =>
                        {
                            results.message+= ': ' + e;
                            callback(results);
                        }
                    }

                    async function get() 
                    {
                        try
                        {
                            await satsConnect.getAddress(xverse_options);
                        }
                        catch(e)
                        {
                            callback(results);
                        }
                    }
                    get();
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for xverse.key',
                        data: false
                    })
                }
            }
        },
        sign: function(params = {}, callback = false)
        {
            var options = 
            {
                psbt: false,
                network: false,
                inputs: false
            };
            Object.assign(options, params);
            
            if
            (
                typeof options.inputs != 'object'
                && typeof options.psbt == 'object'
                && typeof options.address != 'undefined'
                && typeof options.noSignIndexes == 'object'
            )
            {
                var signingIndexes = [];
                for(ic = 0; ic < options.psbt.inputCount; ic++)
                {
                    var add_to_index = true;
                    for(ns = 0; ns < options.noSignIndexes.length; ns++)
                    {
                        if(options.noSignIndexes[ns] == ic)
                        {
                            add_to_index = false;
                        }
                    }
                    if(add_to_index)
                    {
                        signingIndexes.push(ic);
                    }
                }
                options.inputs =
                [{
                    address: options.address,
                    signingIndexes: signingIndexes
                }];
            }
            if
            (
                options.network 
                && typeof options.inputs == 'object' 
                && typeof options.psbt == 'object' 
                && typeof callback == 'function'
            )
            {
                var psbt = options.psbt;
                var psbt_base64 = psbt.toBase64();
                var results =
                {
                    success: false,
                    message: 'xVerse not installed for signing',
                    data: false
                };
                if(typeof window.satsConnect != 'undefined')
                {
                    const xverse_options = 
                    {
                        payload: 
                        {
                            network: 
                            {
                                type: options.network.charAt(0).toUpperCase() + options.network.slice(1)
                            },
                            message: 'Sign Ordit SDK Transaction',
                            psbtBase64: psbt_base64,
                            broadcast: false,
                            inputsToSign: options.inputs
                        },
                        onFinish: (response) => 
                        {
                            var signed_tx = response.psbtBase64;

                            if(signed_tx)
                            {
                                var final_psbt = btc.Psbt.fromBase64(signed_tx);
                                
                                var data = 
                                {
                                    hex: false,
                                    psbt: false
                                }
                                var final_hex = false;
                                var msg = 'Unfinalized PSBT attached to data';

                                try
                                {
                                    final_psbt.finalizeAllInputs();
                                    final_hex = final_psbt.extractTransaction().toHex();
                                    msg = 'Finalized raw TX hex attached to data';
                                    data.hex = final_hex;
                                }
                                catch(e)
                                {
                                    final_hex = signed_tx;
                                    data.psbt = 
                                    {
                                        hex: final_psbt.toHex(),
                                        base64: final_psbt.toBase64()
                                    }
                                }

                                if(signed_tx != psbt_base64)
                                {
                                    results.data = data;
                                    results.message = msg;
                                    results.success = true;
                                    callback(results);
                                }
                                else
                                {
                                    results.message = 'Signed xVerse PSBT same as input';
                                    callback(results);
                                }
                            }
                            else
                            {
                                results.message = 'Unable to sign xVerse transaction';
                                callback(results);
                            }
                        },
                        onCancel: () => 
                        {
                            results.message = 'Signing canceled by xVerse';
                            callback(results);
                        }
                    }
                    async function sign() 
                    {
                        try
                        {
                            await satsConnect.signTransaction(xverse_options);
                        }
                        catch(e)
                        {
                            callback(results);
                        }
                    }
                    sign();
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for xverse.sign',
                        data: options
                    })
                }
            }
        },
        message: function(params = {}, callback = false)
        {
            var options = 
            {
                address: false,
                message: false,
                network: false
            };
            Object.assign(options, params);
            if
            (
                options.network && options.message && options.address
                && typeof callback == 'function'
            )
            {
                var results =
                {
                    success: false,
                    message: 'xVerse not installed for message',
                    data: false
                };
                if(typeof window.satsConnect != 'undefined')
                {
                    const xverse_options = 
                    {
                        payload: 
                        {
                            network: 
                            {
                                type: options.network.charAt(0).toUpperCase() + options.network.slice(1)
                            },
                            address: options.address,
                            message: options.message
                        },
                        onFinish: (response) => 
                        {
                            if(response)
                            {
                                results.success = true;
                                results.message = 'Signatures attached to data';
                                results.data = 
                                {
                                    base64: response,
                                    hex: Buffer.from(response, 'base64').toString('hex'),
                                    address: options.address
                                }
                            }
                            callback(results);
                        },
                        onCancel: () => 
                        {
                            results.message = 'Message signing canceled by xVerse';
                            callback(results);
                        }
                    }

                    async function get() 
                    {
                        try
                        {
                            await satsConnect.signMessage(xverse_options);
                        }
                        catch(e)
                        {
                            callback(results);
                        }
                    }
                    get();
                }
                else
                {
                    callback(results);
                }
            }
            else
            {
                if(typeof callback == 'function')
                {
                    callback({
                        success: false,
                        message: 'Invalid options for xverse.message',
                        data: false
                    })
                }
            }
        }
    },
    inscription:
    {
        address: function(params = {}, callback = false)
        {
            var options = 
            {
                seed: false,
                bip39: false,
                key: false,
                connect: false,
                media_content: false,
                sats_per_byte: 10,
                media_type: 'text/plain;charset=utf-8',
                meta_format: 'oip1',
                network: 'testnet',
                meta: false,
                parent_txid: false,
                parent_id: false,
                parent_vout: 0
            };
            Object.assign(options, params);
            if
            (
                options.network && options.media_type && options.media_content
                && options.sats_per_byte
                &&
                (
                    !options.meta
                    ||
                    (options.meta_format && options.meta)
                )
                && typeof callback == 'function'
                && 
                (
                    (options.seed || options.bip39 || options.key)
                    ||
                    (
                        options.connect == 'metamask'
                        || options.connect == 'unisat'
                        || options.connect == 'xverse'
                        || options.connect == 'saline'
                    )
                )
                
                // be sure only one of the four inputs is used ...
                
                && ! (options.seed && options.key && options.bip39 && options.connect) 
                && ! (options.key && options.bip39 && options.connect) 
                && ! (options.seed && options.key && options.connect) 
                && ! (options.seed && options.key && options.bip39) 
                && ! (options.bip39 && options.connect) 
                && ! (options.seed && options.connect) 
                && ! (options.key && options.connect) 
                && ! (options.seed && options.bip39) 
                && ! (options.key && options.bip39) 
                && ! (options.seed && options.key)
            )
            {
                var results = 
                {
                    data: false,
                    success: false,
                    message: 'Unsupported network for inscription.address'
                };
                
                ordit.sdk.wallet.get(options, function(k)
                {
                    if(k.success)
                    {
                        var xkey = false;
                        for(ke = 0; ke < k.data.keys.length; ke++)
                        {
                            if(typeof k.data.keys[ke].xkey != 'undefined')
                            {
                                xkey = Buffer.from(k.data.keys[ke].xkey, 'hex');
                            }
                        }
                        if(!xkey)
                        {
                            for(ka = 0; ka < k.data.addresses.length; ka++)
                            {
                                if(typeof k.data.addresses[ka].xkey != 'undefined')
                                {
                                    xkey = Buffer.from(k.data.addresses[ka].xkey, 'hex');
                                }
                            }
                        }
                        if(!xkey && options.key)
                        {
                            var net_obj = ordit.sdk.network(options.network);
                            var chain_code = new Buffer(32);
                            chain_code.fill(1);

                            var root = bip32ecc.fromPublicKey
                            (
                                Buffer.from(options.key, 'hex'),
                                chain_code,
                                net_obj
                            );
                            try
                            {
                                xkey = root.publicKey.slice(1, 33);
                            }
                            catch(e){}
                        }
                        if(xkey)
                        {
                            var net_obj = ordit.sdk.network(options.network);
                            if(net_obj)
                            {

                                // Generate inscription address ...

                                var error = false;
                                var address = false;

                                try
                                {
                                    options.xkey = xkey;
                                    
                                    var witness_script = ordit.sdk.inscription.witness(options);
                                    
                                    var recovery_script = ordit.sdk.inscription.witness(options, true);

                                    var script_tree = 
                                    [
                                        {
                                            output: witness_script
                                        },
                                        {
                                            output: recovery_script
                                        }
                                    ];
                                    
                                    var redeem_script = {
                                        output: witness_script,
                                        redeemVersion: 192,
                                    };
                                    
                                    var inscribe = btc.payments.p2tr({
                                        internalPubkey: xkey,
                                        scriptTree: script_tree,
                                        redeem: redeem_script,
                                        network: net_obj
                                    });
                                    
                                    var fees = JSON.parse(JSON.stringify((80 + (1 * 180)) * options.sats_per_byte));
                                    var script_length = witness_script.toString('hex').length;
                                    var script_fees = (parseInt(script_length / 10) * (options.sats_per_byte)) + fees;
                                    
                                    address = {
                                        address: inscribe.address,
                                        xkey: xkey.toString('hex'),
                                        format: 'inscribe',
                                        fees: script_fees
                                    };
                                }
                                catch(e){ error = e }

                                if(error)
                                {
                                   results.message = error.message; 
                                }
                                else
                                {
                                    results.success = true;
                                    results.message = 'Inscription address attached to data';
                                    results.data = address;
                                }
                                callback(results);
                            }
                            else
                            {
                                callback(results);
                            }
                        }
                        else
                        {
                            results.message = 'No xKey provided';
                            callback(results);
                        }
                    }
                    else
                    {
                        results.message = k.message;
                        callback(results);
                    }
                })
            }
            else if(typeof callback == 'function')
            {
                callback({
                    data: options,
                    success: false,
                    message: 'Inavlid options for inscription.address'
                });
            }
        },
        psbt: function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                seed: false,
                bip39: false,
                connect: false,
                media_content: false,
                destination: false,
                change_address: false,
                fees: 10,
                postage: 10000,
                media_type: 'text/plain;charset=utf-8',
                meta_format: 'oip1',
                network: 'testnet',
                meta: false,
                recovery: false,
                dummies: false,
                parent_txid: false,
                parent_id: false,
                parent_vout: 0
            };
            Object.assign(options, params);
            if
            (
                options.network && options.media_type && options.media_content
                && options.destination && options.fees && options.postage
                && 
                (
                    !options.meta
                    ||
                    (
                        options.meta_format
                        && options.meta
                    )
                )
                && typeof callback == 'function'
                && 
                (
                    (options.seed || options.bip39 || options.key)
                    ||
                    (
                        options.connect == 'metamask'
                        || options.connect == 'unisat'
                        || options.connect == 'xverse'
                    )
                )
                
                // be sure only one of the three inputs is used ...
                
                && ! (options.seed && options.key && options.bip39 && options.connect) 
                && ! (options.key && options.bip39 && options.connect) 
                && ! (options.seed && options.key && options.connect) 
                && ! (options.seed && options.key && options.bip39) 
                && ! (options.bip39 && options.connect) 
                && ! (options.seed && options.connect) 
                && ! (options.key && options.connect) 
                && ! (options.seed && options.bip39) 
                && ! (options.key && options.bip39) 
                && ! (options.seed && options.key) 
            )
            {
                var results = 
                {
                    data: false,
                    success: false,
                    message: 'Unsupported network for inscription.psbt'
                };
                
                var net_obj = ordit.sdk.network(options.network);
                if(net_obj)
                {
                    var got_seed = function(options)
                    {
                        var s = false;
                        var seeds = false;
                        async function get_keys()
                        {
                            if(options.bip39)
                            {

                                s = await bip39.mnemonicToEntropy(options.bip39);
                                seeds = s.toString('hex');
                            }
                            else if(options.seed)
                            {
                                try
                                {
                                    var b = btc.crypto.sha256(Buffer.from(options.seed), 'utf8').toString('hex');
                                    var m = bip39.entropyToMnemonic(Buffer.from(b, 'hex'), bip39.wordlists.english);
                                    s = await bip39.mnemonicToEntropy(m);
                                    seeds = s.toString('hex');
                                }
                                catch(e){}
                            }

                            var root = false;
                            
                            if(seeds)
                            {
                                root = bip32ecc.fromSeed
                                (
                                    Buffer.from(seeds, 'hex'),
                                    net_obj
                                );
                            }
                            
                            if(options.connect == 'unisat')
                            {
                                var chain_code = new Buffer(32);
                                chain_code.fill(1);
                                
                                // xverse pubkey ?
                                //seeds = '0207f591c4be9bfbe6a854869a088e6b763d4929559539e02cac08602d2fcdd2c3';
                                
                                root = bip32ecc.fromPublicKey
                                (
                                    Buffer.from(seeds, 'hex'),
                                    chain_code,
                                    net_obj
                                );
                            }
                            else if(options.key)
                            {
                                var chain_code = new Buffer(32);
                                chain_code.fill(1);
                                
                                // xverse pubkey ?
                                //seeds = '0207f591c4be9bfbe6a854869a088e6b763d4929559539e02cac08602d2fcdd2c3';
                                
                                root = bip32ecc.fromPublicKey
                                (
                                    Buffer.from(options.key, 'hex'),
                                    chain_code,
                                    net_obj
                                );
                            }
                            else if(typeof options.connect != 'undefined' && options.connect != 'xverse')
                            {
                                root = bip32ecc.fromSeed
                                (
                                    Buffer.from(seeds, 'hex'),
                                    net_obj
                                );
                            }

                            var parent = root;

                            if(typeof options.path == 'object' && options.path.length > 0)
                            {
                                for(p = 0; p < options.path.length; p++)
                                {
                                    parent = parent.derive(parseInt(options.path[p]));
                                }
                            }
                            
                            var childNodeXOnlyPubkey = false;

                            try
                            {
                                childNodeXOnlyPubkey = parent.publicKey.slice(1, 33);

                            }
                            catch(e)
                            {
                                if(options.connect == 'xverse')
                                {
                                    childNodeXOnlyPubkey = Buffer.from(options.key, 'hex');
                                }
                            }
                            
                            var keys = 
                            {
                                pub: false,
                                xkey: childNodeXOnlyPubkey,
                                parent: parent
                            }
                            
                            if(options.connect != 'xverse')
                            {
                                keys.pub = Buffer.from(parent.publicKey).toString('hex')
                            }
                            
                            if(typeof parent.privateKey == 'object')
                            {
                                keys.priv = Buffer.from(parent.privateKey).toString('hex');
                                keys.wif = parent.toWIF();
                            }
                            
                            return keys;
                        }
                        get_keys().then(async (full_keys) =>
                        {  
                            options.xkey = full_keys.xkey;
                            
                            var witness_script = ordit.sdk.inscription.witness(options);
                                    
                            var recovery_script = ordit.sdk.inscription.witness(options, true);

                            var script_tree =
                            [
                                {
                                    output: witness_script
                                },
                                {
                                    output: recovery_script
                                }
                            ];

                            var redeem_script = {
                                output: witness_script,
                                redeemVersion: 192,
                            };
                            
                            if(options.recovery)
                            {
                                redeem_script = {
                                    output: recovery_script,
                                    redeemVersion: 192,
                                };
                            }

                            var inscribe = btc.payments.p2tr({
                                internalPubkey: full_keys.xkey,
                                scriptTree: script_tree,
                                redeem: redeem_script,
                                network: net_obj
                            });
                            
                            var dummy = btc.payments.p2tr({
                                internalPubkey: full_keys.xkey,
                                network: net_obj
                            });
                            
                            // psbt.get
                            
                            ordit.sdk.apis.unspents({
                                address: inscribe.address,
                                network: options.network
                            },  function(unspent)
                            {
                                if(unspent.success)
                                {
                                    var unspents = unspent.data;
                                    var fees_for_witness_data = options.fees;
                                    var got_suitable_unspent = [];
                                    var spare_unspents = [];
                                    var sats_per_byte = 10;
                                    var sats_in = 0;
                                    
                                    var total_needed_to_reveal = options.postage + fees_for_witness_data;
                                    
                                    if(options.parent_id)
                                    {
                                        total_needed_to_reveal = options.postage;
                                    }
                                    
                                    for(u = 0; u < unspents.length; u++)
                                    {   
                                        if
                                        (
                                            (
                                                unspents[u].sats >= total_needed_to_reveal
                                                && unspents[u].safeToSpend === true
                                            )
                                            ||
                                            options.recovery
                                        )
                                        {
                                            if(options.recovery)
                                            {
                                                sats_in+= unspents[u].sats;
                                                got_suitable_unspent.push(unspents[u]);
                                            }
                                            else
                                            {
                                                sats_in = unspents[u].sats;
                                                got_suitable_unspent[0] = unspents[u];
                                            }
                                        }
                                    }
                                    
                                    if(got_suitable_unspent.length > 0)
                                    {
                                        var fees = (options.postage + fees_for_witness_data);
                                        
                                        if(options.recovery)
                                        {
                                            fees = JSON.parse(JSON.stringify((80 + (got_suitable_unspent.length * 180)) * sats_per_byte));
                                        }
                                        
                                        var change = sats_in - fees;
                                        var parent_first = false;
                                        
                                        var psbt = new btc.Psbt({network: net_obj});
                                        try
                                        {

                                            if
                                            (
                                                !options.recovery 
                                                && 
                                                (
                                                    !options.parent_id
                                                    ||
                                                    (
                                                        options.parent_id
                                                        && !parent_first
                                                    )
                                                )
                                            )
                                            {
                                                jQuery.each(got_suitable_unspent, function(su)
                                                {
                                                    var gsu = got_suitable_unspent[su];
                                                    var witness_index = 0;
                                                    if(options.recovery)
                                                    {
                                                        witness_index = 1;
                                                    }
                                                    psbt.addInput({
                                                        hash: gsu.txid,
                                                        index: parseInt(gsu.n),
                                                        tapInternalKey: full_keys.xkey,
                                                        witnessUtxo:
                                                        {
                                                            script: inscribe.output, 
                                                            value: parseInt(gsu.sats)
                                                        },
                                                        tapLeafScript: [
                                                            {
                                                                leafVersion: redeem_script.redeemVersion,
                                                                script: redeem_script.output,
                                                                controlBlock: inscribe.witness[inscribe.witness.length - 1]
                                                            }
                                                        ]
                                                    });
                                                });

                                                psbt.addOutput({
                                                    address: options.destination, 
                                                    value: options.postage
                                                });
                                                
                                                console.log('change1', change);

                                                //if(change > 600)
                                                if(change > 60000000000000000)
                                                {
                                                    var change_address = inscribe.address;
                                                    if
                                                    (
                                                        typeof options.change_address != 'undefined'
                                                        && options.change_address
                                                    )
                                                    {
                                                        change_address = options.change_address;
                                                    }
                                                    psbt.addOutput({
                                                        address: change_address, 
                                                        value: change
                                                    });
                                                }
                                            }
                                            
                                            console.log('options', options);
                                            
                                            if(options.parent_id)
                                            {
                                                // Extra in and extra out ...
                                                ordit.sdk.balance.get({
                                                    key: full_keys.pub,
                                                    format: 'p2tr',
                                                    network: options.network
                                                }, function(w)
                                                {
                                                    if(w.success)
                                                    {
                                                        var spendables = w.data.spendables;
                                                        
                                                        if(typeof options.parent_id)
                                                        {
                                                            spendables = spendables = w.data.addresses[0].unspents;
                                                        }
                                                        
                                                        console.log('spendables', spendables);
                                                        
                                                        if(spendables.length > 0)
                                                        {
                                                            var suitable_spendable = false; // parent
                                                            var suitable_dummy = false; // fees
                                                            
                                                            for(ss = 0; ss < spendables.length; ss++)
                                                            {
                                                                if
                                                                (
                                                                    options.parent_txid == spendables[ss].txid
                                                                    && parseInt(options.parent_vout) == spendables[ss].n
                                                                    && !suitable_spendable
                                                                    && spendables[ss].sats > 599
                                                                )
                                                                {
                                                                    suitable_spendable = spendables[ss];
                                                                }
                                                                else if
                                                                (
                                                                    (
                                                                        !options.parent_id
                                                                        && spendables[ss].sats > 599
                                                                    )
                                                                    ||
                                                                    (
                                                                        options.parent_id
                                                                        && spendables[ss].sats == fees_for_witness_data
                                                                        && spendables[ss].safeToSpend
                                                                    )
                                                                )
                                                                {
                                                                    if(options.parent_id)
                                                                    {
                                                                        suitable_dummy = spendables[ss];
                                                                    }
                                                                    else
                                                                    {
                                                                        suitable_spendable = spendables[ss];
                                                                    }
                                                                }
                                                            }
                                                            console.log('suitable_spendable', suitable_spendable);
                                                            console.log('suitable_dummy', suitable_dummy);
                                                            if
                                                            (
                                                                (
                                                                    !options.parent_id
                                                                    && suitable_spendable
                                                                )
                                                                ||
                                                                (
                                                                    options.parent_id
                                                                    && suitable_spendable
                                                                    && suitable_dummy
                                                                )
                                                            )
                                                            {
                                                                var dummy_txid = 'N/A';
                                                                if(suitable_dummy)
                                                                {
                                                                    dummy_txid = suitable_dummy.txid;
                                                                }
                                                                ordit.sdk.apis.transaction({
                                                                    txid: dummy_txid,
                                                                    network: options.network
                                                                }, function(dummy_tx)
                                                                {   
                                                                    var dum_tx = false;
                                                                    if
                                                                    (
                                                                        options.parent_id 
                                                                        && dummy_tx.success
                                                                    )
                                                                    {
                                                                        dum_tx = dummy_tx.data;
                                                                    }
                                                                
                                                                
                                                                ordit.sdk.apis.transaction({
                                                                    txid: suitable_spendable.txid,
                                                                    network: options.network
                                                                }, function(this_tx)
                                                                {   
                                                                    if(this_tx.success)
                                                                    {
                                                                        var raw = btc.Transaction.fromHex(this_tx.data.hex);
                                                                        var d = 
                                                                        {
                                                                            hash: this_tx.data.txid,
                                                                            index: parseInt(suitable_spendable.n),
                                                                            nonWitnessUtxo: Buffer.from(this_tx.data.hex, 'hex'),
                                                                            sequence: 0xfffffffd // Needs to be at least 2 below max int value to be RBF
                                                                        };
                                                                        var sats = Math.round(parseFloat(this_tx.data.vout[suitable_spendable.n].value) * (10 ** 8));

                                                                        d.tapInternalKey = Buffer.from(full_keys.xkey, 'hex');
                                                                        d.witnessUtxo = 
                                                                        {
                                                                            script: dummy.output,
                                                                            value: sats
                                                                        };
                                                                        psbt.addInput(d);
                                                                        
                                                                        psbt.addOutput({
                                                                            address: options.destination, 
                                                                            value: sats
                                                                        });
                                                                        
                                                                        if(options.parent_id)
                                                                        {
                                                                            // Need dummy TX info?
                                                                            
                                                                            var draw = btc.Transaction.fromHex(dum_tx.hex);
                                                                            var dt = 
                                                                            {
                                                                                hash: dum_tx.txid,
                                                                                index: parseInt(suitable_dummy.n),
                                                                                nonWitnessUtxo: Buffer.from(dum_tx.hex, 'hex'),
                                                                                sequence: 0xfffffffd // Needs to be at least 2 below max int value to be RBF
                                                                            };
                                                                            var dsats = Math.round(parseFloat(dum_tx.vout[suitable_dummy.n].value) * (10 ** 8));

                                                                            dt.tapInternalKey = Buffer.from(full_keys.xkey, 'hex');
                                                                            dt.witnessUtxo = 
                                                                            {
                                                                                script: dummy.output,
                                                                                value: dsats
                                                                            };
                                                                            psbt.addInput(dt);
                                                                            
                                                                            var dchange = total_needed_to_reveal - dsats;
                                                                            
                                                                            console.log('dchange', dchange);
                                                                            
                                                                            if(dchange > 6000000000000000)
                                                                            {
                                                                                var change_address = options.destination;
                                                                                if
                                                                                (
                                                                                    typeof options.change_address != 'undefined'
                                                                                    && options.change_address
                                                                                )
                                                                                {
                                                                                    change_address = options.change_address;
                                                                                }
                                                                                psbt.addOutput({
                                                                                    address: change_address, 
                                                                                    value: dchange
                                                                                });
                                                                            }
                                                                        }
                                                                        
                                                                        console.log('psbt', psbt);
                                                                        
                                                                        if
                                                                        (
                                                                            options.parent_id 
                                                                            && parent_first
                                                                        )
                                                                        {
                                                                            jQuery.each
                                                                            (
                                                                                got_suitable_unspent, function(su)
                                                                            {
                                                                                var gsu = got_suitable_unspent[su];
                                                                                var witness_index = 0;
                                                                                if(options.recovery)
                                                                                {
                                                                                    witness_index = 1;
                                                                                }
                                                                                psbt.addInput({
                                                                                    hash: gsu.txid,
                                                                                    index: parseInt(gsu.n),
                                                                                    tapInternalKey: full_keys.xkey,
                                                                                    witnessUtxo:
                                                                                    {
                                                                                        script: inscribe.output, 
                                                                                        value: parseInt(gsu.sats)
                                                                                    },
                                                                                    tapLeafScript: [
                                                                                        {
                                                                                            leafVersion: redeem_script.redeemVersion,
                                                                                            script: redeem_script.output,
                                                                                            controlBlock: inscribe.witness[inscribe.witness.length - 1]
                                                                                        }
                                                                                    ]
                                                                                });
                                                                            });

                                                                            psbt.addOutput({
                                                                                address: options.destination, 
                                                                                value: options.postage
                                                                            });

                                                                            if(change > 600)
                                                                            {
                                                                                var change_address = inscribe.address;
                                                                                if
                                                                                (
                                                                                    typeof options.change_address != 'undefined'
                                                                                    && options.change_address
                                                                                )
                                                                                {
                                                                                    change_address = options.change_address;
                                                                                }
                                                                                psbt.addOutput({
                                                                                    address: change_address, 
                                                                                    value: change
                                                                                });
                                                                            }
                                                                        }
                                                                        
                                                                        results.success = true;
                                                                        results.message = 'Unsigned PSBT attached to data';
                                                                        results.data = 
                                                                        {
                                                                            hex: psbt.toHex(),
                                                                            base64: psbt.toBase64()
                                                                        };
                                                                        callback(results);
                                                                    }
                                                                    else
                                                                    {
                                                                        results.message = this_tx.message;
                                                                        callback(results);
                                                                    }
                                                                });
                                                                    
                                                                }); // dummy
                                                            }
                                                            else
                                                            {
                                                                results.message = 'Unable to find suitable spendable';
                                                                callback(results);
                                                            }
                                                        }
                                                        else
                                                        {
                                                            results.message = 'No spendables available';
                                                            callback(results);
                                                        }
                                                    }
                                                    else
                                                    {
                                                        results.message = w.message;
                                                        callback(results);
                                                    }
                                                });
                                            }
                                            else
                                            {
                                                results.success = true;
                                                results.message = 'Unsigned PSBT attached to data';
                                                results.data = 
                                                {
                                                    hex: psbt.toHex(),
                                                    base64: psbt.toBase64()
                                                };
                                                callback(results);
                                            }
                                        }
                                        catch(e)
                                        {
                                            results.message = e.message;
                                            callback(results);
                                        }
                                    }
                                    else
                                    {
                                        results.message = 'Unable to find suitable unspent for reveal';
                                        callback(results);
                                    }
                                }
                                else
                                {
                                    results.message = unspent.message;
                                    callback(results);
                                }
                            });
                        });
                    };
                    
                    if
                    (
                        options.key
                        || options.seed 
                        || options.bip39 
                        || options.connect == 'unisat' 
                        || options.connect == 'xverse' 
                    )
                    {
                        got_seed(options);
                    }
                    else if(options.connect == 'metamask')
                    {
                        if(typeof window.MetaMaskSDK != 'undefined')
                        {
                            var MMSDK = new MetaMaskSDK.MetaMaskSDK();
                            var ethereum = MMSDK.getProvider() // You can also access via window.ethereum

                            async function get_accounts()
                            {
                                return await ethereum.request({method: 'eth_requestAccounts'});
                            }
                            get_accounts().then(async (accounts) =>
                            {
                                var address = accounts[0];
                                var msg = 'Generate Bitcoin Addresses from ' + address + '?';
                                var seed = await ethereum.request({method: 'personal_sign', params: [msg, address]}); 
                                options.seed = seed;
                                got_seed(options);
                            });
                        }
                        else
                        {
                            results.message = 'Metamask not installed';
                            callback(results);
                        }
                    }
                }
                else
                {
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback({
                    data: options,
                    success: false,
                    message: 'Inavlid options for inscription.reveal'
                });
            }
        },
        witness: function(params = {}, recover = false)
        {
            var options = 
            {
                xkey: false,
                media_content: false,
                media_type: 'text/plain;charset=utf-8',
                meta_format: 'oip1',
                meta: false,
                parent_id: false,
                parent_vout: 0,
                protocol: false,
                include_checksig: true,
                pointer: 0
            };
            var witness = false;
            Object.assign(options, params);
            if
            (
                options.media_type && options.media_content && options.xkey
                && 
                (
                    !options.meta
                    ||
                    (
                        options.meta
                        && options.meta_format
                    )
                )
            )
            {
                try
                {
                    var chunk_content = function(str)
                    {
                        if(str.length > 519)
                        {
                            var strings = str.match(/[^]{1,520}/g);
                            return strings;
                        }
                        else
                        {
                            return [str];
                        }
                    }
                    
                    var meta_chunks = [];
                    var chunks = chunk_content(options.media_content);
                    
                    if(typeof options.meta == 'object')
                    {
                        var cmeta = JSON.stringify(options.meta);
                        if(options.meta_format == 'op5')
                        {
                            var encoded = CBOR.encode(options.meta);
                            function toHexString(byteArray) {
                              var s = '';
                              byteArray.forEach(function(byte) {
                                s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
                              });
                              return s;
                            }
                            cmeta = toHexString(Array.from(new Uint8Array(encoded)));
                        }
                        meta_chunks = chunk_content(cmeta);
                    }
                    
                    var op_push = function(str, t = 'utf8')
                    {
                        var buff = Buffer.from(str, t);
                        var obj = [buff];
                        var push = Buffer.concat(obj);
                        return push;
                    }
                    
                    var the_scripts = [];
                    
                    if(options.include_checksig)
                    {
                        the_scripts.push(options.xkey);
                        the_scripts.push(btc.opcodes.OP_CHECKSIG);
                    }
                    
                    if(!recover)
                    {
                        the_scripts.push(btc.opcodes.OP_FALSE);
                        the_scripts.push(btc.opcodes.OP_IF);
                        the_scripts.push(op_push('ord'));
                        
                        the_scripts.push(1);
                        the_scripts.push(1);
                        
                        the_scripts.push(op_push(options.media_type)); // text/plain;charset=utf-8
                        
                        if(options.pointer)
                        {
                            // OP2
                            the_scripts.push(1);
                            the_scripts.push(2);
                            var this_pointer = parseInt(options.parent_vout).toString('16');
                            the_scripts.push(Buffer.from(this_pointer, 'hex'));
                        }
                        
                        if
                        (
                            typeof options.parent_id != 'undefined'
                            && options.parent_id
                        )
                        {
                            // OP3
                            the_scripts.push(1);
                            the_scripts.push(3);
                            var this_index = '';
                            if(parseInt(options.parent_vout))
                            {
                                // TODO - make use of this?!?
                                this_index = parseInt(options.parent_vout).toString('16');
                            }
                            var this_txid = Buffer.from(options.parent_id, 'hex').reverse().toString('hex');
                            
                            the_scripts.push(Buffer.from(this_txid, 'hex'));
                        }
                        
                        if
                        (
                            typeof options.meta == 'object' 
                            && typeof meta_chunks == 'object'
                            && options.meta_format == 'op5'
                        )
                        {
                            // OP5
                            for(mc = 0; mc < meta_chunks.length; mc++)
                            {
                                the_scripts.push(1);
                                the_scripts.push(5);
                                the_scripts.push(op_push(meta_chunks[mc], 'hex'));
                            }
                        }
                        
                        if(options.protocol)
                        {
                            the_scripts.push(1);
                            the_scripts.push(7);
                            the_scripts.push(op_push(options.protocol));
                        }
                        
                        the_scripts.push(btc.opcodes.OP_0);

                        for(c = 0; c < chunks.length; c++)
                        {
                            var encode_type = 'utf8';
                            if
                            (
                                (
                                options.media_type.indexOf('text') < 0 
                                && options.media_type.indexOf('json') < 0
                                )
                            )
                            {
                                encode_type = 'base64';
                            }
                            the_scripts.push(op_push(chunks[c], encode_type));
                        }
                        
                        the_scripts.push(btc.opcodes.OP_ENDIF);
                        
                        if
                        (
                            typeof options.meta == 'object' 
                            && typeof meta_chunks == 'object'
                            && options.meta_format == 'oip1'
                        )
                        {
                            the_scripts.push(btc.opcodes.OP_FALSE);
                            the_scripts.push(btc.opcodes.OP_IF);
                            the_scripts.push(op_push('ord'));
                            the_scripts.push(1);
                            the_scripts.push(1);
                            the_scripts.push(op_push('application/json;charset=utf-8'));
                            the_scripts.push(btc.opcodes.OP_0);

                            for(mc = 0; mc < meta_chunks.length; mc++)
                            {
                                the_scripts.push(op_push(meta_chunks[mc]));
                            }
                            //the_scripts.push(op_push(meta_chunks));

                            the_scripts.push(btc.opcodes.OP_ENDIF);
                        }
                        
                    }
                    witness = btc.script.compile(the_scripts);
                }
                catch(e){}
            }
            return witness;
        }
    },
    sado:
    {
        filter: function(obj, filter_address = false, only_instants = false)
        {
            var objs = false;
            var filtered_objs = [];
            try
            {
                objs = JSON.parse(JSON.stringify(obj));
            }
            catch(e){}
            
            if(typeof objs == 'object' && objs.length > 0)
            {
                for(ob = 0; ob < objs.length; ob++)
                {
                    if
                    (
                        (
                            (
                                only_instants === true
                                && typeof objs[ob].instant != 'undefined'
                                && objs[ob].instant
                            )
                            ||
                            !only_instants
                        )
                        ||
                        (
                            typeof objs[ob].maker != 'undefined'
                            &&
                            (
                                typeof objs[ob].cardinals != 'undefined'
                                && typeof objs[ob].inscriptions == 'object'
                                && parseInt(objs[ob].cardinals) > 600
                                && objs[ob].inscriptions.length == 1
                            )
                        )
                        ||
                        (
                            typeof objs[ob].taker != 'undefined'
                            &&
                            (
                                typeof objs[ob].origin != 'undefined'
                                && typeof objs[ob].inscriptions == 'object'
                                && typeof objs[ob].offer != 'undefined'
                                && objs[ob].inscriptions.length == 1
                            )
                        )
                    )
                    {
                        objs[ob].yours = false;
                        var active_address = false;
                        if(typeof objs[ob].maker != 'undefined')
                        {
                            active_address = objs[ob].maker;
                        }
                        else if(typeof objs[ob].taker != 'undefined')
                        {
                            active_address = objs[ob].taker;
                        }
                        if(active_address && filter_address && filter_address == active_address)
                        {
                            objs[ob].yours = true;
                        }
                        
                        if
                        (
                            typeof jQuery != 'undefined' 
                            && typeof jQuery.timeago == 'function'
                        )
                        {
                            objs[ob].ago = jQuery.timeago(objs[ob].block.time * 1000);
                        }
                        
                        if(typeof objs[ob].price == 'object')
                        {
                            objs[ob].price.usd = parseFloat(objs[ob].price.usd).toFixed(2);
                            if
                            (
                                typeof objs[ob].cardinals != 'undefined'
                                && parseInt(objs[ob].cardinals) > 600
                            )
                            {
                                objs[ob].price.btc = parseFloat(parseInt(objs[ob].cardinals) / (10 ** 8)).toFixed(8)
                            }
                        }
                        else
                        {
                            objs[ob].price = 
                            {
                                btc: 0,
                                usd: 0
                            };
                        }
                        
                        objs[ob].inscriptions[0].formats = 
                        {
                            image: false,
                            audio: false,
                            video: false,
                            html: false,
                            text: false
                        }
                        
                        if
                        (
                            typeof objs[ob].inscriptions[0].mediaType != 'undefined'
                            && typeof objs[ob].inscriptions[0].media_type == 'undefined'
                        )
                        {
                            objs[ob].inscriptions[0].media_type = objs[ob].inscriptions[0].mediaType;
                        }
                        if
                        (
                            typeof objs[ob].inscriptions[0].mediaContent != 'undefined'
                            && typeof objs[ob].inscriptions[0].media_content == 'undefined'
                        )
                        {
                            objs[ob].inscriptions[0].media_content = objs[ob].inscriptions[0].mediaContent;
                        }
                        if
                        (
                            typeof objs[ob].inscriptions[0].mediaSize != 'undefined'
                            && typeof objs[ob].inscriptions[0].size == 'undefined'
                        )
                        {
                            objs[ob].inscriptions[0].size = objs[ob].inscriptions[0].mediaSize;
                        }
                        
                        if(objs[ob].inscriptions[0].media_type.indexOf('text/html') === 0)
                        {
                            objs[ob].inscriptions[0].formats.html = true;
                            objs[ob].inscriptions[0].type = 'html';
                        }
                        else if(objs[ob].inscriptions[0].media_type.indexOf('image') === 0)
                        {
                            objs[ob].inscriptions[0].formats.image = true;
                            objs[ob].inscriptions[0].type = 'image';
                        }
                        else if(objs[ob].inscriptions[0].media_type.indexOf('audio') === 0)
                        {
                            objs[ob].inscriptions[0].formats.audio = true;
                            objs[ob].inscriptions[0].type = 'audio';
                        }
                        else if(objs[ob].inscriptions[0].media_type.indexOf('video') === 0)
                        {
                            objs[ob].inscriptions[0].formats.video = true;
                            objs[ob].inscriptions[0].type = 'video';
                        }
                        else if
                        (
                            objs[ob].inscriptions[0].media_type.indexOf('text') === 0
                            || objs[ob].inscriptions[0].media_type.indexOf('json') > -1
                        )
                        {
                            objs[ob].inscriptions[0].formats.text = true;
                            objs[ob].inscriptions[0].type = 'text';
                        }
                        
                        objs[ob].inscription = objs[ob].inscriptions[0];
                        
                        if(typeof objs[ob].ordinals == 'object' && objs[ob].ordinals.length > 0)
                        {
                            objs[ob].ordinal = objs[ob].ordinals[0];
                            objs[ob].ordinal.postage = parseFloat(objs[ob].ordinal.size / (10 ** 8)).toFixed(8);
                        }
                        else
                        {
                            objs[ob].ordinals = [];
                        }
                        
                        var counts = 
                        {
                            ordinals: objs[ob].ordinals.length,
                            inscriptions: objs[ob].inscriptions.length
                        }
                        var filtered_obj = JSON.parse(JSON.stringify(objs[ob]));
                        filtered_obj.counts = counts;
                        
                        filtered_objs.push(filtered_obj);
                    }
                }
            }
            return filtered_objs;
        },
        order: function(params = {}, callback = false)
        {
            var options = 
            {
                seed: false, // TODO - support other inputs
                key: false, // TODO - support other inputs
                
                location: false, // location of item for sale TXID:VOUT FORMAT
                cardinals: 0, // integer value of sats to sell location for
                ts: 0,
                
                instant: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                data: options,
                message: 'Invalid options for sado.order'
            };
            if
            (
                options.network && typeof callback == 'function'
                && (options.seed || options.key)
                && typeof ordit.sdk.config.apis[options.network] == 'object'
                && typeof ordit.sdk.config.apis[options.network].orderbook != 'undefined'
            )
            {
                results.message = 'No pending orders available';
                var orderbook = ordit.sdk.config.apis[options.network].orderbook;
                options.format = 'p2tr';
                ordit.sdk.wallet.get(options,  function(w)
                {
                    if(w.success)
                    {
                        var ts = new Date().getTime();
                        
                        if(options.ts)
                        {
                            ts = options.ts
                        }
                        var rpc_request = 
                        {
                            jsonrpc: "2.0",
                            method: "Sado.CreateOrder",
                            data: 
                            {
                                network: options.network,
                                order: 
                                {
                                    type: "sell",
                                    ts: ts,
                                    location: options.location,
                                    cardinals: options.cardinals,
                                    maker: w.data.addresses[0].address,
                                    orderbooks: [ orderbook ]
                                },
                                signature: {
                                    value: false,
                                    format: "ordit",
                                    pubkey: w.data.keys[0].pub
                                },
                                satsPerByte: 15
                            },
                            network: options.network,
                            id: 0
                        };
                        
                        if
                        (
                            options.title
                            || options.intro
                            || options.collection
                        )
                        {
                            rpc_request.data.order.meta = {};
                            if(options.title)
                            {
                                rpc_request.data.order.meta.title = options.title;
                            }
                            if(options.intro)
                            {
                                rpc_request.data.order.meta.intro = options.intro;
                            }
                            if(options.collection)
                            {
                                rpc_request.data.order.meta.collection = options.collection;
                            }
                        }
                        if(options.instant === true)
                        {
                            ordit.sdk.instant.sell({
                                key: w.data.keys[0].pub,
                                location: options.location,
                                price: options.cardinals,
                                network: options.network
                            }, function(sell)
                            {
                                if
                                (
                                    sell.success && options.key 
                                    && typeof options.hex != 'undefined'
                                    && typeof options.sig != 'undefined'
                                )
                                {
                                    rpc_request.data.signature.value = options.sig;
                                    rpc_request.data.order.instant = options.hex;
                                        
                                    ordit.sdk.rpc(rpc_request, function(sado)
                                    {
                                        if(typeof sado.rdata == 'object')
                                        {
                                            results.success = true;
                                            results.message = 'Unsigned PSBT attached to data';
                                            results.data =
                                            {
                                                base64: sado.rdata.psbt,
                                                hex: Buffer.from(sado.rdata.psbt, 'base64').toString('hex')
                                            }
                                            callback(results);
                                        }
                                        else
                                        {
                                            results.message = 'Unable to create sado order';
                                            if
                                            (
                                                typeof sado.error == 'object'
                                                && typeof sado.error.data != 'undefined'
                                            )
                                            {
                                                results.message = sado.error.data;
                                            }
                                            callback(results);
                                        }
                                    });
                                }
                                else if(sell.success && options.key && typeof options.hex != 'undefined')
                                {
                                    rpc_request.data.order.instant = options.hex;
                                    
                                    var sign_request = JSON.parse(JSON.stringify(rpc_request));
                                    
                                    sign_request.method = 'Sado.Signature.GetMessage';
                                    sign_request.data = rpc_request.data.order;
                                    sign_request.network = options.network;
                                    
                                    ordit.sdk.rpc(sign_request, function(sado)
                                    {   
                                        if
                                        (
                                            sado.success
                                            && typeof sado.rdata != 'undefined'
                                        )
                                        {
                                            results.success = true;
                                            results.message = 'Unsigned order attached to data';
                                            results.data = 
                                            {
                                                json: sado.rdata
                                            }
                                        }
                                        callback(results);
                                    });
                                }
                                else if(sell.success && options.key)
                                {
                                    results.success = true;
                                    results.message = 'Unsigned PSBT attached to data';
                                    results.data = 
                                    {
                                        hex: sell.data.hex,
                                        psbt: sell.data.psbt
                                    }
                                    callback(results);
                                }
                                else if(sell.success)
                                {
                                    ordit.sdk.psbt.sign({
                                        seed: options.seed,
                                        hex: Buffer.from(sell.data.hex, 'hex').toString('hex'),
                                        network: options.network,
                                        tweaked: false,
                                        extracted: false,
                                        finalized: false,
                                        sighashType: 131,
                                        signingIndexes: [0]
                                    }, function(signed)
                                    {
                                        if(signed.success)
                                        {
                                            rpc_request.params.order.instant = signed.data.psbt.hex;
                                            
                                            var order_to_sign = JSON.stringify(rpc_request.params.order);
                                            
                                            var sign_request_opts = JSON.parse(JSON.stringify(rpc_request));
                                            
                                            sign_request_opts.method = 'Sado.Signature.GetMessage';
                                            sign_request_opts.data = rpc_request.params.order;
                                            sign_request_opts.network = options.network;
                                            
                                            ordit.sdk.rpc(sign_request_opts, function(sigs)
                                            {   
                                                if(sigs && typeof sigs.rdata != 'undefined')
                                                {
                                                    var message_opts = JSON.parse(JSON.stringify(options));
                                                    message_opts.message = sigs.rdata;
                                                    message_opts.format = 'core';
                                                    
                                                    ordit.sdk.message.sign
                                                    (
                                                        message_opts, 
                                                        function(signed_msg)
                                                        {
                                                            if(signed_msg.success)
                                                            {
                                                                rpc_request.params.signature.value = signed_msg.data.hex;
                                                            }

                                                            ordit.sdk.api({
                                                                uri: 'sado/rpc',
                                                                data: rpc_request,
                                                                network: options.network
                                                            }, function(sado)
                                                            {
                                                                if
                                                                (
                                                                    typeof sado.result != 'undefined'
                                                                    && typeof sado.result.psbt != 'undefined'
                                                                )
                                                                {
                                                                    ordit.sdk.psbt.sign({
                                                                        seed: options.seed,
                                                                        base64: sado.result.psbt,
                                                                        network: options.network,
                                                                        tweaked: true
                                                                    },  function(signed_psbt)
                                                                    {
                                                                        if(signed_psbt.success)
                                                                        {
                                                                            ordit.sdk.txid.get({
                                                                                hex: signed_psbt.data.hex,
                                                                                network: options.network
                                                                            }, 
                                                                            function(relayed)
                                                                            {
                                                                                if(relayed.success)
                                                                                {
                                                                                    results.success = true;
                                                                                    results.message = 'TXID attached to data';
                                                                                    results.data = 
                                                                                    {
                                                                                        txid: relayed.data.txid
                                                                                    };
                                                                                    callback(results);
                                                                                }
                                                                                else
                                                                                {
                                                                                    results.message = 'Unable to relay commit';
                                                                                    callback(results);
                                                                                }
                                                                            });
                                                                        }
                                                                        else
                                                                        {
                                                                            results.message = signed_psbt.message;
                                                                            callback(results);
                                                                        }
                                                                    });
                                                                }
                                                                else
                                                                {
                                                                    results.message = 'Unable to construct PSBT';
                                                                    callback(results);
                                                                }
                                                            });
                                                        }
                                                    );
                                                }
                                                else
                                                {
                                                    results.message = sigs.message;
                                                    callback(results);
                                                }
                                            });
                                        }
                                        else
                                        {
                                            results.message = signed.message;
                                            callback(results);
                                        }
                                    });
                                }
                                else
                                {
                                    results.message = sell.message;
                                    callback(results);
                                }
                            });
                        }
                        else
                        {
                            var chain_code = new Buffer(32);
                            chain_code.fill(1);

                            var childNodeXOnlyPubkey = false;

                            try
                            {

                                var net_obj = ordit.sdk.network(options.network);
                                var keys = bip32ecc.fromPublicKey
                                (
                                    Buffer.from(w.data.keys[0].pub, 'hex'),
                                    chain_code,
                                    net_obj
                                );
                                childNodeXOnlyPubkey = keys.publicKey.slice(1, 33).toString('hex');
                                rpc_request.params.signature.pubkey = childNodeXOnlyPubkey;
                            }
                            catch(e){}
                            
                            var sig_request = 
                            {
                                jsonrpc: "2.0",
                                method: "CreateSignablePsbt",
                                params: 
                                {
                                    network: options.network,
                                    location: options.location,
                                    maker: w.data.addresses[0].address,
                                    pubkey: childNodeXOnlyPubkey
                                },
                                id: 0
                            };

                            ordit.sdk.api({
                                uri: 'sado/rpc',
                                url: 'https://api.sado.space/rpc',
                                data: sig_request,
                                network: options.network
                            }, function(sigs)
                            {
                                if(sigs.result && options.key)
                                {
                                    var psbt_to_sign = sigs.result;
                                    
                                    results.success = true;
                                    results.message = 'Unsigned unspendable PSBT attached to data';
                                    results.data = 
                                    {
                                        base64: psbt_to_sign,
                                        hex: Buffer.from(psbt_to_sign, 'base64').toString('hex')
                                    }
                                    callback(results);
                                }
                                else if(sigs.result)
                                {
                                    var psbt_to_sign = sigs.result;

                                    ordit.sdk.psbt.sign({
                                        seed: options.seed,
                                        hex: Buffer.from(psbt_to_sign, 'base64').toString('hex'),
                                        network: options.network,
                                        tweaked: true,
                                        extracted: false
                                    }, function(signed)
                                    {
                                        if(signed.success)
                                        {
                                            if(typeof signed.data.hex != 'undefined' && signed.data.hex)
                                            {
                                                rpc_request.params.signature.value = signed.data.hex;
                                            }
                                            else if(typeof signed.data.psbt == 'object' && typeof signed.data.psbt.base64 != 'undefined')
                                            {
                                                rpc_request.params.signature.value = signed.data.psbt.base64;
                                            }

                                            ordit.sdk.api({
                                                uri: 'sado/rpc',
                                                data: rpc_request,
                                                network: options.network
                                            }, function(sado)
                                            {
                                                if
                                                (
                                                    typeof sado.result != 'undefined'
                                                    && typeof sado.result.psbt != 'undefined'
                                                )
                                                {
                                                    ordit.sdk.psbt.sign({
                                                        seed: options.seed,
                                                        base64: sado.result.psbt,
                                                        network: options.network,
                                                        tweaked: true
                                                    },  function(signed_psbt)
                                                    {
                                                        if(signed_psbt.success)
                                                        {
                                                            ordit.sdk.txid.get({
                                                                hex: signed_psbt.data.hex,
                                                                network: options.network
                                                            }, 
                                                            function(relayed)
                                                            {
                                                                if(relayed.success)
                                                                {
                                                                    results.success = true;
                                                                    results.message = 'TXID attached to data';
                                                                    results.data = 
                                                                    {
                                                                        txid: relayed.data.txid
                                                                    };
                                                                    callback(results);
                                                                }
                                                                else
                                                                {
                                                                    results.message = 'Unable to relay commit';
                                                                    callback(results);
                                                                }
                                                            });
                                                        }
                                                        else
                                                        {
                                                            results.message = signed_psbt.message;
                                                            callback(results);
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    results.message = 'Unable to construct PSBT';
                                                    callback(results);
                                                }
                                            });
                                        }
                                        else
                                        {
                                            results.message = signed.message;
                                            callback(results);
                                        }
                                    });
                                }
                                else
                                {
                                    results.message = 'Unable to construct signature';
                                    callback(results);
                                }
                            });
                        }
                    }
                    else
                    {
                        results.message = w.message;
                        callback(results);
                    }
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        orderbook: function(params = {}, callback = false)
        {
            var options = 
            {
                network: 'testnet',
                only_instants: false,
                address: false // optional user address to filter by
            };
            var results = 
            {
                success: false,
                data: false,
                message: 'Invalid options for sado.orderbook'
            };
            Object.assign(options, params);
            if
            (
                options.network && typeof callback == 'function'
                && typeof ordit.sdk.config.apis[options.network] == 'object'
                && typeof ordit.sdk.config.apis[options.network].orderbook != 'undefined'
            )
            {
                results.message = 'No pending orders available';
                ordit.sdk.apis.orderbook({
                    address: ordit.sdk.config.apis[options.network].orderbook,
                    only_instants: options.only_instants,
                    network: options.network
                },  function(sado)
                {
                    var orders = false;
                    if
                    (
                        sado.success == true
                        && typeof sado.data == 'object'
                        && typeof sado.data.orders == 'object'
                    )
                    {
                        results.success = true;
                        results.message = 'Orders attached to data';
                        results.data = 
                        {
                            /*
                            analytics: sado.rdata.analytics,
                            collections: sado.rdata.collections,
                            completed: sado.rdata.completed,
                            rejected: sado.rdata.rejected,
                            */
                            collections: [],
                            pending:
                            {
                                orders: ordit.sdk.sado.filter(sado.data.orders, options.address)
                                //offers: ordit.sdk.sado.filter(sado.rdata.pending.offers, options.address)
                            }
                        };
                    }
                    callback(results);
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        }
    },
    tokens:
    {
        get: function(params = {}, callback = false)
        {
            var options = 
            {
                symbol: false, // MUST be 4 characters
                address: false, // optional for lookup
                network: 'testnet'
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for tokens.get',
                data: options
            };
            if
            (
                (
                options.address
                ||
                (options.symbol && options.symbol.length === 4)
                )
                && options.network
                &&
                (
                    options.network == 'mainnet'
                    || options.network == 'testnet'
                    || options.network == 'regtest'
                )
                && typeof callback == 'function'
            )
            {
                ordit.sdk.apis.brc20(options, function(brc20)
                {
                    callback(brc20);
                })
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },      
        deploy: function(params = {}, callback = false)
        {
            var options = 
            {
                symbol: false, // MUST be 4 characters
                supply: 0, // total supply available for minting
                limit: 0, // the maximum amount that can be minted at any one time
                decimals: 0, // optional decimal places used in display 
                network: 'testnet'
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for tokens.deploy',
                data: options
            };
            if
            (
                options.symbol && options.symbol.length === 4
                && parseInt(options.supply) > 0
                && parseInt(options.limit) > 0
                && parseInt(options.supply) >= parseInt(options.limit)
                && options.network
                &&
                (
                    options.network == 'mainnet'
                    || options.network == 'testnet'
                    || options.network == 'regtest'
                )
                && typeof callback == 'function'
            )
            {
                ordit.sdk.tokens.get({
                    symbol: options.symbol, 
                    network: options.network
                },  function(brc20)
                {
                    if(brc20.success)
                    {
                        results.message = 'Token already deployed';
                        callback(results);
                    }
                    else
                    {
                        var decimals = "0";
                        if(parseInt(options.decimals) > 0)
                        {
                            decimals = "" + parseInt(options.decimals);
                        }

                        var supply = 
                        {
                            p: "brc-20",
                            op: "deploy",
                            tick: "" + options.symbol,
                            max: "" + options.supply,
                            lim: "" + options.limit,
                            dec: decimals
                        }

                        var inscription_options = JSON.parse(JSON.stringify(options));
                        inscription_options.media_type = 'text/plain;charset=utf-8';
                        inscription_options.media_content = JSON.stringify(supply);

                        ordit.sdk.inscription.address(inscription_options,  function(commit)
                        {
                            if(commit.success)
                            {
                                commit.data.content = supply;
                                commit.data.media_content = inscription_options.media_content;
                                commit.data.media_type = inscription_options.media_type;
                            }
                            callback(commit);
                        })
                    }
                })
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        mint: function(params = {}, callback = false)
        {
            var options = 
            {
                symbol: false, // MUST be 4 characters
                amount: 0, // amount to mint
                network: 'testnet'
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for tokens.mint',
                data: options
            };
            if
            (
                options.symbol && options.symbol.length === 4
                && parseInt(options.amount) > 0
                && options.network
                &&
                (
                    options.network == 'mainnet'
                    || options.network == 'testnet'
                    || options.network == 'regtest'
                )
                && typeof callback == 'function'
            )
            {   
                ordit.sdk.tokens.get({
                    symbol: options.symbol, 
                    network: options.network
                },  function(brc20)
                {
                    if(brc20.success)
                    {
                        if
                        (
                            typeof brc20.data.amount == 'number'
                            && typeof brc20.data.max == 'number'
                            && brc20.data.amount < brc20.data.max
                        )
                        {
                            var supply = 
                            {
                                p: "brc-20",
                                op: "mint",
                                tick: options.symbol,
                                amt: "" + parseInt(options.amount)
                            }

                            var inscription_options = JSON.parse(JSON.stringify(options));
                            inscription_options.media_type = 'text/plain;charset=utf-8';
                            inscription_options.media_content = JSON.stringify(supply);

                            ordit.sdk.inscription.address(inscription_options,  function(commit)
                            {
                                if(commit.success)
                                {
                                    commit.data.media_type = 'text/plain;charset=utf-8';
                                    commit.data.media_content = inscription_options.media_content;
                                }
                                callback(commit);
                            })
                        }
                        else
                        {
                            results.message = 'Token mint max reached';
                            callback(results);
                        }
                    }
                    else
                    {
                        results.message = 'This token not deployed yet';
                        callback(results);
                    }
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        transfer: function(params = {}, callback = false)
        {
            var options = 
            {
                symbol: false, // MUST be 4 characters
                amount: 0, // the amount to prepare for transfer
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid options for tokens.transfer',
                data: false
            };
            Object.assign(options, params);
            if
            (
                options.symbol && options.symbol.length === 4
                && parseInt(options.amount) > 0
                && options.network
                &&
                (
                    options.network == 'mainnet'
                    || options.network == 'testnet'
                    || options.network == 'regtest'
                )
                && typeof callback == 'function'
            )
            {   
                ordit.sdk.tokens.get({
                    symbol: options.symbol, 
                    address: saline.db.wallet.addresses[0].address,
                    network: options.network
                },  function(brc20)
                {
                    if(brc20.success)
                    {
                        if
                        (
                            typeof brc20.data == 'object'
                            && brc20.data.length == 1
                            && typeof brc20.data[0] == 'object'
                            && typeof brc20.data[0].token == 'object'
                            && typeof brc20.data[0].token.amount == 'number'
                            && typeof brc20.data[0].token.max == 'number'
                            && parseInt(options.amount) <= brc20.data[0].available
                        )
                        {
                            var supply = 
                            {
                                p: "brc-20",
                                op: "transfer",
                                tick: options.symbol,
                                amt: "" + parseInt(options.amount)
                            }

                            var inscription_options = JSON.parse(JSON.stringify(options));
                            inscription_options.media_type = 'text/plain;charset=utf-8';
                            inscription_options.media_content = JSON.stringify(supply);

                            ordit.sdk.inscription.address(inscription_options,  function(commit)
                            {
                                if(commit.success && typeof commit.data == 'object')
                                {
                                    commit.data.media_type = inscription_options.media_type;
                                    commit.data.media_content = inscription_options.media_content;
                                }
                                callback(commit);
                            })
                        }
                        else
                        {
                            results.message = 'Invalid transfer token options';
                            callback(results);
                        }
                    }
                    else
                    {
                        results.message = brc20.message;
                        callback(results);
                    }
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        }
    },
    utils:
    {
        faucet: function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                destination: false,
                amount: 100000,
                network: 'testnet'
            };
            var results = 
            {
                success: false,
                message: 'Invalid options for utils.faucet',
                data: false
            };
            Object.assign(options, params);
            if
            (
                options.destination && options.network
            )
            {
                ordit.sdk.rpc({
                    method: 'Faucet.SendToAddress',
                    data: { 
                        address: options.destination,
                        value: options.amount
                    },
                    key: options.key,
                    network: options.network
                }, function(faucet)
                {
                    console.info('faucet', faucet);
                    if
                    (
                        typeof faucet.success != 'undefined'
                        && typeof faucet.rdata == 'object'
                        && faucet.success
                        && faucet.rdata.length > 0
                        
                    )
                    {
                        results.success = true;
                        results.message = 'Transaction ID attached to data';
                        results.data = 
                        {
                            txid: faucet.rdata[0]
                        }
                    }
                    else
                    {
                        if(typeof faucet.message != 'undefined')
                        {
                            results.message = faucet.message;
                        }
                        else
                        {
                            results.message = 'Invalid response for GenerateToAddress';
                        }
                    }
                    callback(results);
                });
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        float: function(num, dec)
        {
            var num_float = "" + parseFloat(num / (10 ** dec)).toFixed(dec) + "";
            var nums = num_float.split('.');
            var this_num = parseFloat(nums[0]).toLocaleString('en-GB');
            var display = "" + this_num;
            if(typeof nums[1] == 'string')
            {
                display+= '.' + nums[1];
            }
            return display;
        },
        getAddressesFromPublicKey: function(key, format, network)
        {
            var address = false;
            try
            {
                var net_obj = ordit.sdk.network(network);
                var chain_code = new Buffer(32);
                chain_code.fill(1);

                var keys = bip32ecc.fromPublicKey
                (
                    Buffer.from(key, 'hex'),
                    chain_code,
                    net_obj
                );
                var childNodeXOnlyPubkey = keys.publicKey.slice(1, 33);

                if(format == 'p2pkh')
                {
                    var p2pkh = btc.payments.p2pkh({ pubkey: keys.publicKey, network: net_obj });
                    address = p2pkh.address;
                }
                if(format == 'p2sh')
                {
                    var p2sh = btc.payments.p2sh({
                        redeem: btc.payments.p2wpkh({ pubkey: keys.publicKey, network: net_obj }),
                        network: net_obj
                    });
                    address = p2sh.address;
                }
                if(format == 'p2wpkh')
                {
                    var p2wpkh = btc.payments.p2wpkh({ pubkey: keys.publicKey, network: net_obj });
                    address = p2wpkh.address;
                }
                if(childNodeXOnlyPubkey && format == 'p2tr')
                {
                    var p2tr = btc.payments.p2tr({
                        internalPubkey: childNodeXOnlyPubkey,
                        network: net_obj
                    });
                    address = p2tr.address;
                }
            }
            catch(e){}
            return address;
        }
    }
};

})(typeof exports === 'undefined'? this['ordit']={}: exports);