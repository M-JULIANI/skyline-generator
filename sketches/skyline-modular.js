// SKYLINE-MODULAR VERSION
console.log('🎨 Running SKYLINE-MODULAR version');
const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random")
const math = require("canvas-sketch-util/math");
const lodash = require('lodash');
const { lerp, mapRange } = require('canvas-sketch-util/math');
const { blend, RGBAToHex } = require('canvas-sketch-util/color');
const { color } = require('canvas-sketch-util');
const { noise1D } = require('canvas-sketch-util/random');
const Tweakpane = require('tweakpane');
const seedrandom = require('seedrandom');
const rgbaToHex = require('canvas-sketch-util/lib/rgba-to-hex');

const lerpColor = (color1, color2, t) => {
    const r = color1.r + t * (color2.r - color1.r);
    const g = color1.g + t * (color2.g - color1.g);
    const b = color1.b + t * (color2.b - color1.b);
    return { r, g, b };
};

// const settings = {
//     dimensions: [1080, 1080],
//     animate: false,
//     //duration: 1000
// };
const targetWidthInches = 8;
const targetHeightInches = 6;

const inchesToPixels = (inches, targetDPI) => {
    return inches * targetDPI;
}

const targetDPI = 300;

const settings = {
    // dimensions: 'a4',
    //pixelsPerInch: 300,
   // units: 'in',
    dimensions: [inchesToPixels(targetWidthInches, targetDPI), inchesToPixels(targetHeightInches, targetDPI)],
    
    scaleToView: true,
    animate: true,
    context: '2d'
};

const params = {
    layers: 12,
    module: 22,
    height: 1.0,
    width: 0.1,
    seed: 31,
    window: 2,
    colorSeed: 0,
    randomColor: 0,
    r1: 44,
    g1:58,
    b1: 111,
    r2: 152,
    g2: 191,
    b2: 0,
    backgroundR: 180,
    backgroundG: 175,
    backgroundB: 180,
    //  borderWidth: 0,
    // startColor: `rgb(${0}, ${0}, ${0}`,
    // endColor: `rgb(${255}, ${255}, ${255}`
}

let shouldAnimate = false;
let shouldRerender = false;
let useRandomColor = false;


const sketch = ({ context, width, height }) => {
    // Store the current dimensions to detect resize
    let currentWidth = width;
    let currentHeight = height;
    
    // Initial render
    generateBackground(context, width, height);
    let skyline = new SkylineModular(height, width, params.layers, params.width, params.height, params.seed, params.colorSeed, params.window, params.module);
    skyline.drawCanvas(context);

    return ({ context, width, height }) => {
        // Check if dimensions changed (resize occurred)
        if (width !== currentWidth || height !== currentHeight) {
            currentWidth = width;
            currentHeight = height;
            shouldRerender = true;
        }
        
        if (shouldAnimate) {
            skyline = new SkylineModular(height, width, params.layers, params.width, params.height, params.seed, params.colorSeed, params.window, params.module);
            shouldAnimate = false;
            context.fillStyle = 'white';
            generateBackground(context, width, height);
            context.fillRect(0, 0, width, height);

            try {
                skyline.drawCanvas(context, params.colorSeed);
            }
            catch (e) {
                console.log(e);
            }
        }
        else if (shouldRerender) {
            shouldRerender = false;
            context.fillStyle = 'white';
            generateBackground(context, width, height);
            context.fillRect(0, 0, width, height);

            try {
                skyline.drawCanvas(context);
            }
            catch (e) {
                console.log(e);
            }
        }
    };
};

