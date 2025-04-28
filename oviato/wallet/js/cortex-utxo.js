/*

DEPENDENICES
    
-- ECC: https://github.com/sadoprotocol/cortex.io/blob/master/js/ecc.js
-- BIP32: https://github.com/sadoprotocol/cortex.io/blob/master/js/bip32.js
-- BUFFER: https://github.com/sadoprotocol/cortex.io/blob/master/js/buffer.js
-- BITCOINJS: https://github.com/sadoprotocol/cortex.io/blob/master/js/bitcoin.js


FAUCTES

-- BTC = https://bitcoinfaucet.uo1.net/
-- BTC = https://coinfaucet.eu/en/btc-testnet/
-- BTC = https://testnet-faucet.com/btc-testnet/
-- BTC = https://faucet.triangleplatform.com/bitcoin/testnet

-- LTC = https://testnet-faucet.com/ltc-testnet/
-- LTC = https://litecointf.salmen.website/

-- DOGE = https://testnet-faucet.com/doge-testnet/
-- DOGE = https://shibe.technology/
-- DOGE = https://faucet.triangleplatform.com/dogecoin/testnet

*/

btc.initEccLib(ecc); // bitcoinjs dependency requires ecc
var bip32ecc = bip32.BIP32Factory(ecc); // bip32 dependency requires ecc

