const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random")
const math = require("canvas-sketch-util/math");
const lodash = require('lodash');
const { lerp, mapRange } = require('canvas-sketch-util/math');
const Tweakpane = require('tweakpane');

const settings = {
    dimensions: [1080, 1080],
    animate: true,
    duration: 180,
};

const params = {
    size: 60,
    speed: 60,
    neighborhood: 1,
    minNeighbors: 3,
    maxNeighbors: 5,
}

const sketch = ({ context, width, height }) => {

    let size = params.size;
    let ca = new CA(size, width);
    ca.glider();
    let tick = 0;
    return ({ context, width, height }) => {
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
        const speed = params.speed;
        let size = params.size;
        if(ca.sizeY!= size){
            ca = new CA(size, width);
            ca.glider();
        }

        try {
            if (tick % speed === 0) {
                const neighborhood = params.neighborhood;
                const minNeighbors = params.minNeighbors;
                const maxNeighbors = params.maxNeighbors;
                ca.computeNextState(neighborhood, minNeighbors, maxNeighbors);
                ca.transferState();
            }
            tick++;
            ca.drawCanvas(context);
        }
        catch (e) {
            console.log(e);
        }
    };
};

const createPane = () => {
    const pane = new Tweakpane.Pane();
    let folder;
    folder = pane.addFolder({ title: 'general' });
    folder.addInput(params, 'size', { min: 20, max: 100, step: 10 });
    folder.addInput(params, 'speed', { min: 20, max: 100, step: 10 });
    folder.addInput(params, 'neighborhood', { min: 1, max: 3, step: 1 });
    folder = pane.addFolder({ title: 'thresholds' });
    folder.addInput(params, 'minNeighbors', { min: 1, max: 10, step: 1 });
    folder.addInput(params, 'maxNeighbors', { min: 4, max: 10, step: 1 });

}

createPane();
canvasSketch(sketch, settings);

class Cell {
    constructor(i, j, state, count) {
        this.i = i;
        this.j = j;
        this.cellState = state;
        this.count = count;
    }
}
class CA {
    currentGeneration = 0;

    constructor(sizeY, cellSize) {
        this.sizeY = sizeY;
        this.state = [...Array(this.sizeY)].map(e => Array(this.sizeY).fill(false));
        this.nextState = [...Array(this.sizeY)].map(e => Array(this.sizeY).fill(false));
        this.cellSize = cellSize;
        this.w = Math.floor((cellSize) / (sizeY));
        this.h = Math.floor((cellSize) / (sizeY));
        this.ix = this.w * 0.9;
        this.iy = this.w * 0.9;
        this.originalCell = new Cell(0, 0, false, 0);
        this.allCells = [...Array(this.sizeX)].map(e => Array(this.sizeX).fill(this.originalCell));
    }

    glider() {

        for (let i = 0; i < this.sizeY; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                let r = random.range(0, 10);
                this.state[i][j] = r > 5 ? true : false;
            }
        }
    }

    computeNextState(neighborhood, min, max) {
        this.state.forEach((x, i) => {
            x.forEach((y, j)=>{
               // const activeCount = this.getActiveNeighborCount(i, j, neighborhood);
                const activeCount = this.getDeeperNeighborDirection(this.state, i, j, neighborhood)
                if (activeCount >= min && activeCount < max) this.nextState[i][j] = true;
                else this.nextState[i][j] = false;
            })
        })         
    }

    //after drawing?
    transferState() {
        this.state = lodash.cloneDeep(this.nextState);
        this.nextState = [...Array(this.sizeY)].map(e => Array(this.sizeY).fill(false));
    }

    drawCanvas(context) {
        context.save();
        this.state.forEach((x, i) => {
            x.forEach((y, j) => this.drawCell(i, j, this.state[i][j], context, 1));
        })
        context.restore();
    }

    drawCell(i, j, state, context, count) {
        const gap = this.ix * 0.0;
        const posX = this.ix + (this.w + gap) * i;
        const posY = this.iy + (this.h + gap) * j;

        const off = this.ix * 0.05;
        const offHalf = off * 0.5;
        count = 200

        //const param = lerp(targetMin, targetMax, count);
        const mapped = mapRange(count, 1, 10, 100, 25);
        const colorSelect = mapRange(count, 1, 5, 140, 215);

        context.fillStyle = state ? `black` : 'white';
        context.fillRect(posX + offHalf, posY + offHalf, this.w - off, this.h - off);
    }

    getActiveNeighborCount(indexX, indexY, neighborhoodSize) {
        let count = 0;
        for (let i = -neighborhoodSize; i <= neighborhoodSize; i++) {
            for (let j = -neighborhoodSize; j <= neighborhoodSize; j++) {
                if (i === 0 && j === 0) continue;
               // if(i * j !==0) continue;
                const usefulX = (indexX + i + this.sizeY) % this.sizeY;
                const usefulY = (indexY + j + this.sizeY) % this.sizeY;
                if (this.state[usefulX][usefulY]) count++;
            }
        }
        return count;
    }

    getDeeperNeighborDirection = (state, indexX, indexY, depth) =>{
        let xNeighbors = 0;
        let yNeighbors = 0;
        const maxNeighborDepth = depth;
    
        //x direction
      for (let j = 0; j < 2; j++) {
        const addend = j === 0 ? 1 : -1;
        for (let i = 1; i <= maxNeighborDepth; i++) {
          const index = indexX + (i * addend);
          if (index > state.length - 1 || index < 0) continue;
          const cellPriority = state[index][indexY];
          if (!cellPriority) {
            i+= maxNeighborDepth
            continue;
          }
          xNeighbors++;
        }
      }
      
        //y direction
      for (let j = 0; j < 2; j++) {
        const addend = j === 0 ? 1 : -1;
        for (let i = 1; i <= maxNeighborDepth; i++) {
          const index = indexY + (i * addend);
          if (index > state[0].length - 1 || index < 0) continue;
          const cellPriority = state[indexX][index];
          if (!cellPriority) {
            i+= maxNeighborDepth
            continue;
          }
          yNeighbors++;
        }
      }  
return yNeighbors + xNeighbors;
      }
    
    
}

