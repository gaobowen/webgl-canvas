import Static2D from './static-2d.js';
import {} from './lottie.min.js';

let lottie = window.lottie;

class Lottie2D extends Static2D {
  constructor(gl) {
    super(gl);
    this.lottieCanvas = document.createElement('canvas');
    this.current = 0;
  }

  loadUrlAsync(url, scale) {
    this.isLoaded = false;
    this.url = url;
    return new Promise((resolve) => {
      fetch(this.url).then((response)=> {
        return response.json();
      })
        .then((myJson) => {
          this.lottieData = myJson;
          let lottieData = this.lottieData;

          this.originWidth = lottieData.w;
          this.originHeight = lottieData.h;
          this.width = lottieData.w * (scale || 1);
          this.height = lottieData.h * (scale || 1);
          this.framerate = lottieData.fr;
          this.startIdx = lottieData.ip;
          this.endIdx = lottieData.op;
          this.duration = (this.endIdx - this.startIdx) / this.framerate;

          //console.log('lottieData', lottieData, width, height, framerate, startIdx, endIdx);

          //等比缩放不支持拉伸
          this.lottieCanvas.width = this.width;
          this.lottieCanvas.height = this.height;

          this.lottieObj = lottie.loadAnimation({
            //container: container,
            renderer: 'canvas',
            loop: true,
            autoplay: false,
            animationData: this.lottieData,
            rendererSettings: {
              context: this.lottieCanvas.getContext('2d')
            }
          });

          this.lottieObj.goToAndStop(this.startIdx, true);
          this.loadPixels(this.lottieCanvas, this.width, this.height);
          this.isLoaded = true;
          resolve(this);
        });
    });
  }



  //矢量图放大，image和video直接用矩阵缩放即可，不影响画质。
  originScale(scaleX, scaleY) {
    cancelAnimationFrame(this.playToken);
    this.playToken = null;
    this.width = this.originWidth * (scaleX || 1);
    this.height = this.originHeight * (scaleY || 1);
    this.lottieCanvas.width = this.width;
    this.lottieCanvas.height = this.height;
    this.lottieObj = lottie.loadAnimation({
      //container: container,
      renderer: 'canvas',
      loop: true,
      autoplay: false,
      animationData: this.lottieData,
      rendererSettings: {
        context: this.lottieCanvas.getContext('2d')
      }
    });

    this.lottieObj.goToAndStop(this.startIdx, true);
    this.loadPixels(this.lottieCanvas, this.width, this.height);
  }

  canvasResize(width, height){

  }

  play(){
    if (this.playToken) {
      return;
    }
    let gl = this.gl;
    let start;
    let drawLottie = (timestamp) => {
      if (timestamp === undefined) {
        this.lottieObj.play();
        this.playToken = requestAnimationFrame(drawLottie);
        return;
      }
      if (start === undefined){
        start = timestamp;
      }

      if (timestamp - start >= this.framerate) {
        start = timestamp;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
          this.width, this.height, 0,
          gl.RGBA, gl.UNSIGNED_BYTE, this.lottieCanvas);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
      this.playToken = requestAnimationFrame(drawLottie);

    };
    drawLottie();
  }

  //0 ~ 1
  stop(val){
    cancelAnimationFrame(this.playToken);
    this.playToken = null;
    this.current = val;
    let idx = this.startIdx + (this.endIdx - this.startIdx) * this.current;
    this.lottieObj.goToAndStop(idx, true);
    let gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
      this.width, this.height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, this.lottieCanvas);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }


}


export default Lottie2D;