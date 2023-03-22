import './style.css'
import * as THREE from 'three'

// (1) Importar VRButton per abilitar el mode VR /////////////////////////////////////////////
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import {BoxLineGeometry} from "three/examples/jsm/geometries/BoxLineGeometry.js";
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Escena
const scene = new THREE.Scene()


let count = 0;
const radius = 0.08;

// Objecte(s):

const room = new THREE.LineSegments(
    new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
    new THREE.LineBasicMaterial( { color: 0x808080 } )
);
room.geometry.translate( 0, 3, 0 );
scene.add( room );

const light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 1, 1, 1 ).normalize();
scene.add( light );

const geometry = new THREE.IcosahedronGeometry( radius, 3 );

for ( let i = 0; i < 200; i ++ ) {

    const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

    object.position.x = Math.random() * 4 - 2;
    object.position.y = Math.random() * 4;
    object.position.z = Math.random() * 4 - 2;

    object.userData.velocity = new THREE.Vector3();
    object.userData.velocity.x = Math.random() * 0.01 - 0.005;
    object.userData.velocity.y = Math.random() * 0.01 - 0.005;
    object.userData.velocity.z = Math.random() * 0.01 - 0.005;

    room.add( object );

}


// Mides
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Redimensionar finestra
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 10)
camera.position.set(0, 1.6, 3);
scene.add(camera)


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding;

// (2) Abilitar el mode XR del renderer //////////////////////////////////////////////////////////////////
renderer.xr.enabled = true;


// Controladors VR (esquerra i dreta)

function onSelectStart() {
    this.userData.isSelecting = true;
}

function onSelectEnd() {
    this.userData.isSelecting = false;
}

// Controlador 1
const controller1 = renderer.xr.getController( 0 );
controller1.addEventListener( 'selectstart', onSelectStart);
controller1.addEventListener( 'selectend', onSelectEnd );
controller1.addEventListener( 'connected', function ( event ) {
    this.add( buildController( event.data ) );
} );
scene.add(controller1)

// Controlador 2
const controller2 = renderer.xr.getController( 1 );
controller2.addEventListener( 'selectstart', onSelectStart);
controller2.addEventListener( 'selectend',  onSelectEnd);
controller2.addEventListener( 'connected', function ( event ) {
    this.add( buildController( event.data ) );
} );
controller2.addEventListener( 'disconnected', function () {
    this.remove( this.children[ 0 ] );
} );
scene.add( controller2 );


// Models per als controladors
const controllerModelFactory = new XRControllerModelFactory();

const controllerGrip1 = renderer.xr.getControllerGrip( 0 );
controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
scene.add( controllerGrip1 );

const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
scene.add( controllerGrip2 );


// Visualitzar raig del controlador
function buildController( data ) {

    let geometry, material;

    switch ( data.targetRayMode ) {

        case 'tracked-pointer':

            geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );
            material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );
            return new THREE.Line( geometry, material );

        case 'gaze':

            geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
            material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
            return new THREE.Mesh( geometry, material );
    }

}


// Afegir piolta
function handleController( controller ) {

    if ( controller.userData.isSelecting ) {

        const object = room.children[ count ++ ];

        object.position.copy( controller.position );
        object.userData.velocity.x = ( Math.random() - 0.5 ) * 3;
        object.userData.velocity.y = ( Math.random() - 0.5 ) * 3;
        object.userData.velocity.z = ( Math.random() - 9 );
        object.userData.velocity.applyQuaternion( controller.quaternion );

        if ( count === room.children.length ) count = 0;

    }

}


// Animació
const clock = new THREE.Clock()

let normal = new THREE.Vector3()
let relativeVelocity = new THREE.Vector3();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    handleController( controller1 );
    handleController( controller2 );

    // Update objectes
    const delta = elapsedTime * 0.002; // slow down simulation

    const range = 3 - radius;

    for ( let i = 0; i < room.children.length; i ++ ) {

        const object = room.children[ i ];

        object.position.x += object.userData.velocity.x * delta;
        object.position.y += object.userData.velocity.y * delta;
        object.position.z += object.userData.velocity.z * delta;

        // manté objectes dins habitació

        if ( object.position.x < - range || object.position.x > range ) {

            object.position.x = THREE.MathUtils.clamp( object.position.x, - range, range );
            object.userData.velocity.x = - object.userData.velocity.x;

        }

        if ( object.position.y < radius || object.position.y > 6 ) {

            object.position.y = Math.max( object.position.y, radius );

            object.userData.velocity.x *= 0.98;
            object.userData.velocity.y = - object.userData.velocity.y * 0.8;
            object.userData.velocity.z *= 0.98;

        }

        if ( object.position.z < - range || object.position.z > range ) {

            object.position.z = THREE.MathUtils.clamp( object.position.z, - range, range );
            object.userData.velocity.z = - object.userData.velocity.z;

        }

        // col·lisions
        for ( let j = i + 1; j < room.children.length; j ++ ) {

            const object2 = room.children[ j ];

            normal.copy( object.position ).sub( object2.position );

            const distance = normal.length();

            if ( distance < 2 * radius ) {

                normal.multiplyScalar( 0.5 * distance - radius );

                object.position.sub( normal );
                object2.position.add( normal );

                normal.normalize();

                relativeVelocity.copy( object.userData.velocity ).sub( object2.userData.velocity );

                normal = normal.multiplyScalar( relativeVelocity.dot( normal ) );

                object.userData.velocity.sub( normal );
                object2.userData.velocity.add( normal );

            }

        }

        object.userData.velocity.y -= 9.8 * delta;

    }

    // Render
    renderer.render(scene, camera)

    // Animation Loop VR
    renderer.setAnimationLoop( tick )

}

tick()


// (4) Adjuntar el botó al body de la pàgina HTML  ////////////////////////////////////////////////////////
document.body.appendChild( VRButton.createButton( renderer ) );



