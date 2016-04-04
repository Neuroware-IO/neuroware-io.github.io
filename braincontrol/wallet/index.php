<!doctype html>
<html>
<head>

<meta charset='utf-8' />
<meta name='viewport' content='width=device-width, initial-scale=1.0, minimal-ui'>
<meta name='apple-mobile-web-app-capable' content='yes'>
<link rel='apple-touch-icon' href='img/bc-icon.png'>
<link rel='apple-touch-startup-image' href='img/startup.png'>

<title>BrainControl</title>

<link href='css/braincontrol.css' rel='stylesheet'>

<!-- 3RD PARTY LIBS -->
<script src='js/jquery.js'></script>
<script src='js/transition.js'></script>
<script src='js/mustache.js'></script>
<script src='js/crypto.js'></script>
<script src='js/bitcoinjs.js'></script>
<script src='js/tx.js'></script>
<script src='js/qrcode.js'></script>


<!-- PRODUCTION VERSION - NEED RECOMPILING AND VERSIONING
<script src='js/braincontrol.min.js'></script>
-->

<!-- DEVELOPMENT / DEBUG SOURCE FOR ABOVE -->
<script src='js/config.js'></script>
<script src='js/base.js'></script>
<script src='js/blockchain.js'></script>
<script src='js/btc.js'></script>
<script src='js/buttons.js'></script>
<script src='js/braincontrol.js'></script>

<style>

body {
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	width: 100%;
	overflow: hidden;
	background: #333;
	margin: 0;
	padding: 0;
	border: none;
}

</style>

</head>
<body>

<div id="braincontrol"></div>

<script>
$(window).load(function(e)
{
	braincontrol.init();
});
</script>

</body>
</html>