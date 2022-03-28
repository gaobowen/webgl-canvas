/**
 * 
 * @param gl gl
 * @param vertexStr vertexShaderSource
 * @param fragmentStr fragmentShaderSource
 * @returns program
 */
let initProgram = (gl, vertexStr, fragmentStr) => {
  let vertexShaderSource = vertexStr;
  let fragmentShaderSource = fragmentStr;

  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    let info = gl.getShaderInfoLog(vertexShader);
    throw 'Could not compile WebGL VERTEX_SHADER. \n\n' + info;
  }

  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    let info = gl.getShaderInfoLog(fragmentShader);
    throw 'Could not compile WebGL FRAGMENT_SHADER. \n\n' + info;
  }

  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    let linkErrLog = gl.getProgramInfoLog(program);
    throw 'linkErrLog => ' + linkErrLog;
  }
  return program;
}

/**
 * @gl gl;
 * @pixelType gl.RGBA, gl.ALPHA;
 * @width width
 * @height height
 * @pixels HTMLCanvasElement, HTMLImageElement, HTMLVideoElement, ImageBitmap, ImageData, ArrayBufferView;
 * @scaleType gl.NEAREST, gl.LINEAR
 */
let createTexture = (gl, pixelType, width, height, pixels, scaleType) => {
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, scaleType); //gl.NEAREST //gl.LINEAR
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, scaleType);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, pixelType, width, height, 0, pixelType, gl.UNSIGNED_BYTE, pixels);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}


const vertexShaderString =
  `#version 300 es
  precision highp float;                         
  layout (location = 0) in vec3 aPos;								
  layout (location = 1) in vec2 aTexCoord;
                                                                          
  out vec2 TexCoord;	
  uniform mat4 model;
  uniform mat4 view;
  uniform mat4 projection;										    
                                                
  void main()															    
  {																				    
    gl_Position = projection  * model *  view * vec4(aPos, 1.0);																			  
    TexCoord = vec2(aTexCoord.x, aTexCoord.y);	
  }
  `;

const fragmentShaderString =
  `#version 300 es
  precision highp float;                                                       
  out vec4 FragColor;																									
                                                                                                                        
  in vec2 TexCoord;																										
                                                                                                                                
  // texture samplers																									
  uniform sampler2D lhtexture1;
  
  vec4 getcolor(vec4 mycolor)
  {
    if(mycolor.a < 0.001)
    {
      return vec4(1.0, 1.0, 1.0, 0);
    }
    else
    {
      return mycolor;
    }
  }
                                                                                                            
  void main()																													
  {
    vec4 color = texture(lhtexture1, TexCoord);
    //...
    FragColor = color;																													                                                     
  }	
  `;

const fboVertex =
  `#version 300 es
  precision highp float;                         
  layout (location = 0) in vec3 aPos;								
  layout (location = 1) in vec2 aTexCoord;
                                                                          
  out vec2 TexCoord;									    
                                                
  void main()															    
  {																				    
    gl_Position = vec4(aPos, 1.0);																			  
    TexCoord = vec2(aTexCoord.x, aTexCoord.y);	
  }
`;

const fboFragment =
  `#version 300 es
  precision highp float;                                                       
  out vec4 FragColor;																									
                                                                                                                        
  in vec2 TexCoord;																										
                                                                                                                                
  // texture samplers																									
  uniform sampler2D fboTexture;																					
                                                                                                            
  void main()																													
  {																																		               
    FragColor = texture(fboTexture, TexCoord);                                        
  }	
  `;

export {
  vertexShaderString,
  fragmentShaderString,
  fboVertex,
  fboFragment,
  initProgram,
  createTexture
}