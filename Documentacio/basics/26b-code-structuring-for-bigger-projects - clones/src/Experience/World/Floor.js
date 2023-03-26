import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Experience from '../Experience.js'

export default class Floor
{
    constructor(radius, position)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.world = this.experience.world

        this.radius = radius
        this.position = position

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
        this.setPhysics()
    }

    setGeometry()
    {
        this.geometry = new THREE.CircleGeometry(this.radius, 64)
    }

    setTextures()
    {
        this.textures = {}

        this.textures.color = this.resources.items.grassColorTexture
        this.textures.color.encoding = THREE.sRGBEncoding
        this.textures.color.repeat.set(1.5, 1.5)
        this.textures.color.wrapS = THREE.RepeatWrapping
        this.textures.color.wrapT = THREE.RepeatWrapping

        this.textures.normal = this.resources.items.grassNormalTexture
        this.textures.normal.repeat.set(1.5, 1.5)
        this.textures.normal.wrapS = THREE.RepeatWrapping
        this.textures.normal.wrapT = THREE.RepeatWrapping
    }

    setMaterial()
    {
        this.material = new THREE.MeshStandardMaterial({
            map: this.textures.color,
            normalMap: this.textures.normal
        })
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.x = - Math.PI * 0.5
        this.mesh.position.copy(this.position)
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)
    }

    setPhysics(){

        this.shape = new CANNON.Cylinder(this.radius, this.radius, 0.2, 12)
        //this.shape = new CANNON.Plane(this.radius)
        this.body = new CANNON.Body({ mass: 0, shape: this.shape })
        this.body.position.copy(this.mesh.position)
        /*
        this.body.quaternion.setFromAxisAngle(
            new CANNON.Vec3(1,0,0),
            -Math.PI*0.5
        )

         */
        this.world.physicsWorld.addBody(this.body)
    }
}