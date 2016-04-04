# The Standalone Static HTML BrainControl App

Please visit [BrainControl.me](http://braincontrol.me) for more information on the Bitcoin Wallet technicalities.

Can be embedded anywhere that has an internet connection and supports LocalStorage.

### Storing and Sending Bitcoin from Your Brain!

BrainControl is a 100% Browser-Based Bitcoin Wallet.

It requires a browser with HTML5 LocalStorage functionality, and uses inline
JavaScript to generate and manage non-existent private keys using deterministic
methods that combine salts, passwords and PINs. Manage your wallet without
actually storing your Bitcoin anywhere other than in your brain.

This repository contains several components, including:

* [STATIC HTML Version](https://github.com/msmalley/BrainControl/tree/master/html/)
* [FirefoxOS Application](https://github.com/msmalley/BrainControl/tree/master/bc-firefox/)
* [WordPress Theme](https://github.com/msmalley/BrainControl/tree/master/bc-wordpress)
* [MacOSX Desktop Application](https://github.com/msmalley/BrainControl/tree/master/bc-macosx/)
* [Windows Desktop Application](https://github.com/msmalley/BrainControl/tree/master/bc-windows/)

Download compiled ZIP files for the following platforms:

* FirefoxOS - [https://github.com/msmalley/BrainControl-FirefoxOS/archive/master.zip](https://github.com/msmalley/BrainControl-FirefoxOS/archive/master.zip)
* WordPress - [https://github.com/msmalley/BrainControl-WordPress/archive/master.zip](https://github.com/msmalley/BrainControl-WordPress/archive/master.zip)
* Windows - [https://github.com/msmalley/BrainControl-Windows/archive/master.zip](https://github.com/msmalley/BrainControl-Windows/archive/master.zip)
* MacOSX - [https://github.com/msmalley/BrainControl-MacOSX/archive/master.zip](https://github.com/msmalley/BrainControl-MacOSX/archive/master.zip)

For a more technical look behind the scenes and at what is to come, please see this
[technical blog post](http://betanomics.asia/blog/store-and-send-bitcoin-directly-from-your-brain-using-braincontrol).

Follow us on [Twitter](http://twitter.com/braincontrolme) for more updates.

Please view [todo.md](https://github.com/msmalley/BrainControl/tree/master/todo.md) for a full break-down of what is left to be done...

#### Current JS Dependencies (Not Mine but Included)

* jquery.js - http://jquery.com/
* transition.js - http://ricostacruz.com/jquery.transit/
* mustache.js - https://github.com/janl/mustache.js
* crypto.js - https://code.google.com/p/crypto-js/
* bitcoinjs.js - http://bitcoinjs.org/
* qrcode.js - https://github.com/LazarSoft/jsqrcode