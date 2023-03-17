import * as THREE from 'three'
import Experience from '../Experience.js'

import testVertexShader from '../../shaders/moon/vertex.glsl'
import testFragmentShader from '../../shaders/moon/fragment.glsl'

export default class Moon
{
    constructor(text)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.geometry = new THREE.SphereGeometry(3, 250, 250)
    }

    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            transparent: true,
            uniforms:{
                uTime:  { value: 0},
                tExplosion: { value: this.resources.items.explosion }
            }
        })

    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(0, 5.5, -5)
        this.scene.add(this.mesh)
    }

    update()
    {
        this.material.uniforms.uTime.value = this.time.elapsed * 0.00001
        this.mesh.rotation.set(0, this.time.elapsed / 100000.0, 0)
    }

}