
export default class Particle {

    constructor([x, y]) {

        this.x = x;
        this.y = y;
        this.z = 0;

        this.rotationX = Math.random() * 2 * Math.PI;
        this.rotationY = Math.random() * 2 * Math.PI;
        this.rotationZ = Math.random() * 2 * Math.PI;
        this.scale = 0;

        this.deltaRotation = 0.2 * (Math.random() - 0.5);
        this.deltaScale = 0.03 + 0.1 * Math.random();

        this.toDelete = false;
    }

    grow () {
        this.rotationX += this.deltaRotation;
        this.rotationY += this.deltaRotation;
        this.rotationZ += this.deltaRotation;

        if (this.toDelete) {
            this.scale -= this.deltaScale;
            if (this.scale <= 0) {
                this.scale = 0;
            }
        } else if (this.scale < 1) {
            this.scale += this.deltaScale;
        }
    }
};