const createPane = () => {
    const pane = new Tweakpane.Pane();
    let folder;

    folder = pane.addFolder({ title: 'Shape' });
    folder.addInput(params, 'layers', { min: 2, max: 20, step: 1 }).on('change', (value) => {
        shouldAnimate = true;
    });

    folder.addInput(params, 'module', { min: 20, max: 30, step: 2 }).on('change', (value) => {
        shouldAnimate = true;
    });
    folder.addInput(params, 'height', { min: 0.25, max: 5.0, step: 0.1 }).on('change', (value) => {
        shouldAnimate = true;
    });
    folder.addInput(params, 'width', { min: 0.05, max: 1.0, step: 0.1 }).on('change', (value) => {
        shouldAnimate = true;
    });

    folder.addInput(params, 'seed', { min: 0.0, max: 45.0, step: 1.0 }).on('change', (value) => {
        shouldAnimate = true;
    });
    folder.addInput(params, 'window', { min: 1.0, max: 10, step: 0.1 }).on('change', (value) => {
        shouldAnimate = true;
        shouldRerender = true;
    });

    folder = pane.addFolder({ title: 'Color' });
    folder.addInput(params, 'colorSeed', { min: 0.0, max: 100.0, step: 1.0 }).on('change', (value) => {
        shouldRerender = true;

    });

    folder.addInput(params, 'randomColor', { min: 0.0, max: 1.0, step: 1.0 }).on('change', (value) => {
        shouldRerender = true;
        useRandomColor = !useRandomColor

    });


    folder = pane.addFolder({ title: 'Blended Colors' });
    folder = pane.addFolder({ title: 'Color 1' });

    folder.addInput(params, 'r1', { min: 0, max: 255, step: 1, label: 'Red' }).on('change', (value) => {
        shouldRerender = true;

    });;
    folder.addInput(params, 'g1', { min: 0, max: 255, step: 1, label: 'Green' }).on('change', (value) => {
        shouldRerender = true;

    });;
    folder.addInput(params, 'b1', { min: 0, max: 255, step: 1, label: 'Blue' }).on('change', (value) => {
        shouldRerender = true;

    });;


    folder = pane.addFolder({ title: 'Color 2' });

    folder.addInput(params, 'r2', { min: 0, max: 255, step: 1, label: 'Red' }).on('change', (value) => {
        shouldRerender = true;

    });;
    folder.addInput(params, 'g2', { min: 0, max: 255, step: 1, label: 'Green' }).on('change', (value) => {
        shouldRerender = true;

    });;
    folder.addInput(params, 'b2', { min: 0, max: 255, step: 1, label: 'Blue' }).on('change', (value) => {
        shouldRerender = true;
    });;

    folder = pane.addFolder({ title: 'Background Color' });

    folder.addInput(params, 'backgroundR', { min: 0, max: 255, step: 1, label: 'Red' }).on('change', () => {
        shouldRerender = true;
    });
    folder.addInput(params, 'backgroundG', { min: 0, max: 255, step: 1, label: 'Green' }).on('change', () => {
        shouldRerender = true;
    });
    folder.addInput(params, 'backgroundB', { min: 0, max: 255, step: 1, label: 'Blue' }).on('change', () => {
        shouldRerender = true;
    });

    // Add a button to the pane
    pane.addButton({ title: 'Download PNG' }).on('click', () => {
        downloadCanvasAsPNG();
    });
}

createPane();

// Add window resize listener to trigger rerender
window.addEventListener('resize', () => {
    shouldRerender = true;
});

canvasSketch(sketch, settings);

class Building {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class SkylineModular {

    buildings = [];
    constructor(screenHeight, screenWidth, layers, widthMultiplier, heightMultiplier, seed, colorSeed, dotSize, module) {
        this.dotRadius = dotSize;
        this.module = module;
        this.seed = seedrandom(seed);
        this.screenHeight = screenHeight;
        this.screenWidth = screenWidth;
        this.layers = layers;

        this.allCells = [...Array(this.sizeX)].map(e => Array(this.sizeX).fill(this.originalCell));

        this.minBuildingWidth = Math.floor(Math.max(1 * widthMultiplier, 1));
        this.maxBuildingWidth = Math.floor(Math.max(5, 8 * widthMultiplier));

        this.minBuildingHeight = Math.floor(Math.max(2, 3 * heightMultiplier));
        this.maxBuildingHeight = Math.floor(Math.max(10, heightMultiplier * 50));

        this.generate();
    }

    generateLayer(heightRange, widthRange) {
        const { minHeight, maxHeight } = heightRange;
        const { minWidth, maxWidth } = widthRange;

        const bldgs = [];
        let x = 0;
        while (x <= this.screenWidth) {
            const rW = this.seed();
            const rH = this.seed();
            const bWidth = Math.floor(mapRange(rW, 0, 1.0, minWidth, maxWidth));
            let bHeight = Math.floor(mapRange(rH, 0, 1.0, minHeight, maxHeight));
            const n = Math.floor((noise1D(x, maxWidth * 0.2, maxHeight * 0.55)));
          //  console.log({n})
           // if (Math.random() > 0.75) bHeight *= 0.5;
            bHeight +=n;
            const bldg = new Building(x, 0, bWidth * this.module, bHeight * this.module);
            bldgs.push(bldg);
            x += bWidth * this.module;
        }
        return bldgs;
    }

    generate() {
        this.buildings = [...Array(this.layers)].map((e, i) => {
            const multiplier = i / (this.layers + 1);
            const heightRange = { minHeight: this.minBuildingHeight * multiplier, maxHeight: this.maxBuildingHeight * multiplier }
            const widthRange = { minWidth: this.minBuildingWidth, maxWidth: this.maxBuildingWidth }
            return this.generateLayer(heightRange, widthRange);
        });
    }

