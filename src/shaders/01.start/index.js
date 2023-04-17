import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import vertexShader from './shaders/02.pattern/vertex.glsl'
import fragmentShader from './shaders/02.pattern/fragment.glsl'
import * as dat from 'dat.gui'

const gui = new dat.GUI()
const canvas = document.querySelector('#webgl')
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

/// Controls
const controls = new OrbitControls(camera, canvas)
// controls.target.y = 1
controls.enableDamping = true

const textureLoader = new THREE.TextureLoader()
const colorTexture = textureLoader.load('/textures/door/color.jpg')

const geomertry = new THREE.PlaneBufferGeometry(1, 1, 32, 32)

const count = geomertry.attributes.position.count
const randoms = new Float32Array(count)
for (let i = 0; i < count; i++) {
    randoms[i] = Math.random()
}
geomertry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

// const material = new THREE.RawShaderMaterial({
// 比 Raw 内置了一些属性
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        uFrequency: { value: new THREE.Vector2(10, 5) },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('orange') },
        uTexture: { value: colorTexture },
    },
    // wireframe side transparent flatShading still working
    // wireframe: true,
    // side: THREE.DoubleSide
})

gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01)
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01)


const mesh = new THREE.Mesh(geomertry, material)

scene.add(mesh)

const renderer = new THREE.WebGLRenderer({
    canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const clock = new THREE.Clock()
const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    // 如果使用了 damping，必须要在这里更新
    controls.update()
    material.uniforms.uTime.value = elapsedTime

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()
