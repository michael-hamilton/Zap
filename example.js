const scene = new THREE.Scene();
const w = window. innerWidth;
const h = window. innerHeight;
const camera = new THREE. PerspectiveCamera ( 75, w/ h, 0.1, 1000 );
const geometry = new THREE. BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshPhongMaterial( { color: 0x124ff } );

const cube = new THREE.Mesh ( geometry, material );
scene.add ( cube );

const spotLight = new THREE. SpotLight( 0xffffff, 1 );
spotLight.position.set( 0, 0, 10 );
spotLight.lookAt (0, 0, 0);
spotLight.castShadow = true;
scene.add ( spotLight );

camera.position.z = 2;

const animate = () => {
	requestAnimationFrame ( animate );
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	renderer.render(scene, camera);
}
animate ();