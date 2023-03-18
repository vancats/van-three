import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const canvas = document.querySelector('#webgl')
const sizes = { width: window.innerWidth, height: window.innerHeight }
const aspectRadio = sizes.width / sizes.height
const parametres = {}

/// Renderer
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const scene = new THREE.Scene()

/// Camera
const camera = new THREE.PerspectiveCamera(35, aspectRadio, 0.1, 100)
camera.position.z = 15
camera.position.y = 15
camera.position.x = 15
scene.add(camera)

/// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/// Objects
const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.3,
        roughness: 0.4,
    })
)
plane.rotation.x = -Math.PI * 0.5
scene.add(plane)


/// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
scene.add(directionalLight)


/// Shadow
plane.receiveShadow = true
directionalLight.castShadow = true






/// Model
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/') // Three 中提供了解码的文件

const gltfLoader = new GLTFLoader()

// 如果加载的内容不是 Draco 文件，那其实该 loader 不会被加载
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load(
    '/models/Hamberger/hamburger.glb',
    (gltf) => {
        scene.add(gltf.scene)
    }
)



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
