import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import Experience from '../Experience.js'

export default class Fox
{
    constructor(number)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.number = number

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder(`fox ${this.number}`)
        }

        // Resource
        this.resource = this.resources.items.foxModel
        this.audioResource = this.resources.items.wolf

        this.setModel()
        this.setAnimation()
        this.setAudio()

        this.experience.mouse.on('fox'+this.number, () =>
        {
            if(!this.audio.isPlaying) {
                //console.log('playing fox ' + this.number)
                if (this.experience.audioEnabled) {
                    this.audio.play()
                }
                this.next()
            }
        })
    }

    setModel()
    {
        this.model = SkeletonUtils.clone(this.resource.scene)
        this.model.name = "fox" + this.number
        this.model.scale.set(0.02, 0.02, 0.02)
        this.scene.add(this.model)

        this.experience.mouse.addIntersectable(this)

        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
            }
        })
    }

    setPosition(x, y, z){
        this.model.position.set(x, y, z)
    }

    setRotation(x, y, z){
        this.model.rotation.set(x, y, z)
    }

    setAudio(){
        this.audio = new THREE.PositionalAudio( this.experience.camera.listener );
        this.audio.setBuffer( this.audioResource );
    }

    setAnimation()
    {
        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        
        // Actions
        this.animation.actions = {}
        
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[2])
        
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Play the action
        this.animation.play = (name) =>
        {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }

        // Debug
        if(this.debug.active)
        {
            const debugObject = {
                playIdle: () => { this.animation.play('idle') },
                playWalking: () => { this.animation.play('walking') },
                playRunning: () => { this.animation.play('running') },
                playSound: () => { this.audio.play() }
            }
            debugObject.position = this.model.position
            debugObject.rotation = this.model.rotation
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playWalking')
            this.debugFolder.add(debugObject, 'playRunning')
            this.debugFolder.add(debugObject, 'playSound')
            this.debugFolder.add(debugObject.position, 'x').min(-5).max(5).step(0.001).name('X')
            this.debugFolder.add(debugObject.position, 'y').min(-5).max(5).step(0.001).name('Y')
            this.debugFolder.add(debugObject.position, 'z').min(-5).max(5).step(0.001).name('Z')

            this.debugFolder.add(debugObject.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('Rotation')
        }
    }

    update()
    {
        this.animation.mixer.update(this.time.delta * 0.001)
    }

    next(){
        if(this.animation.actions.current == this.animation.actions.idle){
            this.animation.actions.current = this.animation.actions.walking
        }
    }
}