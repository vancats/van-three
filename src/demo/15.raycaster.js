import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader, DracoLoader } from 'three/examples/jsm/loaders/DRACOLoader'

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
scene.add(camera)

/// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


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
directionalLight.castShadow = true


/// Objects
const sphere1 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
sphere1.position.x = -2

const sphere2 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)

const sphere3 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
sphere3.position.x = 2
scene.add(sphere1, sphere2, sphere3)


let currentIntersect
/// Raycaster
const raycaster = new THREE.Raycaster()


/// Mouse
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / sizes.width * 2 - 1
    mouse.y = -1 * e.clientY / sizes.height * 2 + 1
})

window.addEventListener('click', () => {
    switch (currentIntersect?.object) {
        case sphere1:
            console.log('sphere1')
            break
        case sphere2:
            console.log('sphere2')
            break
        case sphere3:
            console.log('sphere3')
            break
        default:
    }
})

/// Animations
const clock = new THREE.Clock()
let prevElapsedTime = 0
const tick = () => {

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevElapsedTime
    prevElapsedTime = elapsedTime


    sphere1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
    sphere2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
    sphere3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

    // const rayOrigin = new THREE.Vector3(-3, 0, 0)
    // const rayDirection = new THREE.Vector3(10, 0, 0)
    // rayDirection.normalize()
    // raycaster.set(rayOrigin, rayDirection)

    const objectsToTest = [sphere1, sphere2, sphere3]

    // const intersect = raycaster.intersectObject(sphere2)
    // console.log('intersect: ', intersect)

    const intersects = raycaster.intersectObjects(objectsToTest)

    for (const object of objectsToTest) {
        object.material.color.set(0xff0000)
    }

    for (const intersect of intersects) {
        intersect.object.material.color.set(0x0000ff)
    }

    raycaster.setFromCamera(mouse, camera)


    if (intersects.length) {
        if (!currentIntersect) {
            currentIntersect = intersects[0]
            console.log('mouse enter')
        }
    } else {
        if (currentIntersect) {
            currentIntersect = null
            console.log('mouse leave')
        }
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
