const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random")
const math = require("canvas-sketch-util/math");
const lodash = require('lodash');
const { lerp, mapRange } = require('canvas-sketch-util/math');
const { blend } = require('canvas-sketch-util/color');
const { color } = require('canvas-sketch-util');
const { noise1D } = require('canvas-sketch-util/random');

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  duration: 180,
};

const sketch = ({context, width, height}) => {

  const size = 140;
  const ca = new CA(size, size, width);
  ca.glider();
  let tick = 0;
  let actualCycle = 0;
  let neighborCount = 3;
  let sin = 0;
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

try{

  sin = Math.sin(tick);

  if(tick%20===0){
    // neighborCount = Math.floor(math.mapRange(sin, -1, 1, 2, 5)); 
    if(actualCycle %(size/7) ===0) {
     
      neighborCount = Math.floor(math.mapRange(sin, -1, 1, 2, 5));   
     // console.log(sin); 
     //console.log('neighbor count: ' + neighborCount);
    }
    
    //ca.drawCanvas(context);
    ca.computeNextState(neighborCount, sin);
    ca.registerColumnStep();
    ca.computeCanvas();
    ca.transferState();
    actualCycle++;
  }
  tick++;
  ca.drawCanvas(context);
  }
    catch(e){
      console.log(e);
    }
  };
};

canvasSketch(sketch, settings);

class Cell{
  constructor(i, j, state, count){
    this.i = i;
    this.j = j;
    this.cellState = state;
    this.count = count;
  }
}
class CA {
  currentColumn = 0;

  constructor(sizeX, screenWidth, cellSize) {
    this.sizeX = sizeX;
    this.state = Array(this.sizeX).fill(false);
    this.nextState = Array(this.sizeX).fill(false);
    this.count = Array(this.sizeX).fill(false);
    this.nextCount = Array(this.sizeX).fill(false);
    this.screenWidth = screenWidth;
    this.cellSize = cellSize;
    this.w = Math.floor((cellSize) / (sizeX));
    this.h = Math.floor((cellSize)/(sizeX));
    this.ix = this.w * 0.9;
    this.iy = this.w * 0.9;
    this.originalCell = new Cell(0,0, false, 0);
    this.allCells =[...Array(this.sizeX)].map(e => Array(this.sizeX).fill(this.originalCell));

    for (let i = 0; i < screenWidth; i++) {
      for (let j = 0; j < sizeX; j++) {
        this.allCells[i][j] = new Cell(i,j, false);
      }
    }
  }

  glider(){
    for (let i = 0; i < this.sizeX; i++) {
     let r = random.range(0, 10);
     //console.log(r);
     this.state[i] = r>5 ? true: false;
     this.count[i] = 0;
    }
    for (let i = 0; i < this.sizeX; i++) {
      this.allCells[0][i].cellState = this.state[i];
      this.allCells[0][i].count = this.count[i]
    }
  }

  computeNextState(neighborCount, sin) {
    for (let i = 0; i < this.sizeX; i++) {
      let activeCount = this.getActiveNeighborCount(i, neighborCount);
      let min = neighborCount - 1;
      let max = neighborCount + 1;
     
      //console.log('active count : ' + activeCount);
      if (activeCount>=min && activeCount < max) this.nextState[i] = true;
      else this.nextState[i] = false;
      this.nextCount[i] = activeCount;
    }
  }

  //after drawing?
  transferState() {
    this.state = lodash.cloneDeep(this.nextState);
    this.count = lodash.cloneDeep(this.nextCount);
    this.nextState = Array(this.sizeX).fill(false);
    this.nextCount = Array(this.sizeX).fill(0);
  }

  registerColumnStep(){
    this.currentColumn++;
    this.currentColumn  = this.currentColumn>= this.screenWidth -1? this.screenWidth-1: this.currentColumn;
  }

  //compute
  computeCanvas() {
    try{
      let lastColumnIndex = this.screenWidth - 1;

    if(this.currentColumn !==  lastColumnIndex){
      //add next column
     // console.log('column: '+ this.currentColumn);
      for(let i=0; i< this.sizeX; i++){
        this.allCells[this.currentColumn][i].cellState = this.nextState[i];
        this.allCells[this.currentColumn][i].count = this.nextCount[i];
      }
      //this.allCells.forEach(x=> console.log(x));
    }
    else{
      //copy cell data from the right, except for last column
      let copyAll = lodash.cloneDeep(this.allCells);
      for (let i = 0; i < this.screenWidth; i++) {
        for (let j = 0; j < this.sizeX; j++) {
          if(i === lastColumnIndex) continue;

          this.allCells[i][j] = copyAll[i+1][j];
        }
      }
      //populate last column
      for(let i=0; i< this.screenWidth; i++){
        this.allCells[lastColumnIndex][i].cellState = this.nextState[i];
        this.allCells[lastColumnIndex][i].count = this.nextCount[i];
      }
    }
  }
    catch(e){
console.log(e);
    }
  }


  drawCanvas(context){
    context.save();
    let state = false;
    let count =0;
    for (let i = 0; i < this.screenWidth; i++) {
      for (let j = 0; j < this.sizeX; j++) {
        state = this.allCells[i][j]?.cellState;
        count = this.allCells[i][j].count;
       //console.log('i: ' + i + ', j: ' + j + ', state: ' + state);
       /// if(state!= null)
        this.drawCell(i,j,state, context, count);
      }
    }
    context.restore();
  }

  drawCell(i, j, state, context, count) {
    const gap = this.ix * 0.0;
    const posX = this.ix + (this.w + gap) * i;
    const posY = this.iy + (this.h + gap) * j;

    const off = this.ix * 0.05;
    const offHalf = off * 0.5;

    //const param = lerp(targetMin, targetMax, count);
    const mapped = mapRange(count, 1, 10, 100, 25);
    const colorSelect = mapRange(count, 1, 5, 140, 215);

    //console.log(mapped);

    //context.lineWidth = 4;
     context.fillStyle = state ? `hsl(${135}, ${50}%, ${mapped}%)` : 'white';
    // context.strokeStyle =  state? 'white'pink';
    //context.fillStyle ='black';
  //  context.strokeStyle =  'black';
  // context.beginPath();
   // context.rect(posX + offHalf, posY + offHalf, this.w-off, this.h-off);
   // context.stroke();
    context.fillRect(posX + offHalf, posY + offHalf, this.w-off, this.h-off);
  
  //context.restore();
  }

  getActiveNeighborCount(index, neighborhoodSize) {
    let count = 0;
    for (let i = -neighborhoodSize; i <= neighborhoodSize; i++) {
      if (i === 0) continue;
      let usefulIndex = (index + i + this.sizeX) % this.sizeX;
      //console.log('usefulIndex: '+ usefulIndex);
      if (this.state[usefulIndex]) count++;
    }
    return count;
  }
}

