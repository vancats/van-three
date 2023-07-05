import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

const gui = new dat.GUI()

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

const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const matcapTexture = textureLoader.load('/textures/matcaps/3.png')
const gradientTexture = textureLoader.load('/textures/gradients/5.jpg')
// 如果像素过小，magFilter 会使用 mipmaps 来进行优化，可以使用以下情况来避免该情况
gradientTexture.minFilter = THREE.NearestFilter
gradientTexture.magFilter = THREE.NearestFilter
// 如果都是 NearestFilter，可以直接关闭 mipmaps
gradientTexture.generateMipmaps = false

// 可以通过一些 Web 网站获取 HDRI 文件，然后转换成 CubeMap进行使用
const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/4/nx.png',
    '/textures/environmentMaps/4/px.png',
    '/textures/environmentMaps/4/py.png',
    '/textures/environmentMaps/4/ny.png',
    '/textures/environmentMaps/4/pz.png',
    '/textures/environmentMaps/4/nz.png',
])


const aspectRadio = sizes.width / sizes.height

const scene = new THREE.Scene()
const group = new THREE.Group()


// const material = new THREE.MeshBasicMaterial({
//     color: 0xff0000,
//     // map: doorColorTexture,
// })


// material.color = new THREE.Color('#00ff00')
// material.color.set('#00ff00')
// material.wireframe = true
// material.transparent = true
// material.opacity = 0.3
// material.alphaMap = doorAlphaTexture
// material.side = THREE.FrontSide
// material.side = THREE.BackSide
// material.side = THREE.DoubleSide
// 显示平面阴影
// material.flatShading = true


// const material = new THREE.MeshNormalMaterial() // 紫色的固定颜色

// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture

// const material = new THREE.MeshDepthMaterial() // 接近相机的会被渲染成白色，远离相机的变黑

// 它具有很好的性能，但我们可以在几何图形上看到奇怪的图案
// const material = new THREE.MeshLambertMaterial() // 对发光材质有反应的材料

// 它和 Lamber 很相似，它没有那些奇怪的图案，但是性能上会差一些
// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100
// material.specular = new THREE.Color(0x1188ff)

// const material = new THREE.MeshToonMaterial()
// material.gradientMap = gradientTexture

// 它和 Lamber，Phong 很相似，但是具有更真实的算法，还具有以下两个特殊的参数
// const material = new THREE.MeshStandardMaterial()
// material.roughness = 0
// material.metalness = 1
// material.map = doorColorTexture
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 1
// material.displacementMap = doorHeightTexture
// material.displacementScale = 0.05
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.5, 0.5)
// material.transparent = true
// material.alphaMap = doorAlphaTexture

const material = new THREE.MeshStandardMaterial()
material.roughness = 0
material.metalness = 0.7
material.envMap = environmentMapTexture



gui.add(material, 'roughness').min(0).max(1).step(0.0001)
gui.add(material, 'metalness').min(0).max(1).step(0.0001)
gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001)
gui.add(material, 'displacementScale').min(0).max(1).step(0.0001)



const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 64, 64),
    material,
)
sphere.position.x = -1.5

sphere.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
)


const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1, 1, 100, 100),
    material
)

plane.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2),
)


const torus = new THREE.Mesh(
    new THREE.TorusBufferGeometry(0.3, 0.2, 64, 128),
    material
)
torus.position.x = 1.5

torus.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
)

group.add(sphere, plane, torus)

scene.add(group)

/**
 * Light
 * 光对 DeathMaterial 不起作用
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)



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

    const elapsedTime = clock.getElapsedTime()

    sphere.rotation.y = elapsedTime * 0.1
    plane.rotation.y = elapsedTime * 0.1
    torus.rotation.y = elapsedTime * 0.1

    // 如果使用了 damping，必须要在这里更新
    controls.update()

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()
