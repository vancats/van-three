import '../style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import gsap from 'gsap'

const canvas = document.querySelector('#webgl')
const sizes = { width: window.innerWidth, height: window.innerHeight }
const aspectRadio = sizes.width / sizes.height
let scrollY = window.scrollY
let currentSection = 0
const cursor = { x: 0, y: 0 }

const parametres = {}
parametres.materialColor = 0xffeded

/// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// renderer.setClearAlpha(0.5)

const scene = new THREE.Scene()


/// Camera
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
const camera = new THREE.PerspectiveCamera(35, aspectRadio, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)


/// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter



/// Objects
const objectsDistance = 4

const material = new THREE.MeshToonMaterial({
    color: parametres.materialColor,
    gradientMap: gradientTexture,
})
const mesh1 = new THREE.Mesh(
    new THREE.TorusBufferGeometry(1, 0.4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeBufferGeometry(1, 2, 32),
    material,
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotBufferGeometry(0.8, 0.35, 100, 16),
    material
)

mesh1.position.y = -objectsDistance * 0
mesh2.position.y = -objectsDistance * 1
mesh3.position.y = -objectsDistance * 2

mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2

scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [mesh1, mesh2, mesh3]

/// Particles
const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount * 3; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)
const particlesMaterial = new THREE.PointsMaterial({
    color: parametres.materialColor,
    size: 0.03,
    sizeAttenuation: true,
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)


/// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)





/// Debug
const gui = new dat.GUI()
gui.addColor(parametres, 'materialColor').onChange(() => {
    material.color.set(parametres.materialColor)
    particlesMaterial.color.set(parametres.materialColor)
})


/// Animations
const clock = new THREE.Clock()
let previousTime = 0
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    camera.position.y = -scrollY / sizes.height * objectsDistance


    // 视差
    const parallaxX = cursor.x * 0.5
    const parallaxY = -cursor.y * 0.5
    // 使用 deltaTime 可以使得即使在不同的帧率下，都会有相同的速度
    // 使用差值进行移动，可以实现补帧动画
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 2 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 2 * deltaTime

    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

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

window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)
    if (newSection !== currentSection) {
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )
    }
})

window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5
    cursor.y = e.clientY / sizes.height - 0.5
})
