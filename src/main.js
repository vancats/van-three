import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader, DracoLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const canvas = document.querySelector('#webgl')
const sizes = { width: window.innerWidth, height: window.innerHeight }
const aspectRadio = sizes.width / sizes.height
const parametres = {}
let mixer

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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.position.set(5, 5, -5)
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
scene.add(ambientLight, directionalLight)


/// Shadow
plane.receiveShadow = true
directionalLight.castShadow = true






/// Model
// GLTF JSON 文件，需要提供 gif 和 bin 文件
// Binary 只有一个二进制文件，更轻量，易于加载，但是难以改变
// Draco 和 GLTF 的默认格式一样，但是缓冲区数据被 Draco 算法压缩的，更轻量
// Embedded 只有一个 JSON 文件，只是将 gif 和 bin 文件内嵌


// 当使用 Draco 压缩文件，在使用的时候需要进行解压，需要另开线程
// 它的解码器可以使用 Web Assembly，也能使用在 worker 中以提速
// 虽然 Draco 文件相对小很多，但是需要加载 draco 解压文件，以及解压也需要时间
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/') // Three 中提供了解码的文件

const gltfLoader = new GLTFLoader()

// 如果加载的内容不是 Draco 文件，那其实该 loader 不会被加载
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load(
    // '/models/Duck/glTF/Duck.gltf',
    // '/models/Duck/glTF-Binary/Duck.glb',
    // '/models/Duck/glTF-Draco/Duck.gltf',
    // '/models/Duck/glTF-Embedded/Duck.gltf',
    // '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    '/models/Fox/glTF/Fox.gltf',
    // '/models/Fox/glTF-Binary/Fox.glb',
    // '/models/Fox/glTF-Embedded/Fox.gltf',
    (gltf) => {

        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[2])
        action.play()

        gltf.scene.scale.set(0.025, 0.025, 0.025)

        scene.add(gltf.scene)
        // 当我们添加 scene 的时候，源数据中也会删除第一个值，因此需要浅拷贝一次
        // const children = [...gltf.scene.children]
        // for (const child of children) {
        //     scene.add(child)
        // }
        // while (gltf.scene.children.length) {
        //     scene.add(gltf.scene.children[0])
        // }
    }
)



/// Animations
const clock = new THREE.Clock()
let prevElapsedTime = 0
const tick = () => {

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevElapsedTime
    prevElapsedTime = elapsedTime

    if (mixer) {
        mixer.update(deltaTime)
    }

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
