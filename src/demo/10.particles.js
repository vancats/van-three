import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
const gui = new dat.GUI()

const canvas = document.querySelector('#webgl')
const sizes = { width: window.innerWidth, height: window.innerHeight }
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

const scene = new THREE.Scene()

/// Texture
const textureLoader = new THREE.TextureLoader()
const particleTexture1 = textureLoader.load('/textures/particles/1.png')
const particleTexture2 = textureLoader.load('/textures/particles/2.png')
const particleTexture3 = textureLoader.load('/textures/particles/3.png')
const particleTexture4 = textureLoader.load('/textures/particles/4.png')
const particleTexture5 = textureLoader.load('/textures/particles/5.png')
const particleTexture6 = textureLoader.load('/textures/particles/6.png')
const particleTexture7 = textureLoader.load('/textures/particles/7.png')
const particleTexture8 = textureLoader.load('/textures/particles/8.png')
const particleTexture9 = textureLoader.load('/textures/particles/9.png')
const particleTexture10 = textureLoader.load('/textures/particles/10.png')
const particleTexture11 = textureLoader.load('/textures/particles/11.png')
const particleTexture12 = textureLoader.load('/textures/particles/12.png')
const particleTexture13 = textureLoader.load('/textures/particles/13.png')


/// Particles
// const particlesGeometry = new THREE.SphereBufferGeometry(1, 32, 32)

const particlesGeometry = new THREE.BufferGeometry()
const count = 20000
const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)


for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
    colors[i] = Math.random()
}
particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)
particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
)

const particlesMaterial = new THREE.PointsMaterial()
// particlesMaterial.color = new THREE.Color(0xff88cc)
particlesMaterial.size = 0.2
particlesMaterial.sizeAttenuation = true
particlesMaterial.map = particleTexture2
particlesMaterial.transparent = true
particlesMaterial.alphaMap = particleTexture2
// TODO
// 即使是 alpha 为 0，也就是黑色，也会进行像素的渲染，使用 test 使低于该值的像素不渲染
// particlesMaterial.alphaTest = 0.001
// particlesMaterial.depthTest = false
particlesMaterial.depthWrite = false
particlesMaterial.blending = THREE.AdditiveBlending
particlesMaterial.vertexColors = true


const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)


/// Camera
// 角度 + 宽高比 + 近远平面
const camera = new THREE.PerspectiveCamera(75, aspectRadio, 0.1, 100)
camera.position.z = 3
scene.add(camera)

/// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    particles.rotation.y = elapsedTime * 0.2
    particles.position.y = -elapsedTime * 0.2

    /// 性能更好的操作是使用 shadar 来进行批量操作
    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const x = particlesGeometry.attributes.position.array[i3]
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
    }

    particlesGeometry.attributes.position.needsUpdate = true

    // 如果使用了 damping，必须要在这里更新
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()
