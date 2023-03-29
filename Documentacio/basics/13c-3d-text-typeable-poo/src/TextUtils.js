import Particle from "./Particle.js";

export default class TextUtils {

    constructor(){

        this.string = "Typing<div>animation</div>";
        this.fontName = "Verdana";
        this.textureFontSize = 25;
        this.fontScaleFactor = 0.18;

        this.stringBox = {
            wTexture: 0,
            wScene: 0,
            hTexture: 0,
            hScene: 0,
            caretPosScene: []
        };

        this.textCanvas = document.createElement("canvas");
        this.textCanvas.width = this.textCanvas.height = 0;
        this.textCtx = this.textCanvas.getContext("2d");
        this.textCtx.willReadFrequently = true

        this.textureCoordinates = [];
        this.particles = [];
    }


    setTextInputElement(textInputEl){
        textInputEl.style.fontSize = this.textureFontSize + "px";
        textInputEl.style.font = "100 " + this.textureFontSize + "px " + this.fontName;
        textInputEl.style.lineHeight = 1.1 * this.textureFontSize + "px";
    }

    setStringBox(textInputEl){
        this.string = textInputEl.innerHTML
            .replaceAll("<p>", "\n")
            .replaceAll("</p>", "")
            .replaceAll("<div>", "\n")
            .replaceAll("</div>", "")
            .replaceAll("<br>", "")
            .replaceAll("<br/>", "")
            .replaceAll("&nbsp;", " ");
        this.stringBox.wTexture = textInputEl.clientWidth;
        this.stringBox.wScene = this.stringBox.wTexture * this.fontScaleFactor;
        this.stringBox.hTexture = textInputEl.clientHeight;
        this.stringBox.hScene = this.stringBox.hTexture * this.fontScaleFactor;
        this.stringBox.caretPosScene = this.getCaretCoordinates().map(
            (c) => c * this.fontScaleFactor
        );
    }

    getCaretCoordinates() {
        const range = window.getSelection().getRangeAt(0);
        const needsToWorkAroundNewlineBug =
            range.startContainer.nodeName.toLowerCase() === "div" &&
            range.startOffset === 0;
        if (needsToWorkAroundNewlineBug) {
            return [range.startContainer.offsetLeft, range.startContainer.offsetTop];
        } else {
            const rects = range.getClientRects();
            if (rects[0]) {
                return [rects[0].left, rects[0].top];
            } else {
                document.execCommand("selectAll", false, null);
                return [0, 0];
            }
        }
    }


    sampleCoordinates() {

        const lines = this.string.split(`\n`);
        const linesNumber = lines.length;
        this.textCanvas.width = this.stringBox.wTexture;
        this.textCanvas.height = this.stringBox.hTexture;
        this.textCtx.font = "100 " + this.textureFontSize + "px " + this.fontName;
        this.textCtx.fillStyle = "#2a9d8f";
       this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
        for (let i = 0; i < linesNumber; i++) {
            this.textCtx.fillText(
                lines[i],
                0,
                ((i + 0.8) * this.stringBox.hTexture) / linesNumber
            );
        }

        // Sample coordinates
        if (this.stringBox.wTexture > 0) {
            // Image data to 2d array
            const imageData = this.textCtx.getImageData(
                0,
                0,
                this.textCanvas.width,
                this.textCanvas.height
            );
            const imageMask = Array.from(
                Array(this.textCanvas.height),
                () => new Array(this.textCanvas.width)
            );
            for (let i = 0; i < this.textCanvas.height; i++) {
                for (let j = 0; j < this.textCanvas.width; j++) {
                    imageMask[i][j] = imageData.data[(j + i * this.textCanvas.width) * 4] > 0;
                }
            }

            if (this.textureCoordinates.length !== 0) {
                // Clean up: delete coordinates and particles which disappeared on the prev step
                // We need to keep same indexes for coordinates and particles to reuse old particles properly
                this.textureCoordinates = this.textureCoordinates.filter((c) => !c.toDelete);
                this.particles = this.particles.filter((c) => !c.toDelete);

                // Go through existing coordinates (old to keep, toDelete for fade-out animation)
                this.textureCoordinates.forEach((c) => {
                    if (imageMask[c.y]) {
                        if (imageMask[c.y][c.x]) {
                            c.old = true;
                            if (!c.toDelete) {
                                imageMask[c.y][c.x] = false;
                            }
                        } else {
                            c.toDelete = true;
                        }
                    } else {
                        c.toDelete = true;
                    }
                });
            }

            // Add new coordinates
            for (let i = 0; i < this.textCanvas.height; i++) {
                for (let j = 0; j < this.textCanvas.width; j++) {
                    if (imageMask[i][j]) {
                        this.textureCoordinates.push({
                            x: j,
                            y: i,
                            old: false,
                            toDelete: false
                        });
                    }
                }
            }
        } else {
            this.textureCoordinates = [];
        }
    }

    refreshText() {

        this.sampleCoordinates();

        this.particles = this.textureCoordinates.map((c, cIdx) => {
            const x = c.x * this.fontScaleFactor;
            const y = c.y * this.fontScaleFactor;
            let p = c.old && this.particles[cIdx] ? this.particles[cIdx] : new Particle([x, y]);
            if (c.toDelete) {
                p.toDelete = true;
                p.scale = 1;
            }
            return p;
        });


    }

};