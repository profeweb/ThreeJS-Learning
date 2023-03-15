export default [
    {
        name: 'environmentMapTexture',
        type: 'cubeTexture',
        path:
        [
            'textures/environmentMap/px.jpg',
            'textures/environmentMap/nx.jpg',
            'textures/environmentMap/py.jpg',
            'textures/environmentMap/ny.jpg',
            'textures/environmentMap/pz.jpg',
            'textures/environmentMap/nz.jpg'
        ]
    },
    {
        name: 'grassColorTexture',
        type: 'texture',
        path: 'textures/dirt/color.jpg'
    },
    {
        name: 'grassNormalTexture',
        type: 'texture',
        path: 'textures/dirt/normal.jpg'
    },
    {
        name: 'foxModel',
        type: 'gltfModel',
        path: 'models/Fox/glTF/Fox.gltf'
    },
    {
        name:'helvetikerFont',
        type:'font',
        path:'fonts/helvetiker_regular.typeface.json'
    },
    {
        name: 'matcap6',
        type: 'texture',
        path: 'textures/matcaps/8.png'
    },
    {
        name: 'wolf',
        type: 'audio',
        path: 'audios/wolf.mp3'
    }
]