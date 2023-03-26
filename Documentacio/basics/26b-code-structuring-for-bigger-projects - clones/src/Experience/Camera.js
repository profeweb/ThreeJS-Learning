import * as THREE from 'three'
import Experience from './Experience.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls.js";

export default class Camera
{
    // "OrbitControls"
    constructor(controls)
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.time = this.experience.time

        this.tipusControls = controls

        if(this.tipusControls==="PointerLockControls"){

            this.moveForward = false;
            this.moveBackward = false;
            this.moveLeft = false;
            this.moveRight = false;

            this.velocity = new THREE.Vector3();
            this.direction = new THREE.Vector3();

            document.addEventListener( 'keydown', (event)=>{

                console.log('KEYDOWN', event.code)

                switch ( event.code ) {

                    case 'ArrowUp':
                    case 'KeyW':
                        this.moveForward = true;
                        break;

                    case 'ArrowLeft':
                    case 'KeyA':
                        this.moveLeft = true;
                        break;

                    case 'ArrowDown':
                    case 'KeyS':
                        this.moveBackward = true;
                        break;

                    case 'ArrowRight':
                    case 'KeyD':
                        this.moveRight = true;
                        break;

                }

            } );
            document.addEventListener( 'keyup', (event)=>{
                console.log('KEYUP', event.code)
                switch ( event.code ) {

                    case 'ArrowUp':
                    case 'KeyW':
                        this.moveForward = false;
                        break;

                    case 'ArrowLeft':
                    case 'KeyA':
                        this.moveLeft = false;
                        break;

                    case 'ArrowDown':
                    case 'KeyS':
                        this.moveBackward = false;
                        break;

                    case 'ArrowRight':
                    case 'KeyD':
                        this.moveRight = false;
                        break;

                }
            } );
        }

        this.setInstance()
        this.setControls()
        this.setAudioListener()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 10000)
        this.instance.lef
        this.instance.position.set(6, 4, 8)
        //this.instance.position.x = 0
        //this.instance.position.y = 1.6
        //this.instance.position.z = 8
        this.scene.add(this.instance)
    }

    setControls()
    {
        if(this.tipusControls === "OrbitControls") {
            this.controls = new OrbitControls(this.instance, this.canvas)
            this.controls.enableDamping = true
        }
        else if(this.tipusControls === "PointerLockControls"){
            this.velocity = new THREE.Vector3();
            this.direction = new THREE.Vector3();
            this.controls = new PointerLockControls( this.instance, document.body );
            this.scene.add( this.controls.getObject() );
        }
    }

    setAudioListener()
    {
        this.listener = new THREE.AudioListener()
        this.instance.add( this.listener )
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        if(this.tipusControls==="OrbitControls") {
            this.controls.update()
        }
        else if(this.tipusControls==="PointerLockControls"){

            const delta = this.time.delta / 10000;

            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
            this.direction.x = Number( this.moveRight ) - Number( this.moveLeft );
            this.direction.normalize();

            if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 400.0 * delta;
            if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 400.0 * delta;

            this.controls.moveRight( - this.velocity.x * delta );
            this.controls.moveForward( - this.velocity.z * delta );
        }
    }
}