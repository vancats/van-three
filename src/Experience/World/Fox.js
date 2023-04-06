import * as THREE from 'three'
import Experience from "../Experience"

export default class Fox {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.resource = this.resources.items.foxModel

        this.setModel()
        this.setAnimation()

        this.setDebug()
    }

    setModel() {
        this.model = this.resource.scene
        this.model.scale.set(0.02, 0.02, 0.02)
        this.scene.add(this.model)

        this.model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
            }
        })
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {}
        for (const animation of this.resource.animations) {
            this.animation.actions[animation.name] = this.animation.mixer.clipAction(animation)
        }

        this.animation.actions.current = this.animation.actions[this.resource.animations[0].name]
        this.animation.actions.current.play()

        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }
    }

    update() {
        this.animation.mixer.update(this.time.delta * 0.001)
    }

    setDebug() {
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('fox')
            const debugObject = {}
            for (const animation of this.resource.animations) {
                debugObject[animation.name] = () => this.animation.play(animation.name)
                this.debugFolder.add(debugObject, animation.name)
            }
        }
    }
}
