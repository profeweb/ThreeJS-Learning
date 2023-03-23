import * as THREE from 'three'
import Experience from './Experience.js'
import EventEmitter from "./Utils/EventEmitter";
import Fox from './World/Fox.js'

export default class Mouse extends EventEmitter {

    constructor() {

        super()

        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.camera = this.experience.camera.instance


        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        this.intersectables = []

        // Mousemove event
        window.addEventListener('mousemove', (event)=>{
            this.mouse.x  = +(event.clientX / this.sizes.width )  * 2 - 1
            this.mouse.y  = -(event.clientY / this.sizes.height ) * 2 + 1
        })

    }

    addIntersectable(intersectable){
        this.intersectables.push(intersectable)
    }


    update(){

        this.raycaster.setFromCamera(this.mouse, this.camera)

        for(const intersectable of this.intersectables) {

                const intersections = this.raycaster.intersectObject(intersectable.model)
                if (intersections.length) {
                    if(intersectable instanceof Fox)
                    {
                        this.trigger('fox' + intersectable.number)
                        //console.log('fox' + intersectable.number)
                    }
                }
        }

    }




}