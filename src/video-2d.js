import Static2D from './static-2d.js';

class Video2D extends Static2D {
  constructor(gl) {
    super(gl);
    this.current = 0;
    this.time = 0;
    this.isSeeking = false;
    this.videoEle = document.createElement('video');
    this.videoEle.crossOrigin = "anonymous";
    this.videoEle.muted = true;
    this.videoEle.loop = false;
    this.videoEle.autoplay = false;
    this.videoEle.ontimeupdate = () => {
      if (this.playToken) {
        return;
      }
      console.log(3)
      this.isSeeking = false;
      let gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        this.width, this.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, this.videoEle);
      gl.bindTexture(gl.TEXTURE_2D, null);
      if (this.videoEle.currentTime != this.time) {
        this.isSeeking = true;
        this.videoEle.currentTime = this.time;
      }
    };
    this.videoEle.onended = () => {
      this.stop(1);
    }
  }

  loadUrlAsync(url) {
    this.isLoaded = false;
    this.url = url;
    return new Promise((resolve) => {
      this.videoEle.onloadeddata = (e) => {
        //console.log('video src', videoEle.videoHeight, videoEle.videoWidth, videoEle.duration);
        this.videoEle.width = this.videoEle.videoWidth;
        this.videoEle.height = this.videoEle.videoHeight;
        this.width = this.videoEle.videoWidth;
        this.height = this.videoEle.videoHeight;
        resolve(this);
      }
      this.videoEle.src = this.url;
    });
  }


  play() {
    if (this.playToken) {
      return;
    }
    this.playToken = 1;
    let gl = this.gl;
    let start;
    let drawVideo = (timestamp) => {
      if (timestamp === undefined) {
        this.videoEle.play();
        this.playToken = requestAnimationFrame(drawVideo);
        return;
      }
      if (start === undefined) {
        start = timestamp;
      }

      if (timestamp - start >= 33) {
        start = timestamp;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
          this.width, this.height, 0,
          gl.RGBA, gl.UNSIGNED_BYTE, this.videoEle);
        gl.bindTexture(gl.TEXTURE_2D, null);
        //console.log(this.videoEle.paused)
      }
      this.playToken = requestAnimationFrame(drawVideo);

    };
    drawVideo();
  }

  //0 ~ 1
  stop(val) {
    cancelAnimationFrame(this.playToken);
    this.playToken = null;
    this.current = val;
    this.time = this.videoEle.duration * this.current;
    this.videoEle.pause();
    if (!this.isSeeking) {
      this.isSeeking = true;
      this.videoEle.currentTime = this.time;
    }
  }


}


export default Video2D;