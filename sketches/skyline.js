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

const settings = {
    // dimensions: 'a4',
    // pixelsPerInch: 300,
    // units: 'in',
    dimensions: [1080, 1080],
    scaleToView: true,
    animate: true,
    context: '2d'
};

const params = {
    layers: 16,
    height: 0.75,
    width: 0.1,
    seed: 42,
    colorSeed: 0,
    randomColor: 0,
    r1: 60,
    g1: 60,
    b1: 60,
    r2: 255,
    g2: 255,
    b2: 255,
    backgroundR: 180,
    backgroundG: 180,
    backgroundB: 180
    //  borderWidth: 0,
    // startColor: `rgb(${0}, ${0}, ${0}`,
    // endColor: `rgb(${255}, ${255}, ${255}`
}

let shouldAnimate = true;
let shouldRerender = false;
let useRandomColor = false;

let seedo = 0;
let layero = 5;

let backR = 0;
let backG = 0;
let backB = 0;

let bfrontR = 0;
let bfrontG = 0;
let bfrontB = 0;

let bbackR = 0;
let bbackG = 0;
let bbackB = 0;

let backgroundColor = 'white';

const sketch = ({ context, width, height }) => {

    generateBackground(context, width, height)

   // seedo  = Math.floor(mapRange(Math.random(), 0, 1.0, 3, 100));
   // layero = Math.floor(mapRange(Math.random(), 0, 1.0, 3, 10));
   // console.log({layero})
    let skyline = new Skyline(width, height, layero, params.width, params.height, seedo, params.colorSeed);
    skyline.drawCanvas(context);

    return ({ context, width, height }) => {
        seedo  = Math.floor(mapRange(Math.random(), 0, 1.0, 3, 100));
        layero = Math.floor(mapRange(Math.random(), 0, 1.0, 3, 10));
        backR = Math.floor(mapRange(Math.random(), 0, 1.0, 0, 255));
        backG = Math.floor(mapRange(Math.random(), 0, 1.0, 0, 255));
        backB = Math.floor(mapRange(Math.random(), 0, 1.0, 0, 255));

        bbackR = Math.floor(mapRange(Math.random(), 0, 1.0, 0, 255));
        bbackG = Math.floor(mapRange(Math.random(), 0, 1.0, 0, 255));
        bbackB = Math.floor(mapRange(Math.random(), 0, 1.0, 0, 255));


        bfrontR = Math.floor(mapRange(Math.random(), 0, 1.0, 0, 255));
        bfrontG = Math.floor(mapRange(Math.random(), 0, 1.0, 0, 255));
        bfrontB = Math.floor(mapRange(Math.random(), 0, 1.0, 0, 255));

        backgroundColor = `rgb(${backR}, ${backG}, ${backB})`
        if (shouldAnimate) {

            skyline = new Skyline(width, height, layero, params.width, params.height, seedo, params.colorSeed);
           // shouldAnimate = false;
           // context.fillStyle = 'white';
            generateBackground(context, width, height, backgroundColor)
           // context.fillRect(0, 0, width, height);

            try {
                skyline.drawCanvas(context, params.colorSeed);
            }
            catch (e) {
                console.log(e);
            }
        }
        // else if (shouldRerender) {
           
        //     // skyline = new Skyline(width, height, params.layers, params.width, params.height, params.seed, params.colorSeed);
        //     shouldRerender = false;
        //    // context.fillStyle = 'white';
        //     generateBackground(context, width, height)
        //   //  context.fillRect(0, 0, width, height);

        //     try {
        //         skyline.drawCanvas(context);
        //     }
        //     catch (e) {
        //         console.log(e);
        //     }
        // }
    };
};

