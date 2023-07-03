import '../style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const canvas = document.querySelector('#webgl')
const sizes = {
    width: 800,
    height: 600,
}
const aspectRadio = sizes.width / sizes.height

const scene = new THREE.Scene()
const group = new THREE.Group()
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// 网格由几何体和材料组成
const mesh = new THREE.Mesh(geometry, material)

group.add(mesh)
scene.add(group)

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


const cursor = { x: 0, y: 0 }

window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5
    cursor.y = -(e.clientY / sizes.height - 0.5)
})

const tick = () => {
    /// 手动模拟相机位移
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
    // camera.position.y = cursor.y * 3
    // camera.lookAt(group.position)

    // 如果使用了 damping，必须要在这里更新
    controls.update()

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()
