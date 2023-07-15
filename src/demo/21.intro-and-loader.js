import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

const canvas = document.querySelector('#webgl')
const loadingBarElement = document.querySelector('.loading-bar')

const sizes = { width: window.innerWidth, height: window.innerHeight }
const debugObject = {}

/// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const scene = new THREE.Scene()

/// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, - 4)
scene.add(camera)

/// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, - 2.25)
scene.add(directionalLight)





/// Loaded
let screenReady
const loadingManager = new THREE.LoadingManager(
    () => {
        gsap.delayedCall(0.5, () => {
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
        })

        setTimeout(() => {
            screenReady = true
        }, 3000)
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)
const gltfLoader = new GLTFLoader(loadingManager)

const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap
debugObject.envMapIntensity = 2.5

const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10)
        gltf.scene.position.set(0, - 4, 0)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)


const raycaster = new THREE.Raycaster()
const points = [
    {
        position: new THREE.Vector3(1.55, 0.3, -0.6),
        element: document.querySelector('.point-0'),
    },
    {
        position: new THREE.Vector3(0.5, 0.8, -1.6),
        element: document.querySelector('.point-1'),
    },
    {
        position: new THREE.Vector3(1.6, -1.3, -1.0),
        element: document.querySelector('.point-2'),
    },
]





/// Overlay
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        uAlpha: { value: 1 }
    },
    vertexShader: `

    void main() {
        gl_Position = vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    uniform float uAlpha;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
    `

})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)




/// Animate
const tick = () => {
    controls.update()

    if (screenReady) {
        for (const point of points) {
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            // 跟随移动
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = -screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translate(${translateX}px, ${translateY}px)`

            // 根据相交情况来设置显隐
            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)
            if (intersects.length === 0) {
                point.element.classList.add('visible')
            } else {
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)

                if (intersectionDistance < pointDistance) {
                    point.element.classList.remove('visible')
                } else {
                    point.element.classList.add('visible')
                }
            }
        }
    }


    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
