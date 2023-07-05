import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const canvas = document.querySelector('#webgl')
const sizes = { width: window.innerWidth, height: window.innerHeight }
const aspectRadio = sizes.width / sizes.height
const gui = new dat.GUI({ closed: false })
const parametres = {
    uTime: { value: 0 }
}

/// Renderer
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
// 启用后可以得到和其他软件（如 Blender）中同样的光照情况
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding // 默认是 LinearEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3 // 曝光

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Liner: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
}).onFinishChange(() => {
    // 直接转换过来的是字符串。需要转成数字
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterials()
})
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

const scene = new THREE.Scene()

/// Camera
const camera = new THREE.PerspectiveCamera(35, aspectRadio, 0.1, 100)
camera.position.z = 7
camera.position.y = 8
camera.position.x = 8
scene.add(camera)

/// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/// Texture
const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg',
])
environmentMap.encoding = THREE.sRGBEncoding // 除了渲染器，环境贴图也需要加上
scene.background = environmentMap // 仅覆盖背景
scene.environment = environmentMap // 覆盖所有物体


/// Objects
const updateAllMaterials = () => {
    scene.traverse(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = parametres.envMapIntensity
            child.material.needsUpdate = true

            child.castShadow = true
            child.receiveShadow = true
        }
    })
}
parametres.envMapIntensity = 5
gui.add(parametres, 'envMapIntensity').min(0).max(40).step(0.001).onChange(updateAllMaterials)



const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(30, 30),
    new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.3,
        roughness: 0.4,
    })
)
plane.position.y = -5
plane.rotation.x = -Math.PI * 0.5
scene.add(plane)

const textureLoader = new THREE.TextureLoader()
const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg')
mapTexture.encoding = THREE.sRGBEncoding

const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg')

const material = new THREE.MeshStandardMaterial({
    map: mapTexture,
    normalMap: normalTexture,
})

// 当我们通过下面的 shader 进行旋转操作，阴影材料不会随着移动，需要对 DepthMaterial 同样进行控制，这里控制的是 Drop Shadow
const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking
})

material.onBeforeCompile = (shader) => {

    shader.uniforms.uTime = parametres.uTime
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>

        uniform float uTime;
        mat2 get2dRotateMatrix(float _angle) {
            return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
        }
        `
    )

    // 修复法线方向，这里是 Core Shadow，也就是自身投影
    shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
        #include <beginnormal_vertex>
        float angle = sin(position.y + uTime) * 0.4;
        mat2 rotateMatrix = get2dRotateMatrix(angle);
        objectNormal.xz = rotateMatrix * objectNormal.xz;
        `,

    )

    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        transformed.xz = rotateMatrix * transformed.xz;
        `,
    )

}

depthMaterial.onBeforeCompile = (shader) => {

    shader.uniforms.uTime = parametres.uTime
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>

        uniform float uTime;
        mat2 get2dRotateMatrix(float _angle) {
            return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
        }
        `
    )

    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float angle = sin(position.y + uTime) * 0.4;
        mat2 rotateMatrix = get2dRotateMatrix(angle);
        transformed.xz = rotateMatrix * transformed.xz;
        `,
    )
}

/// Models
const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load(
    '/models/LeePerrySmith/LeePerrySmith.glb',
    (gltf) => {
        const mesh = gltf.scene.children[0]
        mesh.rotation.y = Math.PI * 0.5
        // Update meterial and depthMaterial
        mesh.material = material
        mesh.customDepthMaterial = depthMaterial

        scene.add(mesh)

        updateAllMaterials()
    }
)






/// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(1, 2, -2)

scene.add(directionalLight)

const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(directionalLightHelper)


/// Shadow
plane.receiveShadow = true
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.shadow.normalBias = 0.05

/// GUI
gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('LightIntensity')
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('LightX')
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('LightY')
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('LightZ')


/// Animations
const clock = new THREE.Clock()
let prevElapsedTime = 0
const tick = () => {

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevElapsedTime
    prevElapsedTime = elapsedTime

    parametres.uTime.value = elapsedTime

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
