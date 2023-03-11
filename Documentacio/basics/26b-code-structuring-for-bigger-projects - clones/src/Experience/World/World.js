import * as THREE from 'three'
import Experience from '../Experience.js'
import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.foxes = []

        // Wait for resources
        this.resources.on('ready', () =>
        {
            // Setup
            this.floor1 = new Floor(3.3, new THREE.Vector3(0, 0, 0))
            this.floor2 = new Floor(1, new THREE.Vector3(-3, 0, 3))
            this.floor3 = new Floor(1, new THREE.Vector3(3, 0, 3))

            for(let i=0; i<5; i++) {
                let fox = new Fox(i)
                this.foxes.push(fox)
            }
            this.environment = new Environment()
        })
    }

    update()
    {

        for(let fox of this.foxes){
                fox.update()
        }

    }
}