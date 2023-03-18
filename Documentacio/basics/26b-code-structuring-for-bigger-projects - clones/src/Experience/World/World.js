import * as THREE from 'three'
import Experience from '../Experience.js'
import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'
import Text from './Text.js'
import Moon from './Moon.js'

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

            // Positions
            const dataInfo = JSON.parse(this.resources.items.positions);

            for(let i=0; i<5; i++) {
                let fox = new Fox(i)
                fox.setPosition(dataInfo[i].position.x, dataInfo[i].position.y, dataInfo[i].position.z)
                fox.setRotation(dataInfo[i].rotation.x, dataInfo[i].rotation.y, dataInfo[i].rotation.z)
                this.foxes.push(fox)
            }

            this.text = new Text('Wolf Land')

            this.moon = new Moon()

            this.environment = new Environment()
        })
    }

    update()
    {

        if(this.moon) {
            this.moon.update()
        }

        for(let fox of this.foxes){
                fox.update()
        }


    }
}