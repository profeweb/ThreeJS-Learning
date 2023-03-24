import * as THREE from 'three'
import Experience from '../Experience.js'
import { gsap } from 'gsap'

export default class Overlay
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.color = new THREE.Color(255, 0, 0);


        // Debug
        if(this.debug.active){

        }

        this.setOverlay()

        this.resources.on('ready', () =>
        {
            gsap.to(this.overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })
            //console.log('overlay ready')
            setTimeout(()=>{
                this.experience.ready = true
            }, 3000)
        })

    }


    setOverlay(){

        this.overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)

        this.overlayMaterial = new THREE.ShaderMaterial({
            // wireframe: true,
            transparent: true,
            uniforms: {
                uColor: {value: this.color},
                uAlpha: { value: 1 }
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uAlpha;
                uniform vec3 uColor;
        
                void main() {
                    gl_FragColor = vec4(uColor, uAlpha);
                }
            `
        })

        this.overlay = new THREE.Mesh(this.overlayGeometry, this.overlayMaterial)
        this.scene.add(this.overlay)
    }

    update(){

    }


}