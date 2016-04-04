var PRIVATE_KEY_VERSION = 0x80;

btc = new function(){

	this.keys = function(secret, password)
	{
		var hash_str = Crypto.SHA256(secret);
		var hash = Crypto.util.hexToBytes(hash_str);
		var eckey = new Bitcoin.ECKey(hash);
		var pass = password || hash_str;
		var result = false;
		try
		{
			var curve = getSECCurveByName("secp256k1");
			var gen_pt = curve.getG().multiply(eckey.priv);
			eckey.pub = this.encode(gen_pt, false);
			eckey.pubKeyHash = Bitcoin.Util.sha256ripe160(eckey.pub);
			var pub = eckey.getBitcoinAddress();
			var priv = new Bitcoin.Address(hash);
			priv.version = 128;
			var payload = this.encrypt(hash_str+','+pub+','+priv, pass);
			result = {'result':1, 'secret':hash_str, 'pubkey':pub, 'privkey':priv, 'payload':payload, 'payload_hash':Crypto.SHA256(payload), 'response':'keys generated'};
		}
		catch(error)
		{
			result = {'result':0, 'error':error, 'response':base.lang('Invalid secret exponent (must be non-zero value)')};
		}
		return result;
	}

	this.encrypt = function(string, key)
	{
		return '' + CryptoJS.AES.encrypt(string, Crypto.SHA256(key));
	}

	this.encode = function(pt, compressed)
	{
		var x = pt.getX().toBigInteger();
		var y = pt.getY().toBigInteger();
		var enc = integerToBytes(x, 32);
		if(compressed)
		{
			if(y.isEven())
			{
				enc.unshift(0x02);
			}
			else
			{
				enc.unshift(0x03);
			}
		}
		else
		{
			enc.unshift(0x04);
			enc = enc.concat(integerToBytes(y, 32));
		}
		return enc;
	}

	this.decode = function(input)
	{
		var base = BigInteger.valueOf(58);
		var length = input.length;
		var num = BigInteger.valueOf(0);
		var leading_zero = 0;
		var seen_other = false;
		for(var i=0; i<length ; ++i)
		{
		  var chr = input[i];
		  var p = positions[chr];

		  // if we encounter an invalid character, decoding fails
		  if (p === undefined)
		  {
			  throw new Error('invalid base58 string: ' + input);
		  }
		  num = num.multiply(base).add(BigInteger.valueOf(p));

		  if(chr == '1' && !seen_other)
		  {
			  ++leading_zero;
		  }
		  else
		  {
			  seen_other = true;
		  }
		}
		var bytes = num.toByteArrayUnsigned();

		// remove leading zeros
		while(leading_zero-- > 0)
		{
		  bytes.unshift(0);
		}
		return bytes;
	}

	this.check = function(input)
	{
		var bytes = this.decode(input);
		var front = bytes.slice(0,bytes.length-4);
		var back = bytes.slice(bytes.length-4);
		var checksum = Crypto.SHA256(Crypto.SHA256(front,{asBytes: true}), {asBytes: true}).slice(0,4);
		if (""+checksum != ""+back)
		{
			throw new Error("Checksum failed");
		}
		var o = front.slice(1);
		o.version = front[0];
		return o;
	}

	this.validate = function(address)
	{
		try {
			this.check(address);
			return true;
		} catch (e) {
			return false;
		}
	}

	this.raw = function(return_address, privkey, these_inputs, these_outputs, this_fee, amount_to_send)
	{
		var secret = Bitcoin.Base58.decode(privkey).slice(1, 33);
		var eckey = new Bitcoin.ECKey(secret);
		var fee = 0;
		var balance = 0;
		var total = 0;

		if(this_fee) fee = this_fee;
		if(amount_to_send) total = amount_to_send;

		TX.init(eckey);

		$.each(these_inputs, function(i, o)
		{
			balance+= o.value;
			var unspent = {'txid':o.txid, 'n': o.n, 'script':o.script,'value': o.value*1};
			TX.addInputs(unspent, TX.getAddress());
		});

		$.each(these_outputs, function(i, o)
		{
			TX.addOutput(these_outputs[i].address, parseFloat(these_outputs[i].value));
		});

		if(balance > (total + fee))
		{
			var change = balance - (total + fee);
			TX.addOutput(return_address, parseFloat(change / 100000000).toFixed(8));
		}

		var sendTx = (TX.construct());
		return Crypto.util.bytesToHex(sendTx.serialize());
	}

	this.unspent = function(address, callback_function)
	{

		//var url = 'https://blockchain.info/unspent?active=12iFXjZcSJTkx1Xv3U2e4wFLCP4QaaUi3n';
		var url = 'https://blockchain.info/unspent?active='+address;

		var useYQL = true;

		if (useYQL) {
			var q = 'select * from html where url="'+url+'"';
			url = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(q);
		}

		$.ajax({
			url: url,
			dataType: 'XML',
			success: function(res) {
				var results = $(res).find('results').text();
				if(!results)
				{
					base.alert(base.lang('No available funds / error connecting - please try again'));
					braincontrol.unload();
				}
				else if(results == 'No free outputs to spend')
				{
					base.alert(results);
					braincontrol.unload();
				}
				else
				{
					if(base.is_json(results))
					{
						var json_results = JSON.parse(results);
						if(!json_results.unspent_outputs)
						{
							callback_function(json_results);
						}
						else
						{
							callback_function(json_results.unspent_outputs);
						}
					}
					else
					{
						base.alert(base.lang('Error fetching unspent'));
						braincontrol.unload();
					}
				}
			},
			error:function (xhr, opt, err) {
				console.log(err);
			}
		});
	}

	this.convert = function(key) {
		var secret = Bitcoin.Base58.decode(key).slice(1, 33);
		var eckey = new Bitcoin.ECKey(secret);
		return eckey.getBitcoinAddress().toString();
	}

}