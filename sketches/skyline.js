const canvasSketch = require('canvas-sketch');
const { mapRange } = require('canvas-sketch-util/math');
const { noise1D } = require('canvas-sketch-util/random');
const Tweakpane = require('tweakpane');
const seedrandom = require('seedrandom');

const lerpColor = (color1, color2, t) => {
    const r = color1.r + t * (color2.r - color1.r);
    const g = color1.g + t * (color2.g - color1.g);
    const b = color1.b + t * (color2.b - color1.b);
    return { r, g, b };
};


const settings = {
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
}

let shouldAnimate = false;
let shouldRepaintBackground = false;
let shouldRerender = false;
let useRandomColor = false;

let seedo = 0;
let layero = 5;

const sketch = ({ context, width, height }) => {

    generateBackground(context, width, height)
    let skyline = new Skyline(width, height, layero, params.width, params.height, seedo, params.colorSeed);
    skyline.drawCanvas(context);

    return ({ context, width, height }) => {
        seedo  = Math.floor(mapRange(Math.random(), 0, 1.0, 3, 100));
        layero = Math.floor(mapRange(Math.random(), 0, 1.0, 3, 10));

        
        if(shouldRepaintBackground){
            generateBackground(context, width, height)
            shouldRepaintBackground = false;
            try {
                skyline.drawCanvas(context, params.colorSeed);
            }
            catch (e) {
                console.log(e);
            }
        }
        if (shouldAnimate) {
            generateBackground(context, width, height)
            skyline = new Skyline(width, height, layero, params.width, params.height, seedo, params.colorSeed);
            shouldAnimate = false;

            try {
                skyline.drawCanvas(context, params.colorSeed);
            }
            catch (e) {
                console.log(e);
            }
        }    

        if (shouldRerender) {

           // skyline = new Skyline(width, height, layero, params.width, params.height, seedo, params.colorSeed);
            shouldRerender = false;
            generateBackground(context, width, height)
            try {
                skyline.drawCanvas(context, params.colorSeed);
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

    let mainFolder = pane.addFolder({title: 'skyline'})

    folder = mainFolder.addFolder({ title: 'Shape' });
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

    folder = mainFolder.addFolder({ title: 'Color' });
    folder.addInput(params, 'colorSeed', { min: 0.0, max: 100.0, step: 1.0 }).on('change', (value) => {
        shouldRerender = true;

    });

    folder.addInput(params, 'randomColor', { min: 0.0, max: 1.0, step: 1.0 }).on('change', (value) => {
        shouldRerender = true;
    });


    folder = mainFolder.addFolder({ title: 'Blended Colors' });
    folder = mainFolder.addFolder({ title: 'Color 1' });

    folder.addInput(params, 'r1', { min: 0, max: 255, step: 1, label: 'Red' }).on('change', (value) => {
        shouldRerender = true;

    });;
    folder.addInput(params, 'g1', { min: 0, max: 255, step: 1, label: 'Green' }).on('change', (value) => {
        shouldRerender = true;

    });;
    folder.addInput(params, 'b1', { min: 0, max: 255, step: 1, label: 'Blue' }).on('change', (value) => {
        shouldRerender = true;

    });;


    folder = mainFolder.addFolder({ title: 'Color2' });

    folder.addInput(params, 'r2', { min: 0, max: 255, step: 1, label: 'Red' }).on('change', (value) => {
        shouldRerender = true;

    });
    folder.addInput(params, 'g2', { min: 0, max: 255, step: 1, label: 'Green' }).on('change', (value) => {
        shouldRerender = true;

    });
    folder.addInput(params, 'b2', { min: 0, max: 255, step: 1, label: 'Blue' }).on('change', (value) => {
        shouldRerender = true;
    });

    folder = mainFolder.addFolder({ title: 'Background Color' });

    folder.addInput(params, 'backgroundR', { min: 0, max: 255, step: 1, label: 'Red' }).on('change', (value) => {
        shouldRepaintBackground = true;

    });
    folder.addInput(params, 'backgroundG', { min: 0, max: 255, step: 1, label: 'Green' }).on('change', (value) => {
        shouldRepaintBackground = true;

    });
    folder.addInput(params, 'backgroundB', { min: 0, max: 255, step: 1, label: 'Blue' }).on('change', (value) => {
        shouldRepaintBackground = true;
    });

    return pane;
}

createPane();
//
// //  Make the pane draggable
// let isDragging = false;
// let startX = 0;
// let startY = 0;

// // The element that you'll be dragging
// const paneElement = pane.element; // This is the default container element of Tweakpane

// let dragOffsetX = 0;
// let dragOffsetY = 0;

// paneElement.addEventListener('mousedown', function(e) {
//   // Only start drag if the primary mouse button is pressed
//   if (e.button !== 0) return;

//   console.log({e, paneElement})

//   isDragging = true;
//   dragOffsetX = e.clientX - paneElement.getBoundingClientRect().left;
//   dragOffsetY = e.clientY - paneElement.getBoundingClientRect().top;
//   paneElement.style.cursor = 'grabbing';
  
//   // Prevent default dragging behavior for images or text selections
//   e.preventDefault();
// });

// document.addEventListener('mousemove', function(e) {
//   if (!isDragging) return;
//   paneElement.style.position = 'absolute';
//   paneElement.style.left = e.clientX - dragOffsetX + 'px';
//   paneElement.style.top = e.clientY - dragOffsetY + 'px';
// });

// document.addEventListener('mouseup', function() {
//   if (isDragging) {
//     isDragging = false;
//     paneElement.style.cursor = 'grab';
//   }
// });

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
        const bldgs = [];

        let x = 0;
        while (x <= this.screenWidth) {
            const rW = this.seed();
            const rH = this.seed();
            const bWidth = mapRange(rW, 0, 1.0, minWidth, maxWidth);
            let bHeight = mapRange(rH, 0, 1.0, minHeight, maxHeight);

            const n = (noise1D(x, maxWidth * 0.2, maxHeight * 0.25));
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
            const c = lerpColor(
                { r: params.r1, g: params.g1, b: params.b1 },
                { r: params.r2, g: params.g2, b: params.b2 },
                t
            );

            const red = Math.floor(this.colorSeed() * 256);
            const green = Math.floor(this.colorSeed() * 256);
            const blue = Math.floor(this.colorSeed() * 256);

            const color = params.randomColor === 1
                ? `rgb(${red}, ${green}, ${blue})`
                : `rgb(${c.r}, ${c.g}, ${c.b})`;
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

const generateBackground = (context, width, height, color) => {
    const margin = 1 / 4;

    // Fill rectangle
    const backgroundColor = `rgb(${params.backgroundR}, ${params.backgroundG}, ${params.backgroundB})`;
    context.fillStyle = color ? color : backgroundColor;
    context.fillRect(margin, margin, width - margin * 2, height - margin * 2);
};

