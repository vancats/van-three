import '../style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/**
 * Debug
 */
const gui = new dat.GUI({ closed: true, width: 400 })
// gui.hide()

const parameters = {
    color: 0xff0000,
    spin: () => {
        gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 })
    }
}

const canvas = document.querySelector('#webgl')
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

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

window.addEventListener('dblclick', () => {
    /// Safari 不支持，如果要支持需要额外加一些判断
    if (document.fullscreenElement) {
        document.exitFullscreen()
    } else {
        canvas.requestFullscreen()
    }

})

const aspectRadio = sizes.width / sizes.height

const scene = new THREE.Scene()
const group = new THREE.Group()

// const geometry = new THREE.Geometry()
// geometry.vertices.push(new THREE.Vector3(0, 0, 0))
// geometry.vertices.push(new THREE.Vector3(0, 1, 0))
// geometry.vertices.push(new THREE.Vector3(1, 0, 0))
// geometry.faces.push(new THREE.Face3(0, 1, 2))


// const geometry = new THREE.BufferGeometry()
// const count = 200
// const positionsArray = []
// for (let i = 0; i < count * 3 * 3; i++) {
//     positionsArray.push((Math.random() - 0.5) * 4)
// }
// const positionsAttribute = new THREE.BufferAttribute(new Float32Array(positionsArray), 3)
// geometry.setAttribute('position', positionsAttribute)

const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 10, 10, 10)

const material = new THREE.MeshBasicMaterial({
    color: parameters.color,
    wireframe: true,
})
// 网格由几何体和材料组成
const mesh = new THREE.Mesh(geometry, material)

group.add(mesh)
scene.add(group)

// group.visible = false

/**
 * Debug
 */
gui.add(group.position, 'x', -3, 3, 0.01).name('hello')
gui.add(group.position, 'z').min(-3).max(3).step(0.01)

gui.add(mesh, 'visible')

gui.add(material, 'wireframe')

gui.addColor(parameters, 'color').onChange(() => material.color.set(parameters.color))

gui.add(parameters, 'spin')

// AxesHelper
const axeshelper = new THREE.AxesHelper(3)
scene.add(axeshelper)

/// Camera
// 角度 + 宽高比 + 近远平面
const camera = new THREE.PerspectiveCamera(75, aspectRadio, 0.1, 100)
camera.position.z = 3
scene.add(camera)

/// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 1
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const cursor = { x: 0, y: 0 }

window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5
    cursor.y = -(e.clientY / sizes.height - 0.5)
})

const tick = () => {
    // 如果使用了 damping，必须要在这里更新
    controls.update()

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()
