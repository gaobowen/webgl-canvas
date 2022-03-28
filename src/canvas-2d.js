import Static2D from './static-2d.js';

class Canvas2D extends Static2D {
  constructor(gl) {
    super(gl);
    this.canvasEle = document.createElement('canvas');
    this.canvasCtx = this.canvasEle.getContext('2d');
  }

  resize(width, height) {
    this.canvasEle.width = width;
    this.canvasEle.height = height;
    this.loadPixels(this.canvasEle, width, height);
  }

  update() {
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
      this.width, this.height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, this.canvasEle);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

}

export default Canvas2D;