    drawCanvas(context, colorSeed) {
        this.colorSeed = seedrandom(colorSeed)
        context.save();

        const bldgs = this.buildings.slice().reverse();
        bldgs.forEach((layer, index) => {

            const t = index / (this.buildings.length ?? 1)
            const c = lerpColor(
                { r: params.r1, g: params.g1, b: params.b1 },
                { r: params.r2, g: params.g2, b: params.b2 },
                t
            );

            const red = Math.floor(this.colorSeed() * 256);
            const green = Math.floor(this.colorSeed() * 256);
            const blue = Math.floor(this.colorSeed() * 256);

            const color = useRandomColor
                ? `rgb(${red}, ${green}, ${blue})`
                : `rgb(${c.r}, ${c.g}, ${c.b})`;

            const hex = RGBAToHex([red, green, blue]);
            const lit = lightenColor(hex, 0.05);

            layer.forEach(x => this.drawBuilding(context, x, color, t))
        })

        context.restore();
    }

    // function drawDiceOneFace(context, moduleSize, color) {
    //     const dotRadius = 4; // Adjust the radius of the dot as needed

    //     // Clear the module
    //     context.clearRect(0, 0, moduleSize, moduleSize);

    //     // Draw the dot in the center of the module
    //     const centerX = moduleSize / 2;
    //     const centerY = moduleSize / 2;

    //     context.fillStyle = color;
    //     context.beginPath();
    //     context.arc(centerX, centerY, dotRadius, 0, 2 * Math.PI);
    //     context.fill();
    //     context.closePath();
    // }

    // // Example usage:
    // const canvas = document.getElementById('diceCanvas'); // Replace 'diceCanvas' with your canvas ID
    // const context = canvas.getContext('2d');
    // const moduleSize = 20;
    // const color = 'black'; // Change the color as needed

    // drawDiceOneFace(context, moduleSize, color);

    dotPattern(context, baseStroke, color, pts, lightenPercent) {
        // off-screen canvas
        const canvasPattern = document.createElement('canvas');
        canvasPattern.width = this.module;
        canvasPattern.height = this.module;
        const contextPattern = canvasPattern.getContext('2d');

        if (contextPattern) {
            // Fill the off-screen canvas with a white background
            contextPattern.fillStyle = color;
            contextPattern.fillRect(0, 0, canvasPattern.width, canvasPattern.height);

            // Set stroke color for hatch pattern
            contextPattern.strokeStyle = 'white';
            const lineWidth = baseStroke;
            contextPattern.lineWidth = lineWidth;

            const lerped = lerpColor({ r: 255, g: 255, b: 255},
                { r: 180, g: 180, b: 180 }, 1-lightenPercent);

            const rgbString = `rgb(${lerped.r}, ${lerped.g}, ${lerped.b})`
            pts.forEach(x => {
                contextPattern.fillStyle = rgbString;
                contextPattern.beginPath();
                contextPattern.arc(x.x, x.y, Math.max(this.dotRadius * (lightenPercent), 1.2), 0, 2 * Math.PI);
                contextPattern.fill();
                contextPattern.stroke();
                contextPattern.closePath();
            });

           // contextPattern.lineWidth = 0.5
            contextPattern.lineWidth = Math.max(1 * lightenPercent, 0.5);
            contextPattern.strokeRect(0, 0, this.module, this.module)
        }

        const pattern = context.createPattern(canvasPattern, 'repeat');
        return pattern;
    }

