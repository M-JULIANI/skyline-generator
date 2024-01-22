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
    //pixelsPerInch: 300,
    // units: 'in',
    dimensions: [2080, 2080],

    scaleToView: true,
    animate: true,
    context: '2d'
};

const params = {
    layers: 5,
    module: 1050,
    multiplicationFactor: 0.5
}


let shouldAnimate = false;
//let shouldRerender = false;
// let useRandomColor = false;

let centroids = [];
let rot = 0;

// for(let i = 0; i< params.layers; i++){
//     centroids[i] = [];
// }

const sketch = ({ context, width, height }) => {
    let pt = [width * 0.5, height * 0.5];
    generateTree(context, pt, params.layers, params.module);

    // centroids.map(x=>{
    //     x.map(p=>{
    //         p.map(y=> {
    //             console.log({y})
    //             context.beginPath();
    //             context.arc(y[0], y[1], 20, 0, Math.PI * 2);
    //             context.fillStyle = 'orange';
    //             context.fill();
    //             context.stroke();
    //         })
    //     })
    // })

    console.log({centroids})
    let counter = 0;
    let rotationIndex = 0;
    return ({ context, width, height }) => {
        //if (shouldAnimate) {
           // pt[1] += 0.25
            counter+=1;
            rot +=0.15;
            const breakPt = counter % 600 === 0;
            if(breakPt) rotationIndex -=1;
         //   console.log({rotationIndex}, params.layers)
            rotationIndex = rotationIndex < 0 ? params.layers : rotationIndex;
            if(pt[1]>=height) pt[1] = 0;
            context.fillStyle = '#DAF7A6';
            context.fillRect(0, 0, width, height);
            centroids = [];
            generateTree(context, pt, params.layers, params.module, rotationIndex, rot);
          //  shouldAnimate = false;
       // }
    };
};

const createPane = () => {
    const pane = new Tweakpane.Pane();
    let folder;

    folder = pane.addFolder({ title: 'Shape' });
    folder.addInput(params, 'layers', { min: 1, max: 8, step: 1 }).on('change', (value) => {
        shouldAnimate = true;
    });

    folder.addInput(params, 'module', { min: 20, max: 3000, step: 2 }).on('change', (value) => {
        shouldAnimate = true;
    });

    folder.addInput(params, 'multiplicationFactor', { min: 0.1, max: 1, step: 0.05 }).on('change', (value) => {
        shouldAnimate = true;
    });
}

createPane();
canvasSketch(sketch, settings);



const generateTree = (context, pt, index, length, rotIndex, rotation) => {
    const baseRadii = 10;
    const baseLineWidth = 4;
    context.strokeStyle = 'black';
    context.lineWidth = baseLineWidth;

   // includeAll = index > 3

   includeAll = true;

    let rot = 0;
   if(index === rotIndex) rot = rotation;
  // console.log({index, rotIndex})
    const pts = generateTreePts(pt, length * params.multiplicationFactor, includeAll, rot);

    if (!centroids[index]) {
        centroids[index] = [];
    }
    centroids[index].push(pts);
    pts.forEach(x => {
        const rad = Math.abs(index / params.layers * baseRadii)

        context.lineWidth = Math.abs(index / params.layers * baseLineWidth)
        context.fillStyle = 'white';

        //lines
        const centerX = pt[0];
        const centerY = pt[1];
        context.moveTo(centerX, centerY);
        context.lineTo(x[0], x[1]);
        context.stroke();

        //circles
        context.beginPath();
        context.arc(x[0], x[1], rad, 0, Math.PI * 2);
        context.fillStyle = 'black';
        context.fill();
        context.stroke();

        if (index > 1) {
            generateTree(context, [x[0], x[1]], index - 1, length * params.multiplicationFactor, rotIndex, rotation);
        }
    })
}

const generateTreePts = (pt, length, includeAll, rotation) => {
    // Convert rotation from degrees to radians
    const angleInRadians = (rotation * Math.PI) / 180;

    // Function to rotate a point (x, y) around the origin (0, 0)
    const rotatePoint = (x, y) => {
        const newX = x * Math.cos(angleInRadians) - y * Math.sin(angleInRadians);
        const newY = x * Math.sin(angleInRadians) + y * Math.cos(angleInRadians);
        return [newX, newY];
    };

    // Original points without rotation
    const p1 = [pt[0], pt[1] + length];
    const p2 = [pt[0] - length, pt[1]];
    const p3 = [pt[0], pt[1] - length];
    const p4 = [pt[0] + length, pt[1]];

    // Rotate the points
    const rotatedP1 = rotatePoint(p1[0] - pt[0], p1[1] - pt[1]);
    const rotatedP2 = rotatePoint(p2[0] - pt[0], p2[1] - pt[1]);
    const rotatedP3 = rotatePoint(p3[0] - pt[0], p3[1] - pt[1]);
    const rotatedP4 = rotatePoint(p4[0] - pt[0], p4[1] - pt[1]);

    // Translate the rotated points back to the original position
    const finalP1 = [rotatedP1[0] + pt[0], rotatedP1[1] + pt[1]];
    const finalP2 = [rotatedP2[0] + pt[0], rotatedP2[1] + pt[1]];
    const finalP3 = [rotatedP3[0] + pt[0], rotatedP3[1] + pt[1]];
    const finalP4 = [rotatedP4[0] + pt[0], rotatedP4[1] + pt[1]];

    // const finalP1 = rotatedP1
    // const finalP2 = rotatedP2
    // const finalP3 = rotatedP3
    // const finalP4 = rotatedP4
    if (!includeAll) return [finalP2, finalP3, finalP4];
    return [finalP1, finalP2, finalP3, finalP4];
};

// Example usage:
const startPoint = [100, 100];
const treeLength = 50;
const includeAllPoints = true;
const rotationAngle = 45; // Degrees

const rotatedTreePts = generateTreePts(startPoint, treeLength, includeAllPoints, rotationAngle);
console.log(rotatedTreePts);

