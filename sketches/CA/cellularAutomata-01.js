const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random")
const math = require("canvas-sketch-util/math");
const lodash = require('lodash');
const { lerp, mapRange } = require('canvas-sketch-util/math');

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  duration: 180,
};

const sketch = ({context, width, height}) => {

  const sizeX= 220;
  const sizeY = 220;
  const ca = new CA(sizeX, sizeY, width, height);
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
    // if(actualCycle %(sizeX/20) ===0) {
    //   neighborCount = Math.floor(math.mapRange(sin, -1, 1, 2, 5));   
    //  // console.log(sin); 
    //  console.log('neighbor count: ' + neighborCount);
    // }
    
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

  constructor(sizeX, sizeY, canvasWidth, canvasHeight) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.state = Array(this.sizeY).fill(false);
    this.nextState = Array(this.sizeY).fill(false);
    this.count = Array(this.sizeY).fill(false);
    this.nextCount = Array(this.sizeY).fill(false);
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.edgePadding = sizeX * 0.3;
    this.w = Math.floor((canvasWidth - (this.edgePadding * 2)) / (sizeX));
    this.h = Math.floor((canvasHeight - (this.edgePadding * 2))/(sizeY));
    this.ix = this.w * 0.9;
    this.iy = this.h * 0.9;
    this.originalCell = new Cell(0,0, false, 0);
    this.allCells =[...Array(this.sizeX)].map(e => Array(this.sizeX).fill(this.originalCell));
   // this.allCells =[...Array(this.sizeX)].map(e => Array(this.sizeX).fill(this.originalCell));

    for (let i = 0; i < sizeX; i++) {
      for (let j = 0; j < sizeY; j++) {
        this.allCells[i][j] = new Cell(i,j, false);
      }
    }
  }

  glider(){
    for (let i = 0; i < this.sizeY; i++) {
     let r = random.range(0, 10);
     //console.log(r);
     this.state[i] = r>5 ? true: false;
     this.count[i] = 0;
    }
    for (let i = 0; i < this.sizeY; i++) {
      this.allCells[0][i].cellState = this.state[i];
      this.allCells[0][i].count = this.count[i]
    }
  }

  computeNextState(neighborCount, sin) {
    for (let i = 0; i < this.sizeY; i++) {
      let activeCount = this.getActiveNeighborCount(i, neighborCount);
      let min = neighborCount - 1;
      let max = neighborCount + 1;
     
      //console.log('active count : ' + activeCount);
      if (activeCount>=min && activeCount < max) this.nextState[i] = true;
      else this.nextState[i] = false;
      this.nextCount[i] = activeCount;

let addFactor = mapRange(sin, -1, 1, 0, 3);
      let usableIndex = (i+addFactor + this.sizeY) % this.sizeY;;
    // if((sin)> 0.5){
        this.nextState[usableIndex] = this.nextState[i];
        this.nextCount[usableIndex] = this.nextCount[i];
    // }
    }
  }

  //after drawing?
  transferState() {
    this.state = lodash.cloneDeep(this.nextState);
    this.count = lodash.cloneDeep(this.nextCount);
    this.nextState = Array(this.sizeY).fill(false);
    this.nextCount = Array(this.sizeY).fill(0);
  }

  registerColumnStep(){
    this.currentColumn++;
    this.currentColumn  = this.currentColumn>= this.sizeX -1? this.sizeX-1: this.currentColumn;
  }

  //compute
  computeCanvas() {
    try{
      let lastColumnIndex = this.sizeX - 1;

    if(this.currentColumn !==  lastColumnIndex){
      //add next column
     // console.log('column: '+ this.currentColumn);
      for(let i=0; i< this.sizeY; i++){
        this.allCells[this.currentColumn][i].cellState = this.nextState[i];
        this.allCells[this.currentColumn][i].count = this.nextCount[i];
      }
      //this.allCells.forEach(x=> console.log(x));
    }
    else{
      //copy cell data from the right, except for last column
      let copyAll = lodash.cloneDeep(this.allCells);
      for (let i = 0; i < this.sizeX; i++) {
        for (let j = 0; j < this.sizeY; j++) {
          if(i === lastColumnIndex) continue;

          this.allCells[i][j] = copyAll[i+1][j];
        }
      }
      //populate last column
      for(let i=0; i< this.sizeY; i++){
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
    for (let i = 0; i < this.sizeX; i++) {
      for (let j = 0; j < this.sizeY; j++) {
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
    const gap = this.h * 0.04;
    const posX = this.edgePadding + (this.w + gap) * i;
    const posY = this.edgePadding + (this.h + gap) * j;

    const off = gap;
    const offHalf = off * 0.5;
    const mapped = mapRange(count, 1, 10, 100, 25);
    const colorSelect = mapRange(count, 1, 5, 20, 215);
     context.fillStyle = state ? `hsl(${colorSelect}, ${50}%, ${25}%)` : 'white';
    context.fillRect(posX + offHalf, posY + offHalf, this.w-off, this.h-off);
  }

  getActiveNeighborCount(index, neighborhoodSize) {
    let count = 0;
    for (let i = -neighborhoodSize; i <= neighborhoodSize; i++) {
      if (i === 0) continue;
      let usefulIndex = (index + i + this.sizeY) % this.sizeY;
      //console.log('usefulIndex: '+ usefulIndex);
      if (this.state[usefulIndex]) count++;
    }
    return count;
  }
}

