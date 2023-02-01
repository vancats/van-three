import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

/// Scene
const scene = new THREE.Scene()

/// Object
const group = new THREE.Group()

/// Red cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// 网格由几何体和材料组成
const mesh = new THREE.Mesh(geometry, material)

/// Position
// mesh.position.x = 0.6
// mesh.position.set(0.7, -0.6, 1)

/// Scale
// mesh.scale.set(2, 0.5, 0.5)

/// Rotation
// mesh.rotation.reorder('YXZ')
// mesh.rotation.x = Math.PI * 0.25
// mesh.rotation.y = Math.PI * 0.25

// scene.add(mesh)
group.add(mesh)
scene.add(group)

// AxesHelper
const axeshelper = new THREE.AxesHelper(3)
scene.add(axeshelper)


const sizes = {
    width: 800,
    height: 600,
}

/// Camera
// 角度 + 宽高比 + 近远平面
const aspectRadio = sizes.width / sizes.height
const camera = new THREE.PerspectiveCamera(75, aspectRadio, 0.1, 100)
// const camera = new THREE.OrthographicCamera(-1 * aspectRadio, 1 * aspectRadio, 1, -1, 0.1, 100)
camera.position.z = 3
scene.add(camera)


/// Renderer
const canvas = document.querySelector('#webgl')
const renderer = new THREE.WebGLRenderer({
    canvas,
})
renderer.setSize(sizes.width, sizes.height)

const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    camera.position.y = Math.sin(elapsedTime)
    camera.position.x = Math.cos(elapsedTime)
    camera.lookAt(group.position)

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

// 进行手动的时间校准
// let time = Date.now()
// const tick = () => {
//     const currentTime = Date.now()
//     const deltaTime = currentTime - time
//     time = currentTime

//     group.rotation.x += 0.001 * deltaTime
//     group.rotation.y += 0.001 * deltaTime

//     renderer.render(scene, camera)
//     requestAnimationFrame(tick)
// }

tick()

gsap.to(group.position, { x: 1, duration: 2, delay: 1 })
gsap.to(group.position, { x: 0, duration: 2, delay: 3 })
