import { default as cacheObj } from './gl-cache-src.js';

class Filter {
  constructor(gl) {
    this.gl = gl;

    let vertices = [
      1.0, 1.0, 0.0, 1.0, 1.0, //right top 
      1.0, -1.0, 0.0, 1.0, 0.0, //right bottom 
      -1.0, -1.0, 0.0, 0.0, 0.0, //left bottom 
      -1.0, 1.0, 0.0, 0.0, 1.0  //left top -> canvas left-bottom
    ];

    let verticesDataView = new Float32Array(vertices);

    let indices = [ 0, 1, 3, 1, 2, 3 ];
    let indicesDataView = new Uint32Array(indices);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

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

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    this.vao = vao;
    this.vbo = vbo;
    this.ebo = ebo;

    let renderFramebuffer = gl.createFramebuffer();
    let colorFramebuffer = gl.createFramebuffer();
    var colorRenderbuffer = gl.createRenderbuffer();
    this.renderFramebuffer = renderFramebuffer;
    this.colorFramebuffer = colorFramebuffer;
    this.colorRenderbuffer = colorRenderbuffer;
    let texture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.filterTexture = texture1;

    this.filterProgram = cacheObj.fboProgram;
  }


  resize(width, height) {
    //console.log('aaaaaaaaa',this.width, this.height );
    if (this.width == width && this.height == height) {
      return;
    }
    let gl = this.gl;

    this.width = width;
    this.height = height;
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.colorRenderbuffer);
    //gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, this.width, this.height);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 1, gl.RGBA8, this.width, this.height);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.colorRenderbuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //output
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.colorFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.filterTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  execFilter(texture) {
    return texture;
  }

  initLocations(options){
    this.options = options;
    this.locations = [];
    for (const key in this.options) {
      if (Object.hasOwnProperty.call(this.options, key)) {
        this.locations[key] = this.gl.getUniformLocation(this.filterProgram, key);
      }
    }
  }

  updateOptions() {
    for (const key in this.options) {
      if (Object.hasOwnProperty.call(this.options, key)) {
        const val = this.options[key];
        
      }
    }

  }

  beginFilter(){
    let gl = this.gl;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(1, 1, 1, 0);
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.filterProgram);
  }

  endFilter(){
    let gl = this.gl;

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.renderFramebuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.colorFramebuffer);
    gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
    gl.blitFramebuffer(
      0, 0, this.width, this.height,
      0, 0, this.width, this.height,
      gl.COLOR_BUFFER_BIT, gl.NEAREST
    );
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(null);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

}


export default Filter;