export default [
    {
        name: 'environmentMapTexture', // 将使用哪个来检索加载的资源
        type: 'cubeTexture', // 被哪个 loader 所使用
        path: [
            '/textures/environmentMaps/1/px.jpg',
            '/textures/environmentMaps/1/nx.jpg',
            '/textures/environmentMaps/1/py.jpg',
            '/textures/environmentMaps/1/ny.jpg',
            '/textures/environmentMaps/1/pz.jpg',
            '/textures/environmentMaps/1/nz.jpg',
        ]
    },
    {
        name: 'grassColorTexture',
        type: 'texture',
        path: '/textures/grass/color.jpg'
    },
    {
        name: 'grassNormalTexture',
        type: 'texture',
        path: '/textures/grass/normal.jpg'
    },
    {
        name: 'hamburgerModel',
        type: 'gltfModel',
        path: '/models/Hamberger/hamburger.glb',
    },
    {
        name: 'foxModel',
        type: 'gltfModel',
        path: '/models/Fox/glTF/Fox.gltf'
    },
]
