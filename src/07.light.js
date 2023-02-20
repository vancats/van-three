import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'

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
const group = new THREE.Group()
scene.add(group)



/// Light
// 环境光  Low Cost
const ambientLight = new THREE.AmbientLight()
ambientLight.color = new THREE.Color(0xffffff)
ambientLight.intensity = 0.5

// 平行光  Moderate Cost
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3)
directionalLight.position.set(1, 0.25, 0)

// 氛围光，上 下两种颜色  Low Cost
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3)

// 点光源 颜色 + 强度 + 影响距离 + 衰变速度  Moderate Cost
const pointLight = new THREE.PointLight(0xff9000, 0.5, 2)
pointLight.position.set(1, -0.5, 1)

// 矩形区域光 类似于打光 只作用于 MeshStandardMaterial 和 MeshPhysicalMaterial  High Cost
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
rectAreaLight.position.set(-1.5, 0, 1.5)
rectAreaLight.lookAt(new THREE.Vector3())

// 聚光灯 颜色 + 强度 + 影响距离 + 角度 + 边缘的消减/模糊程度 + 衰变速度  High Cost
const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(0, 2, 3)

// 如果要移动 spotLight 的观察位置，需要将其 target 放入场景并移动 target 位置
scene.add(spotLight.target)
spotLight.target.position.x = -0.75


// 灯光的花费很可能不小，可以考虑使用 Bake 的方式，将灯光 Bake 到纹理内部

scene.add(
    ambientLight,
    directionalLight,
    hemisphereLight,
    pointLight,
    rectAreaLight,
    spotLight,
)

/// Helper
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)

requestAnimationFrame(() => {
    // spotLightHelper 的定位会指向中心，所以需要在下一帧更新一下位置
    spotLightHelper.update()

    // rectAreaLightHelper 也是同样的问题，但是它更糟糕，还需要对 Helper 进行同样的位置和旋转
    rectAreaLightHelper.position.copy(rectAreaLight.position)
    rectAreaLightHelper.quaternion.copy(rectAreaLight.quaternion)
    rectAreaLightHelper.update()

})

scene.add(
    hemisphereLightHelper,
    directionalLightHelper,
    pointLightHelper,
    spotLightHelper,
    rectAreaLightHelper,
)

gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01)


/// Geometry
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4
const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 64, 64),
    material
)
sphere.position.x = -1.5

const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusBufferGeometry(0.3, 0.2, 64, 128),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(5, 5, 20, 20),
    material
)
plane.rotation.x = -Math.PI * 0.5
plane.position.y = -0.65

group.add(sphere, cube, torus)
scene.add(plane)


/// Camera
// 角度 + 宽高比 + 近远平面
const camera = new THREE.PerspectiveCamera(75, aspectRadio, 0.1, 100)
camera.position.z = 6
camera.position.y = 2
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
