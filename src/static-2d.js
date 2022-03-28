import Graph2D from './graph-2d.js';
import { default as cacheObj } from './gl-cache-src.js';
import * as mat4 from './mat4.js';

var { resolution, glResources } = cacheObj;

class Static2D extends Graph2D {
  constructor(gl) {
    super(gl);
  }

  loadPixels(pixels, width, height, scaleX, scaleY) {
    if (pixels && width > 0 && height > 0) {
      this.width = width;
      this.height = height;

      let gl = this.gl;
      let sw = this.width / resolution.width;
      let sh = this.height / resolution.height;

      if (scaleX && scaleY) {
        sw *= scaleX;
        sh *= scaleY;
      }


      let vertices = [
        1.0 * sw, 1.0 * sh, 0.0, 1.0, 0.0,
        1.0 * sw, -1.0 * sh, 0.0, 1.0, 1.0,
        -1.0 * sw, -1.0 * sh, 0.0, 0.0, 1.0,
        -1.0 * sw, 1.0 * sh, 0.0, 0.0, 0.0
      ];

      let verticesDataView = new Float32Array(vertices);

      let indices = [0, 1, 3, 1, 2, 3];
      let indicesDataView = new Uint32Array(indices);
      let vao = gl.createVertexArray();
      let vbo = gl.createBuffer();
      let ebo = gl.createBuffer();

      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, verticesDataView, gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, verticesDataView.BYTES_PER_ELEMENT * 5, 0);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, verticesDataView.BYTES_PER_ELEMENT * 5, verticesDataView.BYTES_PER_ELEMENT * 3);
      gl.enableVertexAttribArray(1);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesDataView, gl.STATIC_DRAW);
      this.vao = vao;
      this.vbo = vbo;
      this.ebo = ebo;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        this.width, this.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      //console.log(pixels.width, pixels.naturalWidth);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

      return this.texture;
    }
  }

}


export default Static2D;