var eden_clipboard = false;
var eden_domain_id = 'smalley.my';
var eden_user_id = 'Oviato Wallet Secrets';

var eden = 
{
    db:
    {
        db:
        {
            setup: false,
            defaults:
            {
                network: 'bitcointestnet',
                type: 'utxo'
            },
            testing: true
        },
        html:
        {
            forms:
            {
                setup: false
            }
        }
    },
    data:
    {
        get: async function(callback = false)
        {
            if(typeof callback == 'function')
            {
                var db = false;
                
                if(typeof browser != 'undefined' && typeof browser == 'object' && typeof browser.storage == 'object')
                {
                    try
                    {
                        db = await browser.storage.local.get();
                    }
                    catch(e){ }
                    callback(db);
                }
                else if(typeof chrome == 'object' && typeof chrome.storage != 'undefined')
                {
                    chrome.storage.local.get(function(db)
                    {
                        callback(db);
                    });
                }
                else
                {
                    db = localStorage.getItem('db');
                    if(db)
                    {
                        try
                        {
                            db = JSON.parse(db);
                        }
                        catch(e){}
                    }
                    callback(db);
                }
            }
        },
        remove: async function(fields, callback = false)
        {
            if(typeof fields == 'object' && typeof callback == 'function')
            {
                var error = false;
                
                if(typeof browser != 'undefined' && typeof browser == 'object' && typeof browser.storage == 'object' && typeof browser.storage.local == 'object')
                {
                    try
                    {
                        error = await browser.storage.local.remove(fields);
                    }
                    catch(e){ error = e.message }
                    callback(error);
                }
                else if(typeof chrome == 'object' && typeof chrome.storage == 'object')
                {
                    chrome.storage.local.remove(fields, function()
                    {
                        callback();
                    });
                }
                else
                {
                    eden.data.get(function(old_db)
                    {
                        var db = {}
                        
                        jQuery.each(old_db, function(k, v)
                        {
                            var include = true;
                            for(f = 0; f < fields.length; f++)
                            {
                                if(k == fields[f])
                                {
                                    include = false;
                                }
                            }
                            if(include)
                            {
                                db[k] = v;
                            }
                        })
                        error = localStorage.setItem('db', JSON.stringify(db));
                        callback(error);
                    })
                }
            }
        },
        set: async function(db, callback = false)
        {
            if(db && typeof callback == 'function')
            {
                var error = false;
                
                if(typeof browser != 'undefined' && typeof browser == 'object' && typeof browser.storage == 'object' && typeof browser.storage.local == 'object')
                {
                    try
                    {
                        error = await browser.storage.local.set(db);
                    }
                    catch(e){ error = e.message }
                }
                else if(typeof chrome == 'object' && typeof chrome.storage == 'object')
                {
                    chrome.storage.local.set(db, function()
                    {
                        callback();
                    });
                }
                else
                {
                    error = localStorage.setItem('db', JSON.stringify(db));
                }
                
                callback(error);
            }
        },
        update: async function(fields = false, callback = false)
        {
            if(typeof fields == 'object' && typeof callback == 'function')
            {
                var error = false;
                
                if(typeof browser != 'undefined' && typeof browser != null && typeof browser.storage == 'object' && typeof browser.storage.local == 'object')
                {
                    try
                    {
                        error = await browser.storage.local.set(fields);
                    }
                    catch(e){ error = e.message }
                    callback(error);
                }
                else if(typeof chrome == 'object' && typeof chrome.storage == 'object')
                {
                    chrome.storage.local.set(fields, function(e)
                    {
                        callback(error);
                    });
                }
                else
                {
                    eden.data.get(function(old_db)
                    {
                        var db = JSON.parse(JSON.stringify(old_db));
                        
                        if(db)
                        {
                            jQuery.each(fields, function(k, v)
                            {
                                db[k] = v;
                            });

                            error = localStorage.setItem('db', JSON.stringify(db));
                            setTimeout(function()
                            {
                                callback(error);
                            }, 150);
                        }
                    })
                }
            }
        }
    },
    forms: function()
    {
        var setup = 'form-ordit-wallet-setup';
        var register = 'form-ordit-wallet-register';
        var recover = 'form-ordit-wallet-recover';
        var login = 'form-ordit-wallet-login';
        var send = 'form-ordit-wallet-send';

        if(window.location.href.indexOf('localhost') > 0)
        {
            eden_domain_id = 'localhost';
        }
        
        jQuery('body').on('submit', '.' + login, function(e)
        {
            e.preventDefault();
            var form = jQuery(this);
            var identifier = jQuery(form).find('#' + login + '-0').val();
            var id_type = jQuery(form).find('#' + login + '-1').val();
            if
            (
                (
                    id_type == 'any'
                )
                ||
                (
                    identifier && id_type
                    &&
                    (
                        id_type == 'dns'
                        || id_type == 'pk'
                        || id_type == 'any'
                    )
                )
            )
            {
                if(typeof eden.db.db == 'object')
                {
                    async function recover(public_key_hex)
                    {
                        if(id_type == 'any' && typeof eden.db.db.pk != 'undefined')
                        {
                            public_key_hex = eden.db.db.pk;
                        }
                        var publicKeyCredentialGetOptions = 
                        {
                            challenge: Buffer.from('the-challenge', 'utf8'),
                            rpId: eden_domain_id,
                            userVerification: "required",
                            attestation: 'direct',
                            allowCredentials: [{
                                type: "public-key",
                                id: Buffer.from(public_key_hex, 'hex')
                            }],
                            extensions:
                            {
                                largeBlob: 
                                {
                                    read: true
                                }
                            }
                        };

                        try
                        {
                            var credential = await navigator.credentials.get({
                                publicKey: publicKeyCredentialGetOptions
                            });
                            var pk = Buffer.from(credential.rawId).toString('hex');
                            var extensions = credential.getClientExtensionResults();
                            
                            var stored_data = false;
                            
                            try
                            {
                                stored_data = Buffer.from(extensions.largeBlob.blob).toString('utf8');
                            }
                            catch(e){}

                            if(stored_data)
                            {
                                var addresses = await cortex.sdk.get('addresses', 
                                {
                                    seed: stored_data, 
                                    balances: false, 
                                    object: true, 
                                    currencies:[
                                    {
                                        type: 'utxo', 
                                        format: 'legacy', 
                                        networks: ['bitcointestnet']
                                    }]
                                });
                                var address = addresses.utxo.bitcointestnet[0].account.address;
                                var public_key = addresses.utxo.bitcointestnet[0].account.pub;
                                
                                var db = 
                                {
                                    pk: pk,
                                    address: address,
                                    hash: btc.crypto.sha256(Buffer.from(stored_data, 'hex')).toString('hex'),
                                    key: public_key
                                }
                                await eden.data.set(db, function(error)
                                {
                                    if(!error)
                                    {
                                        location.reload(true);
                                    }
                                    else
                                    {
                                        eden.modal('Login Error', error);
                                    }
                                });
                            }
                            else
                            {
                                eden.modal('Login Warning', 'Browser not supported');
                            }
                        }
                        catch(e)
                        {
                            eden.modal('Login Warning', e.toString());
                        }
                    }
                    if(id_type == 'dns')
                    {
                        ordit.sdk.dnkeys(identifier, function(dnkeys)
                        {   
                            if(typeof dnkeys["project-eden-pk"] != 'undefined')
                            {
                                var pk = dnkeys["project-eden-pk"];
                                recover(pk);
                            }
                            else
                            {
                                eden.modal('Login Warning', 'Unable to verify DNS records');
                            }
                        });
                    }
                    else
                    {
                        recover(identifier);
                    }
                }
                else
                {
                    eden.modal('Login Warning', 'Unable to find necessary device credentials');
                }
            }
        });
        jQuery('body').on('submit', '.' + recover, async function(e)
        {
            e.preventDefault();
            var form = jQuery(this);
            var shard_1 = jQuery(form).find('#' + recover + '-0').val();
            var shard_2 = jQuery(form).find('#' + recover + '-1').val();
            var identifier = jQuery(form).find('#' + recover + '-2').val();
            var user_type = jQuery(form).find('#' + recover + '-3').val();
            if
            (
                shard_1 && shard_2
                &&
                (
                    (
                        identifier
                        &&
                        (
                            user_type == 'dns'
                            || user_type == 'pk'
                        )
                    )
                    ||
                    user_type == 'all'
                )
            )
            {
                console.info('READY TO RECOVER');
                try
                {
                    var publicKeyCredentialCreationOptions = 
                    {
                        challenge: Buffer.from('the-challenge', 'utf8'), // this should be random
                        rp: {
                            id: eden_domain_id,
                            name: "Project Eden" // required but not seen in UX anywhere?
                        },
                        user: {
                            id: Buffer.from(eden_user_id, 'utf8'),
                            name: eden_user_id,
                            displayName: "Eden User" // required but not seen in UX anywhere?
                        },
                        pubKeyCredParams: [
                            {alg: -7, type: "public-key"},
                            {alg: -257, type: "public-key"}
                        ],
                        attestation: 'direct',
                        authenticatorSelection: {
                            residentKey: "required",  // Or "preferred".
                        },
                        extensions: {
                            credProps: true, // limited support
                            largeBlob:
                            {
                                support: 'required' // supported by chrome with iOS auth and safari on iOS 
                            }
                        }
                    };
                    
                    var error = 'Unable to re-write to credentials';
                    
                    var now_know_key = async function(pk)
                    {
                        var seed = secrets.combine([shard_1, shard_2]);

                        var addresses = await cortex.sdk.get('addresses', 
                        {
                            seed: seed, 
                            balances: false, 
                            object: true, 
                            currencies:[
                            {
                                type: 'utxo', 
                                format: 'legacy', 
                                networks: ['bitcointestnet']
                            }]
                        });
                        var address = addresses.utxo.bitcointestnet[0].account.address;
                        var public_key = addresses.utxo.bitcointestnet[0].account.pub;

                        var pk_write_options = 
                        {
                            challenge: Buffer.from('the-challenge', 'utf8'),
                            rpId: eden_domain_id,
                            userVerification: "required",
                            attestation: 'direct',
                            allowCredentials: [{
                                type: "public-key",
                                id: Buffer.from(pk, 'hex')
                            }],
                            extensions:
                            {
                                largeBlob: 
                                {
                                    write: Buffer.from(seed, 'utf8')
                                }
                            }
                        };

                        var write_credentials = await navigator.credentials.get({
                            publicKey: pk_write_options
                        });
                        var extensions = write_credentials.getClientExtensionResults();

                        var pk2 = Buffer.from(write_credentials.rawId).toString('hex');

                        var passed = false;
                        if(pk2 == pk)
                        {
                            try
                            {
                                passed = extensions.largeBlob.written;
                            }
                            catch(e){}
                        }

                        if(passed)
                        {
                            var db = 
                            {
                                pk: pk,
                                address: address,
                                hash: btc.crypto.sha256(Buffer.from(seed, 'hex')).toString('hex'),
                                key: public_key
                            }
                            await eden.data.set(db, function(error)
                            {
                                if(!error)
                                {
                                    eden.db.db.pk = db.pk;
                                    eden.db.db.setup = true;
                                    eden.db.db.key = db.pk;
                                    eden.db.user = 
                                    {
                                        pk: db.pk,
                                        hash: db.hash,
                                        address: db.address,
                                        key: db.key
                                    }

                                    if(user_type == 'all')
                                    {
                                        var message = 'Your <code>new</code> WebAuthN Public Key:<br /><pre>' + pk + '</pre>';
                                        eden.modal('Recover Success', message);
                                    }
                                    else
                                    {
                                        location.reload(true);
                                    }
                                }
                                else
                                {
                                    eden.modal('Recover Error', error);
                                }
                            })
                        }
                        else
                        {
                            eden.modal('Setup Error', error);
                        }
                    }
                    
                    if(user_type == 'pk')
                    {
                        now_know_key(Buffer.from(identifier).toString('hex'));
                    }
                    else if(user_type == 'dns')
                    {
                        ordit.sdk.dnkeys(identifier, function(dnkeys)
                        {   
                            if(typeof dnkeys["project-eden-pk"] != 'undefined')
                            {
                                now_know_key(dnkeys["project-eden-pk"]);
                            }
                        });
                    }
                    else
                    {
                        // Need to generate new WebAuthN PK
                        var publicKeyCredentialCreationOptions = 
                        {
                            challenge: Buffer.from('the-challenge', 'utf8'), // this should be random
                            rp: {
                                id: eden_domain_id,
                                name: "Project Eden" // required but not seen in UX anywhere?
                            },
                            user: {
                                id: Buffer.from(eden_user_id, 'utf8'),
                                name: eden_user_id,
                                displayName: "Eden User" // required but not seen in UX anywhere?
                            },
                            pubKeyCredParams: [
                                {alg: -7, type: "public-key"},
                                {alg: -257, type: "public-key"}
                            ],
                            attestation: 'direct',
                            authenticatorSelection: {
                                residentKey: "required",  // Or "preferred".
                            },
                            extensions: {
                                credProps: true, // limited support
                                largeBlob:
                                {
                                    support: 'required' // supported by chrome with iOS auth and safari on iOS 
                                }
                            }
                        };
                        var new_credentials = await navigator.credentials.create({
                            publicKey: publicKeyCredentialCreationOptions
                        });
                        now_know_key(Buffer.from(new_credentials.rawId).toString('hex'));
                    }
                }
                catch(e)
                {
                    eden.modal('Recover Error', e.toString());
                }
            }
        });
        
        jQuery('body').on('submit', '.' + send, async function(e)
        {
            e.preventDefault();
            var form = jQuery(this);
            var destination = jQuery(form).find('#' + send + '-0').val();
            var value = jQuery(form).find('#' + send + '-1').val();
            var value_type = jQuery(form).find('#' + send + '-2').val();
            var memo = jQuery(form).find('#' + send + '-3').val();
            
            if
            (
                destination && value
                &&
                (
                    value_type == 'lamports'
                    || value_type == 'usdc'
                )
            )
            {
                eden.loader(true, 'SENDING');
                
                // cardinals only support for now ...
                var lamports = parseInt(value);
                
                var publicKeyCredentialGetOptions = 
                {
                    challenge: Buffer.from('the-challenge', 'utf8'),
                    rpId: eden_domain_id,
                    userVerification: "required",
                    attestation: 'direct',
                    allowCredentials: [{
                        type: "public-key",
                        id: Buffer.from(eden.db.user.pk, 'hex')
                    }],
                    extensions:
                    {
                        largeBlob: 
                        {
                            read: true
                        }
                    }
                };

                try
                {
                    var credentials = await navigator.credentials.get({
                        publicKey: publicKeyCredentialGetOptions
                    });
                    var pk = Buffer.from(credentials.rawId).toString('hex');
                    var extensions = credentials.getClientExtensionResults();

                    var stored_data = false;

                    try
                    {
                        stored_data = Buffer.from(extensions.largeBlob.blob).toString('utf8');
                    }
                    catch(e){}

                    if(stored_data)
                    {
                        var addresses = await cortex.sdk.get('addresses', 
                        {
                            seed: stored_data, 
                            balances: false, 
                            object: true, 
                            currencies:[
                            {
                                type: 'utxo', 
                                format: 'legacy', 
                                networks: ['bitcointestnet']
                            }]
                        });
                        
                        var address = addresses.utxo.bitcointestnet[0].account.address;
                        var public_key = addresses.utxo.bitcointestnet[0].account.pub;
                        var private_key = addresses.utxo.bitcointestnet[0].account.key;
                        
                        var type = eden.db.wallet.settings.type;
                        var network = eden.db.wallet.settings.network;
                        var format = eden.db.wallet.account.format;
                        
                        var contract = false;
                        if(value_type == 'usdc' && typeof cortex.config.currencies.utxo.bitcointestnet.parent_mint != 'undefined')
                        {
                            contract = cortex.config.currencies.utxo.bitcointestnet.parent_mint;
                        }
                            
                        var prepared_options = 
                        {
                            destination: destination,
                            amount: lamports,
                            network: network,
                            format: format,
                            key: public_key,
                            contract: contract,
                            fees: 'auto'
                        }
                        
                        if(memo)
                        {
                            prepared_options.memo = memo;
                        }
                        
                        console.info('prepared_options', prepared_options);
                        var prepared = await cortex.sdk.prepare
                        (
                            type, 'send', prepared_options
                        ).catch(error => prepared = error);
                        console.info('ux.prepared', prepared);

                        if
                        (
                            typeof prepared == 'object'
                            && typeof prepared.hex != 'undefined'
                        )
                        {
                            var signed_options = 
                            {
                                tx: prepared.hex,
                                network: network,
                                key: private_key
                            }
                            console.info('signed_options', signed_options);
                            var signed = await cortex.sdk.sign
                            (
                                type, 'transaction', signed_options
                            ).catch(error => signed = error);
                            console.info('ux.signed', signed);

                            if
                            (
                                typeof signed == 'object'
                                && typeof signed.hex != 'undefined'
                            )
                            {
                                var relayed_options = 
                                {
                                    tx: signed.hex,
                                    network: network
                                }
                                console.info('relayed_options', relayed_options);
                                var relayed = await cortex.sdk.api
                                (
                                    type, 'relay', relayed_options
                                ).catch(error => relayed = error);
                                console.info('ux.relayed', relayed);

                                var msg = relayed;
                                var title = 'Relay Warning';
                                if
                                (
                                    typeof relayed == 'object'
                                    && typeof relayed.txid != 'undefined'
                                )
                                {
                                    title = 'Relay Success';
                                    msg = 'TXID:<pre>' + relayed.txid + '</pre>';
                                }
                                eden.modal(title, msg);
                            }
                            else
                            {
                                eden.modal('Sign Warning', signed);
                            }
                        }
                        else
                        {
                            eden.modal('Prepare Warning', prepared);
                        }
                    }
                    else
                    {
                        eden.modal('Send Error', 'Unable to get full credentials');
                    }
                }
                catch(e)
                {
                    eden.modal('Send Error', e.toString());
                }
            }
            else
            {
                if(name == password)
                {
                    eden.modal('Send Warning', 'Name cannot match password');
                }
            }
        });
        
        jQuery('body').on('submit', '.' + register, async function(e)
        {
            e.preventDefault();
            var form = jQuery(this);
            var identifier = jQuery(form).find('#' + register + '-0').val();
            
            var credential_id = false;
            var prevent_reregistration = true;
            await eden.data.get(async function(db)
            { 
                try
                {
                    credential_id = db.pk;
                }
                catch(e){}

                var publicKeyCredentialCreationOptions = 
                {
                    challenge: Buffer.from('the-challenge', 'utf8'), // this should be random
                    rp: {
                        id: eden_domain_id,
                        name: "Project Eden" // required but not seen in UX anywhere?
                    },
                    user: {
                        id: Buffer.from(eden_user_id, 'utf8'),
                        name: eden_user_id,
                        displayName: "Eden User" // required but not seen in UX anywhere?
                    },
                    pubKeyCredParams: [
                        {alg: -7, type: "public-key"},
                        {alg: -257, type: "public-key"}
                    ],
                    attestation: 'direct',
                    authenticatorSelection: {
                        residentKey: "required",  // Or "preferred".
                    },
                    extensions: {
                        credProps: true, // limited support
                        largeBlob:
                        {
                            support: 'required' // supported by chrome with iOS auth and safari on iOS 
                        }
                    }
                };

                if(prevent_reregistration && credential_id)
                {
                    publicKeyCredentialCreationOptions.excludeCredentials = 
                    [
                        {
                            type: "public-key",
                            id: Buffer.from(credential_id, 'hex')
                        }
                    ]
                }

                try
                {
                    var error = 'Unable to write to credentials';
                    var credential = await navigator.credentials.create({
                        publicKey: publicKeyCredentialCreationOptions
                    });
                    var pk = Buffer.from(credential.rawId).toString('hex');
                    
                    var ts = new Date().getTime();
                    var nonce = Buffer.from(credential.response.attestationObject).toString('hex');
                    var hash = btc.crypto.sha256(Buffer.from(nonce + '_' + ts + '_' + pk), 'utf8');
                    var rand = new randchacha.ChaChaRng(hash);
                    var seeds1 = Buffer.from(parseInt(rand.nextU64()).toString()).toString('hex');
                    var seeds2 = Buffer.from(parseInt(rand.nextU64()).toString()).toString('hex');
                    var seed = btc.crypto.sha256(Buffer.from(seeds1 + seeds2, 'hex')).toString('hex');
                    
                    var addresses = await cortex.sdk.get('addresses', 
                    {
                        seed: seed, 
                        balances: false, 
                        object: true, 
                        currencies:[
                        {
                            type: 'utxo', 
                            format: 'legacy', 
                            networks: ['bitcointestnet']
                        }]
                    });
                    var address = addresses.utxo.bitcointestnet[0].account.address;
                    var public_key = addresses.utxo.bitcointestnet[0].account.pub;

                    var pk_write_options = 
                    {
                        challenge: Buffer.from('the-challenge', 'utf8'),
                        rpId: eden_domain_id,
                        userVerification: "required",
                        attestation: 'direct',
                        allowCredentials: [{
                            type: "public-key",
                            id: Buffer.from(pk, 'hex')
                        }],
                        extensions:
                        {
                            largeBlob: 
                            {
                                write: Buffer.from(seed, 'utf8')
                            }
                        }
                    };
                    
                    var write_credentials = await navigator.credentials.get({
                        publicKey: pk_write_options
                    });
                    var extensions = write_credentials.getClientExtensionResults();
                    
                    var pk2 = Buffer.from(write_credentials.rawId).toString('hex');
                    
                    var passed = false;
                    if(pk2 == pk)
                    {
                        try
                        {
                            passed = extensions.largeBlob.written;
                        }
                        catch(e){}
                    }
                    
                    if(passed)
                    {
                        var db = 
                        {
                            pk: pk,
                            address: address,
                            hash: btc.crypto.sha256(Buffer.from(seed, 'hex')).toString('hex'),
                            key: public_key
                        }
                        await eden.data.set(db, function(error)
                        {
                            if(!error)
                            {
                                var message = 'Your WebAuthN Public Key: ' + pk;
                                
                                if(identifier)
                                {
                                    message = '<p>Update DNS TXT record for <code>' + identifier + '</code>:</p><pre>dnkey-project-eden-pk=' + pk + '</pre>';
                                }
                                eden.modal('Setup Success', message);
                            }
                            else
                            {
                                eden.modal('Setup Error', error);
                            }
                        })
                    }
                    else
                    {
                        eden.modal('Setup Error', error);
                    }
                }
                catch(e)
                {
                    eden.modal('Setup Error', e);
                }
            });
        });
    },
    init: function()
    {
        eden.markdown();
    },
    selects: function()
    {
        
    },
    buttons: function()
    {
        jQuery('body').on('click', '.btn-ordit-sender', async function(e)
        {
            var value_type = 'lamports';
            var button = jQuery(this);
            
            if(jQuery(button).attr('data-type'))
            {
                value_type = jQuery(button).attr('data-type');
            }
            
            jQuery('#form-ordit-wallet-send-2').val(value_type);
        });
        jQuery('body').on('click', '.btn-ordit-new-keys', async function(e)
        {
            e.preventDefault();
            var button = jQuery(this);
            
            var publicKeyCredentialGetOptions = 
            {
                challenge: Buffer.from('the-challenge', 'utf8'),
                rpId: eden_domain_id,
                userVerification: "required",
                attestation: 'direct',
                allowCredentials: [{
                    type: "public-key",
                    id: Buffer.from(eden.db.user.pk, 'hex')
                }],
                extensions:
                {
                    largeBlob: 
                    {
                        read: true
                    }
                }
            };

            try
            {
                var credentials = await navigator.credentials.get({
                    publicKey: publicKeyCredentialGetOptions
                });
                var pk = Buffer.from(credentials.rawId).toString('hex');
                var extensions = credentials.getClientExtensionResults();

                var stored_data = false;

                try
                {
                    stored_data = Buffer.from(extensions.largeBlob.blob).toString('utf8');
                }
                catch(e){}
                
                if(stored_data)
                {
                    var shards = secrets.share(secrets.str2hex(stored_data), 3, 2);
                    eden.data.update({backup: shards[0]}, function(error)
                    {
                        if(!error)
                        {
                            var contents = '<div class="row">';
                            contents+= '<div class="col-md-6">';
                            contents+= '<alert class="alert alert-block alert-info"><small>SHARD #1:<br /><pre>' + shards[1] + '</pre></small></alert>';
                            contents+= '<div class="qr-holder" data-content="' + shards[1] + '"></div>';
                            contents+= '<hr><a href="#" class="btn btn-block btn-primary btn-ordit-copy" data-content="' + shards[1] + '">COPY</a>';
                            contents+= '</div>';
                            contents+= '<div class="col-md-6">';
                            contents+= '<alert class="alert alert-block alert-info"><small>SHARD #2:<br /><pre>' + shards[2] + '</pre></small></alert>';
                            contents+= '<div class="qr-holder" data-content="' + shards[2] + '"></div>';
                            contents+= '<hr><a href="#" class="btn btn-block btn-primary btn-ordit-copy" data-content="' + shards[2] + '">COPY</a>';
                            contents+= '</div>';
                            contents+= '</div>';
                            
                            eden.modal('Backup Shards', contents);
                        }
                        else
                        {
                            eden.modal('Backup Error', error);
                        }
                    });
                }
                else
                {
                    eden.modal('Backup Error', 'Unable to get credentials');
                }
            }
            catch(e)
            {
                eden.modal('Backup Error', e.toString());
            }
        });
        
        jQuery('body').on('click', '.btn-ordit-qr', function(e)
        {
            e.preventDefault();
            var content = jQuery(this).attr('data-content');
            var title = jQuery(this).attr('data-title');
            var results = '<div class="row">';
            results+= '<div class="col-sm-3"></div>';
            results+= '<div class="col-sm-6">';
            results+= '<alert class="alert alert-block alert-info"><small>' + title + ':<br /><pre>' + content + '</pre></small></alert>';
            results+= '<div class="qr-holder" data-content="' + content + '"></div>';
            results+= '<hr><a href="#" class="btn btn-block btn-primary btn-ordit-copy" data-content="' + content + '">COPY</a>';
            results+= '</div>';
            results+= '<div class="col-sm-3"></div>';
            results+= '</div>';
            eden.modal(title, results);
        });
        
        jQuery('body').on('click', '.btn-ordit-reset-wallet', function(e)
        {
            e.preventDefault();
            
            eden.loader(true, 'RESETTING');

            eden.data.remove(['key', 'hash', 'address', 'user', 'provide', 'wallet'], function(error)
            {
                location.reload(true);
            })
        });
    },
    markdown: function()
    {
        var c = 0;
        var m = jQuery('.batter-markdown').length;
        if(jQuery('.batter-markdown').length > 0)
        {
            jQuery('.batter-markdown').each(function(i)
            {
                var div = jQuery(this);
                var url = jQuery(div).attr('data-url');
                eden.md(url, function(html)
                {
                    jQuery(div).html(html);
                    c++;
                    if(m == c)
                    {
                        eden.mustache();
                    }
                })
            });
        }
        else
        {
            eden.mustache();
        }
    },
    md: function(url, callback)
    {
        if(url && typeof callback == 'function')
        {
            jQuery.ajax({
                url: url,
                dataType: 'html',
                async: true,
                cache: false,
                success: function(res)
                {
                    var html = marked.parse(res);
                    callback(html);
                }
            });
        }
    },
    modal: function(title, contents, id = false)
    {
        if((title && contents) || id)
        {
            eden.loader(false);
            if(jQuery('.modal.show').length > 0)
            {
                jQuery('.modal.show').each(function(m)
                {
                    var id = jQuery(this).attr('id');
                    var this_modal = bootstrap.Modal.getInstance(
                        document.getElementById(id)
                    );
                    this_modal.hide();
                });
            }
            if(!id)
            {
                id = 'default-modal';
                jQuery('#' + id).find('.modal-title').html(title);
                jQuery('#' + id).find('.modal-body').html(contents);
            }
            if(jQuery('#' + id).find('.qr-holder').length > 0)
            {
                eden.qr();
            }
            var el = document.getElementById(id);
            var modal = new bootstrap.Modal(el, {
                keyboard: true,
                backdrop: true,
                focus: false
            });
            el.addEventListener('hidden.bs.modal', function (event)
            {

            });
            el.addEventListener('shown.bs.modal', function (event)
            {
                eden.copy(id);
            });
            modal.show();
        }
    },
    copy: function(focus = false)
    {
        if(jQuery('.btn-ordit-copy').length > 0)
        {
            try
            {
                if(focus)
                {
                    eden_clipboard = new ClipboardJS('.btn-ordit-copy', {
                        container: document.getElementById(focus),
                        text: function(trigger) {
                            jQuery('.btn-copied').removeClass('btn-copied');
                            jQuery(trigger).addClass('btn-copied');
                            var text = trigger.getAttribute('data-content');
                            return text;
                        }
                    });
                }
                else
                {
                    eden_clipboard = new ClipboardJS('.btn-ordit-copy', {
                        container: document.getElementById('main-body'),
                        text: function(trigger) {
                            jQuery('.btn-copied').removeClass('btn-copied');
                            jQuery(trigger).addClass('btn-copied');
                            var text = trigger.getAttribute('data-content');
                            return text;
                        }
                    });
                }
            }
            catch(err){ console.info('copy.err', err)}
        }
    },
    qr: function()
    {
        jQuery('body').find('.qr-holder').each(function()
        {
            if(jQuery(this).find('img').length > 0)
            {
                jQuery(this).find('img').remove();
            }
            try
            {
                jQuery(this).qrcode({
                    render: 'image',
                    text: jQuery(this).attr('data-content')
                });
            }
            catch(e)
            {
                jQuery(this).html('<pre>' + jQuery(this).attr('data-content') + '</pre>');
            }
        });
    },
    loader: function(open = false, text = false)
    {
        if(open) jQuery('body').addClass('loading');
        else jQuery('body').removeClass('loading');

        if(text) jQuery('body').attr('data-text', text);
        else jQuery('body').attr('data-text', 'LOADING');
    },
    mustache: function()
    {
        var c = 0;
        var m = jQuery('.batter-mustache').length;
        
        var check_html = function()
        {
            eden.qr();
            eden.copy();
            eden.forms();
            eden.buttons();
            eden.selects();
            
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
              return new bootstrap.Tooltip(tooltipTriggerEl)
            })
            
            eden.loader(false);
        }
        
        if(jQuery('.batter-mustache').length > 0)
        {
            jQuery('.batter-mustache').each(function(i)
            {
                var div = jQuery(this);
                var content = jQuery(div).html();
                var html = '';
                
                try
                {
                    console.info('eden.db', eden.db);
                    html = Mustache.render(content, eden.db);
                }
                catch(e){}
                
                jQuery(div).html(html);
                c++;
                if(m == c)
                {
                    check_html();
                }
            });
        }
        else
        {
            check_html();
        }
    },
    html:
    {
        forms: 
        {
            create: function(params = {})
            {
                var options = 
                {
                    id: '',
                    css: '',
                    action: false,
                    submit: true,
                    fields: false
                };
                Object.assign(options, params);
                var html = '<form class="form ' + options.css + '" id="' + options.id + '">';
                if(typeof options.fields == 'object' && options.fields.length > 0)
                {
                    for(f = 0; f < options.fields.length; f++)
                    {
                        var field = options.fields[f];
                        if
                        (
                            typeof field.type != 'undefined'
                            && 
                            (
                                field.type == 'text'
                                || field.type == 'number'
                                || field.type == 'password'
                                || field.type == 'hidden'
                                || field.type == 'select'
                                || field.type == 'hr'
                                || field.type == 'alert'
                                || field.type == 'file'
                            )
                        )
                        {
                            if(field.type == 'hr' || field.type == 'alert')
                            {
                                if(field.type == 'alert' && typeof field.value != 'undefined')
                                {
                                    html+= '<alert class="alert alert-block alert-info">';
                                    html+= '<small>' + field.value + '</small>';
                                    html+= '</alert>';
                                }
                                else
                                {
                                    html+= '<hr>';
                                }
                            }
                            else
                            {
                                if
                                (
                                    field.type != 'hidden'
                                    && typeof field.label != 'undefined'
                                ){
                                    html+= '<div class="row mb-3">';
                                    html+= '<label for="' + options.css + '-' + f + '" class="col-sm-3 col-form-label">' + field.label + '</label>';
                                    html+= '<div class="col-sm-9">';
                                }

                                if(field.type == 'text' || field.type == 'hidden' || field.type == 'password' || field.type == 'number' || field.type == 'file')
                                {
                                    var ph = '';
                                    var val = '';
                                    if(typeof field.placeholder != 'undefined')
                                    {
                                        ph = field.placeholder;
                                    }
                                    if(typeof field.value != 'undefined')
                                    {
                                        val = field.value;
                                    }
                                    
                                    var np = '';
                                    if(field.type == 'number')
                                    {
                                        np = 'pattern="[0-9]*"';
                                    }
                                    if(np)
                                    {
                                        field.type = 'password';
                                    }
                                    
                                    var ro = '';
                                    if(typeof field.readonly != 'undefined' && field.readonly === true)
                                    {
                                        ro = ' readonly="readonly"';
                                    }
                                    html+= "<input class='form-control' type='" + field.type + "' name='" + options.css + "-" + f + "' id='" + options.css + "-" + f + "' placeholder='" + ph + "' value='" + val + "' autocomplete='off' " + np + "" + ro + " />";
                                }
                                else if(field.type == 'select' && typeof field.choices == 'object')
                                {
                                    html+= '<select class="form-control" name="' + options.css + '-' + f + '" id="' + options.css + '-' + f + '">';
                                    for(fc = 0; fc < field.choices.length; fc++)
                                    {
                                        var c = field.choices[fc];
                                        var selected = '';
                                        if(typeof c.selected != 'undefined' && c.selected)
                                        {
                                            selected = 'selected="selected"';
                                        }
                                        html+= '<option value="' + c.id + '" ' + selected + '>' + c.text + '</option>';
                                    }
                                    html+= '</select>';
                                }

                                if
                                (
                                    field.type != 'hidden'
                                    && typeof field.label != 'undefined'
                                ){
                                    html+= '</div>';
                                    html+= '</div>';
                                }
                            }
                        }
                    }
                }
                
                if(options.submit)
                {
                    html+= '<hr>';
                    html+= '<div class="row">';
                    html+= '<div class="col-sm-6">';

                    if(options.action)
                    {
                        html+= options.action;
                    }

                    html+= '</div>';
                    html+= '<div class="col-sm-6">';
                    html+= '<input class="btn btn-block btn-primary" type="submit" value="SUBMIT" />';
                    html+= '</div>';
                    html+= '</div>';
                }
                
                html+= '</form>';
                return html;
            }
        }
    }
}