    pickPattern(context, baseStroke, color, lightenPercent) {
        const r = Math.random();
        const result = Math.floor(mapRange(r, 0, 1, 1, 7));
        let pat = undefined;
        let pts = [];
        let pt1, pt2, pt3, pt4, pt5, pt6 = { x: 0, y: 0 };
        switch (true) {
            case result === 1:
                pts = [{ x: this.module * 0.5, y: this.module * 0.5 }];
                break;
            case result === 2:
                pt1 = { x: this.module * 0.25, y: this.module * 0.25 };
                pt2 = { x: this.module * 0.75, y: this.module * 0.75 };
                pts = [pt1, pt2]
                break;
            case result === 3:
                pt1 = { x: this.module * 0.25, y: this.module * 0.25 };
                pt2 = { x: this.module * 0.5, y: this.module * 0.5 };
                pt3 = { x: this.module * 0.75, y: this.module * 0.75 };
                pts = [pt1, pt2, pt3];
                break;
            case result === 4:
                pt1 = { x: this.module * 0.25, y: this.module * 0.25 };
                pt2 = { x: this.module * 0.75, y: this.module * 0.25 };
                pt3 = { x: this.module * 0.75, y: this.module * 0.75 };
                pt4 = { x: this.module * 0.25, y: this.module * 0.75 };
                pts = [pt1, pt2, pt3, pt4]
                break;
            case result === 5:
                pt1 = { x: this.module * 0.25, y: this.module * 0.25 };
                pt2 = { x: this.module * 0.75, y: this.module * 0.25 };
                pt3 = { x: this.module * 0.75, y: this.module * 0.75 };
                pt4 = { x: this.module * 0.25, y: this.module * 0.75 };
                pt5 = { x: this.module * 0.5, y: this.module * 0.5 };
                pts = [pt1, pt2, pt3, pt4, pt5]
                break;
            case result === 6:
                pt1 = { x: this.module * 0.25, y: this.module * 0.25 };
                pt2 = { x: this.module * 0.25, y: this.module * 0.5 };
                pt3 = { x: this.module * 0.25, y: this.module * 0.75 };
                pt4 = { x: this.module * 0.75, y: this.module * 0.25 };
                pt5 = { x: this.module * 0.75, y: this.module * 0.5 };
                pt6 = { x: this.module * 0.75, y: this.module * 0.75 };
                pts = [pt1, pt2, pt3, pt4, pt5, pt6]
                break;

        }
        pat = this.dotPattern(context, baseStroke, color, pts, lightenPercent);
        return pat;
    }
    traverseBuildingAndRender(context, building, color, baseStroke, lightenPercent) {

        const cellCount = building.height / this.module;
        const heightsArray = Array.from({ length: cellCount }, (_, i) => i * this.module);

        const pat = this.pickPattern(context, baseStroke, color, lightenPercent);
        heightsArray.forEach((height) => {
            renderPatternCell(context, building, this.screenHeight, pat, height);
        });

    }

    drawBuilding = (context, building, color, lightenPercent) => {
        context.lineWidth = 1
      // context.strokeStyle = 'white'
        context.fillStyle = color

        const vOffset = this.screenHeight - building.y
        //context.strokeRect(building.x, vOffset, building.width, -building.height);
        context.fillRect(building.x, vOffset, building.width, -building.height);

        const baseStroke = 0.5;
        this.traverseBuildingAndRender(context, building, color, baseStroke, lightenPercent)
    }
}

const renderPatternCell = (
    context,
    building,
    screenHeight,
    canvasPattern
) => {
    context.fillStyle = canvasPattern;
    const vOffset = screenHeight - building.y
    context.fillRect(building.x, vOffset, building.width, -building.height);
};

function rgbStringToHex(rgbString) {
    const rgbValues = rgbString.match(/\d+(\.\d+)?/g).map(Number);
    const hexColor = rgbaToHex([rgbValues[0], rgbValues[1], rgbValues[2]]);
    return hexColor;
}




// Utility function to lighten a color
function lightenColor(color, percent) {
    return mixColors('#ffffff', color, percent);
}

// Utility function to darken a color
function darkenColor(color, percent) {
    return mixColors('#000000', color, percent);
}

// Utility function to mix two colors
function mixColors(color1, color2, percent) {
    const factor = percent / 100;
    const result = [];
    for (let i = 0; i < 6; i += 2) {
        const channel1 = parseInt(color1.substr(i, 2), 16);
        const channel2 = parseInt(color2.substr(i, 2), 16);
        const mixedChannel = Math.round(channel1 + (channel2 - channel1) * factor);
        result.push(mixedChannel.toString(16).padStart(2, '0'));
    }
    return '#' + result.join('');
}

const generateBackground = (context, width, height, color) => {
    const margin = 1 / 4;

    // Fill rectangle
    const backgroundColor = `rgb(${params.backgroundR}, ${params.backgroundG}, ${params.backgroundB})`;
    context.fillStyle = color ? color : backgroundColor;
    context.fillRect(margin, margin, width - margin * 2, height - margin * 2);
};

function downloadCanvasAsPNG() {
    // Assuming your canvas-sketch canvas has an id or you can fetch it another way
    const canvas = document.querySelector('canvas'); // Adjust selector as needed
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }

    // Create a PNG URL from the canvas
    const imageURL = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream");

    // Create a temporary link element and trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = imageURL;

    // You can set the default file name for the download like this
    downloadLink.download = 'canvas-sketch-export.png';

    // Append the link to the document, trigger click, and remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
