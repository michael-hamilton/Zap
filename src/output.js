export const threeJSEditorOutput =  (code) => `
	<html lang="en">
		<style>
		 *, * * {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
			position: relative;
		 }
		 html, body, #canvas {
			height: 100%;
			overflow: hidden;
			width: 100%;
		 }
		</style>
		<head>
		</head>
		<body>
			<script>
			const formatMessage = (message) => {
				return message;
			};
			
			const _log = console.log;
			console.log = (...rest) => {
				window.parent.postMessage(
					{
						source: 'iframe',
						message: formatMessage(rest),
					},
					'*'
				);
				_log.apply(console);
			};
		</script>
		<script src="https://ajax.googleapis.com/ajax/libs/threejs/r84/three.min.js"></script>
		<script>
			const renderer = new THREE.WebGLRenderer();
			renderer.setSize( window.innerWidth, window.innerHeight );
			document.body.appendChild( renderer.domElement );
	
			window.addEventListener( 'resize', () => {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}, false );
			${code}
		</script>
		</body>
	</html>
`;