const createPane = () => {
    const pane = new Tweakpane.Pane();
    let folder;

    folder = pane.addFolder({ title: 'Shape' });
    folder.addInput(params, 'layers', { min: 2, max: 20, step: 1 }).on('change', (value) => {
        shouldAnimate = true;
    });
    folder.addInput(params, 'height', { min: 0.25, max: 1.0, step: 0.1 }).on('change', (value) => {
        shouldAnimate = true;
    });
    folder.addInput(params, 'width', { min: 0.05, max: 1.0, step: 0.1 }).on('change', (value) => {
        shouldAnimate = true;
    });

    folder.addInput(params, 'seed', { min: 0.0, max: 45.0, step: 1.0 }).on('change', (value) => {
        shouldAnimate = true;
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


    folder = pane.addFolder({ title: 'Color2' });

    folder.addInput(params, 'r2', { min: 0, max: 255, step: 1, label: 'Red' }).on('change', (value) => {
        shouldRerender = true;

    });
    folder.addInput(params, 'g2', { min: 0, max: 255, step: 1, label: 'Green' }).on('change', (value) => {
        shouldRerender = true;

    });
    folder.addInput(params, 'b2', { min: 0, max: 255, step: 1, label: 'Blue' }).on('change', (value) => {
        shouldRerender = true;
    });

    folder = pane.addFolder({ title: 'Background Color' });

    folder.addInput(params, 'backgroundR', { min: 0, max: 255, step: 1, label: 'Red' }).on('change', (value) => {
        shouldRerender = true;

    });
    folder.addInput(params, 'backgroundG', { min: 0, max: 255, step: 1, label: 'Green' }).on('change', (value) => {
        shouldRerender = true;

    });
    folder.addInput(params, 'backgroundB', { min: 0, max: 255, step: 1, label: 'Blue' }).on('change', (value) => {
        shouldRerender = true;
    });
}

createPane();
canvasSketch(sketch, settings);

class Building {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
class Skyline {

    buildings = [];
    constructor(screenHeight, screenWidth, layers, widthMultiplier, heightMultiplier, seed) {
        this.seed = seedrandom(seed);
        this.screenHeight = screenHeight;
        this.screenWidth = screenWidth;
        this.layers = layers;

        this.allCells = [...Array(this.sizeX)].map(e => Array(this.sizeX).fill(this.originalCell));

        this.minBuildingWidth = 50 * widthMultiplier;
        this.maxBuildingWidth = screenHeight * widthMultiplier;

        this.minBuildingHeight = 10 * heightMultiplier;
        this.maxBuildingHeight = screenHeight * heightMultiplier;

        this.generate();
    }

    generateLayer(heightRange, widthRange) {

        const { minHeight, maxHeight } = heightRange;
        const { minWidth, maxWidth } = widthRange;
        //  console.log({ heightRange, widthRange })

        const bldgs = [];

        let x = 0;
        while (x <= this.screenWidth) {
            const rW = this.seed();
            const rH = this.seed();
            const bWidth = mapRange(rW, 0, 1.0, minWidth, maxWidth);
            let bHeight = mapRange(rH, 0, 1.0, minHeight, maxHeight);

            const n = (noise1D(x, maxWidth * 0.2, maxHeight * 0.25));
           // if (Math.random() > 0.75) bHeight *= 0.5;
            bHeight +=n;
            const bldg = new Building(x, 0, bWidth, bHeight);
            bldgs.push(bldg);
            x += bWidth;
        }
        return bldgs;
    }

    generate() {
        this.buildings = [...Array(this.layers)].map((e, i) => {
            const multiplier = i / (this.layers);
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
            // const c = lerpColor(
            //     { r: params.r1, g: params.g1, b: params.b1 },
            //     { r: params.r2, g: params.g2, b: params.b2 },
            //     t
            // );

            const c = lerpColor(
                { r: bbackR, g: bbackG, b: bbackB },
                { r: bfrontR, g: bfrontG, b: bfrontB }, t
            );

            // const red = Math.floor(this.colorSeed() * 256);
            // const green = Math.floor(this.colorSeed() * 256);
            // const blue = Math.floor(this.colorSeed() * 256);

            // const color = useRandomColor
            //     ? `rgb(${red}, ${green}, ${blue}`
            //     : `rgb(${c.r}, ${c.g}, ${c.b}`;

            const color =`rgb(${c.r}, ${c.g}, ${c.b}`;

          //  const hex = RGBAToHex([red, green, blue]);
          //  const lit = lightenColor(hex, 0.05);

            layer.forEach(x => this.drawBuilding(context, x, color, t))
        })

        context.restore();
    }

    drawBuilding(context, building, color, lightenPercent) {
        context.lineWidth = 1
        context.strokeStyle = 'black'
        context.fillStyle = color

        const vOffset = this.screenHeight - building.y
        context.strokeRect(building.x, vOffset, building.width, -building.height);
        context.fillRect(building.x, vOffset, building.width, -building.height);

        const baseStroke = 0.5;
        const baseSpacing = 20;
        let usableSpacing = Math.max(1, (1 - lightenPercent) * baseSpacing);
        const horizontalPattern = horizontalCanvasPattern(context, baseStroke, color, usableSpacing)
        const verticalPattern = verticalCanvasPattern(context, baseStroke, color, usableSpacing)
        const pat = Math.random() > 0.5 ? horizontalPattern : verticalPattern;
        renderHatch(context, building, this.screenHeight, pat)
    }
}

const horizontalCanvasPattern = (context, baseStroke, color, spacing) => {
    // off-screen canvas
    const canvasPattern = document.createElement('canvas');
    canvasPattern.width = 10;
    canvasPattern.height = 10;
    const contextPattern = canvasPattern.getContext('2d');
    if (contextPattern) {
        // fill the off-screen canvas with white background
        contextPattern.fillStyle = color;
        contextPattern.fillRect(0, 0, canvasPattern.width, canvasPattern.height);
        //stroke color for hatch pattern
        contextPattern.strokeStyle = 'black';
        let angle = -(Math.PI / 4);
        angle = 0
        let lineWidth = baseStroke
        // lineWidth = Math.min(lineWidth, spacing * 0.8);
        contextPattern.lineWidth = lineWidth;

        //hatch pattern drawn to off-screen context
        for (let y = 0; y < canvasPattern.height + spacing; y += spacing) {
            for (let x = 0; x < canvasPattern.width + spacing; x += spacing) {
                contextPattern.beginPath();
                const startX = x;
                const startY = y;
                contextPattern.moveTo(startX, startY);
                contextPattern.lineTo(x + spacing * Math.cos(angle), y + spacing * Math.sin(angle));
                contextPattern.stroke();
            }
        }
    }

    const pattern = context.createPattern(canvasPattern, 'repeat');
    return pattern;
}

const verticalCanvasPattern = (context, baseStroke, color, spacing) => {
    // off-screen canvas
    const canvasPattern = document.createElement('canvas');
    canvasPattern.width = 10;
    canvasPattern.height = 10;
    const contextPattern = canvasPattern.getContext('2d');
    if (contextPattern) {
        // fill the off-screen canvas with white background
        contextPattern.fillStyle = color;
        contextPattern.fillRect(0, 0, canvasPattern.width, canvasPattern.height);

        //stroke color for hatch pattern
        contextPattern.strokeStyle = 'black';
        let angle = -(Math.PI / 2);
        let lineWidth = baseStroke
        //lineWidth = Math.min(lineWidth, spacing * 0.8);
        contextPattern.lineWidth = lineWidth;

        //hatch pattern drawn to off-screen context
        for (let y = 0; y < canvasPattern.height + spacing; y += spacing) {
            for (let x = 0; x < canvasPattern.width + spacing; x += spacing) {
                contextPattern.beginPath();
                const startX = x;
                const startY = y;
                contextPattern.moveTo(startX, startY);
                contextPattern.lineTo(x + spacing * Math.cos(angle), y + spacing * Math.sin(angle));
                contextPattern.stroke();
            }
        }
    }

    const pattern = context.createPattern(canvasPattern, 'repeat');
    return pattern;
}
const renderHatch = (
    context,
    building,
    screenHeight,
    canvasPattern
) => {
    context.fillStyle = canvasPattern;
    const vOffset = screenHeight - building.y
    context.fillRect(building.x, vOffset, building.width, -building.height);
};



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
    // Margin in inches
    const margin = 1 / 4;

    // Off-white background
   // context.fillStyle = 'hsl(88, 87%, 98%)';
   // context.fillRect(0, 0, width, height);

    // Gradient foreground
   // const fill = context.createLinearGradient(0, 0, width, height);
   // fill.addColorStop(0, 'gray');
   // fill.addColorStop(1, 'white');

    // Fill rectangle
    const backgroundColor = `rgb(${params.backgroundR}, ${params.backgroundG}, ${params.backgroundB})`;
    context.fillStyle = color ? color : backgroundColor;
    context.fillRect(margin, margin, width - margin * 2, height - margin * 2);
};

