import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const canvas = document.querySelector('#webgl')
const sizes = { width: window.innerWidth, height: window.innerHeight }
const aspectRadio = sizes.width / sizes.height
const gui = new dat.GUI({ closed: false })
const parametres = {}

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
            console.log(child)
            // child.material.envMap = environmentMap
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
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.3,
        roughness: 0.4,
    })
)
plane.rotation.x = -Math.PI * 0.5
// scene.add(plane)


/// Models
const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

// GLTFLoader 会自动判定正确的编码方式，比如 normal 会使用 LinearEncoding
gltfLoader.load(
    '/models/Hamberger/hamburger.glb',
    // '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(5, 5, 5)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        gui.add(gltf.scene.rotation, 'y')
            .min(-Math.PI).max(Math.PI).step(0.001).name('rotation')


        updateAllMaterials()
    }
)






/// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(0.25, 3, -2.25)

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

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()

window.addEventListener('resize', () => {
    // Update Sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update Camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update Renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * 1. environmentMap 以及其使用
 *  / scene: background environment traverse
 * 2. physicallyCorrectLights
 * 3. encoding: 包括渲染器和环境贴图
 * 4. Tone Mapping
 * 5. antialias 必须在创建时使用
 * 6. shadow artifacts 使用 normalBias
 */
