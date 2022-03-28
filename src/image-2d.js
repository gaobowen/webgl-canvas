import Static2D from "./static-2d.js"

class Image2D extends Static2D {
  constructor(gl){
    super(gl);
    this.isLoaded = true;
    this.imgObj = new Image();
  }

  loadUrlAsync(url, options) {
    this.isLoaded = false;
    this.url = url;
    if (options && options.width && options.height) {
      this.width = options.width;
      this.height = options.height;
    }

    return new Promise((resolve) => {
      let img = this.imgObj;
      if (this.width > 0 && this.height > 0) {
        img.width = this.width;
        img.height = this.height;
      }
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!options || !options.width || !options.height) {
          this.width = img.naturalWidth;
          this.height = img.naturalHeight;
        }

        

        this.loadPixels(img, this.width, this.height);

        //glResources[this.url] = this;
        this.isLoaded = true;
        resolve(this.texture);
      }
      img.onresize = () => {

      }
      img.src = this.url;
    });
  }

  

}

export default Image2D;