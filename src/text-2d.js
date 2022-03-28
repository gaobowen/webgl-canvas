import Static2D from "./static-2d.js"
import TextRendering from './DrawText/TextRendering.js';
import { default as cacheObj } from './gl-cache-src.js';
import * as mat4 from './mat4.js';

var { resolution, fieldOfView } = cacheObj;

class Text2D extends Static2D {
  constructor(gl) {
    super(gl);
    this.drawTextObj = new TextRendering();
  }

  setTextStyle(textStyle) {
    this.drawTextObj.setTextStyle(textStyle);
  }

  updateText(text) {
    let textCanvas = this.drawTextObj.drawTextWrapAutomatic(text);
    let posOffsetX = this.drawTextObj.posOffsetX;
    let posOffsetY = this.drawTextObj.posOffsetY;
    let realCenter = { x: posOffsetX + this.drawTextObj.width / 2, y: posOffsetY + this.drawTextObj.height / 2 };
    let canvasCenter = { x: textCanvas.width / this.drawTextObj.scale / 2, y: textCanvas.height / this.drawTextObj.scale / 2 }
    let centerOffset = { x: realCenter.x - canvasCenter.x, y: realCenter.y - canvasCenter.y };
    let aspect = resolution.width / resolution.height;
    let model = mat4.create();
    mat4.translate(model, model, 
      [-centerOffset.x / resolution.width * 2 * aspect, 
      -centerOffset.y / resolution.height * 2, 
      - Math.PI / 2 / fieldOfView]);
    this.selfModel = model;
    this.loadPixels(textCanvas, textCanvas.width, textCanvas.height, 1 / this.drawTextObj.scale, 1 / this.drawTextObj.scale);

  }
}


export default Text2D;