cortex.utxo = 
{
    api:
    {
        balance: async function(params = {}, callback = false)
        {
            var options = 
            {
                address: false,
                network: 'testnet'
            };
            Object.assign(options, params);
            if
            (
                options.address && options.network
                && typeof cortex.config.currencies.utxo[options.network] == 'object'
                && typeof cortex.config.currencies.utxo[options.network].api != 'undefined'
                && cortex.config.currencies.utxo[options.network].api
                && typeof callback == 'function'
            )
            {
                var results =
                {
                    success: false,
                    message: 'Invalid network for getting UTXO balance',
                    data: false
                };
                var chain = cortex.utxo.network(options.network);
                var debug = false;

                if(chain)
                {
                    var symbol = false;
                    var utxo_api = false;
                    var api_token = false;
                    var endpoint = false;
                    var decimals = 1;
                    
                    try
                    {
                        symbol = cortex.config.currencies.utxo[options.network].api_symbol;
                        api_token = cortex.config.currencies.utxo[options.network].key;
                        
                        // SoChain
                        utxo_api = cortex.config.currencies.utxo[options.network].api;
                        utxo_api+= '/address_summary/' + symbol + '/' + options.address;
                        
                        // BLOCK(io)
                        //utxo_api+= '/get_address_balance?api_key=' + api_token + '&addresses=' + options.address;
                        
                        endpoint = 'https://corsproxy.io/?' + encodeURIComponent(utxo_api);
                        
                        decimals = cortex.config.currencies.utxo[options.network].decimals;
                    }
                    catch(e){}
                    
                    cortex.sdk.apis.rpc({
                        method: 'GET',
                        data: true,
                        key: api_token,
                        token: false,
                        endpoint: endpoint
                    },  function(balance)
                    {   
                        if
                        (
                            balance && typeof balance.status != 'undefined'
                            && typeof balance.data == 'object'
                            && balance.status == 'success'
                        )
                        {
                            var int = parseInt(parseFloat(balance.data.confirmed_balance) * (10 ** decimals));
                            results.success = true;
                            results.message = 'UTXO balance attached to data';
                            results.data = 
                            {
                                int: int,
                                str: cortex.utils.float(int, decimals),
                                tx_count: parseInt(balance.data.txs_total)
                            };
                        }
                        else
                        {
                            if(balance && typeof balance == 'object')
                            {
                                results.success = true;
                                results.message = 'UTXO balance attached to data';
                                results.data = 
                                {
                                    int: 0,
                                    str: parseFloat("0").toFixed(decimals),
                                    tx_count: 0
                                };
                            }
                        }
                        
                        callback(results);
                    })
                }
                else
                {
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        relay: async function(params = {}, callback = false)
        {
            var options = 
            {
                tx: false,
                network: false
            };
            Object.assign(options, params);
            var results =
            {
                success: false,
                message: 'Invalid options for relaying UTXO transaction',
                data: options
            };
            if
            (
                options.tx && options.network
                && typeof cortex.config.currencies.utxo[options.network] == 'object'
                && typeof cortex.config.currencies.utxo[options.network].api != 'undefined'
                && cortex.config.currencies.utxo[options.network].api
                && typeof callback == 'function'
            )
            {
                results.message = 'Invalid network for relaying UTXO transaction';
                
                var net = cortex.utxo.network(options.network);

                if
                (
                    net
                    && typeof cortex.config.currencies.utxo[options.network] == 'object'
                )
                {
                    var txid = false;
                    var api_token = false;
                    var utxo_api = false;
                    var endpoint = false;
                    var decimals = 0;
                    
                    try
                    {
                        var symbol = cortex.config.currencies.utxo[options.network].api_symbol;
                        api_token = cortex.config.currencies.utxo[options.network].key;
                        decimals = cortex.config.currencies.utxo[options.network].decimals;
                        
                        // SoChain
                        utxo_api = cortex.config.currencies.utxo[options.network].api;
                        utxo_api+= '/broadcast_transaction/' + symbol;
                        
                        endpoint = 'https://corsproxy.io/?' + encodeURIComponent(utxo_api);
                    }
                    catch(e){}
                    
                    cortex.sdk.apis.rpc({
                        method: 'POST',
                        data: true,
                        request: { tx_hex: options.tx },
                        key: api_token,
                        token: false,
                        endpoint: endpoint
                    },  function(relay)
                    {   
                        if(relay && typeof relay.data == 'object' && typeof relay.data.hash != 'undefined')
                        {
                            txid = relay.data.hash;
                        }
                        if(txid)
                        {
                            results.success = true;
                            results.message = 'UTXO transaction ID attached to data';
                            results.data = 
                            {
                                txid: txid
                            };
                        }
                        else
                        {
                            results.message = 'Unable to relay UTXO transaction';
                        }
                        callback(results);
                    });
                }
                else
                {
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        transaction: async function(params = {}, callback = false)
        {
            var options = 
            {
                txid: false,
                network: false
            };
            Object.assign(options, params);
            var results =
            {
                success: false,
                message: 'Invalid options for getting UTXO transaction',
                data: options
            };
            if
            (
                options.txid && options.network
                && typeof cortex.config.currencies.utxo[options.network] == 'object'
                && typeof cortex.config.currencies.utxo[options.network].api != 'undefined'
                && cortex.config.currencies.utxo[options.network].api
                && typeof callback == 'function'
            )
            {
                results.message = 'Invalid network for getting UTXO transaction';
                
                var net = cortex.utxo.network(options.network);

                if
                (
                    net
                    && typeof cortex.config.currencies.utxo[options.network] == 'object'
                )
                {
                    var tx = false;
                    var api_token = false;
                    var utxo_api = false;
                    var endpoint = false;
                    var decimals = 0;
                    
                    try
                    {
                        var symbol = cortex.config.currencies.utxo[options.network].api_symbol;
                        api_token = cortex.config.currencies.utxo[options.network].key;
                        decimals = cortex.config.currencies.utxo[options.network].decimals;
                        
                        // SoChain
                        utxo_api = cortex.config.currencies.utxo[options.network].api;
                        utxo_api+= '/transaction/' + symbol + '/' + options.txid;
                        
                        endpoint = 'https://corsproxy.io/?' + encodeURIComponent(utxo_api);
                    }
                    catch(e){}
                    
                    cortex.sdk.apis.rpc({
                        method: 'GET',
                        data: true,
                        key: api_token,
                        token: false,
                        endpoint: endpoint
                    },  function(transaction)
                    {   
                        if
                        (
                            transaction
                            && typeof transaction == 'object'
                            && typeof transaction.data == 'object'
                            && typeof transaction.data.outputs == 'object'
                            && transaction.data.outputs.length > 0
                        )
                        {
                            tx = transaction.data;
                        }
                        
                        if(typeof tx == 'object')
                        {
                            results.success = true;
                            results.message = 'UTXO transaction attached to data';
                            results.data = tx;
                        }
                        else
                        {
                            results.message = 'Unable to get UTXO transaction';
                        }
                        callback(results);
                    });
                }
                else
                {
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        unspents: async function(params = {}, callback = false)
        {
            var options = 
            {
                address: false,
                loop: true,
                network: false
            };
            Object.assign(options, params);
            var results =
            {
                success: false,
                message: 'Invalid options for getting UTXO unspents',
                data: options
            };
            if
            (
                options.address && options.network
                && typeof cortex.config.currencies.utxo[options.network] == 'object'
                && typeof cortex.config.currencies.utxo[options.network].api != 'undefined'
                && cortex.config.currencies.utxo[options.network].api
                && typeof callback == 'function'
            )
            {
                results.message = 'Invalid network for getting UTXO unspents';
                
                var net = cortex.utxo.network(options.network);

                if
                (
                    net
                    && typeof cortex.config.currencies.utxo[options.network] == 'object'
                )
                {
                    var unspents = false;
                    var api_token = false;
                    var utxo_api = false;
                    var endpoint = false;
                    var decimals = 0;
                    
                    try
                    {
                        var symbol = cortex.config.currencies.utxo[options.network].api_symbol;
                        api_token = cortex.config.currencies.utxo[options.network].key;
                        decimals = cortex.config.currencies.utxo[options.network].decimals;
                        
                        // SoChain
                        utxo_api = cortex.config.currencies.utxo[options.network].api;
                        utxo_api+= '/unspent_outputs/' + symbol + '/' + options.address;
                        
                        endpoint = 'https://corsproxy.io/?' + encodeURIComponent(utxo_api);
                    }
                    catch(e){}
                    
                    var looped_unspents = function(page = 1)
                    {
                        endpoint = 'https://corsproxy.io/?' + encodeURIComponent(utxo_api + '/' + page + '/');
                        cortex.sdk.apis.rpc({
                            method: 'GET',
                            data: true,
                            key: api_token,
                            token: false,
                            endpoint: endpoint
                        },  function(unspent)
                        {   
                            if
                            (
                                unspent
                                && typeof unspent == 'object'
                                && typeof unspent.data == 'object'
                                && typeof unspent.data.outputs == 'object'
                                && unspent.data.outputs.length > 0
                            )
                            {
                                if(typeof unspents != 'object')
                                {
                                    unspents = [];
                                }
                                for(out = 0; out < unspent.data.outputs.length; out++)
                                {
                                    var output = unspent.data.outputs[out];
                                    unspents.push(output);
                                }

                                if(!options.loop || (options.loop && unspent.data.outputs.length < 10))
                                {
                                    if(typeof unspents == 'object' && unspents.length > 0)
                                    {
                                        results.success = true;
                                        results.message = 'UTXO unspents attached to data';
                                        results.data = unspents;
                                    }
                                    else
                                    {
                                        results.message = 'Unable to get UTXO unspents';
                                    }
                                    callback(results);
                                }
                                else
                                {
                                    looped_unspents(page + 1);
                                }
                            }
                            else
                            {
                                if(typeof unspents == 'object' && unspents.length > 0)
                                {
                                    results.success = true;
                                    results.message = 'UTXO unspents attached to data';
                                    results.data = unspents;
                                }
                                else
                                {
                                    results.message = 'Unable to get UTXO unspents';
                                }
                                callback(results);
                            }
                        });
                    }
                    looped_unspents(1);
                }
                else
                {
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
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
        else if(network == 'testnet')
        {
            //net_word = 'bitcointestnet';
        }
        else if(network == 'bitcointestnet')
        {
            net_word = 'testnet';
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
                path: false,
                format: 'all',
                network: 'testnet',
                private: false
            };
            Object.assign(options, params);
            if
            (
                options.seed && options.network && options.format 
                && typeof callback == 'function'
            )
            {
                var results =
                {
                    success: false,
                    message: 'Invalid network for getting UTXO keys',
                    data: false
                };
                var net_obj = cortex.utxo.network(options.network);
                
                if(net_obj)
                {
                    var s = false;
                    var seeds = false;
                    var msg = false;

                    async function get_seed()
                    {
                        var hd_keys = await cortex.utils.keys
                        (
                            options.seed, 
                            options.network, 
                            options.path
                        );
                        
                        if(typeof hd_keys == 'object')
                        {
                            var keys = 
                            {
                                pub: Buffer.from(hd_keys.raw.publicKey).toString('hex')
                            }
                            
                            try
                            {
                                keys.xkey = hd_keys.raw.parent.publicKey.slice(1, 33);
                            }
                            catch(e){}
                            
                            if(!options.private)
                            {
                                keys.key = Buffer.from(hd_keys.raw.privateKey).toString('hex');
                                keys.words = hd_keys.words;
                            }

                            results.success = true;
                            results.message = 'UTXO keys attached to data';
                            results.data = keys;
                            callback(results);
                        }
                        else
                        {
                            results.message = 'Unable to construct UTXO seed';
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
        get: function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                seed: false,
                path: false,
                network: 'testnet',
                format: 'all',
                private: false
            };
            Object.assign(options, params);
            if
            (
                (options.seed || options.key) 
                && options.network && options.format 
                && typeof callback == 'function'
            )
            {
                var results =
                {
                    success: false,
                    message: 'Invalid network for getting UTXO address',
                    data: false
                };
                var net_obj = cortex.utxo.network(options.network);
                
                if(net_obj)
                {
                    var getAddresses = function(key, private = false, words = false)
                    {
                        console.log('key', key);
                        
                        var addresses = [];
                        var chain_code = new Buffer(32);
                        chain_code.fill(1);
                        
                        var childNodeXOnlyPubkey = false;
                        var address_obj = false;
                        var keys = false;

                        try
                        {
                            console.log('buff', Buffer.from(key, 'hex'))
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
                            console.info('utxo.addresses.get.error', e);
                            childNodeXOnlyPubkey = Buffer.from(key, 'hex');
                            keys = false;
                        }
                        
                        console.log('keys', keys);
                        
                        var error = false;
                        
                        if(keys && (options.format == 'all' || options.format == 'legacy') && cortex.utxo.addresses.supported(options.network, 'legacy'))
                        {
                            try
                            {
                                var p2pkh = btc.payments.p2pkh({ pubkey: keys.publicKey, network: net_obj });
                                address_obj = {
                                    address: p2pkh.address,
                                    short: cortex.utils.shorten(p2pkh.address),
                                    format: 'legacy',
                                    pub: keys.publicKey.toString('hex')
                                };
                            }
                            catch(e){ error = e }
                            
                            if(typeof address_obj == 'object')
                            {
                                if(!options.private)
                                {
                                    address_obj.key = private;
                                    address_obj.words = words;
                                }
                                addresses.push(address_obj);
                            }
                            
                            address_obj = false;
                        }
                        if(keys && (options.format == 'all' || options.format == 'segwit') && cortex.utxo.addresses.supported(options.network, 'segwit'))
                        {
                            try
                            {
                                var p2sh = btc.payments.p2sh({
                                    redeem: btc.payments.p2wpkh({ pubkey: keys.publicKey, network: net_obj }),
                                    network: net_obj
                                });
                                address_obj = {
                                    address: p2sh.address,
                                    short: cortex.utils.shorten(p2sh.address),
                                    format: 'segwit',
                                    pub: keys.publicKey.toString('hex')
                                };
                            }
                            catch(e){ error = e }
                            
                            if(typeof address_obj == 'object')
                            {
                                if(!options.private)
                                {
                                    address_obj.key = private;
                                    address_obj.words = words;
                                }
                                addresses.push(address_obj);
                            }
                            
                            address_obj = false;
                        }
                        if(keys && (options.format == 'all' || options.format == 'bech32') && cortex.utxo.addresses.supported(options.network, 'bech32'))
                        {
                            try
                            {
                                var p2wpkh = btc.payments.p2wpkh({ pubkey: keys.publicKey, network: net_obj });
                                address_obj = {
                                    address: p2wpkh.address,
                                    short: cortex.utils.shorten(p2wpkh.address),
                                    format: 'bech32',
                                    pub: keys.publicKey.toString('hex')
                                };
                            }
                            catch(e){ error = e }
                            
                            if(typeof address_obj == 'object')
                            {
                                if(!options.private)
                                {
                                    address_obj.key = private;
                                    address_obj.words = words;
                                }
                                addresses.push(address_obj);
                            }
                            
                            address_obj = false;
                        }
                        if(childNodeXOnlyPubkey && (options.format == 'all' || options.format == 'taproot') && cortex.utxo.addresses.supported(options.network, 'taproot'))
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
                                address_obj = {
                                    address: p2tr.address,
                                    short: cortex.utils.shorten(p2tr.address),
                                    xkey: childNodeXOnlyPubkey.toString('hex'),
                                    format: 'taproot',
                                    pub: pub
                                };
                            }
                            catch(e){ error = e; }
                            
                            if(typeof address_obj == 'object')
                            {
                                if(!options.private)
                                {
                                    address_obj.key = private;
                                    address_obj.words = words;
                                }
                                addresses.push(address_obj);
                            }
                            
                            address_obj = false;
                        }
                        if(keys && (options.format == 'all' || options.format == 'bitpay') && cortex.utxo.addresses.supported(options.network, 'bitpay'))
                        {
                            try
                            {
                                var p2sh = btc.payments.p2sh({
                                    redeem: btc.payments.p2wpkh({ pubkey: keys.publicKey, network: net_obj }),
                                    network: net_obj
                                });
                                var p2pkh = btc.payments.p2pkh({ pubkey: keys.publicKey, network: net_obj });
                                address_obj = {
                                    address: bchaddr.toBitpayAddress(p2sh.address),
                                    short: cortex.utils.shorten(bchaddr.toBitpayAddress(p2sh.address)),
                                    format: 'bitpay',
                                    pub: keys.publicKey.toString('hex')
                                };
                            }
                            catch(e){ error = e }
                            
                            if(typeof address_obj == 'object')
                            {
                                if(!options.private)
                                {
                                    address_obj.key = private;
                                    address_obj.words = words;
                                }
                                addresses.push(address_obj);
                            }
                            
                            address_obj = false;
                        }
                        if(keys && (options.format == 'all' || options.format == 'cashaddr') && cortex.utxo.addresses.supported(options.network, 'cashaddr'))
                        {
                            try
                            {
                                var p2pkh = btc.payments.p2pkh({ pubkey: keys.publicKey, network: net_obj });
                                address_obj = {
                                    address: bchaddr.toCashAddress(p2pkh.address),
                                    short: cortex.utils.shorten(bchaddr.toBitpayAddress(p2pkh.address)),
                                    format: 'cashaddr',
                                    pub: keys.publicKey.toString('hex')
                                };
                            }
                            catch(e){ error = e }
                            
                            if(typeof address_obj == 'object')
                            {
                                if(!options.private)
                                {
                                    address_obj.key = private;
                                    address_obj.words = words;
                                }
                                addresses.push(address_obj);
                            }
                            
                            address_obj = false;
                        }
                        
                        if(addresses.length > 0 && !error)
                        {
                            results.success = true;
                            results.message = 'UTXO addresses attached to data';
                            results.data = addresses;
                            callback(results);
                        }
                        else
                        {
                            results.message = 'Invalid UTXO address format';
                            if(error)
                            {
                                results.message+= ': ' + error;
                            }
                            callback(results);
                        }
                    }
                    
                    console.log('utxo.options', options);
                    
                    if(options.seed)
                    {
                        cortex.utxo.keys.get(options, function(k)
                        {
                            if(k.success)
                            {
                                if(options.private)
                                {
                                    getAddresses(k.data.pub);
                                }
                                else
                                {
                                    getAddresses(k.data.pub, k.data.key, k.data.words);
                                }
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
        },
        supported: function(network = false, format = false)
        {
            var supported = false;
            if
            (
                typeof cortex.config.currencies.utxo[network] == 'object'
                && typeof cortex.config.currencies.utxo[network].formats == 'object'
                && cortex.config.currencies.utxo[network].formats.length > 0
            )
            for(f = 0; f < cortex.config.currencies.utxo[network].formats.length; f++)
            {
                var type = cortex.config.currencies.utxo[network].formats[f];
                if(format && type == format)
                {
                    supported = true;
                }
            }
            return supported;
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
                path: false,
                network: 'testnet',
                format: 'all',
                private: false
            };
            Object.assign(options, params);
            
            console.log('options', options);
            
            if
            (
                (options.seed || options.key) 
                && options.network && options.format 
                && typeof callback == 'function'

                // be sure only one of the four inputs is used ...
                
                && ! (options.seed && options.key) 
            )
            {
                var results =
                {
                    success: false,
                    message: 'Unable to get UTXO addresses',
                    data: false
                };
                
                var get_addresses = function(opt, keys, specified_address = false)
                {
                    cortex.utxo.addresses.get(opt, function(a)
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
                            results.message = 'UTXO wallet attached to data';
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
                if(options.seed)
                {
                    cortex.utxo.keys.get(options, function(k)
                    {
                        if(k.success)
                        {
                            var keys = k.data;
                            get_addresses(options, [keys]);
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
                    message: 'Invalid options for utxo.wallet.get function',
                    data: false
                })
            }
        }
    },
    prepare:
    {
        bump: async function(params = {}, callback = false)
        {
            var options = 
            {
                txid: false,
                network: false,
                format: false,
                script: false,
                key: false,
                sats: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.prepare.bump',
                data: options
            }
            
            if
            (
                options.txid
                && options.key
                && options.sats
                && options.format
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {  
                // Get current TX
                var currency = cortex.config.currencies.utxo[options.network];
                var network = cortex.utxo.network(options.network);
                var units = currency.smallest;
                var address = await cortex.sdk.utils('utxo', 'key_to_address', {
                    key: options.key,
                    format: options.format,
                    network: options.network
                });
                
                var transaction = await cortex.sdk.api('utxo', 'transaction', {
                    txid: options.txid,
                    network: options.network
                });
                
                var potential_destination = false;
                
                var got_change = 0;
                var inputs = [];
                var change_outs = [];
                var non_change_outs = [];
                var potential_amount = 0;
                
                if(!address || typeof address.address == 'undefined')
                {
                    results.message = address;
                }
                else if(!transaction || typeof transaction.hash == 'undefined')
                {
                    results.message = transaction;
                }
                else if
                (
                    transaction 
                    && typeof transaction.confirmations != 'undefined'
                    && transaction.confirmations
                    && parseInt(transaction.confirmations) > 0
                )
                {
                    results.message = 'This transaction has already been confirmed';
                }
                else if
                (
                    transaction 
                    && typeof transaction.outputs == 'object'
                    && transaction.outputs.length > 0
                )
                {
                    var script_type = 'scripthash';
                    if(options.format == 'bech32')
                    {
                        script_type = 'witness_v0_keyhash';
                    }
                    else if(options.format == 'taproot')
                    {
                        script_type = 'witness_v1_taproot';
                    }
                    for(i = 0; i < transaction.inputs.length; i++)
                    {
                        inputs.push({
                            index: transaction.inputs[i].previous_output.index,
                            hash: transaction.inputs[i].previous_output.hash,
                            script: transaction.inputs[i].scriptSig.asm,
                            script_type: script_type,
                            value: transaction.inputs[i].value,
                            sats: BigNumber(transaction.inputs[i].value).multipliedBy(10 ** 8).toNumber(),
                            block: true, // override check
                            tx_hex: false // will break pubkeyhash and some scripthash ?
                        });
                    }
                    
                    for(out = 0; out < transaction.outputs.length; out++)
                    {
                        var int = BigNumber(transaction.outputs[out].value).multipliedBy(10 ** 8).toNumber();
                        if(transaction.outputs[out].address == address.address)
                        {
                            got_change = BigNumber(got_change).plus(int);
                            change_outs.push(transaction.outputs[out]);
                        }
                        else
                        {
                            if(!potential_destination)
                            {
                                potential_destination = transaction.outputs[out].address;
                                potential_amount = int;
                            }
                            non_change_outs.push(transaction.outputs[out]);
                        }
                    }
                    got_change = BigNumber(got_change).toNumber();


                    if(options.format != 'taproot' && options.format != 'bech32' && options.format != 'segwit')
                    {
                        results.message = 'Bump does not support the ' + options.format + ' format';
                    }
                    else if(!got_change)
                    {
                        results.message = 'This transaction does not have change available for bumping';
                    }
                    else if(got_change && got_change < options.sats)
                    {
                        results.message = 'This transaction only has ' + got_change + ' ' + units + ' to use internally for bumping';
                    }
                    else
                    {   
                        var prepared = await cortex.sdk.prepare('utxo', 'send',
                        {
                            key: options.key,
                            address: address.address,
                            destination: potential_destination,
                            amount: potential_amount,
                            network: options.network,
                            script: options.script,
                            format: options.format,
                            unspents: inputs,
                            change: got_change - options.sats
                        });

                        if(prepared && typeof prepared.hex != 'undefined')
                        {
                            results.success = true;
                            results.message = 'Unsigned PSBT HEX for bump attached to data';
                            results.data = 
                            {
                                hex: prepared.hex
                            }
                        }
                        else
                        {
                            results.message = prepared;
                        }
                    }
                }
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        multisig: async function(params = {}, callback = false)
        {
            var options = 
            {
                from: false,
                destination: false,
                amount: false,
                network: false,
                format: false,
                script: false,
                key: false, // private key
                fees: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.prepare.multisig',
                data: options
            }
            
            // TODO - validate if from is part of addresses?
            
            var valid_address = false;
            try
            {
                valid_address = btc.address.toOutputScript
                (
                    options.destination, 
                    cortex.utxo.network(options.network)
                );
            }
            catch(e){}

            if
            (
                options.from
                && options.key
                && options.fees
                && options.format
                && options.script
                && parseInt(options.amount) > 0
                && cortex.utxo.network(options.network)
                && valid_address
                && typeof callback == 'function'
            )
            {   
                var wallet = await cortex.sdk.multisig('utxo', 'validate', {
                    address: options.from,
                    script: options.script,
                    format: options.format,
                    network: options.network
                }).catch(error => wallet = error);
                
                console.log('wallet', wallet);
                
                if(typeof wallet == 'object')
                {
                    var network = cortex.utxo.network(options.network);
                    var chain_code = new Buffer(32);
                    chain_code.fill(1);
                    
                    var root = await bip32ecc.fromPrivateKey
                    (
                        Buffer.from(options.key, 'hex'),
                        chain_code,
                        network
                    );  
                    var public_key = Buffer.from(root.publicKey).toString('hex');
                    
                    var tx = await cortex.sdk.prepare('utxo', 'send',
                    {
                        destination: options.destination,
                        amount: options.amount,
                        network: options.network,
                        format: options.format,
                        address: wallet.address,
                        script: options.script,
                        fees: 'auto'
                    });
                    
                    if(typeof tx == 'object')
                    {       
                        var signature = await cortex.sdk.sign('utxo', 'transaction',
                        {
                            tx: tx.hex,
                            network: options.network,
                            format: options.format,
                            key: options.key,
                            multisig: true
                        }).catch(error => signature = error);

                        if(typeof signature == 'object' && typeof signature.hex != 'undefined')
                        {
                            results.success = true;
                            results.message = 'UTXO multisig hex attached to data?';
                            results.data = 
                            {
                                hex: signature.hex
                            }
                        }
                        else if(typeof signature == 'object' && typeof signature.psbt != 'undefined')
                        {
                            results.success = true;
                            results.message = 'UTXO multisig PSBT attached to data?';
                            results.data = 
                            {
                                psbt: signature.psbt
                            }
                        }
                        else
                        {
                            results.message = signature;
                        }
                        callback(results);
                    }
                }
                else
                {
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        send: async function(params = {}, callback = false)
        {
            var options = 
            {
                destination: false,
                amount: false,
                network: false,
                format: false,
                key: false,
                address: false,
                script: false,
                rbf: true, 
                mpc: false,
                signature: false,
                unspents: false, // optional array of predefined inputs
                memo: false, // optional on-chain message to include
                gas_key: false, // optional pubkey for gas station 
                fees: false,
                change: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.prepare.send',
                data: options
            }
            
            var valid_address = false;
            try
            {
                valid_address = btc.address.toOutputScript
                (
                    options.destination, 
                    cortex.utxo.network(options.network)
                );
            }
            catch(e){}
            
            if(options.gas_key && typeof options.gas_key != 'string')
            {
                try
                {
                    options.gas_key = cortex.config.currencies.utxo[options.network].station.pub;
                }
                catch(e)
                {
                    valid_address = false;
                }
            }
            
            if
            (
                valid_address
                && 
                (
                    options.key
                    || options.address
                )
                && 
                (
                    options.fees
                    || options.change
                )
                && options.format
                && parseInt(options.amount) > 0
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {   
                var address = false;
                var gas_address = false;
                var gas_inputs = false;
                var gas_unspents = false;
                
                if(options.mpc == 'ecdsa-tss')
                {
                    var pk_address = await cortex.sdk.utils('utxo', 'key_to_address', 
                    {
                        key: options.key,
                        format: 'segwit',
                        mpc: 'ecdsa-tss',
                        network: options.network
                    });
                    if(typeof pk_address == 'object')
                    {
                        options.key = '04' + JSON.parse(JSON.stringify(options.key));
                        address = pk_address.address;
                    }
                }
                else if(options.address)
                {
                    address = options.address;
                }
                else
                {
                    var address_options = 
                    {
                        key: options.key,
                        currencies: [
                        {
                            type: 'utxo',
                            format: options.format,
                            networks: [ options.network ]
                        }]
                    }

                    var addresses = await cortex.sdk.get('addresses', address_options);
                    address = addresses[0].account.address;
                }
                
                if(options.gas_key)
                {
                    
                    var gas_addressed = 
                    {
                        key: options.gas_key,
                        currencies: [
                        {
                            type: 'utxo',
                            format: options.format,
                            networks: [ options.network ]
                        }]
                    }

                    var gas_addresses = await cortex.sdk.get('addresses', gas_addressed);
                    gas_address = gas_addresses[0].account.address;
                    
                    var unspent_gas_options = 
                    {
                        address: gas_address,
                        network: options.network
                    };
                    var gased_unspents = await cortex.sdk.api('utxo', 'unspents', unspent_gas_options);
                    if(gased_unspents && typeof gased_unspents == 'object' && gased_unspents.length > 0)
                    {
                        gas_unspents = gased_unspents;
                    }
                }
                
                var unspent_options = 
                {
                    address: address,
                    network: options.network
                };
                
                var unspents = false;
                
                if(typeof options.unspents == 'object')
                {
                    unspents = options.unspents;
                }
                else
                {
                    unspents = await cortex.sdk.api('utxo', 'unspents', unspent_options);
                }
                
                var sats_per_vbyte = cortex.config.currencies.utxo[options.network].fees.default.rate;
                
                if(options.fees === 'none')
                {
                    sats_per_vbyte = 0;
                }
                else if(options.fees === 'auto')
                {
                    try
                    {
                        // TODO - get recent sats per vbyte
                    }
                    catch(e){}
                }
                else if(options.fees && parseInt(options.fees) > 0)
                {
                    sats_per_vbyte = parseInt(options.fees);
                }
                
                if(options.format == 'taproot')
                {
                    try
                    {
                        var variables = JSON.parse(
                            Buffer.from(options.script, 'hex').toString('utf8')
                        );
                        options.key = variables.key;
                    }
                    catch(e){}
                }

                if(typeof unspents == 'object' && unspents.length > 0)
                {
                    var net = cortex.utxo.network(options.network);
                    
                    var psbt = new btc.Psbt({network: net});
                    
                    var fees = 0;
                    var change = -1;
                    var gas_change = -1;
                    var dust = 600;
                    var amount_used = 0;
                    var change_index = 0;
                    var inputs = [];
                    var error = false;
                    var vin_vout = {
                        ins: {},
                        outs: {}
                    };
                    
                    psbt.addOutput({ 
                        address: options.destination, 
                        value: parseInt(options.amount)
                    });
                    var script = btc.address.toOutputScript(options.destination, net).toString('hex');
                    var out_type = cortex.utxo.utils.script(script);
                    vin_vout.outs[out_type] = 1;
                    
                    if(options.gas_key)
                    {
                        for(u = 0; u < unspents.length; u++)
                        {
                            if(amount_used < parseInt(options.amount) && unspents[u].block)
                            {
                                if(!unspents[u].script_type)
                                {
                                    unspents[u].script_type = cortex.utxo.utils.script(unspents[u].script);
                                }
                                unspents[u].sats = BigNumber(unspents[u].value).multipliedBy(10 ** 8).toNumber();
                                console.log('options', options);
                                unspents[u].pub = options.key;
                                amount_used+= unspents[u].sats;
                                inputs.push(unspents[u]);
                            }
                        }
                        change = amount_used - parseInt(options.amount);
                        
                        var gas_used = 0;
                        gas_inputs = [];
                        for(g = 0; g < gas_unspents.length; g++)
                        {
                            fees = JSON.parse(JSON.stringify((80 + ((inputs.length + 1) * 180)) * sats_per_vbyte));
                            if(gas_used < fees && gas_unspents[g].block)
                            {
                                if(!gas_unspents[g].script_type)
                                {
                                    gas_unspents[g].script_type = cortex.utxo.utils.script(gas_unspents[g].script);
                                }
                                gas_unspents[g].sats = BigNumber(gas_unspents[g].value).multipliedBy(10 ** 8).toNumber();
                                gas_unspents[g].pub = options.gas_key;
                                gas_used+= gas_unspents[g].sats;
                                gas_inputs.push(gas_unspents[g]);
                                inputs.push(gas_unspents[g]);
                            }
                        }
                        gas_change = gas_used - fees;
                        if(gas_change < 0)
                        {
                            change = -1;
                        }
                    }
                    else
                    {
                        for(u = 0; u < unspents.length; u++)
                        {
                            fees = JSON.parse(JSON.stringify((80 + ((u + 1) * 180)) * sats_per_vbyte));
                            if
                            (
                                amount_used < (parseInt(options.amount) + fees)
                                && unspents[u].block
                            )
                            {
                                if(!unspents[u].script_type)
                                {
                                    unspents[u].script_type = cortex.utxo.utils.script(unspents[u].script);
                                }
                                unspents[u].sats = BigNumber(unspents[u].value).multipliedBy(10 ** 8).toNumber();
                                console.log('options', options);
                                unspents[u].pub = options.key;
                                amount_used+= unspents[u].sats;
                                inputs.push(unspents[u]);
                            }
                        }
                        change = amount_used - (parseInt(options.amount) + fees);
                    }
                    
                    console.log('change', change);
                    
                    if(change >= 0)
                    {
                        for(i = 0; i < inputs.length; i++)
                        {
                            var supported = false;
                            var input_address = false;
                            var spendable = inputs[i];
                            
                            if(inputs[i].script_type == 'witness_v1_taproot')
                            {
                                if(typeof spendable.pub == 'undefined')
                                {
                                    spendable.pub = //'f345068e88471ef19b3181c800e139152148c580c74e2c2a20400a5ec142b4fa';
                                    spendable.pub = '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0';
                                }
                                console.log('spendable', spendable);
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
                                            net
                                        );
                                        childNodeXOnlyPubkey = pkey.publicKey.slice(1, 33);
                                    }
                                    catch(e)
                                    {
                                        childNodeXOnlyPubkey = Buffer.from(spendable.pub, 'hex');
                                    }

                                    var p2tr = btc.payments.p2tr({
                                        internalPubkey: childNodeXOnlyPubkey,
                                        network: net
                                    });
                                    console.log('p2tr?', p2tr);
                                    input_address = p2tr.address;
                                    
                                    var this_input = 
                                    {
                                        hash: spendable.hash,
                                        index: parseInt(spendable.index),
                                        tapInternalKey: childNodeXOnlyPubkey,
                                        witnessUtxo:
                                        {
                                            //script: p2tr.output, 
                                            script: Buffer.from('50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0', 'hex'), 
                                            value: parseInt(spendable.sats)
                                        }
                                    }
                                    
                                    // potential tapleaf?
                                    options.something = '20d4021a4d9fe05e3b68182d625a88e2e652993143a0a3fa51eab54f0b7b935427ac';
                                    
                                    options.something = false;
                                    
                                    if(options.something)
                                    {
                                        var redeem_script = {
                                            output: Buffer.from(options.something, 'hex'),
                                            redeemVersion: 192,
                                        };
                                        var tapin = btc.payments.p2tr({
                                            internalPubkey: childNodeXOnlyPubkey,
                                            scriptTree: [
                                                {
                                                    output: Buffer.from('20fc7c767ccde11c32b0154ad30c4d9954125cb7fa11c68afde41dd33963736291ac', 'hex')
                                                },
                                                {
                                                    output: Buffer.from('20d4021a4d9fe05e3b68182d625a88e2e652993143a0a3fa51eab54f0b7b935427ac', 'hex')
                                                },
                                                {
                                                    output: Buffer.from('2066923d56c595b120d24370f85811049d98802547e460a8d8aaeb687119893b0cac', 'hex')
                                                }
                                            ],
                                            redeem: redeem_script,
                                            network: net
                                        });
                                        console.log('tapin', tapin);
                                        this_input.tapLeafScript = 
                                        [{
                                            leafVersion: redeem_script.redeemVersion,
                                            script: redeem_script.output,
                                            controlBlock: tapin.witness[tapin.witness.length - 1]
                                        }]
                                    }
                                    
                                    psbt.addInput(this_input); 
                                    
                                    if(options.rbf === true)
                                    {
                                        psbt.setInputSequence(i, 0xfffffffd); 
                                    }
                                    supported = true;
                                }
                                catch(e){ error = e }
                            }
                            else if(inputs[i].script_type == 'witness_v0_keyhash')
                            {
                                try
                                {
                                    var p = btc.payments.p2wpkh({ 
                                        pubkey: Buffer.from(spendable.pub, 'hex'), 
                                        network: net
                                    });
                                    input_address = p.address;
                                    psbt.addInput({
                                        hash: spendable.hash,
                                        index: parseInt(spendable.index),
                                        witnessUtxo:
                                        {
                                            script: p.output, 
                                            value: parseInt(spendable.sats)
                                        }
                                    }); 
                                    if(options.rbf === true)
                                    {
                                        psbt.setInputSequence(i, 0xfffffffd); 
                                    }
                                    supported = true;
                                }
                                catch(e){ error = e }
                            }
                            else if
                            (
                                inputs[i].script_type == 'witness_v0_scripthash' 
                                && options.address 
                                && options.script
                            )
                            {
                                try
                                {
                                    input_address = options.address;
                                    psbt.addInput({
                                        hash: spendable.hash,
                                        index: parseInt(spendable.index),
                                        witnessUtxo:
                                        {
                                            script: Buffer.from(spendable.script, 'hex'), 
                                            value: parseInt(spendable.sats)
                                        },
                                        witnessScript: Buffer.from(options.script, 'hex')
                                    }); 
                                    if(options.rbf === true)
                                    {
                                        psbt.setInputSequence(i, 0xfffffffd); 
                                    }
                                    supported = true;
                                }
                                catch(e){ error = e }
                            }
                            else if(inputs[i].script_type == 'scripthash')
                            {
                                try
                                {
                                    var p2sh = false;
                                    var redeem = false;
                                    var script = false;
                                    if(spendable.pub)
                                    {
                                        console.log('THIS.spendable', spendable);
                                        
                                        p2sh = btc.payments.p2sh({
                                          redeem: btc.payments.p2wpkh({ // for regular TXs?
                                          //redeem: btc.payments.p2pkh({ // for segwit ecdsa-tss
                                              pubkey: Buffer.from(spendable.pub, 'hex'),
                                              network: net 
                                          }),
                                          network: net
                                        });
                                        redeem = p2sh.redeem.output;
                                        script = p2sh.output;
                                        input_address = p2sh.address;
                                        
                                        psbt.addInput({
                                            hash: spendable.hash,
                                            index: parseInt(spendable.index),
                                            redeemScript: redeem,
                                            witnessUtxo:
                                            {
                                                script: script, 
                                                value: parseInt(spendable.sats)
                                            }
                                        }); 
                                        if(options.rbf === true)
                                        {
                                            psbt.setInputSequence(i, 0xfffffffd); 
                                        }
                                    }
                                    else if(options.script && options.address)
                                    {
                                        script = Buffer.from(spendable.script, 'hex');
                                        redeem = Buffer.from(options.script, 'hex');
                                        
                                        input_address = options.address;
                                        
                                        if(options.format == 'segwit')
                                        {
                                            var validated = await cortex.sdk.multisig('utxo', 'validate', {
                                                address: input_address,
                                                script: options.script,
                                                format: options.format,
                                                network: options.network
                                            });
                                            var buffered_keys = [];
                                            for(tk = 0; tk < validated.keys.length; tk++)
                                            {
                                                buffered_keys.push(Buffer.from(validated.keys[tk], 'hex'));
                                            }
                                            var redeem_script = btc.payments.p2ms({ 
                                                m: validated.threshold, 
                                                pubkeys: buffered_keys,
                                                network: net
                                            });
                                            var this_address_obj = btc.payments.p2sh({
                                                redeem: btc.payments.p2wsh({
                                                    redeem: redeem_script
                                                })
                                            });
                                            var script_redeem = this_address_obj.redeem.output;

                                            psbt.addInput({
                                                hash: spendable.hash,
                                                index: parseInt(spendable.index),
                                                redeemScript: script_redeem,
                                                witnessScript: redeem,
                                                nonWitnessUtxo: Buffer.from(spendable.tx_hex, 'hex')
                                            }); 
                                            if(options.rbf === true)
                                            {
                                                psbt.setInputSequence(i, 0xfffffffd); 
                                            }
                                        }
                                        else
                                        {
                                            psbt.addInput({
                                                hash: spendable.hash,
                                                index: parseInt(spendable.index),
                                                redeemScript: redeem,
                                                nonWitnessUtxo: Buffer.from(spendable.tx_hex, 'hex')
                                            }); 
                                            if(options.rbf === true)
                                            {
                                                psbt.setInputSequence(i, 0xfffffffd); 
                                            }
                                        }
                                    }
                                    supported = true;
                                }
                                catch(e){ error = e }
                            }
                            else if(inputs[i].script_type == 'pubkeyhash')
                            {
                                try
                                {
                                    var p2pkh = btc.payments.p2pkh({ 
                                        pubkey: Buffer.from(spendable.pub, 'hex'), 
                                        network: net 
                                    });
                                    input_address = p2pkh.address;
                                    psbt.addInput({
                                        hash: spendable.hash,
                                        index: parseInt(spendable.index),
                                        nonWitnessUtxo: Buffer.from(spendable.tx_hex, 'hex')
                                    });
                                    if(options.rbf === true)
                                    {
                                        psbt.setInputSequence(i, 0xfffffffd); 
                                    }
                                    supported = true;
                                }
                                catch(e){ error = e; }
                            }
                            if(supported)
                            {
                                var in_script = btc.address.toOutputScript(input_address, net).toString('hex');
                                var in_type = cortex.utxo.utils.script(in_script);
                                if(typeof vin_vout.ins[in_type] == 'undefined')
                                {
                                    vin_vout.ins[in_type] = 0;
                                }
                                vin_vout.ins[in_type]++;
                            }
                            else if(!supported && !error)
                            {
                                error = inputs[i].script_type + ' is an unsupported script type';
                            }
                        }
                        
                        if(!error)
                        {
                            // CHECK FEES / LAST
                            
                            var extra_weight = 0;
                            
                            if(options.memo)
                            {
                                var memo = Buffer.from(options.memo, 'utf8');
                                var embed = btc.payments.embed({ data: [memo] });
                                psbt.addOutput({
                                    script: embed.output, 
                                    value: 0
                                });
                                change_index++;
                                extra_weight+= (11 + memo.length) * 4;
                            }

                            if(change >= dust && sats_per_vbyte > 0)
                            {
                                var out_script = btc.address.toOutputScript(
                                    unspent_options.address, 
                                    net
                                ).toString('hex');
                                var output_type = cortex.utxo.utils.script(out_script);
                                
                                if(typeof vin_vout.outs[output_type] == 'undefined')
                                {
                                    vin_vout.outs[output_type] = 0;
                                }
                                vin_vout.outs[output_type]++;
                                
                                psbt.addOutput({ 
                                    address: unspent_options.address, 
                                    value: change
                                });
                                change_index++;

                                if(options.gas_key && gas_change >= dust)
                                {
                                    var change_script = btc.address.toOutputScript(
                                        unspent_options.address, 
                                        net
                                    ).toString('hex');
                                    var change_type = cortex.utxo.utils.script(change_script);

                                    if(typeof vin_vout.outs[change_type] == 'undefined')
                                    {
                                        vin_vout.outs[change_type] = 0;
                                    }
                                    vin_vout.outs[change_type]++;

                                    psbt.addOutput({ 
                                        address: gas_address, 
                                        value: gas_change
                                    });
                                    change_index++;
                                }

                                var vsize = cortex.utxo.utils.vsize(vin_vout, options.network, extra_weight);
                                var real_fees = vsize * sats_per_vbyte;
                                var overpaid = fees - real_fees;

                                var this_change_address = unspent_options.address;

                                var new_change = change + overpaid;
                                if(options.gas_key && gas_change >= dust)
                                {
                                    new_change = gas_change + overpaid;
                                    this_change_address = gas_address;
                                }

                                if(options.change)
                                {
                                    new_change = options.change;
                                }

                                var updated = psbt.updateOutput(change_index, {
                                    address: this_change_address, 
                                    value: new_change
                                });

                                psbt.data.globalMap.unsignedTx.tx.outs[change_index].value = new_change;
                            }
                            
                            // UPDATE INPUTS BASED ON REAL FEES ...???

                            results.success = true;
                            results.message = 'Unsigned UTXO transaction attached to data';
                            results.data =
                            {
                                hex: psbt.toHex()
                            }
                            
                            options.mpc = 'ecdsa-tss';
                            options.mpc = false;
                            console.log('options', options);
                            
                            if(options.mpc == 'ecdsa-tss' && options.signature)
                            {
                                var signer = 
                                {
                                    network: net,
                                    publicKey: Buffer.from(options.key, 'hex'),
                                    sign: ($hash) => 
                                    {
                                        return Buffer.from(options.signature, 'hex');
                                    }
                                };
                                psbt.signInput(0, signer);
                                var final_hex = psbt.finalizeAllInputs().extractTransaction().toHex();;
                                results.data.hex = final_hex;
                            }
                            else if(options.mpc == 'ecdsa-tss')
                            {
                                var signer = 
                                {
                                    network: net,
                                    publicKey: Buffer.from(options.key, 'hex'),
                                    sign: ($hash) => 
                                    {
                                        results.data.hex = Buffer.from($hash).toString('hex');
                                        console.info('signer.$hash', results.data.hex);
                                        return false;
                                    }
                                };
                                try
                                {
                                    //psbt.signInput(0, signer);
                                    console.log('psbt', psbt);
                                    var tapLeaf = Buffer.from('20d4021a4d9fe05e3b68182d625a88e2e652993143a0a3fa51eab54f0b7b935427ac', 'hex');
                                    psbt.signTaprootInput(0, signer, tapLeaf);
                                }
                                catch(e){ console.info('signer.e', e)}
                            }

                            callback(results);
                        }
                        else
                        {
                            results.message = error;
                            callback(results);
                        }
                    }
                    else
                    {
                        results.message = 'Insufficent funds for transfer';
                        callback(results);
                    }
                }
                else
                {
                    results.message = 'No unspents available';
                    if(typeof unspents == 'string') results.message+= ': ' + unspents;
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        }
    },
    sign:
    {
        message: async function(params = {}, callback = false)
        {
            var options = 
            {
                message: false,
                network: false,
                key: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.sign.message',
                data: options
            }            
            if
            (
                options.message
                && options.key
                && cortex.utxo.network(options.network)
                && typeof options.message == 'string'
                && typeof callback == 'function'
            )
            {
                results.message = 'Unable to sign UTXO message';
                
                var signature = false;
                
                try
                {
                    var net = cortex.utxo.network(options.network);
                    var chain_code = new Buffer(32);
                    chain_code.fill(1);
                    
                    var keys = bip32ecc.fromPrivateKey(Buffer.from(options.key, 'hex'), chain_code, net);
                    var signatures = bitcoinjsMessage.sign
                    (
                        options.message,
                        keys.privateKey,
                        keys.compressed,
                        net.messagePrefix
                    );
                    signature = Buffer.from(signatures).toString('base64');
                }
                catch(e){ console.info('utxo.sign.message.e', e) }
                
                if(signature)
                {
                    results.success = true;
                    results.message = 'Signed UTXO message attached to data';
                    results.data = 
                    {
                        hex: signature
                    };
                }
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        transaction: async function(params = {}, callback = false)
        {
            var options = 
            {
                tx: false,
                network: false,
                key: false,
                gas_key: false, // optional privkey for gas station
                sighashType: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.sign.transaction',
                data: options
            }
            
            if(options.gas_key && typeof options.gas_key != 'string')
            {
                try
                {
                    options.gas_key = cortex.config.currencies.utxo[options.network].station.priv;
                }
                catch(e)
                {
                    options.key = false;
                }
            }
            
            if
            (
                options.tx
                && options.key
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {
                var psbt = false;
                var signed_tx = false;
                var net = cortex.utxo.network(options.network);
                
                console.log('psbt.hex', options.tx);
                
                try
                {
                    psbt = btc.Psbt.fromHex(options.tx, { network: net});
                }
                catch(e){ console.info('psbt.e', e) }
                
                if(psbt)
                {
                    var rawTX = btc.Transaction.fromHex(Buffer.from(psbt.data.getTransaction()).toString('hex'));
                    
                    console.log('rawTX', rawTX);
                    
                    var cust = async function
                    (
                        inputIndex,
                        input,
                        script,
                        isSegwit,
                        isP2SH,
                        isP2WSH
                    )
                    {
                        console.log('inputIndex', inputIndex);
                        console.log('input', input);
                        console.log('script', script);
                        console.log('isSegwit', isSegwit);
                        console.log('isP2SH', isP2SH);
                        console.log('isP2WSH', isP2WSH);
                        
                        var hash = Buffer.from(rawTX.ins[inputIndex].hash).toString('hex');
                        console.log('hash', hash);
                        console.log('rawHash', Buffer.from(rawTX.getHash()).toString('hex'));
                        console.log('scriptHex', Buffer.from(script).toString('hex'));
                        
                        var { BigInteger, randomBytes, schnorr } = bipSchnorr;
                        console.log('schnorr', schnorr);
                        console.log('randomBytes', randomBytes);
                        console.log('BigInteger', BigInteger);
                        var convert = schnorr.convert; // convert.hash(Buff)
                        var muSig = schnorr.muSig;
                        console.log('muSig', muSig);
                        
                        var sessionId = await randomBytes(32); // must never be reused between sessions!

                        console.log('sessionId', sessionId);

                        var pubKeys = [
                        Buffer.from('b6f0a52ca788bf90da53508f69e24ecef783b85afdc409325adf72062e095787', 'hex'), 
                        Buffer.from('a5cad4533101dee21e5726fd226183ce0b592f4dd2dcc3856506c935a616a52d', 'hex')
                        ];

                        console.log('BigInteger', BigInteger);
                        console.log('pubKeys', pubKeys);

                        var pubKeyHash = muSig.computeEll(pubKeys);
                        var pkCombined = muSig.pubKeyCombine(pubKeys, pubKeyHash);
                        var pubKeyCombined = convert.intToBuffer(pkCombined.affineX);
                        var pubKeyParity = schnorr.math.isEven(pkCombined);

                        console.log('pubKeyParity', pubKeyParity);
                        console.log('muSig', muSig);

                        try
                        {
                            session = muSig.sessionInitialize(
                                sessionId,
                                BigInteger.fromHex(options.key),
                                Buffer.from(hash, 'hex'),
                                pubKeyCombined,
                                pubKeyParity, // pubKeyParity
                                pubKeyHash,
                                0 // idx
                            );
                        }
                        catch(e)
                        {
                            console.log('e', e);
                        }

                        console.log('session', session);
                        console.log('commitment', Buffer.from(session.commitment).toString('hex'));
                        console.log('nonce', Buffer.from(session.nonce).toString('hex'));
                        
                        var mu_sig_obj =
                        {
                            inputs:
                            [
                                {
                                    nonces: [
                                        Buffer.from('b387a3b93a27f0019baf8669e32746bc2e43faeacdb242958103b2d07edb4452', 'hex')
                                    ],
                                    sigs: [
                                        BigInteger.fromHex('7a137eb8cbae584f2c558a82843ff6219ac77ebe643f6dda72c2a0ea706a6c6f', 'hex')
                                    ]
                                },
                                {
                                    nonces: [
                                        Buffer.from('ade486411e3159d5a07e97889415817a2b868d018b19b5a55ee4b9627ffa145f', 'hex')
                                    ],
                                    sigs: [
                                        BigInteger.fromHex('3b8595712919a2da0ee3a0cb5b74ae10483bdbe8897f25322b4853e34b3aefed', 'hex')
                                    ]
                                }
                            ]
                        }
                        
                        mu_sig_obj.inputs[inputIndex].nonces.push(session.nonce);
                        
                        var nonceCombined = muSig.sessionNonceCombine(
                            session, mu_sig_obj.inputs[inputIndex].nonces
                        );
                        
                        console.log('nonceCombined', nonceCombined);
                            
                        //signerPrivateData.forEach(data => (data.session.combinedNonceParity = signerSession.combinedNonceParity));
                        
                        console.log('hash', hash);
                        
                        var partialSignature = muSig.partialSign(
                            session, 
                            Buffer.from(hash, 'hex'), 
                            //script, 
                            nonceCombined, 
                            pubKeyCombined
                        );
                        
                        console.log('partialSignature.pubKey', partialSignature);
                        console.log('partialSignature', partialSignature);
                        console.log('partialSignature.hex', partialSignature.toHex());
                        
                        var sighex = partialSignature.toHex();
                        
                        mu_sig_obj.inputs[inputIndex].sigs.push(Buffer.from(sighex, 'hex'));
                        
                        console.log('sigs', mu_sig_obj.inputs[inputIndex].sigs);
                        console.log('sighex', sighex);
                        console.log('sighex.Big', BigInteger.fromHex(sighex));
                        
                        console.log('nonceCombined', nonceCombined );
                        console.log('mu_sig_obj.inputs[inputIndex].sigs', mu_sig_obj.inputs[inputIndex].sigs);
                        
                        var final_signature = muSig.partialSigCombine(
                            nonceCombined, 
                            mu_sig_obj.inputs[inputIndex].sigs
                        );
                        
                        console.log('final_signature', final_signature);
                        console.log('final_signature.hex', Buffer.from(final_signature).toString('hex'));
                        
                        /*
                        var witness = Buffer.concat([
                            script,
                            input.tapLeafScript[0].script,
                            input.tapLeafScript[0].controlBlock
                        ]);
                        console.log('witness', witness);
                        */
                            //witness.concat(input.tapLeafScript[0].script)
                            //.concat(input.tapLeafScript[0].controlBlock);
                        
                        //finalScriptSig: final_signature,
                            //finalScriptWitness: final_signature,
                        
                        var partialSig = 
                        [{
                            finalScriptSig: Buffer.from('040b750182b8782df45d4b5f5e624b3084a6c25fe87437503c11d6dac1339438b8f8c49722bae015d4b1dee7f0df0cfa62019b696864188f4b679d7ce9f6e3cb2e', 'hex'),
                            finalScriptWitness: Buffer.from('c258246b4df2545c857f062126f6b8c1ab0b0eba662c32174332d87d58325ba31ab8f2ea2be2c0440d237b6e177cd28ce71a6f40099e430cafd428796d65ae0d', 'hex'),
                        }];

                        //psbt.data.updateInput(inputIndex, partialSig);
                        
                        console.log('psbt.afterUpdate', psbt);
                        
                        /**/
                        return {
                            finalScriptSig: final_signature,
                            finalScriptWitness: final_signature,
                        }
                        
                    }
                    console.log('psbt', psbt);
                    console.log('psbt', psbt.data.getTransaction());
                    
                    var chain_code = new Buffer(32);
                    chain_code.fill(1);
                    
                    var gas_keys = false;
                    var keys = bip32ecc.fromPrivateKey(Buffer.from(options.key, 'hex'), chain_code, net);
                    if(options.gas_key)
                    {
                        gas_keys = bip32ecc.fromPrivateKey(Buffer.from(options.gas_key, 'hex'), chain_code, net);
                    }
                    
                    console.log('keys', keys);
                    
                    if(options.format == 'taproot')
                    {
                        for(i = 0; i < psbt.inputCount; i++)
                        {
                            try
                            {
                                var tapLeaf = Buffer.from('20d4021a4d9fe05e3b68182d625a88e2e652993143a0a3fa51eab54f0b7b935427ac', 'hex');
                                
                                console.log('tapLeaf', tapLeaf);
                                
                                //await psbt.finalizeInput(i, cust);
                                await psbt.finalizeTaprootInput(i, tapLeaf, cust);
                                //await cust(i, psbt.data.inputs[i]);
                                
                            }
                            catch(e){}
                        }
                        
                        /*
                        var { BigInteger, randomBytes, schnorr } = bipSchnorr;
                        var convert = schnorr.convert; // convert.hash(Buff)
                        var muSig = schnorr.muSig;
                        
                        var hash = convert.hash(psbt.data.getTransaction());
                        console.log('rawTX?', Buffer.from(psbt.data.getTransaction()).toString('hex'));
                        console.log('hash', hash);
                        console.log('hash.hex', Buffer.from(hash).toString('hex'));
                        
                        var rawTX = btc.Transaction.fromHex(Buffer.from(psbt.data.getTransaction()).toString('hex'));
                        
                        console.log('rawHash', Buffer.from(rawTX.getHash()).toString('hex'));
                        console.log('rawTX2', rawTX);
                        console.log('rawTX.ins[0].hash', Buffer.from(rawTX.ins[0].hash).toString('hex'));
                        console.log('rawHashForSig', rawTX.hashForSignature(
                            0, 
                            rawTX.ins[0].hash,
                            0x01
                        ));
                        
                        var session = false;
                        var sessionId = await randomBytes(32); // must never be reused between sessions!

                        console.log('sessionId', sessionId);

                        var pubKeys = [
                        Buffer.from('b6f0a52ca788bf90da53508f69e24ecef783b85afdc409325adf72062e095787', 'hex'), 
                        Buffer.from('a5cad4533101dee21e5726fd226183ce0b592f4dd2dcc3856506c935a616a52d', 'hex')
                        ];

                        console.log('BigInteger', BigInteger);
                        console.log('pubKeys', pubKeys);

                        var pubKeyHash = muSig.computeEll(pubKeys);
                        var pkCombined = muSig.pubKeyCombine(pubKeys, pubKeyHash);
                        var pubKeyCombined = convert.intToBuffer(pkCombined.affineX);
                        var pubKeyParity = schnorr.math.isEven(pkCombined);

                        console.log('pubKeyParity', pubKeyParity);
                        console.log('muSig', muSig);

                        try
                        {
                            session = muSig.sessionInitialize(
                                sessionId,
                                BigInteger.fromHex(options.key),
                                hash,
                                pubKeyCombined,
                                pubKeyParity, // pubKeyParity
                                pubKeyHash,
                                0 // idx
                            );
                        }
                        catch(e)
                        {
                            console.log('e', e);
                        }

                        console.log('session', session);
                        console.log('commitment', Buffer.from(session.commitment).toString('hex'));
                        console.log('nonce', Buffer.from(session.nonce).toString('hex'));
                        
                        var nonces = [
                            Buffer.from('a5a329458c954b2149b4930c69e01a83421c5a171addf300a0628c001e38ca6b', 'hex')
                        ];
                        nonces.push(session.nonce);
                        
                        var sigs = [
                            BigInteger.fromHex('da6a4d7ca4cdce18f7becc7487a2e1bc2362acc149b6731e046608971cc468a8')
                        ]
                        
                        var nonceCombined = muSig.sessionNonceCombine(
                            session, nonces
                        );
                        
                        console.log('nonceCombined', nonceCombined);
                            
                        //signerPrivateData.forEach(data => (data.session.combinedNonceParity = signerSession.combinedNonceParity));
                        
                        console.log('hash', hash);
                        
                        var partialSignature = muSig.partialSign(
                            session, 
                            hash, 
                            nonceCombined, 
                            pubKeyCombined
                        );
                        
                        console.log('partialSignature', partialSignature);
                        console.log('partialSignature.hex', partialSignature.toHex());
                        
                        var sighex = partialSignature.toHex();
                        
                        sigs.push(partialSignature);
                        
                        console.log('sigs', sigs);
                        console.log('sighex', sighex);
                        console.log('BigInteger', BigInteger);
                        console.log('sighex.Big', BigInteger.fromHex(sighex));
                        
                        var final_signature = muSig.partialSigCombine(
                            nonceCombined, 
                            sigs
                        );
                        
                        console.log('final_signature', final_signature);
                        console.log('final_signature.hex', Buffer.from(final_signature).toString('hex'));
                        
                        var signer = {
                            network: net,
                            publicKey: pubKeyCombined,
                            sign: ($hash) => 
                            {
                                console.log('$hash', $hash);
                                
                                return final_signature
                            },
                          };
                        
                        var xkey = keys.publicKey.slice(1, 33);            
                        var tweaked_key = keys.tweak(
                            btc.crypto.taggedHash(
                                "TapTweak", 
                                xkey
                            )
                        );
                        
                        console.log('tweaked_key', tweaked_key);
                        
                        tweaked_key.sign = ($hash) => 
                        {
                            console.log('$hash', $hash);
                                
                            return final_signature;
                        }
                        
                        
                          psbt.signInput(0, tweaked_key);
                          psbt.signInput(1, tweaked_key);
                        
                        */
                        
                        console.log('psbt.beforeFinalization', psbt);
                        //var tx = psbt.finalizeAllInputs().extractTransaction();
                        //console.log('tx', tx);
                    }
                    
                    var signed_tx = false;
                    var signing_error = false;
                    
                    for(i = 0; i < psbt.inputCount; i++)
                    {
                        try
                        {
                            if(typeof psbt.data.inputs[i].tapInternalKey == 'object')
                            {
                                //var signSchnorr1 = Buffer.from(keys.signSchnorr(Buffer.from('2aca8868f444134abf67079649dc5fa8d872e4415494f2ffe98e8d3cfc482bcf', 'hex'))).toString('hex');
                                //console.log('signSchnorr1', signSchnorr1);
                                console.log('in,.keys', keys);
                                var xkey = keys.publicKey.slice(1, 33);            
                                var tweaked_key = keys.tweak(
                                    btc.crypto.taggedHash(
                                        "TapTweak", 
                                        xkey
                                    )
                                );
                                
                                console.log('in.options', options);
                                
                                options.script = '5120f345068e88471ef19b3181c800e139152148c580c74e2c2a20400a5ec142b4fa';
                                
                                if
                                (
                                    options.format == 'taproot' 
                                    && typeof options.script != 'undefined'
                                )
                                {
                                    console.log('here?');
                                    
                                    var partialSig = 
                                    [{
                                        pubkey: Buffer.from('040b750182b8782df45d4b5f5e624b3084a6c25fe87437503c11d6dac1339438b8f8c49722bae015d4b1dee7f0df0cfa62019b696864188f4b679d7ce9f6e3cb2e', 'hex'),
                                        signature: Buffer.from('c258246b4df2545c857f062126f6b8c1ab0b0eba662c32174332d87d58325ba31ab8f2ea2be2c0440d237b6e177cd28ce71a6f40099e430cafd428796d65ae0d', 'hex'),
                                    }];
                                    
                                    psbt.updateInput(0, partialSig);
                                }
                                else
                                {
                                
                                    if(options.sighashType)
                                    {
                                        psbt.signInput(i, tweaked_key, [options.sighashType]);
                                    }
                                    else
                                    {
                                        psbt.signInput(i, tweaked_key);
                                    }
                                    
                                }
                            }
                            else
                            {
                                if(options.sighashType)
                                {
                                    psbt.signInput(i, keys, [options.sighashType]);
                                }
                                else
                                {
                                    psbt.signInput(i, keys);
                                }
                            }
                        }
                        catch(e)
                        { 
                            console.info('utxo.signing.error', e);
                            if(options.gas_key)
                            {
                                try
                                {
                                    if(typeof psbt.data.inputs[i].tapInternalKey == 'object')
                                    {
                                        var gkey = gas_keys.publicKey.slice(1, 33);            
                                        var tweaked_gkey = gas_keys.tweak(
                                            btc.crypto.taggedHash(
                                                "TapTweak", 
                                                gkey
                                            )
                                        );
                                        if(options.sighashType)
                                        {
                                            psbt.signInput(i, tweaked_gkey, [options.sighashType]);
                                        }
                                        else
                                        {
                                            psbt.signInput(i, tweaked_gkey);
                                        }
                                    }
                                    else
                                    {
                                        if(options.sighashType)
                                        {
                                            psbt.signInput(i, gas_keys, [options.sighashType]);
                                        }
                                        else
                                        {
                                            psbt.signInput(i, gas_keys);
                                        }
                                    }
                                }
                                catch(e2)
                                {
                                    signing_error = e2; 
                                }
                            }
                            else
                            {
                                signing_error = e;
                            }
                        }
                    }
                    
                    if(!signing_error)
                    {
                        try
                        {
                            signed_tx = psbt.finalizeAllInputs().extractTransaction(true).toHex();
                        }
                        catch(e)
                        { 
                            console.info('utxo.finalizing.e', e);
                            signing_error = e;
                        }
                        if(signing_error)
                        {
                            try
                            {
                                signed_tx = psbt.toHex();
                            }
                            catch(e){}
                        }
                    }
                    
                    if(signing_error && signed_tx)
                    {
                        results.success = true;
                        results.message = 'Signed UTXO PSBT attached to data';
                        results.data = 
                        {
                            psbt: signed_tx
                        };
                    }
                    else if(!signing_error)
                    {
                        results.success = true;
                        results.message = 'Signed UTXO transaction attached to data';
                        results.data = 
                        {
                            hex: signed_tx
                        };
                    }
                    else
                    {
                        results.message = signing_error;
                    }
                    
                    callback(results);
                }
                else
                {
                    results.message = 'Unable to reconstruct PSBT';
                    callback(results);
                }
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        }
    },
    utils:
    {
        consolidate: async function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                format: false,
                max: 100000000, // maximum size of UTXO to consolidate
                limit: 100, // limit the number of UTXOs to consolidate
                fees: 1000, // sats to spend on consolidating
                gas_key: false, // optional private gas station key
                network: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.utils.consolidate',
                data: options
            }
            if
            (
                options.key
                && parseInt(options.max) > 600
                && parseInt(options.limit) > 1
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {
                var currency = cortex.config.currencies.utxo[options.network];
                var network = cortex.utxo.network(options.network);
                var chain_code = new Buffer(32);
                chain_code.fill(1);

                var root = await bip32ecc.fromPrivateKey
                (
                    Buffer.from(options.key, 'hex'),
                    chain_code,
                    network
                );  
                var public_key = Buffer.from(root.publicKey).toString('hex');
                var account = await cortex.sdk.utils('utxo', 'key_to_address', 
                {
                    key: public_key,
                    format: options.format,
                    network: options.network
                });
                
                var unspents = await cortex.sdk.api('utxo', 'unspents', 
                {
                    address: account.address,
                    loop: true,
                    network: options.network
                });
                
                if(!unspents || typeof unspents != 'object')
                {
                    unspents = [];
                }
                
                var inputs = [];
                var amount_to_send = 0;
                
                for(u = 0; u < unspents.length; u++)
                {
                    var sats = BigNumber(unspents[u].value).multipliedBy(10 ** 8).toNumber();
                    if(sats <= options.max && inputs.length < options.limit && unspents[u].block)
                    {
                        amount_to_send+= sats;
                        unspents[u].sats = sats;
                        inputs.push(unspents[u]);
                    }
                }
                
                amount_to_send-= options.fees;
                
                var prepared = await cortex.sdk.prepare('utxo', 'send',
                {
                    key: public_key,
                    address: account.address,
                    destination: account.address,
                    amount: amount_to_send,
                    network: options.network,
                    format: options.format,
                    fees: 'none', // explicity set
                    unspents: inputs
                });
                
                if(prepared && typeof prepared.hex != 'undefined')
                {
                    var signed = await cortex.sdk.sign('utxo', 'transaction', 
                    {
                        tx: prepared.hex,
                        network: options.network,
                        key: options.key,
                        gas_key: false, // optional privkey for gas station
                    });
                    
                    if(signed && typeof signed.hex != 'undefined')
                    {
                        var relayed = await cortex.sdk.api('utxo', 'relay', 
                        {
                            tx: signed.hex,
                            network: options.network
                        });   
                        
                        if(relayed && typeof relayed.txid != 'undefined')
                        {
                            results.success = true;
                            results.message = 'Consolidation transaction details attached to data';
                            results.data =
                            {
                                txid: relayed.txid
                            };
                        }
                        else
                        {
                            results.message = relayed;
                        }
                    }
                    else
                    {
                        results.message = signed;
                    }
                }
                else
                {
                    results.message = prepared;
                }
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        key_to_address: function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                format: false,
                network: false,
                mpc: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.utils.key_to_address',
                data: options
            }
            if
            (
                options.key && options.format
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {
                var network = cortex.utxo.network(options.network);
                var address = false;
                
                var chain_code = new Buffer(32);
                chain_code.fill(1);

                var childNodeXOnlyPubkey = false;
                var address_obj = false;
                var pk_address = false;
                var keys = false;

                if(options.mpc == 'ecdsa-tss')
                {
                    if
                    (
                        options.format == 'legacy'
                        || options.format == 'segwit'
                    )
                    {
                        //options.key = '04' + JSON.parse(JSON.stringify(options.key));
                    }
                    
                    if(options.format == 'legacy')
                    {
                        pk_address = btc.payments.p2pkh({
                            pubkey: Buffer.from(options.key, 'hex'),
                            network: cortex.utxo.network(options.network)
                        });
                    }
                    else if(options.format == 'segwit')
                    {
                        pk_address = btc.payments.p2sh({
                            redeem: btc.payments.p2pkh({
                                pubkey: Buffer.from(options.key, 'hex'),
                                network: cortex.utxo.network(options.network)
                            }),
                            network: cortex.utxo.network(options.network)
                        });
                    }
                    else if(options.format == 'taproot')
                    {
                        var keys = bip32ecc.fromPublicKey
                        (
                            Buffer.from(options.key, 'hex'),
                            chain_code,
                            network
                        );
                        var childNodeXOnlyPubkey = keys.publicKey.slice(1, 33);
                        pk_address = btc.payments.p2tr({
                            internalPubkey: childNodeXOnlyPubkey,
                            network: network
                        });
                    }
                    
                    if(pk_address)
                    {
                        address_obj = {
                            address: pk_address.address,
                            short: cortex.utils.shorten(pk_address.address),
                            format: options.format,
                            pub: options.key
                        };
                    }
                    else
                    {
                        results.message = 'Unsupported format for UTXO ecdsa address';
                    }
                }
                else
                {
                    try
                    {
                        keys = bip32ecc.fromPublicKey
                        (
                            Buffer.from(options.key, 'hex'),
                            chain_code,
                            network
                        );
                        childNodeXOnlyPubkey = keys.publicKey.slice(1, 33);

                    }
                    catch(e)
                    {
                        childNodeXOnlyPubkey = Buffer.from(options.key, 'hex');
                        keys = false;
                    }

                    var error = false;

                    if(keys && (options.format == 'all' || options.format == 'legacy') && cortex.utxo.addresses.supported(options.network, 'legacy'))
                    {
                        try
                        {
                            var p2pkh = btc.payments.p2pkh({ pubkey: keys.publicKey, network: network });
                            address_obj = {
                                address: p2pkh.address,
                                short: cortex.utils.shorten(p2pkh.address),
                                format: 'legacy',
                                pub: keys.publicKey.toString('hex')
                            };
                        }
                        catch(e){ error = e }
                    }
                    if(keys && (options.format == 'all' || options.format == 'segwit') && cortex.utxo.addresses.supported(options.network, 'segwit'))
                    {
                        try
                        {
                            var p2sh = btc.payments.p2sh({
                                redeem: btc.payments.p2wpkh({ pubkey: keys.publicKey, network: network }),
                                network: network
                            });
                            address_obj = {
                                address: p2sh.address,
                                short: cortex.utils.shorten(p2sh.address),
                                format: 'segwit',
                                pub: keys.publicKey.toString('hex')
                            };
                        }
                        catch(e){ error = e }
                    }
                    if(keys && (options.format == 'all' || options.format == 'bech32') && cortex.utxo.addresses.supported(options.network, 'bech32'))
                    {
                        try
                        {
                            var p2wpkh = btc.payments.p2wpkh({ pubkey: keys.publicKey, network: network });
                            address_obj = {
                                address: p2wpkh.address,
                                short: cortex.utils.shorten(p2wpkh.address),
                                format: 'bech32',
                                pub: keys.publicKey.toString('hex')
                            };
                        }
                        catch(e){ error = e }
                    }
                    if(childNodeXOnlyPubkey && (options.format == 'all' || options.format == 'taproot') && cortex.utxo.addresses.supported(options.network, 'taproot'))
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
                                network: network
                            });
                            address_obj = {
                                address: p2tr.address,
                                short: cortex.utils.shorten(p2tr.address),
                                xkey: childNodeXOnlyPubkey.toString('hex'),
                                format: 'taproot',
                                pub: pub
                            };
                        }
                        catch(e){ error = e; }
                    }
                    if(keys && (options.format == 'all' || options.format == 'bitpay') && cortex.utxo.addresses.supported(options.network, 'bitpay'))
                    {
                        try
                        {
                            var p2sh = btc.payments.p2sh({
                                redeem: btc.payments.p2wpkh({ pubkey: keys.publicKey, network: network }),
                                network: network
                            });
                            var p2pkh = btc.payments.p2pkh({ pubkey: keys.publicKey, network: network });
                            address_obj = {
                                address: bchaddr.toBitpayAddress(p2sh.address),
                                short: cortex.utils.shorten(bchaddr.toBitpayAddress(p2sh.address)),
                                format: 'bitpay',
                                pub: keys.publicKey.toString('hex')
                            };
                        }
                        catch(e){ error = e }
                    }
                    if(keys && (options.format == 'all' || options.format == 'cashaddr') && cortex.utxo.addresses.supported(options.network, 'cashaddr'))
                    {
                        try
                        {
                            var p2pkh = btc.payments.p2pkh({ pubkey: keys.publicKey, network: network });
                            address_obj = {
                                address: bchaddr.toCashAddress(p2pkh.address),
                                short: cortex.utils.shorten(bchaddr.toBitpayAddress(p2pkh.address)),
                                format: 'cashaddr',
                                pub: keys.publicKey.toString('hex')
                            };
                        }
                        catch(e){ error = e }
                    }
                }
                if(typeof address_obj == 'object')
                {
                    results.success = true;
                    results.message = 'UTXO address attached to data';
                    results.data = address_obj;
                }
                else if(error)
                {
                    results.message = error;
                }
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        permutations: async function(params = {}, callback = false)
        {
            var options = 
            {
                values: false, // array
                threshold: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.utils.permutations',
                data: options
            }
            
            if
            (
                options.values
                && typeof options.values == 'object'
                && options.values.length > 1
                && parseInt(options.threshold) > 0
                && parseInt(options.threshold) <= options.values.length
                && typeof callback == 'function'
            )
            { 
                var combinations = [];

                function generateCombinations(arr, size, start, temp) 
                {
                    if (temp.length === size) 
                    {
                        combinations.push([...temp]);
                        return;
                    }

                    for (let i = start; i < arr.length; i++) 
                    {
                        temp.push(arr[i]);
                        generateCombinations(arr, size, i + 1, temp);
                        temp.pop();
                    }
                }
                generateCombinations(options.values, parseInt(options.threshold), 0, []);
                
                if(combinations.length > 0)
                {
                    results.success = true;
                    results.message = 'Possible permutations attached to data';
                    results.data = combinations;
                }
                
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        schnorr_key: async function(params = {}, callback = false)
        {
            var options = 
            {
                keys: false, // array of 33 byte pubkeys in hex format
                network: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.utils.schnorr_key',
                data: options
            }
            
            if
            (
                options.keys
                && typeof options.keys == 'object'
                && options.keys.length > 1
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            { 
                var error = false;
                var public_data = false;
                
                try
                {
                    var { schnorr } = bipSchnorr;
                    var convert = schnorr.convert;
                    var muSig = schnorr.muSig;

                    var pubKeys32 = [];

                    for(p = 0; p < options.keys.length; p++)
                    {
                        var pk = options.keys[p];
                        pubKeys32.push(Buffer.from(pk, 'hex').slice(1, 33));
                    }

                    // data known to every participant
                    public_data = 
                    {
                          pubKeys: pubKeys32,
                          message: convert.hash(Buffer.from('muSig is awesome!', 'utf8')),
                          pubKeyHash: null,
                          pubKeyCombined: null,
                          pubKeyParity: null,
                          commitments: [],
                          nonces: [],
                          nonceCombined: null,
                          partialSignatures: [],
                          signature: null,
                    };
                    public_data.pubKeyHash = muSig.computeEll(public_data.pubKeys);
                    var pk_combined = muSig.pubKeyCombine(public_data.pubKeys, public_data.pubKeyHash);
                    public_data.pubKeyCombined = convert.intToBuffer(pk_combined.affineX);
                }
                catch(e)
                {
                    error = e;
                }
                if(typeof public_data == 'object' && !error)
                {
                    results.success = true;
                    results.message = 'Combined key attached to data';
                    results.data = public_data;
                }
                else
                {
                    results.message = error;
                }
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        bump: async function(params = {}, callback = false)
        {
            var options = 
            {
                txid: false,
                network: false,
                format: false,
                key: false,
                sats: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.utils.bump',
                data: options
            }
            
            if
            (
                options.txid
                && options.key
                && options.sats
                && options.format
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {  
                var currency = cortex.config.currencies.utxo[options.network];
                var network = cortex.utxo.network(options.network);
                var units = currency.smallest;
                var chain_code = new Buffer(32);
                chain_code.fill(1);

                var root = await bip32ecc.fromPrivateKey
                (
                    Buffer.from(options.key, 'hex'),
                    chain_code,
                    network
                );  
                var public_key = Buffer.from(root.publicKey).toString('hex');
                
                var prepared_tx = await cortex.sdk.prepare('utxo', 'bump', {
                    txid: options.txid,
                    network: options.network,
                    format: options.format,
                    sats: options.sats,
                    key: public_key
                });
                
                if(prepared_tx && typeof prepared_tx.hex != 'undefined')
                {
                    var signed_tx = await cortex.sdk.sign('utxo', 'transaction',
                    {
                        tx: prepared_tx.hex,
                        key: options.key,
                        network: options.network
                    });

                    if(signed_tx && typeof signed_tx.hex != 'undefined')
                    {
                        var relayed_tx = await cortex.sdk.api('utxo', 'relay',
                        {
                            tx: signed_tx.hex,
                            network: options.network
                        }); 

                        if(relayed_tx && typeof relayed_tx.txid != 'undefined')
                        {
                            results.success = true;
                            results.message = 'Bumped utxo transaction details attached to data';
                            results.data =
                            {
                                txid: relayed_tx.txid
                            }
                        }
                        else
                        {
                            results.message = relayed_tx;
                        }
                    }
                    else
                    {
                        results.message = signed_tx;
                    }
                }
                else
                {
                    results.message = prepared_tx;
                }
                
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        vsize: function(utxo, network, witness_byte_length = 0)
        {
            var vsize = 0;
            try
            {
                var fee = cortex.config.currencies.utxo[network].fees;
                var ins = Object.entries(utxo.ins);
                var outs = Object.entries(utxo.outs);
                function getBaseSize() 
                {
                    var inputVBytes = 0;
                    var outputVBytes = 0;
                    var witness_total = 0;
                    
                    var header = 0;
                    
                    ins.forEach(function(input, i)
                    {
                        inputVBytes+= ( fee[input[0]].input * input[1] );
                        if(fee[input[0]].header > header)
                        {
                            header = fee[input[0]].header;
                        }
                    });
                    
                    outs.forEach(function(output, i)
                    {
                        outputVBytes+= ( fee[output[0]].output * output[1] );
                    });

                    var base = 
                    {
                        baseSize: inputVBytes + outputVBytes + header,
                        witnessSize: witness_byte_length
                    }
                    return base;
                  }
                
                var { baseSize, witnessSize } = getBaseSize();
                var weight = (baseSize * 3) + (baseSize + witnessSize);
                vsize = Math.ceil(weight / 4);
            }
            catch(e){ console.info ('fees.e', e) }
            return vsize;
        },
        script: function(script)
        {
            var type = 'unknown';
            var asm = btc.script.toASM(Buffer.from(script, 'hex')).split(' ');
            if(asm[0] == 'OP_DUP' && asm[1] == 'OP_HASH160')
            {
                type = 'pubkeyhash';
            }
            else if(asm[0] == 'OP_HASH160')
            {
                type = 'scripthash';
            }
            else if(asm[0] == 'OP_0' && asm[1].length > 42)
            {
                type = 'witness_v0_scripthash';
            }
            else if(asm[0] == 'OP_0')
            {
                type = 'witness_v0_keyhash';
            }
            else if(asm[1] == 'OP_CHECKSIG' && asm.length === 2)
            {
                type = 'pubkey';
            }
            else if(asm[0] == 'OP_1')
            {
                type = 'witness_v1_taproot';
            }
            return type;
        }
    },
    verify:
    {
        message: async function(params = {}, callback = false)
        {
            var options = 
            {
                message: false,
                network: false,
                signature: false,
                address: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.verify.message',
                data: options
            }            
            if
            (
                options.message
                && options.address
                && options.signature
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {
                results.message = 'Unable to verify UTXO message';
                
                var verified = false;
                
                try
                {
                    var net = cortex.utxo.network(options.network);
                    verified = bitcoinjsMessage.verify
                    (
                        options.message,
                        options.address,
                        options.signature,
                        net.messagePrefix,
                        { checkSegwitAlways: true }
                    );
                }
                catch(e){ console.info('utxo.verify.e', e) }
                
                if(verified)
                {
                    results.success = true;
                    results.message = 'UTXO message verified';
                    results.data = 
                    {
                        verified: verified
                    };
                }
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        }
    },
    mpc:
    {
        address: async function(params = {}, callback = false)
        {
            var options = 
            {
                key: false, // private key
                format: false,
                keys: false, // array of public keys
                threshold: false,
                message: false, // round zero ?
                private_obj: false, // round zero ?
                network: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.mpc.address',
                data: options
            }
            if
            (
                options.key
                && options.format
                && typeof options.keys == 'object'
                && options.keys.length == 1
                && parseInt(options.threshold) == 2
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
                && 
                (
                    options.format == 'ecdsa-tss'
                )
            )
            {
                results.message = 'Unable to process utxo.mpc.address';
                
                var public_msg = false;
                var private_obj = false;
                var private_key = options.key;
                
                var network = cortex.utxo.network(options.network);
                var chain_code = new Buffer(32);
                chain_code.fill(1);

                var root = await bip32ecc.fromPrivateKey
                (
                    Buffer.from(private_key, 'hex'),
                    chain_code,
                    network
                );  
                var public_key = Buffer.from(root.publicKey).toString('hex');
                
                var addresses = [public_key];
                addresses.push(options.keys[0]);
                
                try
                {
                    public_msg = JSON.parse(options.message);
                }
                catch(e){}
                
                try
                {
                    private_obj = JSON.parse(options.private_obj);
                }
                catch(e){}
                
                var res = await cortex.sdk.apis.mpc({
                    core: 'tss',
                    module: 'ecdsa',
                    method: 'address',
                    key: private_key,
                    msg: public_msg,
                    obj: private_obj
                });

                if(typeof res == 'object')
                {
                    var ready = false;
                    var mpc_address = false;

                    if
                    (
                        typeof res.message == 'object' 
                        && typeof res.message.private == 'object'
                        && typeof res.message.private.share == 'object'
                    )
                    {
                        var pk_address = await cortex.sdk.utils('utxo', 'key_to_address', 
                        {
                            key: res.message.private.share.public_key,
                            format: 'segwit',
                            mpc: 'ecdsa-tss',
                            network: options.network
                        });
                        if(typeof pk_address == 'object')
                        {
                            mpc_address = pk_address.address;
                            ready = true;
                        }
                    }

                    results.success = true;
                    results.message = 'UTXO mpc details attached to data';
                    results.data = 
                    {
                        address: mpc_address,
                        format: options.format,
                        short: cortex.utils.shorten(mpc_address),
                        addresses: addresses,
                        threshold: options.threshold,
                        ready: ready,
                        message: JSON.stringify(res)
                    }
                }
                
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        refresh: async function(params = {}, callback = false)
        {
            var options = 
            {
                network: false,
                private_obj: false,
                message: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.mpc.refresh',
                data: options
            }
            if
            (
                options.private_obj
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {
                results.message = 'Unable to process utxo.mpc.refresh';
                
                var public_msg = false;
                var private_obj = false;
                
                try
                {
                    public_msg = options.message;
                }
                catch(e){}
                
                try
                {
                    private_obj = options.private_obj;
                }
                catch(e){}
                
                var res = await cortex.sdk.apis.mpc({
                    core: 'tss',
                    module: 'ecdsa',
                    method: 'refresh',
                    msg: public_msg,
                    obj: private_obj
                });
                
                if(typeof res == 'object')
                {   
                    results.success = true;
                    results.message = 'UTXO mpc refresh attached to data';
                    results.data = 
                    {
                        ready: false,
                        message: res.message
                    }
                    
                    if(res.ready)
                    {
                        results.data.ready = true;
                    }
                }
                else
                {
                    results.message = res;
                }
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        sign: async function(params = {}, callback = false)
        {
            var options = 
            {
                hash: false,
                network: false,
                private_share: false,
                message: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.mpc.sign',
                data: options
            }
            if
            (
                options.hash
                && options.network
                && options.private_share
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {
                results.message = 'Unable to process utxo.mpc.sign';
                
                var message_hash = Buffer.from(options.hash, 'hex').toString('hex');
                
                var public_msg = false;
                var private_obj = false;
                
                try
                {
                    public_msg = options.message;
                }
                catch(e){}
                
                try
                {
                    private_obj = options.private_share;
                }
                catch(e){}
                
                var res = await cortex.sdk.apis.mpc({
                    core: 'tss',
                    module: 'ecdsa',
                    method: 'sign',
                    hash: message_hash,
                    msg: public_msg,
                    obj: private_obj
                });
                
                console.log('res', res);
                
                if(typeof res == 'object')
                {   
                    results.success = true;
                    results.message = 'UTXO mpc signature attached to data';
                    results.data = 
                    {
                        ready: false,
                        message: res.message
                    }
                    
                    if(res.ready)
                    {
                        results.data.ready = true;
                        results.data.signature = res.message.private.signature;
                    }
                }
                else
                {
                    results.message = res;
                }
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        }
    },
    multisig:
    {
        address: async function(params = {}, callback = false)
        {
            var options = 
            {
                key: false,
                format: false,
                keys: false,
                threshold: false,
                network: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.multisig.address',
                data: options
            }
            if
            (
                options.key
                && options.format
                && typeof options.keys == 'object'
                && options.keys.length > 0
                && parseInt(options.threshold) > 1
                && parseInt(options.threshold) <= (options.keys.length + 1)
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {
                results.message = 'Unable to process utxo.multisig.address';
                
                var address = false;
                var redeem = false;
                var unique_keys = false;
                
                try
                {
                    var network = cortex.utxo.network(options.network);
                    var chain_code = new Buffer(32);
                    chain_code.fill(1);
                    
                    var root = await bip32ecc.fromPrivateKey
                    (
                        Buffer.from(options.key, 'hex'),
                        chain_code,
                        network
                    );  
                    var public_key = Buffer.from(root.publicKey).toString('hex');
                    
                    var public_keys = [ public_key ];
                    for(p = 0; p < options.keys.length; p++)
                    {
                        public_keys.push(options.keys[p]);
                    }
                    public_keys.sort();
                    unique_keys = public_keys.filter(function(item, pos, self) 
                    {
                        return self.indexOf(item) == pos;
                    });
                    
                    if(parseInt(options.threshold) <= unique_keys.length)
                    {
                        var buffered_keys = [];
                        var redeem_script = false;
                        
                        try
                        {
                            for(k = 0; k < unique_keys.length; k++)
                            {
                                var pub = bip32ecc.fromPublicKey(
                                    Buffer.from(unique_keys[k], 'hex'),
                                    chain_code,
                                    network
                                );
                                buffered_keys.push(pub.publicKey);
                            }
                            redeem_script = btc.payments.p2ms({ 
                                m: parseInt(options.threshold), 
                                pubkeys: buffered_keys,
                                network: network
                            });
                        }
                        catch(e)
                        {
                            buffered_keys = [];
                            try
                            {
                                for(k = 0; k < unique_keys.length; k++)
                                {
                                    buffered_keys.push(Buffer.from(unique_keys[k], 'hex'));
                                }
                            }
                            catch(e){}
                        }
                        var address_obj = false;
                        var master_key = false;
                        
                        if(options.format == 'legacy')
                        {
                            address_obj = btc.payments.p2sh({
                                redeem: redeem_script
                            });
                            redeem = Buffer.from(address_obj.redeem.output).toString('hex');
                        }
                        else if(options.format == 'segwit')
                        {
                            address_obj = btc.payments.p2sh({
                                redeem: btc.payments.p2wsh({
                                    redeem: redeem_script
                                })
                            });
                            redeem = Buffer.from(redeem_script.output).toString('hex');
                        }
                        else if(options.format == 'bech32')
                        {
                            address_obj = btc.payments.p2wsh({
                                redeem: redeem_script
                            });
                            redeem = Buffer.from(address_obj.redeem.output).toString('hex');
                        }
                        else if(options.format == 'taproot')
                        {
                            var combinations = [];
                            var ms_address = false;
                            
                            // If threshold equals unique_key.length just combine
                            
                            if(parseInt(options.threshold) == unique_keys.length)
                            {
                            
                                var scure_network = 
                                {
                                    bech32: "tb",
                                    pubKeyHash: 0x6f,
                                    scriptHash: 0xc4,
                                    wif: 0xef,
                                };
                                
                                var chain_code = new Buffer(32);
                                chain_code.fill(1);

                                var pKey1 = bip32ecc.fromPublicKey
                                (
                                    Buffer.from(unique_keys[0], 'hex'),
                                    chain_code,
                                    network
                                );
                                var xKey1 = pKey1.publicKey.slice(1, 33);
                                
                                var pKey2 = bip32ecc.fromPublicKey
                                (
                                    Buffer.from(unique_keys[1], 'hex'),
                                    chain_code,
                                    network
                                );
                                var xKey2 = pKey2.publicKey.slice(1, 33);
                                
                                console.log('xKey1', Buffer.from(xKey1).toString('hex'));
                                console.log('xKey2', Buffer.from(xKey2).toString('hex'));
                                
                                //var pKey1 = scure.hex.decode(Buffer.from(xKey1).toString('hex'));
                                //var pKey2 = scure.hex.decode(Buffer.from(xKey2).toString('hex'));
                                
                                var xKey = await scure.btc.p2tr_ns(2, [xKey1, xKey2]);
                                console.log('xKey', xKey);
                                var p2trX = scure.btc.p2tr(undefined, xKey, scure_network);
                                console.log('p2trX', p2trX);
                                console.log('p2trX.tapInternalKey', Buffer.from(p2trX.tapInternalKey).toString('hex'));
                                console.log('p2trX.tweakedPubkey', Buffer.from(p2trX.tweakedPubkey).toString('hex'));
                                
                                //redeem = Buffer.from(p2trX.script).toString('hex');
                                
                                redeem = Buffer.from(JSON.stringify({
                                    keys: unique_keys,
                                    threshold: parseInt(options.threshold),
                                    script: Buffer.from(p2trX.script).toString('hex')
                                }), 'utf8').toString('hex');
                            
                                address_obj = 
                                {
                                    address: p2trX.address
                                }
                                
                                /*
                                
                                MuSig ?
                                
                                master_key = await cortex.sdk.utils('utxo', 'schnorr_key', {
                                    keys: unique_keys,
                                    network: options.network
                                });
                                
                                console.log('Buffer.from(master_key.pubKeyCombined)', Buffer.from(master_key.pubKeyCombined).toString('hex'));

                                ms_address = await cortex.sdk.utils('utxo', 'key_to_address', {
                                    key: Buffer.from(master_key.pubKeyCombined).toString('hex'),
                                    format: 'taproot',
                                    network: options.network
                                });
                                */
                            }
                            else
                            {   
                                master_key = await cortex.sdk.utils('utxo', 'schnorr_key', {
                                    keys: unique_keys,
                                    network: options.network
                                });
                                
                                var combinations = await cortex.sdk.utils('utxo', 'permutations', {
                                    values: unique_keys,
                                    threshold: options.threshold
                                });
                                
                                // Different leaves needed ...
                                
                                var script_tree = [];
                                
                                for(c = 0; c < combinations.length; c++)
                                {
                                    console.log('combinations[c]', combinations[c]);
                                    var combined_key = await cortex.sdk.utils('utxo', 'schnorr_key', 
                                    {
                                        keys: combinations[c],
                                        network: options.network
                                    });
                                    
                                    var the_scripts = [];
                                    the_scripts.push(combined_key.pubKeyCombined);
                                    the_scripts.push(btc.opcodes.OP_CHECKSIG);
                                    
                                    var witness = btc.script.compile(the_scripts);
                                    console.log('witness', Buffer.from(witness).toString('hex'));
                                    
                                    script_tree.push({
                                        output: witness
                                    })
                                }
                                
                                console.log('script_tree', script_tree);
                                
                                var redeem_script = {
                                    output: Buffer.from('20d4021a4d9fe05e3b68182d625a88e2e652993143a0a3fa51eab54f0b7b935427ac', 'hex'),
                                    redeemVersion: 192,
                                };
                                
                                ms_address = btc.payments.p2tr({
                                    internalPubkey: master_key.pubKeyCombined,
                                    scriptTree: script_tree,
                                    redeem: redeem_script,
                                    network: network
                                });
                                
                                console.log('master_key.pubKeyCombined', Buffer.from(master_key.pubKeyCombined).toString('hex'));
                                console.log('ms_address', ms_address);
                                console.log('ms_address.witness', Buffer.from(ms_address.witness[1]).toString('hex'));
                                
                                redeem = Buffer.from(JSON.stringify({
                                    keys: unique_keys,
                                    threshold: parseInt(options.threshold),
                                    key: master_key.pubKeyCombined
                                }), 'utf8').toString('hex');

                                address_obj = 
                                {
                                    address: ms_address.address
                                }
                            }
                        }
                        else
                        {
                            results.message = 'Unsupported format for UTXO multisig.address';
                        }
                        if(typeof address_obj == 'object')
                        {
                            address = address_obj.address;
                        }
                    }
                    else
                    {
                        results.message = 'Threshold higher than unique utxo keys';
                    }
                }
                catch(e){ console.info('utxo.multisig.address.e', e) }
                
                if(address && redeem)
                {
                    results.success = true;
                    results.message = 'UTXO multisig account attached to data';
                    results.data = 
                    {
                        address: address,
                        format: options.format,
                        short: cortex.utils.shorten(address),
                        keys: unique_keys,
                        threshold: parseInt(options.threshold),
                        ready: true,
                        redeem: redeem
                    };
                }
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        },
        validate: async function(params = {}, callback = false)
        {
            var options = 
            {
                address: false,
                script: false,
                format: false,
                network: false
            };
            Object.assign(options, params);
            var results = 
            {
                success: false,
                message: 'Invalid options for utxo.multisig.validate',
                data: options
            }
            if
            (
                options.address && options.script && options.format
                && cortex.utxo.network(options.network)
                && typeof callback == 'function'
            )
            {
                results.message = 'Unable to validate UTXO multisig account';
                
                var keys = false;
                var address = false;
                var threshold = false;
                
                if(options.format == 'taproot')
                {
                    try
                    {
                        var variables = JSON.parse
                        (
                            Buffer.from(options.script, 'hex').toString('utf8')
                        );
                        
                        console.log('variables', variables);
                        
                        if
                        (
                            typeof variables == 'object'
                            && typeof variables.keys == 'object'
                            && typeof variables.threshold == 'number'
                        )
                        {
                            variables.keys.sort();
                            var unique_keys = variables.keys.filter(function(item, pos, self) 
                            {
                                return self.indexOf(item) == pos;
                            });
                            
                            var combinations = [];
                            var ms_address = false;
                            var network = cortex.utxo.network(options.network);
                            
                            // If threshold equals unique_key.length just combine
                            
                            if(variables.threshold == unique_keys.length)
                            {
                            
                                var scure_network = 
                                {
                                    bech32: "tb",
                                    pubKeyHash: 0x6f,
                                    scriptHash: 0xc4,
                                    wif: 0xef,
                                };
                                
                                var chain_code = new Buffer(32);
                                chain_code.fill(1);
                                
                                console.log('unique_keys', unique_keys);

                                var pKey1 = bip32ecc.fromPublicKey
                                (
                                    Buffer.from(unique_keys[0], 'hex'),
                                    chain_code,
                                    network
                                );
                                var xKey1 = pKey1.publicKey.slice(1, 33);
                                
                                var pKey2 = bip32ecc.fromPublicKey
                                (
                                    Buffer.from(unique_keys[1], 'hex'),
                                    chain_code,
                                    network
                                );
                                var xKey2 = pKey2.publicKey.slice(1, 33);
                                
                                console.log('xKey1', Buffer.from(xKey1).toString('hex'));
                                console.log('xKey2', Buffer.from(xKey2).toString('hex'));
                                
                                //var pKey1 = scure.hex.decode(Buffer.from(xKey1).toString('hex'));
                                //var pKey2 = scure.hex.decode(Buffer.from(xKey2).toString('hex'));
                                
                                var xKey = await scure.btc.p2tr_ns(2, [xKey1, xKey2]);
                                console.log('xKey', xKey);
                                var p2trX = scure.btc.p2tr(undefined, xKey, scure_network);
                                console.log('p2trX', p2trX);
                                console.log('p2trX.tapInternalKey', Buffer.from(p2trX.tapInternalKey).toString('hex'));
                                console.log('p2trX.script', Buffer.from(p2trX.script).toString('hex'));
                                
                                //redeem = Buffer.from(p2trX.script).toString('hex');
                                
                                redeem = Buffer.from(JSON.stringify({
                                    keys: unique_keys,
                                    threshold: parseInt(options.threshold),
                                    script: Buffer.from(p2trX.script).toString('hex')
                                }), 'utf8').toString('hex');
                            
                                ms_address = 
                                {
                                    address: p2trX.address
                                }
                                /*
                                var combined_key = await cortex.sdk.utils('utxo', 'schnorr_key', {
                                    keys: unique_keys,
                                    network: options.network
                                });

                                ms_address = await cortex.sdk.utils('utxo', 'key_to_address', {
                                    key: Buffer.from(combined_key.pubKeyCombined).toString('hex'),
                                    format: 'taproot',
                                    network: options.network
                                });
                                */
                                
                            }
                            else
                            {   
                                var master_key = await cortex.sdk.utils('utxo', 'schnorr_key', {
                                    keys: unique_keys,
                                    network: options.network
                                });
                                
                                combinations = await cortex.sdk.utils('utxo', 'permutations', {
                                    values: unique_keys,
                                    threshold: variables.threshold
                                });
                                
                                // Different leaves needed ...
                                
                                var script_tree = [];
                                
                                for(c = 0; c < combinations.length; c++)
                                {
                                    var combined_key = await cortex.sdk.utils('utxo', 'schnorr_key', 
                                    {
                                        keys: combinations[c],
                                        network: options.network
                                    });
                                    
                                    var the_scripts = [];
                                    the_scripts.push(combined_key.pubKeyCombined);
                                    the_scripts.push(btc.opcodes.OP_CHECKSIG);
                                    
                                    var witness = btc.script.compile(the_scripts);
                                    
                                    script_tree.push({
                                        output: witness
                                    })
                                }
                                
                                ms_address = btc.payments.p2tr({
                                    internalPubkey: master_key.pubKeyCombined,
                                    scriptTree: script_tree,
                                    network: network
                                });
                            }
                            
                            if
                            (
                                typeof ms_address == 'object'
                                && typeof ms_address.address == 'string'
                                && ms_address.address == options.address
                            )
                            {
                                address = ms_address.address;
                                threshold = variables.threshold;
                                keys = unique_keys;
                            }
                        }
                    }
                    catch(e)
                    {
                        console.info('utxo.multisig.validate.taproot.e', e);
                    }
                }
                else
                {
                    try
                    {
                        keys = btc.script.toASM(Buffer.from(options.script, 'hex')).split(' ');

                        var this_address_obj = btc.payments.p2sh({
                            redeem: btc.payments.p2wsh({
                                redeem: Buffer.from(options.script, 'hex'),
                                network: network
                            })
                        });

                        var type_checks = false;
                        var threshold_checks = false;
                        var key_checks = false;

                        try
                        {
                            type_checks = keys.pop().split('_');
                            threshold_checks = keys.shift().split('_');
                            key_checks = keys.pop().split('_');
                        }
                        catch(e){}

                        if
                        (
                            type_checks[1] == 'CHECKMULTISIG'
                            && parseInt(key_checks[1]) == keys.length
                            && parseInt(threshold_checks[1]) > 1
                        )
                        {
                            threshold = parseInt(threshold_checks[1]);

                            var buffered_keys = [];
                            var chain_code = new Buffer(32);
                            chain_code.fill(1);

                            for(k = 0; k < keys.length; k++)
                            {
                                var pub = bip32ecc.fromPublicKey(
                                    Buffer.from(keys[k], 'hex'),
                                    chain_code,
                                    network
                                );
                                buffered_keys.push(pub.publicKey);
                            }

                            var network = cortex.utxo.network(options.network);
                            var redeem_script = btc.payments.p2ms({ 
                                m: threshold, 
                                pubkeys: buffered_keys,
                                network: network
                            });

                            var address_obj = false;

                            if(options.format == 'legacy')
                            {
                                address_obj = btc.payments.p2sh({
                                    redeem: redeem_script
                                });
                            }
                            else if(options.format == 'segwit')
                            {
                                address_obj = btc.payments.p2sh({
                                    redeem: btc.payments.p2wsh({
                                        redeem: redeem_script
                                    })
                                });
                            }
                            else if(options.format == 'bech32')
                            {
                                address_obj = btc.payments.p2wsh({
                                    redeem: redeem_script
                                });
                            }
                            else
                            {
                                results.message = 'Unsupported format for UTXO multisig.address';
                            }
                            if(typeof address_obj == 'object')
                            {
                                address = address_obj.address;
                            }
                        }
                    }
                    catch(e){ console.info('utxo.multisig.validate.e', e) }
                }
                
                if
                (
                    typeof keys == 'object' 
                    && address == options.address
                    && address && threshold && parseInt(threshold) > 1
                )
                {
                    results.success = true;
                    results.message = 'UTXO multisig account attached to data';
                    results.data = 
                    {
                        address: address,
                        format: options.format,
                        short: cortex.utils.shorten(address),
                        keys: keys,
                        threshold: threshold,
                        ready: true,
                        redeem: options.input
                    }
                }
                
                callback(results);
            }
            else if(typeof callback == 'function')
            {
                callback(results);
            }
        }
    }
}