import * as THREE from 'three'
import Experience from './Experience.js'

import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js"
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js"
import {DotScreenPass} from "three/examples/jsm/postprocessing/DotScreenPass.js"
import { FilmPass } from 'three/examples/jsm/postprocessing//FilmPass.js'

export default class Composer  {

    constructor() {

        this.experience = new Experience()
        this.renderer = this.experience.renderer.instance
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Postprocessing')
        }

        this.setComposer()

    }

    setComposer(){

        this.renderTarget = new THREE.WebGLRenderTarget(
            800,
            600,
            {
                samples: this.renderer.getPixelRatio() === 1 ? 2 : 0
            }
        )

        this.effectComposer = new EffectComposer(this.renderer, this.renderTarget)
        this.effectComposer.setSize(this.sizes.width, this.sizes.height)
        this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderPass = new RenderPass(this.scene, this.camera)
        this.effectComposer.addPass(this.renderPass)

        const dotScreenPass = new DotScreenPass()
        dotScreenPass.enabled = false
        this.effectComposer.addPass(dotScreenPass)

        const filmPass = new FilmPass( 0.35, 0.025, 648, false )
        filmPass.enabled = false
        this.effectComposer.addPass(filmPass)


        // Debug
        if(this.debug.active)
        {
            const dsFolder = this.debugFolder.addFolder('DotScreenPass')
            dsFolder.add(dotScreenPass, 'enabled')
            dsFolder.add(dotScreenPass.material.uniforms.scale, 'value').min(0.1).max(2).step(0.001).name('scale')
            dsFolder.add(dotScreenPass.material.uniforms.angle, 'value').min(-Math.PI).max(Math.PI).step(0.001).name('angle')
            dsFolder.add(dotScreenPass.uniforms.center.value, 'x').min(-50).max(50).step(0.001).name('center X')
            dsFolder.add(dotScreenPass.uniforms.center.value, 'y').min(-50).max(50).step(0.001).name('center Y')

            const fpFolder = this.debugFolder.addFolder('FilmPass')
            fpFolder.add(filmPass, 'enabled')
            fpFolder.add(filmPass.material.uniforms.nIntensity, 'value').min(0).max(1).step(0.001).name('noiseIntensity')
            fpFolder.add(filmPass.material.uniforms.sIntensity, 'value').min(0).max(1).step(0.001).name('scanLineIntensity')
            fpFolder.add(filmPass.material.uniforms.sCount, 'value').min(100).max(1000).step(1).name('scanLinesCount')
            fpFolder.add(filmPass.material.uniforms.grayscale, 'value').name('grayscale')
        }
    }


    update(){
        this.effectComposer.render()
    }




}