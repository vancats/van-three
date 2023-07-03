import '../style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const gui = new dat.GUI({ closed: true, width: 400 })
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




/**
 * Texture
 */
// const image = new Image()
// const texture = new THREE.Texture(image)
// image.src = '/textures/door/color.jpg'
// image.onload = () => {
//     texture.needsUpdate = true
// }

const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () => { console.log('loading started') }
loadingManager.onLoad = () => { console.log('loading finished') }
loadingManager.onProgress = () => { console.log('loading processing') }
loadingManager.onError = () => { console.log('loading error') }

const textureLoader = new THREE.TextureLoader(loadingManager)
const texture = textureLoader.load(
    '/textures/door/color.jpg',
    () => { console.log('load') },
    () => { console.log('progress') },
    () => { console.log('error') },
)

const colorTexture = textureLoader.load('/textures/checkerboard-8x8.png')
// const colorTexture = textureLoader.load('/textures/checkerboard-1024x1024.png')
// const colorTexture = textureLoader.load('/textures/door/color.jpg')
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const heightTexture = textureLoader.load('/textures/door/height.jpg')
const normalTexture = textureLoader.load('/textures/door/normal.jpg')
const ambientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

// colorTexture.repeat.x = 2
// colorTexture.repeat.y = 3

// 重复
// colorTexture.wrapS = THREE.RepeatWrapping
// colorTexture.wrapT = THREE.RepeatWrapping
// 镜像
// colorTexture.wrapS = THREE.MirroredRepeatWrapping
// colorTexture.wrapT = THREE.MirroredRepeatWrapping

// 偏移
// colorTexture.offset.x = 0.5
// colorTexture.offset.y = 0.5

// 旋转
// colorTexture.rotation = Math.PI * 0.25

// 旋转的中心点
// colorTexture.center.x = 0.5
// colorTexture.center.y = 0.5

// Minfilter
// 当 minFilter 使用 NearestFilter，我们不需要使用 mipmaps 了，直接关闭以提升性能
colorTexture.generateMipmaps = false
colorTexture.minFilter = THREE.NearestFilter
// colorTexture.minFilter = THREE.LinearFilter
// colorTexture.minFilter = THREE.LinearMipMapLinearFilter
// colorTexture.minFilter = THREE.LinearMipMapNearestFilter
// colorTexture.minFilter = THREE.NearestMipMapLinearFilter
// colorTexture.minFilter = THREE.NearestMipmapNearestFilter

// Magfilter
// colorTexture.magFilter = THREE.LinearFilter // Default
colorTexture.magFilter = THREE.NearestFilter






const aspectRadio = sizes.width / sizes.height

const scene = new THREE.Scene()
const group = new THREE.Group()

// const geometry = new THREE.SphereBufferGeometry(1, 32, 32) // 球
// const geometry = new THREE.ConeBufferGeometry(1, 1, 32) // 锥
// const geometry = new THREE.TorusBufferGeometry(1, 0.35, 32, 100) // 环
const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 5, 5, 5)
console.log('geometry: ', geometry.attributes)
const material = new THREE.MeshBasicMaterial({
    map: colorTexture,
    // color: parameters.color,
    // wireframe: true,
})

// 网格由几何体和材料组成
const mesh = new THREE.Mesh(geometry, material)

group.add(mesh)
scene.add(group)

// group.visible = false

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
