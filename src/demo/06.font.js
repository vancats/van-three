import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


const canvas = document.querySelector('#webgl')
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}
const aspectRadio = sizes.width / sizes.height

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


const textureLoader = new THREE.TextureLoader()
const colorTexture = textureLoader.load('/textures/door/color.jpg')
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')

/**
 * Fonts
 */
const fontLoader = new THREE.FontLoader()
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        // const material = new THREE.MeshBasicMaterial()
        const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
        // material.wireframe = true
        const textGeometry = new THREE.TextBufferGeometry(
            'Hello ThreeJS',
            {
                font,
                size: 0.5,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4,
            }
        )

        /// 手动移动到中心
        // 先 compute 才能取 boundingBox 的值
        // textGeometry.computeBoundingBox()
        // textGeometry.translate(
        //     - textGeometry.boundingBox.max.x * 0.5,
        //     - textGeometry.boundingBox.max.y * 0.5,
        //     - textGeometry.boundingBox.max.z * 0.5,
        // )
        textGeometry.center()

        const mesh = new THREE.Mesh(textGeometry, material)
        group.add(mesh)


        const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45)
        for (let i = 0; i < 500; i++) {
            const donut = new THREE.Mesh(donutGeometry, material)
            donut.position.x = (Math.random() - 0.5) * 10
            donut.position.y = (Math.random() - 0.5) * 10
            donut.position.z = (Math.random() - 0.5) * 10

            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI

            const scale = Math.random()
            donut.scale.set(scale, scale, scale)
            group.add(donut)
        }
    }
)


const scene = new THREE.Scene()
const group = new THREE.Group()
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const clock = new THREE.Clock()

const tick = () => {
    // 如果使用了 damping，必须要在这里更新
    controls.update()

    const elapsedTime = clock.elapsedTime
    group.rotation.x += Math.cos(elapsedTime) * 0.002
    group.rotation.y += Math.sin(elapsedTime) * 0.002
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()
