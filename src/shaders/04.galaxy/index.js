import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'

const gui = new dat.GUI({ width: 360 })

const canvas = document.querySelector('#webgl')
const sizes = { width: window.innerWidth, height: window.innerHeight }
const aspectRadio = sizes.width / sizes.height

const scene = new THREE.Scene()

/// Camera
// 角度 + 宽高比 + 近远平面
const camera = new THREE.PerspectiveCamera(75, aspectRadio, 0.01, 100)
camera.position.z = 4
camera.position.y = 2
scene.add(camera)

/// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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


const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 4
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = 0xff6030
parameters.outsideColor = 0x1b3984

let geometry
let material
let points

/// Texture
const textureLoader = new THREE.TextureLoader()


/// Galaxy
function generateGalaxy() {
    if (points) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    const {
        count, size, radius, branches, spin, randomness,
        randomnessPower, insideColor, outsideColor
    } = parameters

    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const scales = new Float32Array(count * 1)
    const randomnessPosition = new Float32Array(count * 3)

    const colorInside = new THREE.Color(insideColor)
    const colorOutside = new THREE.Color(outsideColor)

    for (let i = 0; i < count; i++) {
        const i3 = i * 3

        // Positions
        const randomRadius = Math.random() * radius
        const branchAngle = (i % branches) / branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), randomnessPower) * randomness * (Math.random() < 0.5 ? 1 : -1) * randomRadius
        const randomY = Math.pow(Math.random(), randomnessPower) * randomness * (Math.random() < 0.5 ? 1 : -1) * randomRadius
        const randomZ = Math.pow(Math.random(), randomnessPower) * randomness * (Math.random() < 0.5 ? 1 : -1) * randomRadius

        randomnessPosition[i3] = randomX
        randomnessPosition[i3 + 1] = randomY
        randomnessPosition[i3 + 2] = randomZ


        positions[i3] = Math.cos(branchAngle) * randomRadius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * randomRadius


        // Colors

        const mixedColor = colorInside.clone()
        // 会改变原来的 Color
        mixedColor.lerp(colorOutside, randomRadius / radius)
        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        scales[i] = Math.random()
    }
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    )

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    )

    geometry.setAttribute(
        'aScale',
        new THREE.BufferAttribute(scales, 1)
    )

    geometry.setAttribute(
        'aRondom',
        new THREE.BufferAttribute(randomnessPosition, 3)
    )

    material = new THREE.ShaderMaterial({
        // size: parameters.size,
        // sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
        vertexShader,
        fragmentShader,
        uniforms: {
            // 修复像素问题
            uSize: { value: 30 * renderer.getPixelRatio() },
            uTime: { value: 0 }
        }
    })
    points = new THREE.Points(geometry, material)
    scene.add(points)
}
generateGalaxy()




/// DEBUG
gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)







const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    material.uniforms.uTime.value = elapsedTime

    // 如果使用了 damping，必须要在这里更新
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()
