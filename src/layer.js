import * as mat4 from './mat4.js';
import { default as cacheObj } from './gl-cache-src.js';
import Graph2D from './graph-2d.js'


class Layer extends Graph2D {
  constructor(gl) {
    super(gl);
    this.gl = gl;
    let renderFramebuffer = gl.createFramebuffer();
    let colorFramebuffer = gl.createFramebuffer();
    var colorRenderbuffer = gl.createRenderbuffer();
    this.renderFramebuffer = renderFramebuffer;
    this.colorFramebuffer = colorFramebuffer;
    this.colorRenderbuffer = colorRenderbuffer;
    this.width = gl.canvas.width;
    this.height = gl.canvas.height;
    this.resize(this.width, this.height);
    this.isBusy = false;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    let gl = this.gl;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.colorRenderbuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, cacheObj.multisample, gl.RGBA8, this.width, this.height);
    let fboTexture = this.texture;
    gl.bindTexture(gl.TEXTURE_2D, fboTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.colorRenderbuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.colorFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    let projection = mat4.create()
    const fieldOfView = cacheObj.fieldOfView; //Math.atan(1/2);
    const aspect = this.width / this.height;
    const zNear = 1;
    const zFar = 10000;
    mat4.perspective(projection,
      fieldOfView,
      aspect,
      zNear,
      zFar);

    let view = mat4.create();
    mat4.scale(view, view, [aspect, 1, 1]);

    this.projection = projection;
    this.view = view;
  }

  beginDraw(isClear = true) {
    this.isBusy = true;
    let gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.viewport(0, 0, this.width, this.height);
    if (isClear) {
      gl.clearColor(1, 1, 0, 0);
      gl.clearDepth(1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    gl.useProgram(cacheObj.eleProgram);
  }

  /**
   * 清空layer画布
   * @option rgba 0.0~1.0
   */
  clearColor(option) {
    let { r=1, g=1, b=1, a=0 } = option;
    let gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(r, g, b, a);
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  endDraw() {
    let gl = this.gl;
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.renderFramebuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.colorFramebuffer);
    gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 1.0, 0.0]);
    gl.blitFramebuffer(
      0, 0, this.width, this.height,
      0, 0, this.width, this.height,
      gl.COLOR_BUFFER_BIT, gl.NEAREST
    );
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(null);
    this.isBusy = false;

  }

  /**
   * 绘制单个元素，默认"不"清空layer画布
   * @param {object} graph2d 
   */
  drawElement(graph2d) {
    let eleTexture = graph2d.execFilters();
    //let eleTexture = graph2d.texture;
    let model = graph2d.drawModel;
    let projection = this.projection;
    let view = this.view;

    this.beginDraw(false);

    let gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, eleTexture);
    gl.uniform1i(gl.getUniformLocation(cacheObj.eleProgram, 'lhtexture1'), 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(cacheObj.eleProgram, 'projection'), false, projection);
    gl.uniformMatrix4fv(gl.getUniformLocation(cacheObj.eleProgram, 'model'), false, model);
    gl.uniformMatrix4fv(gl.getUniformLocation(cacheObj.eleProgram, 'view'), false, view);
    gl.bindVertexArray(graph2d.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, graph2d.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, graph2d.ebo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);

    this.endDraw();
  }

  /**
   * 批量绘制元素，默认清空layer画布
   * @param {Array} graphList 
   */
  drawElementList(graphList) {
    let textureList = [];
    if (graphList.length > 0) {
      for (let i = 0; i < graphList.length; i++) {
        textureList.push(graphList[i].execFilters())
      }

      this.beginDraw();
      let gl = this.gl;
      for (let i = 0; i < graphList.length; i++) {
        const graph2d = graphList[i];
        let eleTexture = textureList[i];
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, eleTexture);
        gl.uniform1i(gl.getUniformLocation(cacheObj.eleProgram, 'lhtexture1'), 0);
        gl.uniformMatrix4fv(gl.getUniformLocation(cacheObj.eleProgram, 'projection'), false, this.projection);
        gl.uniformMatrix4fv(gl.getUniformLocation(cacheObj.eleProgram, 'model'), false, graph2d.drawModel);
        gl.uniformMatrix4fv(gl.getUniformLocation(cacheObj.eleProgram, 'view'), false, this.view);
        gl.bindVertexArray(graph2d.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, graph2d.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, graph2d.ebo);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
      }

      this.endDraw();
    }

    // let eleTexture = graph2d.execFilters();
    // //let eleTexture = graph2d.texture;
    // let model = graph2d.drawModel;
    // let projection = this.projection;
    // let view = this.view;



  }

  drawLayer(layer, isClear = false) {
    let layerTexture = layer.execFilters();

    let gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);
    gl.viewport(0, 0, this.width, this.height);
    if (isClear) {
      gl.clearColor(1, 1, 1, 0);
      gl.clearDepth(1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    gl.useProgram(cacheObj.fboProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, layerTexture);
    gl.uniform1i(gl.getUniformLocation(cacheObj.fboProgram, 'fboTexture'), 0);

    gl.bindVertexArray(layer.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, layer.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, layer.ebo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    this.endDraw();
  }
}

export default Layer;