var load_eden_wallet = async function()
{
    var seed = btc.crypto.sha256(Buffer.from('' + new Date().getTime()), 'utf8');
    var rand = new randchacha.ChaChaRng(seed);
    var fp = Buffer.from(parseInt(rand.nextU64()).toString(16)).toString('hex');

    eden.data.get(function(db)
    { 
        var backup = false;
        try
        {
            backup = db.backup;
        }
        catch(e){}

        eden.db.html.forms.register = eden.html.forms.create({
            css: 'form-ordit-wallet-register',
            fields:
            [
                {
                    type: 'text',
                    label: 'Username',
                    placeholder: 'Optional domain for storing public keys ?'
                }
            ]
        });
        eden.db.html.forms.recover = eden.html.forms.create({
            css: 'form-ordit-wallet-recover',
            fields:
            [
                {
                    type: 'text',
                    label: 'Shard #1',
                    placeholder: 'First of two RECOVERY SHARDS required ...',
                    value: backup
                },
                {
                    type: 'text',
                    label: 'Shard #2',
                    placeholder: 'Second of two RECOVERY SHARDS required ...'
                },
                {
                    type: 'text',
                    label: 'Identity',
                    placeholder: 'Username or Public Key ...'
                },
                {
                    type: 'select',
                    label: 'Type',
                    choices:
                    [
                        {
                            id: 'all',
                            text: 'Lost Everything'
                        },
                        {
                            id: 'dns',
                            text: 'DNS Username'
                        },
                        {
                            id: 'pk',
                            text: 'Public Key'
                        }
                    ]
                }
            ]
        });
        eden.db.html.forms.login = eden.html.forms.create({
            css: 'form-ordit-wallet-login',
            fields:
            [
                {
                    type: 'text',
                    label: 'Username',
                    placeholder: 'Simply type your Ovi.Cat username ...'
                },
                {
                    type: 'hidden',
                    value: 'dns'
                }
            ]
        });

        // TODO - make this list dynamic
        var value_types = 
        [
            {
                id: 'lamports',
                text: 'SOL'
            },
            {
                id: 'usdc',
                text: 'USDC'
            }
        ];
        
        eden.db.html.forms.send = eden.html.forms.create({
            css: 'form-ordit-wallet-send',
            fields:
            [
                {
                    type: 'text',
                    label: 'Destination',
                    placeholder: 'Must be a valid address ...'
                },
                {
                    type: 'text',
                    label: 'Value',
                    placeholder: 'How many of smallest selected unit to send ...?'
                },
                {
                    type: 'select',
                    label: 'Type',
                    choices: value_types
                }
            ]
        });

        var network = eden.db.db.defaults.network; 

        eden.data.get(async function(db)
        {
            if(db != null && typeof db == 'object')
            {
                if(typeof db.pk != 'undefined')
                {
                    eden.db.db.pk = db.pk;
                }
                if
                (
                    typeof db.provide == 'object'
                    && typeof db.provide.shards == 'object'
                    && typeof db.provide.key != 'undefined'
                    && typeof db.provide.dns != 'undefined'
                )
                {
                    eden.db.db.pending = 
                    {
                        form: eden.html.forms.provide(db)
                    };
                }
                else if
                (
                    typeof db.pk != 'undefined'
                    && typeof db.address != 'undefined'
                    && typeof db.hash != 'undefined'
                    && typeof db.key != 'undefined'
                )
                {
                    eden.db.db.setup = true;
                    eden.db.db.key = db.pk;
                    //eden.db.db.webauthk = db.key;
                    eden.db.user = 
                    {
                        pk: db.pk,
                        hash: db.hash,
                        address: db.address,
                        key: db.key
                    }
                }

                if
                (
                    eden.db.db.setup === true 
                    && typeof eden.db.user == 'object' 
                    && typeof db.provide != 'object'
                )
                {
                    eden.loader(true, 'FETCHING');
                    console.log('eden.db.user.key', eden.db.user.key);

                    var addresses = await cortex.sdk.get('addresses', 
                    {
                        key: eden.db.user.key, 
                        balances: true, 
                        object: true, 
                        currencies:[
                        {
                            type: 'utxo', 
                            format: 'taproot', 
                            networks: ['bitcoin']
                        }]
                    });
                    console.log('addresses', addresses);
                    eden.db.wallet = addresses.utxo.bitcoin[0];

                    eden.init();
                }
                else
                {
                    eden.init();
                }
            }
            else
            {
                eden.init();
            }
        });
    });
};