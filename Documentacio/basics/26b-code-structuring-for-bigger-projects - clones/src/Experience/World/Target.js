import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Target
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        this.sizes = this.experience.sizes
        this.resources = this.experience.resources

        this.raycaster = new THREE.Raycaster()
        this.setTargets()

    }

    setTargets()
    {
        this.dataPoints = JSON.parse(this.resources.items.targets);
        this.points = []

        for(const dataPoint of this.dataPoints){

            const newPointDiv = document.createElement("div");
            newPointDiv.setAttribute('class', 'point point-'+dataPoint.number)

            const newLabelDiv = document.createElement("div");
            newLabelDiv.setAttribute('class', 'label')
            newLabelDiv.innerText = dataPoint.number
            newPointDiv.appendChild(newLabelDiv)

            const newTextDiv = document.createElement("div");
            newTextDiv.setAttribute('class', 'text')
            newTextDiv.innerText = dataPoint.text
            newPointDiv.appendChild(newTextDiv)

            document.querySelector('body').appendChild(newPointDiv)

            const newPoint = {}
            newPoint.position = new THREE.Vector3(dataPoint.position.x, dataPoint.position.y, dataPoint.position.z)
            newPoint.element = newPointDiv
            newPoint.text = dataPoint.text
            newPoint.number = dataPoint.number
            this.points.push(newPoint)
        }

    }

    update(){

        for(let point of this.points) {

            const screenPosition = point.position.clone()
            screenPosition.project(this.camera)

            this.raycaster.setFromCamera(screenPosition, this.camera)
            const intersects = this.raycaster.intersectObjects(this.scene.children, true)

            if(intersects.length === 0) {
                point.element.classList.add('visible')
            }
            else {
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(this.camera.position)

                if(intersectionDistance < pointDistance) {
                    point.element.classList.remove('visible')
                }
                else {
                    point.element.classList.add('visible')
                }
            }
            const translateX = screenPosition.x * this.sizes.width * 0.5
            const translateY = - screenPosition.y * this.sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
    }

}