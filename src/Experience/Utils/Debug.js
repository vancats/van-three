import * as dat from 'dat.gui'

export default class Debug {
    constructor() {
        this.active = location.hash === '#debug'
        if (this.active) {
            this.ui = new dat.GUI()
        }
    }
}
