import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Experience from '../Experience.js'

export default class Rain
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.resources = this.experience.resources

        this.radius = 0.01

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
        this.setPhysics()
    }

    setGeometry()
    {
        this.geometry = new THREE.IcosahedronGeometry(this.radius)
    }

    setTextures()
    {

    }

    setMaterial()
    {
        this.material = new THREE.MeshStandardMaterial({
            color: '#ffffff',
        })
    }

    setRandomPosition(){
        let xPos = (Math.random() > 0.5 ? -1 : 1 ) * Math.random()* 5
        let yPos = 2 + Math.random()*5
        let zPos = (Math.random() > 0.5 ? -1 : 1 ) * Math.random()* 5
        this.mesh.position.set(xPos,yPos, zPos)
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.setRandomPosition()
        this.scene.add(this.mesh)
    }

    setPhysics(){
        this.shape = new CANNON.Sphere(this.radius)
        this.body = new CANNON.Body({
            mass: 0.1,
            position: new CANNON.Vec3(0, 0, 0),
            shape: this.shape,
            material: this.world.defaultMaterial
        })
        this.body.position.copy(this.mesh.position)
        let xDir = (Math.random() > 0.5 ? -1 : 1 ) * Math.random()* 15
        let yDir = Math.random()
        let zDir = (Math.random() > 0.5 ? -1 : 1 ) * Math.random()* 15
        this.body.applyLocalForce(new CANNON.Vec3(xDir, yDir, zDir), new CANNON.Vec3(0,0,0))
        this.world.physicsWorld.addBody(this.body)
    }

    update(){

        if(this.world.wind.enabled){
            let windForce = new CANNON.Vec3(this.world.wind.x, this.world.wind.y, this.world.wind.z)
            this.body.applyLocalForce(windForce, new CANNON.Vec3(0,0,0))
        }

        if(this.body.position.y < -0.05){
            this.body.velocity.set(0,0.0,0)
            this.setRandomPosition()
            this.body.position.copy(this.mesh.position)
        }
        this.mesh.position.copy(this.body.position)
        this.mesh.quaternion.copy(this.body.quaternion)
    }
}