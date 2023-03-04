import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'

// (1) Importar EffectComposer i RenderPass
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";

// (6) Importar altres Passades i ShaderPass
import {DotScreenPass} from "three/examples/jsm/postprocessing/DotScreenPass.js";
import {GlitchPass} from "three/examples/jsm/postprocessing/GlitchPass.js";

// (7) Importar ShaderPass i altres passades basades en Shaders
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";
import {RGBShiftShader} from "three/examples/jsm/shaders/RGBShiftShader.js";
import {GammaCorrectionShader} from "three/examples/jsm/shaders/GammaCorrectionShader.js";

// (8) Importar SMAAPass per aplicar Antialiasing
import {SMAAPass} from "three/examples/jsm/postprocessing/SMAAPass.js";

// (9) Importar UnrealBloomPass
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// (13) Importar FilmPass
import { FilmPass } from 'three/examples/jsm/postprocessing//FilmPass.js';

// (1.1) Test de la importació
//console.log(EffectComposer)

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
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMapIntensity = 2.5
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
 * Models
 */
gltfLoader.load(
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(2, 2, 2)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, - 2.25)
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

    // (8) Update de l'effectComposer
    effectComposer.setSize(sizes.width, sizes.height)
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1.5
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// (7.3) Antialias amb WebGLRenderTarget
console.log(renderer.getPixelRatio())
const renderTarget = new THREE.WebGLRenderTarget(
    800,
    600,
    {
        samples: renderer.getPixelRatio() === 1 ? 2 : 0
    }
)

// (2) Instanciar i configurar l'objecte EffectComposer
const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setSize(sizes.width, sizes.height)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// (3) Instanciar l'objecte RenderPass
const renderPass = new RenderPass(scene, camera)

// (4) Afegir una passada a l'EffectComposer
effectComposer.addPass(renderPass)

// (6.2) Afegir els altres passades a l'effectComposer (DotScreenPass, GitchPass, ...)
const dotScreenPass = new DotScreenPass()
dotScreenPass.enabled = false
effectComposer.addPass(dotScreenPass)

const glitchPass = new GlitchPass()
glitchPass.enabled = false
glitchPass.goWild = false
effectComposer.addPass(glitchPass)

// (6.2a) Afegir Paràmetres del DotScreenPass al GUI controls
const dsFolder = gui.addFolder('DotScreenPass')
dsFolder.add(dotScreenPass, 'enabled')
dsFolder.add(dotScreenPass.material.uniforms.scale, 'value').min(0.1).max(2).step(0.001).name('scale')
dsFolder.add(dotScreenPass.material.uniforms.angle, 'value').min(-Math.PI).max(Math.PI).step(0.001).name('angle')
dsFolder.add(dotScreenPass.uniforms.center.value, 'x').min(-50).max(50).step(0.001).name('center X')
dsFolder.add(dotScreenPass.uniforms.center.value, 'y').min(-50).max(50).step(0.001).name('center Y')

// (6.2b) Afegir Paràmetres del GlitchPass al GUI controls
const gpFolder = gui.addFolder('GlitchPass')
gpFolder.add(glitchPass, 'enabled')
gpFolder.add(glitchPass, 'goWild')

//(7.2) Afegir passades a través del ShaderPass (RGBShifShader, GammaCorrectionShader, ...)
const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.enabled = false
effectComposer.addPass(rgbShiftPass)

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
gammaCorrectionPass.enabled = true;
effectComposer.addPass(gammaCorrectionPass)

// (7.2a) Afegir Paràmetres del RGBShifPassal GUI controls
const rgbspFolder = gui.addFolder('RGBShiftPass')
rgbspFolder.add(rgbShiftPass, 'enabled')
rgbspFolder.add(rgbShiftPass.material.uniforms.amount, 'value').min(0).max(1).step(0.0001).name('amount')

// (7.2b) Afegir Paràmetres del RGBShifPassal GUI controls
const gcpFolder = gui.addFolder('GammaCorrectionPass')
gcpFolder.add(gammaCorrectionPass, 'enabled')

// (9.2) Unreal Bloom Pass
const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 0.3
unrealBloomPass.radius = 1
unrealBloomPass.threshold = 0.6
unrealBloomPass.enabled = true
effectComposer.addPass(unrealBloomPass)

// (9.3) Afegir Paràmetres de l'UnrealBloomPass al GUI controls
const ubpFolder = gui.addFolder('UnrealBloomPass')
ubpFolder.add(unrealBloomPass, 'enabled')
ubpFolder.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
ubpFolder.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
ubpFolder.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)

// (10) Crear un custom Pass TintPass (amb uniforms, vertexShader i fragmentShader)
const TintShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTint: { value: null }
    },
    vertexShader:
        `
            varying vec2 vUv;
            void main(){
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                vUv = uv;
            }
        `,
    fragmentShader:
        `
            uniform sampler2D tDiffuse;
            uniform vec3 uTint;
            varying vec2 vUv;
            
            void main(){
                vec4 color = texture2D(tDiffuse, vUv);
                color.rgb += uTint;
                gl_FragColor = color;
            }
        `,
}
const tintPass = new ShaderPass(TintShader)
tintPass.material.uniforms.uTint.value = new THREE.Vector3()
effectComposer.addPass(tintPass)

