const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random")
const math = require("canvas-sketch-util/math");
const Tweakpane = require('tweakpane');
const { noise1D } = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const scale = 20;

const radians_to_degrees = (radians) =>
{
  var pi = Math.PI;
  return radians * (180/pi);
}

const params = {
    scaleMin: 0.1,
    scaleMax:1.0,
    freq: 0.001,
    amp: 1,
    lineCap: "butt"
};

const flowField = (width, height, scale, frame, freq, amp)=> {
    let vectors = [];

    const gridW = width * 1.0;
    const gridH = height * 1.0;
    const cols = Math.floor(width/scale);
    const rows = Math.floor(height/scale);
   // console.log('rows: ' + rows)
   // console.log('cols: '+ cols)
    const cellW = gridW / cols;
    const cellH = gridH / rows;
    const numCells = cols * rows;

    let angles = [];
    for(let i =0; i< numCells; i++){
        const col = i% cols;
        const row = Math.floor(i/ cols);
        const x = col * cellW;
        const y = row * cellH;
        const n = random.noise3D(x, y, frame, freq);
        const angle = n * Math.PI  * amp;
        const vector = new Vector(Math.cos(angle), Math.sin(angle))
        vectors[i] = vector;
        angles[i] = angle;
    }
    //console.log(numCells)
   // console.log('vectors:' + vectors.length)
    return [vectors, angles];
}

const sketch = ({context, width, height, frame}) => {

   //console.log('ff length: ' + ff.length)
   let min = random.range(0, 10)
   let max = random.range(0, 10)
  const agents = [];
  for(let i = 0; i < 2000; i++){
    const x = random.range(0, width);
    const y =  random.range(0, height);

    agents.push(new Agent(x, y));
  }

  return({context, width, height, frame})=>{
  context.fillStyle = 'white';
  context.fillRect(0,0, width, height);
  const otherAmp = noise1D(frame, params.freq, params.amp)
  const ff = flowField(width, height, scale, frame * 5, (params.freq * frame/100), otherAmp)
  min = math.mapRange(Math.sin(frame* 0.01), -1, 1, 0, 4)
  max = math.mapRange(Math.cos(frame* 0.01), -1, 1, 0, 4)


  const cols = Math.floor(width / scale);
  const rows = Math.floor(height/scale);

  const gridW = width * 1.0;
  const gridH = height * 1.0;
  const cellW = gridW / cols;
  const cellH = gridH / rows;

  const w = cellW * 1.0;
  const h = cellH * 1.0;
  
  const numCells = cols * rows;

  for(let i =0; i< numCells; i++){
    const angle = ff[1][i]
      const col = i% cols;
      const row = Math.floor(i/ cols);

      const x = col * cellW;
      const y = row * cellH;
      context.save();
      context.translate(x,y);
      context.translate(cellW * 0.5,cellH * 0.5);
      context.rotate(angle);

      context.lineWidth = 0.5;
      context.lineCap = params.lineCap;
  
    //   context.beginPath();
    //   context.moveTo(w * -0.5, 0);
    //   context.lineTo(w * 0.5, 0);
    //   context.stroke();
    //   context.fill();
      context.restore();
     // context.fillStyle = 'black'
     // const deg = radians_to_degrees(angle)
      //context.fillText(deg.toFixed(2), x + (cellW * 0.5), y + (cellH * 0.5))
  }
  agents.forEach(agent=> 
  {
   agent.follow(ff[0], ff[1], scale, cols);
    agent.update();
    agent.draw(context, min, max);
    agent.bounce(width, height);
  });
  };
};
const createPane = () =>{
    const pane = new Tweakpane.Pane();
    let folder;
    folder = pane.addFolder({title: 'Grid'});
  //  folder.addInput(params, 'lineCap', {options: {butt: 'butt', round:'round', square: 'square'}});
    folder.addInput(params, 'scaleMin', {min: 1, max:100});
    folder.addInput(params, 'scaleMax', {min: 1, max:100});
  
    folder = pane.addFolder({title: 'Noise'});
    folder.addInput(params, 'freq', {min: -0.01, max: 0.01});
    folder.addInput(params, 'amp', {min: 0, max: 15});
  }


class Vector{
  constructor(x, y){
    this.x = x;
    this.y = y
  }

  static magnitude(vec){
     return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y))
  }

  static unitize(vec){
    const magnitude = this.magnitude(vec)
    return new Vector((vec.x * 1 )/ magnitude, (vec.y * 1) / magnitude);
  }

  static add(v1, v2){
    const x = v1.x +v2.x;
    const y = v1.y +v2.y;
    return new Vector(x,y);
  }

  static multiply(v1, v2){
    const x = v1.x *v2.x;
    const y = v1.y *v2.y;
    return new Vector(x,y);
  }
  getDistance(v){
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getRecDims(v){
    const dx = math.sign(this.x - v.x, 1);
    const dy = math.sign(this.y - v.y, 1);
    return (dx, dy);
  }
}

class Agent {
  constructor(x, y) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(random.range(-0.01,0.01),random.range(-0.01,0.01));
    this.acceleration = new Vector(random.range(0, 0), random.range(0, 0))
    this.radius = random.range(0.1, 1);
  }

  update(){
    this.acceleration = Vector.unitize(this.acceleration);
  //  if(mutate) this.acceleration = Vector.add(this.acceleration, new Vector(random.range(-1, 1), random.range(-1,1)));
     this.vel = Vector.add(this.vel, this.acceleration);
     this.vel.x = math.clamp(this.vel.x, -3, 3)
     this.vel.y = math.clamp(this.vel.y, -3, 3)
     this.pos = Vector.add(this.pos, this.vel);
  }

  follow(flowField, angles, scale, cols){
    const x = Math.floor(this.pos.x/scale);
    const y = Math.floor(this.pos.y/scale);
    const index = x + (y * cols);
      if (index >= 0 && flowField[index]) {
          const force = flowField[index];
          this.applyForce(force);
         // const angle = angles[index]
          //console.log(radians_to_degrees(angle))
      }
  }

  applyForce(force){
    let f = (Vector.unitize(force))
    this.acceleration = Vector.add(this.acceleration, f);
  }

  bounce(width, height){
    if (this.pos.x >= width) {
        this.pos.x = 0;
    }
    else if(this.pos.x <= 0){
        this.pos.x = width;
    }
    else if(this.pos.y >= height){
        this.pos.y =0;
      }
      else if(this.pos.y <= 0){
        this.pos.y=height;
      }
  }

  draw(context, min, max){
    context.save();
    //context.translate(this.pos.x, this.pos.y);
    context.fillStyle = 'white';
    context.lineWidth = 4;
    context.beginPath();
    const tempRadius = math.mapRange(this.radius, 0.1, 1.0, min, max)
    context.arc(this.pos.x, this.pos.y, tempRadius,
      0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.restore();
  }
}

//createPane();
canvasSketch(sketch, settings);