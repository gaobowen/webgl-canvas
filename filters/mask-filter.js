
import {
  initProgram,
  Filter
} from '../src/index.js';


const vertexShader =
    `#version 300 es
    precision mediump float;                         
    layout (location = 0) in vec3 aPos;								
    layout (location = 1) in vec2 aTexCoord;			
                                                                            
    out vec2 TexCoord;												    
                                                  
    void main()															    
    {																				    
      gl_Position = vec4(aPos, 1.0);																			  
      TexCoord = vec2(aTexCoord.x, aTexCoord.y);	
    }
    `;


const fragmentShader =
    `#version 300 es
    precision mediump float;                                                       
    out vec4 FragColor;																									
                                                                                                                          
    in vec2 TexCoord;																										
                                                                                                                                  
    // texture samplers																									
    uniform sampler2D srcTexture;																					
    uniform sampler2D maskTexture;																		
                                                                        
    void main()																													
    {																																		
      FragColor =  vec4(texture(srcTexture, TexCoord).rgb, texture(maskTexture, TexCoord).a);
      //FragColor =  vec4(1.0,0,0,1.0);                                                 
    }	
    `;



class MaskFilter extends Filter{
  constructor(gl){
    super(gl);
    this.filterProgram = initProgram(gl, vertexShader, fragmentShader);
  }

  setMaskTexture(texture){
    this.maskTexture = texture;
  }

  execFilter(texture) {
    if (!this.maskTexture) {
      return texture;
    }
    let gl = this.gl;
    this.beginFilter();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(this.filterProgram, 'srcTexture'), 0);


    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.maskTexture);
    gl.uniform1i(gl.getUniformLocation(this.filterProgram, 'maskTexture'), 1);

    this.endFilter();
    return this.filterTexture;
  }


}


export default MaskFilter;