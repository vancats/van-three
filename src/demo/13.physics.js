import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import CANNON from 'cannon'

const canvas = document.querySelector('#webgl')
const sizes = { width: window.innerWidth, height: window.innerHeight }
const aspectRadio = sizes.width / sizes.height

const parametres = {}

/// Renderer
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const scene = new THREE.Scene()

/// Camera
const camera = new THREE.PerspectiveCamera(35, aspectRadio, 0.1, 100)
camera.position.z = 15
camera.position.y = 15
camera.position.x = 15
scene.add(camera)

/// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/// Texture
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

/// Sounds
const hitSound = new Audio('/textures/sounds/hit.mp3')
const playHitSound = (collide) => {
    // 冲击强度
    const impactStrength = collide.contact.getImpactVelocityAlongNormal()
    if (impactStrength > 1.5) {
        // Further volume 强弱 sound 类型 函数防抖
        hitSound.currentTime = 0
        hitSound.volume = Math.random()
        hitSound.play()
    }
}

/// Objects
const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
plane.rotation.x = -Math.PI * 0.5
scene.add(plane)




/// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.position.set(5, 5, -5)
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
scene.add(ambientLight, directionalLight)


/// Shadow
plane.receiveShadow = true
directionalLight.castShadow = true


/// Physics
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

/// Material
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1, // 摩擦
        restitution: 0.7, // 回弹力度
    }
)
world.addContactMaterial(defaultContactMaterial)
// 为所有的物体设置初始材质
world.defaultContactMaterial = defaultContactMaterial
/**
 * NativeBroadphase 原生的碰撞检测方式
 * GridBroadphase 将整体分为多个网格，只会测试当前与四周的，性能好，但是如果有快速运动的物体，可能无法检测准确
 * SAPBroadphase Sweep And Prune 在多个步骤中，任意轴上测试物体，但是如果物体快速移动但是不碰撞的情况，会出现问题
 */
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true // sleepSpeedLimit 这个属性可以设置速度限制，但是大多时候不需要设置它


/// Cannon 的平面是无限延长的
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
// floorBody.material = defaultMaterial
floorBody.addShape(floorShape)
// 绕某个矢量旋转
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)


/// Forces
// apply force 指定一个点给一个力，比如风，多米诺，愤怒小鸟
// apply force 类似上条，但是不是添加力，而是通过添加力来添加速率
// apply local force 类似，但是坐标在物体的内部
// apply local force 同


const objectsToUpdate = []

/// Sphere
// 提取之后，物理操作在CPU，模型在GPU
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
})
const createSphere = (radius, position) => {

    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.scale.set(radius, radius, radius)
    mesh.position.copy(position)
    mesh.castShadow = true
    scene.add(mesh)

    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        shape,
        position: new CANNON.Vec3(0, 3, 0),
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    objectsToUpdate.push({ mesh, body })
}


/// Box
const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
})
const createBox = (width, height, depth, position) => {

    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.position.copy(position)
    mesh.castShadow = true
    scene.add(mesh)

    // 在 Cannon 中，都是以中心点出发的，所以都得除以二
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
    const body = new CANNON.Body({
        mass: 1,
        shape,
        position: new CANNON.Vec3(0, 3, 0),
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    objectsToUpdate.push({ mesh, body })
}


/// Constrains
// HingeConstraint 门锁
// DistanceConstraint 物体间保持同距离
// LockConstraint 物体被锁住，是一个整体
// PointToPointConstraint 将物体粘在特定的点上

/// Worker
// 所有的物理计算都在CPU中，我们可以把它放到 worker 中：javascript/worker

// cannon-es
// npm install --save cannon-es@0.15.1
// import * as CANNON form 'cannon-es'

// Ammo.js
// WebAssembly support

// Physijs
// 使用 Ammo.js 并原生支持 worker

/// Debug
const gui = new dat.GUI()
const debugObject = {}

debugObject.createSphere = () => {
    createSphere(
        Math.random() * 0.5,
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3,
        }
    )
}

debugObject.createBox = () => {
    createBox(
        Math.random(),
        Math.random(),
        Math.random(),
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3,
        }
    )
}

debugObject.reset = () => {
    for (const object of objectsToUpdate) {
        object.body.removeEventListener('collide', playHitSound)
        world.remove(object.body)

        scene.remove(object.mesh)
    }
}

gui.add(debugObject, 'createSphere')
gui.add(debugObject, 'createBox')
gui.add(debugObject, 'reset')



/// Animations
const clock = new THREE.Clock()
let prevElapsedTime = 0
const tick = () => {

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevElapsedTime
    prevElapsedTime = elapsedTime

    /// Update physics world
    // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)

    world.step(1 / 60, deltaTime, 3)

    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()

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