// (10.2) Afegir Paràmetres del TintPass al GUI controls
const tpFolder = gui.addFolder('TintPass')
tpFolder.add(tintPass, 'enabled')
tpFolder.add(tintPass.material.uniforms.uTint.value, 'x').min(-1).max(1).step(0.001).name('Red')
tpFolder.add(tintPass.material.uniforms.uTint.value, 'y').min(-1).max(1).step(0.001).name('Green')
tpFolder.add(tintPass.material.uniforms.uTint.value, 'z').min(-1).max(1).step(0.001).name('Blue')

// (11) Crear un custom Pass DisplacementPass (amb uniforms, vertexShader i fragmentShader)
const DisplacementShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: null},
        uDisplaceDistance: {value: null}
    },
    vertexShader:
        `
            varying vec2 vUv;
            void main(){
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                vUv = uv;
            }
        `,
    fragmentShader:
        `
            uniform sampler2D tDiffuse;
            uniform float uTime;
            uniform float uDisplaceDistance;
            varying vec2 vUv;
            
            void main(){
                vec2 newUv = vec2( 
                    vUv.x, 
                    vUv.y + sin(vUv.x*10.0 + uTime) * uDisplaceDistance
                    );
                //newUv.y += uDisplaceDistance;
                vec4 color = texture2D(tDiffuse, newUv);
                gl_FragColor = color;
            }
        `,
}
const displacementPass = new ShaderPass(DisplacementShader)
displacementPass.material.uniforms.uTime.value = 0
displacementPass.material.uniforms.uDisplaceDistance.value = 0.1
effectComposer.addPass(displacementPass)

// (11.2) Afegir Paràmetres del DisplacementPass al GUI controls
const dpFolder = gui.addFolder('DisplacementPass')
dpFolder.add(displacementPass, 'enabled')
dpFolder.add(displacementPass.material.uniforms.uDisplaceDistance, 'value').min(-1).max(1).step(0.001).name('Displace Distance')

// (12) Crear un custom Pass NormalMapPass (amb uniforms, vertexShader i fragmentShader)
const normalMapShader = {
    uniforms: {
        tDiffuse: { value: null },
        uNormalMap: { value : null },
        uLightStrength: { value: null}
    },
    vertexShader:
        `
            varying vec2 vUv;
            void main(){
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                vUv = uv;
            }
        `,
    fragmentShader:
        `
            uniform sampler2D tDiffuse;
            uniform sampler2D uNormalMap;
            uniform float uLightStrength;
            varying vec2 vUv;
            
            void main(){
            
                vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
                
                vec2 newUv = vUv + normalColor.xy * 0.1;
                vec4 color = texture2D(tDiffuse, newUv);
                
                vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
                float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
                color.rgb += lightness * uLightStrength;
                
                gl_FragColor = color;
            }
        `,
}
const normalMapPass = new ShaderPass(normalMapShader)
normalMapPass.material.uniforms.uNormalMap.value = textureLoader.load('/textures/interfaceNormalMap.png')
normalMapPass.material.uniforms.uLightStrength.value = 2.0
effectComposer.addPass(normalMapPass)

// (11.2) Afegir Paràmetres del NormalMapPass al GUI controls
const nmpFolder = gui.addFolder('NormalMapPass')
nmpFolder.add(normalMapPass, 'enabled')
nmpFolder.add(normalMapPass.material.uniforms.uLightStrength, 'value').min(0).max(5).step(0.001).name('Light Strength')

// (13.2) Film Pass (noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale)
const filmPass = new FilmPass( 0.35, 0.025, 648, false )
filmPass.enabled = true
effectComposer.addPass(filmPass)

// (13.2b) Afegir Paràmetres del FilmPass al GUI controls
const fpFolder = gui.addFolder('FilmPass')
fpFolder.add(filmPass, 'enabled')
fpFolder.add(filmPass.material.uniforms.nIntensity, 'value').min(0).max(1).step(0.001).name('noiseIntensity')
fpFolder.add(filmPass.material.uniforms.sIntensity, 'value').min(0).max(1).step(0.001).name('scanLineIntensity')
fpFolder.add(filmPass.material.uniforms.sCount, 'value').min(100).max(1000).step(1).name('scanLinesCount')
fpFolder.add(filmPass.material.uniforms.grayscale, 'value').name('grayscale')


const guiObject = {
    'disableAll': ()=>{
        for(let folder of gui.children){
            for (let c  of folder.controllers) {
                if(c._name==='enabled'){
                    c.setValue(false)
                }
            }
        }
    },
    'enableAll': ()=>{
        for(let folder of gui.children){
            for (let c  of folder.controllers) {
                if(c._name==='enabled'){
                    c.setValue(true)
                }
            }
        }
    }
}
const eFolder = gui.addFolder('Enable/Disable')
eFolder.add(guiObject, 'disableAll').name('Disable All')
eFolder.add(guiObject, 'enableAll').name('Enable All')


// (8.2) SMAA passada per aplicar antialiasing (en cas que el navegador suporti WebGL v2)
console.log("Pixel ratio: ",renderer.getPixelRatio())
if(renderer.getPixelRatio()===1 && !renderer.capabilities.isWebGL2) {
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
    console.log('SMAA Aplicat')
}


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update paràmetres de Passes
    displacementPass.material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)
    // (5) Canvi del renderer per l'effectComposer
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()