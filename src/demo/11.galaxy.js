import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
const gui = new dat.GUI({ width: 360 })

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

    const colorInside = new THREE.Color(insideColor)
    const colorOutside = new THREE.Color(outsideColor)

    for (let i = 0; i < count; i++) {
        const i3 = i * 3

        // Positions
        const randomRadius = Math.random() * radius
        const branchAngle = (i % branches) / branches * Math.PI * 2
        const spinAngle = randomRadius * spin

        const randomX = Math.pow(Math.random(), randomnessPower) * randomness * (Math.random() < 0.5 ? 1 : -1) * Math.random() * radius
        const randomY = Math.pow(Math.random(), randomnessPower) * randomness * (Math.random() < 0.5 ? 1 : -1) * Math.random() * radius
        const randomZ = Math.pow(Math.random(), randomnessPower) * randomness * (Math.random() < 0.5 ? 1 : -1) * Math.random() * radius

        positions[i3] = Math.cos(branchAngle + spinAngle) * randomRadius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * randomRadius + randomZ


        // Colors

        const mixedColor = colorInside.clone()
        // 会改变原来的 Color
        mixedColor.lerp(colorOutside, randomRadius / radius)
        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

    }
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    )

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    )

    material = new THREE.PointsMaterial({
        size: size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        // color: 0xff5588,
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






/// Camera
// 角度 + 宽高比 + 近远平面
const camera = new THREE.PerspectiveCamera(75, aspectRadio, 0.1, 100)
camera.position.z = 4
camera.position.y = 2
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
    points.rotation.y = elapsedTime * 0.2


    /// 性能更好的操作是使用 shadar 来进行批量操作
    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3
        const x = geometry.attributes.position.array[i3]
        geometry.attributes.position.array[i3 + 1] += (Math.random() - 0.5)
    }

    // 如果使用了 damping，必须要在这里更新
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()
