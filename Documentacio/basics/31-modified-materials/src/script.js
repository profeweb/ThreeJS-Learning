import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMapIntensity = 1
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])
environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Material
 */

// Textures
const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg')
mapTexture.encoding = THREE.sRGBEncoding

const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg')

// Material
const material = new THREE.MeshStandardMaterial( {
    map: mapTexture,
    normalMap: normalTexture
})

// (6)
const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking
})

// (3) Crear els uniforms accesibles
const customUniforms = {
    uTime: { value: 0 },
    uDeformation: { value: 0.5}
}

gui.add(customUniforms.uDeformation, 'value').min(0).max(1).step(0.001).name('uDeformation')

// (1) Accés al material abans de ser compilat
material.onBeforeCompile = (shader)=>{

    //console.log("Abans de Compilar el Material")
    //console.log(shader.vertexShader)
    //console.log(shader.uniforms)

    // (2) Afegir els uniforms
    shader.uniforms.uTime = customUniforms.uTime
    shader.uniforms.uDeformation  = customUniforms.uDeformation

    // (1.1) Re-emplaçar els chunck a editar
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
            #include <common>
            
            uniform float uTime;
            uniform float uDeformation;
            
            mat2 get2dRotateMatrix(float _angle){
                return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
            }
        `
    )

    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>
            //transformed.y += 1.0;
            
            float angle = sin(position.y + uTime)*uDeformation; 
            mat2 rotateMatrix = get2dRotateMatrix(angle);
            
            transformed.xz = rotateMatrix * transformed.xz;
        `
    )

}

depthMaterial.onBeforeCompile = (shader) =>{

    //console.log(shader.vertexShader)

    shader.uniforms.uTime = customUniforms.uTime
    shader.uniforms.uDeformation  = customUniforms.uDeformation

    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
            #include <common>
            
            uniform float uTime;
            uniform float uDeformation;
            float angle = 0.0;
            mat2 rotateMatrix;
            
            mat2 get2dRotateMatrix(float _angle){
                return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
            }
        `
    )

    shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
            #include <beginnormal_vertex>
            
            angle = sin(position.y + uTime)*uDeformation; 
            rotateMatrix = get2dRotateMatrix(angle);
            
            objectNormal.xz = rotateMatrix * objectNormal.xz;
        `
    )

    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>
            //transformed.y += 1.0;
            
            angle = sin(position.y + uTime)*uDeformation;
            rotateMatrix = get2dRotateMatrix(angle);
            
            transformed.xz = rotateMatrix * transformed.xz;
        `
    )

    console.log(shader.vertexShader)
}

/**
 * Models
 */
gltfLoader.load(
    '/models/LeePerrySmith/LeePerrySmith.glb',
    (gltf) =>
    {
        // Model
        const mesh = gltf.scene.children[0]
        mesh.rotation.y = Math.PI * 0.5
        mesh.material = material // depthMaterial
        mesh.customDepthMaterial = depthMaterial
        scene.add(mesh)

        // Update materials
        updateAllMaterials()
    }
)

// (5) Pla per veure ombra projectada pel model
/**
 * Pla
 */
const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(15, 15, 15),
    new THREE.MeshStandardMaterial()
)
plane.rotation.set(0, Math.PI, 0)
plane.position.set(0, -5, 5)
scene.add(plane)
/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, - 2.25)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, - 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // (4) Update material
    customUniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()