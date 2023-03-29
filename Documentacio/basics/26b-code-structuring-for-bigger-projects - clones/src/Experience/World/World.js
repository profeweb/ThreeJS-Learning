import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Experience from '../Experience.js'
import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'
import Text from './Text.js'
import Moon from './Moon.js'
import Target from "./Target.js";
import Rain from'./Rain.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.foxes = []

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Physics')
        }

        this.setPhysics()

        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            this.floor1 = new Floor(3.3, new THREE.Vector3(0, 0, 0))
            this.floor2 = new Floor(1, new THREE.Vector3(-3, 0, 3))
            this.floor3 = new Floor(1, new THREE.Vector3(3, 0, 3))

            // Positions
            const dataInfo = JSON.parse(this.resources.items.positions);

            for (let i = 0; i < 5; i++) {
                let fox = new Fox(i)
                fox.setPosition(dataInfo[i].position.x, dataInfo[i].position.y, dataInfo[i].position.z)
                fox.setRotation(dataInfo[i].rotation.x, dataInfo[i].rotation.y, dataInfo[i].rotation.z)
                this.foxes.push(fox)
            }

            this.text = new Text('Wolf Land')

            this.moon = new Moon()

            this.targets = new Target()


            this.rainDrops = []
            for (let r = 0; r < 1500; r++) {
                this.rainDrops.push(new Rain())
            }

            this.environment = new Environment()

        })


    }

    setPhysics(){



        this.wind = {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            enabled: true
        }



        this.physicsWorld = new CANNON.World()
        this.physicsWorld.gravity.set(0, -9.8, 0)


        if(this.debug.active){
            this.debugFolder.add(this.wind, 'enabled').name('Wind')
            this.debugFolder.add(this.wind, 'x').min(-1).max(1).step(0.001).name('X wind')
            this.debugFolder.add(this.wind, 'y').min(-1).max(1).step(0.001).name('Y wind')
            this.debugFolder.add(this.wind, 'z').min(-1).max(1).step(0.001).name('Z wind')
            this.debugFolder.add(this.physicsWorld.gravity, 'x').min(-10).max(10).step(0.001).name('X gravity')
            this.debugFolder.add(this.physicsWorld.gravity, 'y').min(-10).max(10).step(0.001).name('Y gravity')
            this.debugFolder.add(this.physicsWorld.gravity, 'z').min(-10).max(10).step(0.001).name('Z gravity')
        }

        this.defaultMaterial = new CANNON.Material('default')
        this.defaultContactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0.1,
                restitution: 0.7
            }
        )
        this.physicsWorld.addContactMaterial(this.defaultContactMaterial)
        this.physicsWorld.defaultContactMaterial = this.defaultContactMaterial



    }

    update()
    {
        if(this.experience.ready) {

            if (this.moon) {
                this.moon.update()
            }

            for (let fox of this.foxes) {
                fox.update()
            }

            if (this.targets) {
                this.targets.update()
            }

            // Update de físiques
            this.physicsWorld.step(1/60, this.time.deltaTime, 3)
            for(const rain of this.rainDrops){
                rain.update()
            }
        }


    }
}