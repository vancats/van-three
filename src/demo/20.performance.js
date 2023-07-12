import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils'
import Stats from 'stats.js'

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)
const canvas = document.querySelector('#webgl')
const sizes = { width: window.innerWidth, height: window.innerHeight }

/// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    powerPreference: 'high-performance', /// 当电脑帧率没有问题，不要打开它
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio) /// 这里需要设置最大为 2

const scene = new THREE.Scene()
/// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 6)
scene.add(camera)

/// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/// Textures
const textureLoader = new THREE.TextureLoader()
const displacementTexture = textureLoader.load('/textures/displacementMap.png')

/// Meshes
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial()
)
cube.castShadow = true
cube.receiveShadow = true
cube.position.set(- 5, 0, 0)
scene.add(cube)

const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 128, 32),
    new THREE.MeshStandardMaterial()
)
torusKnot.castShadow = true
torusKnot.receiveShadow = true
scene.add(torusKnot)

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial()
)
sphere.position.set(5, 0, 0)
sphere.castShadow = true
sphere.receiveShadow = true
scene.add(sphere)

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial()
)
floor.position.set(0, - 2, 0)
floor.rotation.x = - Math.PI * 0.5
floor.castShadow = true
floor.receiveShadow = true
scene.add(floor)

/// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, 2.25)
scene.add(directionalLight)

const clock = new THREE.Clock()
const tick = () => {
    stats.begin()
    const elapsedTime = clock.getElapsedTime()

    torusKnot.rotation.y = elapsedTime * 0.1

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
    stats.end()
}
tick()

window.addEventListener('resize', () => {
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


const geometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5)
const material = new THREE.MeshNormalMaterial()
/// MergeBufferGeometry
// const geometries = []
// for (let i = 0; i < 50; i++) {
//     geometry.rotateX((Math.random() * 0.5) * Math.PI * 2)
//     geometry.rotateY((Math.random() * 0.5) * Math.PI * 2)
//     geometry.translate(
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10,
//     )
//     geometries.push(geometry)
// }

// const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
// const mergedMesh = new THREE.Mesh(mergedGeometry, material)
// scene.add(mergedMesh)

/// InstancedMesh
const instancedMesh = new THREE.InstancedMesh(geometry, material, 50)
// 如果需要在 tick 中改变 mesh，最好加上
instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
scene.add(instancedMesh)

for (let i = 0; i < 50; i++) {

    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
    )

    const quaternion = new THREE.Quaternion()
    quaternion.setFromEuler(new THREE.Euler(
        (Math.random() * 0.5) * Math.PI * 2,
        (Math.random() * 0.5) * Math.PI * 2,
        0,
    ))

    const matrix = new THREE.Matrix4()
    matrix.makeRotationFromQuaternion(quaternion)
    matrix.setPosition(position)
    instancedMesh.setMatrixAt(i, matrix)
}
