import { default as cacheObj } from './gl-cache-src.js';
import Static2D from './static-2d.js';
import Text2D from './text-2d.js';
import Image2D from './image-2d.js';
import Lottie2D from './lottie-2d.js';
import Video2D from './video-2d.js';
import Canvas2D from './canvas-2d.js';
import Layer from './layer.js';
import {
  initProgram,
  vertexShaderString,
  fragmentShaderString,
  fboVertex,
  fboFragment
} from './proxima-util.js';

class Proxima {
  constructor(options) {
    let { canvasEle, resolution, renderScale, multisample } = options;
    if (!canvasEle) throw 'canvasEle is null';

    this.resolution = resolution || { width: 1920, height: 1080 };
    this.renderScale = renderScale || 2;
    this.multisample = multisample || 8;

    canvasEle.width = this.resolution.width * this.renderScale;
    canvasEle.height = this.resolution.height * this.renderScale;

    let gl = canvasEle.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });
    console.log('SHADING_LANGUAGE_VERSION = ', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    if (!gl) {
      throw "getContext(webgl2) is null";
    }
    
    this.gl = gl;
    cacheObj.gl = this.gl;
    cacheObj.resolution = this.resolution;
    cacheObj.renderScale = this.renderScale;
    cacheObj.multisample = this.multisample;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    cacheObj.eleProgram = initProgram(gl, vertexShaderString, fragmentShaderString);
    cacheObj.fboProgram = initProgram(gl, fboVertex, fboFragment);

    this.filterDictionary = [];
  }

  getRenderScale() {
    return cacheObj.renderScale;
  }

  createLayer() {
    return new Layer(this.gl);
  }

  createGraph(type) {
    if (type) {
      switch (type) {
        case 'image': {
          return new Image2D(this.gl);
        }
        case 'svg': {

          break;
        }
        case 'lottie': {
          return new Lottie2D(this.gl);
        }
        case 'video': {
          return new Video2D(this.gl);
        }
        case 'text': {
          return new Text2D(this.gl);
        }
        case 'canvas2d': {
          return new Canvas2D(this.gl);
        }
        default:
          break;
      }
    }
  }

  toScreen(layers) {
    if (layers.length > 0) {
      let gl = this.gl;
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(cacheObj.fboProgram);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(1, 1, 1, 1);
      gl.clearDepth(1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


      for (let index = 0; index < layers.length; index++) {
        const layer = layers[index];
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, layer.texture);
        gl.uniform1i(gl.getUniformLocation(cacheObj.fboProgram, 'fboTexture'), 0);
        gl.bindVertexArray(layer.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, layer.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, layer.ebo);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
      }
      
    }
  }

  registerFilter(key, prototype){
    this.filterDictionary[key] = prototype;
  }

  unregisterFilter(key){
    delete this.filterDictionary[key];
  }

  createFilter(key){
    return new this.filterDictionary[key](this.gl);
  }

}

export { Proxima };
