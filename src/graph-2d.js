import { default as cacheObj } from './gl-cache-src.js';
import * as mat4 from './mat4.js';

var { fieldOfView } = cacheObj;

class Graph2D {
  constructor(gl) {
    let model = mat4.create();
    mat4.translate(model, model, [0, 0, - Math.PI / 2 / fieldOfView]);
    this.selfModel = model;
    //this.comModel = mat4.create();
    this.drawModel = mat4.create();
    mat4.multiply(this.drawModel, mat4.create(), this.selfModel);

    this.width = gl.canvas.width;
    this.height = gl.canvas.height;

    this.filters = [];
    //this.useModel

    this.gl = gl;
    let texture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.texture = texture1;

    let vertices = [
      // positions            //texture coords
      1.0, 1.0, 0.0, 1.0, 0.0, //right top 
      1.0, -1.0, 0.0, 1.0, 1.0, //right bottom 
      -1.0, -1.0, 0.0, 0.0, 1.0, //left bottom 
      -1.0, 1.0, 0.0, 0.0, 0.0  //left top -> canvas left-bottom
    ];

    let verticesDataView = new Float32Array(vertices);

    let indices = [
      0, 1, 3, // first triangle
      1, 2, 3  // second triangle
    ];
    let indicesDataView = new Uint32Array(indices);

    let vao = gl.createVertexArray();
    let vbo = gl.createBuffer();
    let ebo = gl.createBuffer();

    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verticesDataView, gl.STATIC_DRAW);
    // position attribute
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, verticesDataView.BYTES_PER_ELEMENT * 5, 0);
    gl.enableVertexAttribArray(0);
    // texture coord attribute
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, verticesDataView.BYTES_PER_ELEMENT * 5, verticesDataView.BYTES_PER_ELEMENT * 3);
    gl.enableVertexAttribArray(1);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesDataView, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    this.vao = vao;
    this.vbo = vbo;
    this.ebo = ebo;
  }

  updateModel(matrix) {
    mat4.multiply(this.drawModel, matrix, this.selfModel);
  }

  execFilters() {
    let result = this.texture;
    if (this.filters && this.filters.length > 0) {
      for (let index = 0; index < this.filters.length; index++) {
        const filter = this.filters[index];
        if (filter) {
          filter.resize(this.width, this.height);
          result =filter.execFilter(result);

          //filter.execFilter(result);
        }
      }
    }
    return result;
  }
}

export default Graph2D;