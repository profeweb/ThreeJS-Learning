import * as THREE from 'three'
import Experience from '../Experience.js'
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js";

export default class Text
{
    constructor(text)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.text = text

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()

    }

    setGeometry()
    {
        this.font= this.resources.items.helvetikerFont

        this.geometry = new TextGeometry(
            this.text,
            {
                font: this.font,
                size: 0.5,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )

        this.geometry.center()
    }

    setTextures()
    {
        this.texture = this.resources.items.matcap6

    }

    setMaterial()
    {
        this.material = new THREE.MeshMatcapMaterial({
            matcap: this.texture
        })
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(0, 2.5, 0)
        //this.mesh.receiveShadow = true
        this.scene.add(this.mesh)
    }

}