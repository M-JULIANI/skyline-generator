const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    context.lineWidth = width * 0.01;
    context.strokeStyle = 'white';

    const gap = width * 0.03;
    const w = width * 0.1;
    const h = height * 0.1;

    const ix = width * 0.17;
    const iy = height * 0.17;

    const off = width * 0.02;

    let posX, posY;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        posX = ix + (w + gap) * i;
        posY = iy + (h + gap) * j;
        console.log('posX: ' + posX + ', posY: '+ posY);
        context.beginPath();
        context.rect(posX, posY, w, h);
        context.stroke();

        if (Math.random() > 0.5) {
          context.beginPath();
          context.rect(posX + off/2, posY + off/2, w - off, h - off);
          context.stroke();

        }
      }
    }
  };
};

canvasSketch(sketch, settings);
