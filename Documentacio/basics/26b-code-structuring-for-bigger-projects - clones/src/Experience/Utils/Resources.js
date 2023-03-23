import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {FontLoader} from "three/examples/jsm/loaders/FontLoader.js";
import EventEmitter from './EventEmitter.js'


export default class Resources extends EventEmitter
{
    constructor(sources)
    {
        super()

        this.sources = sources

        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.loadingManager = new THREE.LoadingManager(
            () =>
            {
                window.setTimeout(() =>
                {
                    //gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })
                    const loadingBarElement = document.querySelector('.loading-bar')
                    loadingBarElement.classList.add('ended')
                    loadingBarElement.style.transform = ''
                }, 500)
            },
            (itemUrl, itemsLoaded, itemsTotal) =>
            {
                const progressRatio = itemsLoaded / itemsTotal
                const loadingBarElement = document.querySelector('.loading-bar')
                loadingBarElement.style.transform = `scaleX(${progressRatio})`
            }
        )

        this.setLoaders()
        this.startLoading()
    }

    setLoaders()
    {
        this.loaders = {}
        this.loaders.gltfLoader = new GLTFLoader(this.loadingManager)
        this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager)
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager)
        this.loaders.fontLoader = new FontLoader(this.loadingManager)
        this.loaders.audioLoader = new THREE.AudioLoader(this.loadingManager);
        this.loaders.fileLoader = new THREE.FileLoader(this.loadingManager);
    }

    startLoading()
    {
        // Load each source
        for(const source of this.sources)
        {
            if(source.type === 'gltfModel')
            {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                        //console.log('Loaded ', source.path)
                    }
                )
            }
            else if(source.type === 'texture')
            {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                        //console.log('Loaded ', source.path)
                    }
                )
            }
            else if(source.type === 'cubeTexture')
            {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                        //console.log('Loaded ', source.path)
                    }
                )
            }
            else if(source.type === 'font')
            {
                this.loaders.fontLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                        //console.log('Loaded ', source.path)
                    }
                )
            }
            else if(source.type === 'audio')
            {
                this.loaders.audioLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                        //console.log('Loaded ', source.path)
                    }
                )
            }
            else if(source.type === 'file')
            {
                this.loaders.fileLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                        //console.log('Loaded ', source.path)
                    }
                )
            }
        }
    }

    sourceLoaded(source, file)
    {
        this.items[source.name] = file

        this.loaded++

        if(this.loaded === this.toLoad)
        {
            this.trigger('ready')
        }
    }
}