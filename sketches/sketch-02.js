const canvasSketch = require('canvas-sketch');
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random")
const settings = {
  dimensions: [ 1080, 1080 ]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'black';

    const cx = width * 0.5;
    const cy = height * 0.5;
    const w = width * 0.01;
    const h = height * 0.1;

    let x,y;

    const num = 24;
    const radius = width * 0.3;
    const slice = math.degToRad(360 / num);
    let angle = 0;
    var r = random.range(0,  math.degToRad(360));
    for (let i = 0; i < num; i++) {
      let angle = slice * i;

      x = cx + radius * Math.sin(angle);
      y = cy + radius * Math.cos(angle);

      context.save();
      context.translate(x, y);
      context.rotate(-angle);
      context.scale(random.range(0.5,1.5), random.range(0.2, 1));
  
      context.beginPath();
      context.rect(-w * 0.5, random.range(0, -h * 2.5), -w*0.5, -h*0.5);
      context.fill();
      context.restore();

      context.save();
      context.translate(cx, cy);
      context.rotate(-angle);
      context.lineWidth = random.range(2.5, 10);
      context.beginPath();

      context.arc(0,0, 
        radius * i/num  + r,
        0,
         slice * i);
    
      context.stroke();
      context.restore();
    }
  };
};

canvasSketch(sketch, settings);
