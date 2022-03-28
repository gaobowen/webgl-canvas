import { splitString } from './TextSplite.js';
class TextRendering
{
    constructor(){
        this.width = 300;
        this.height = 150;
        this.textColor = "black";
        //对齐方式： left right center start end;
        this.textAlign = "center";
        // 字体样式：normal italic oblique
        this.fontStyle = "normal";
        //字体变体： normal small-caps 
        this.fontVariant = "normal";
        //字体的粗细： normal bold bolder lighter 100 200 ...
        this.fontWeight = "normal";
        //字体的大小： 如50px
        this.fontSize = "50px";
        //字体的行高：如50px
        this.lineHeight = "";
        //字体
        this.fontFamily = "Microsoft YaHei";
        //bool 是否设置下划线
        this.isUnderLine = false;
        //bool 是否设置删除线
        this.delLine = false;
        //行间距
        this.lineSpace = 1;
        //字间距
        this.wordSpace = "1px";

        //文字方向 vertical -- 竖向 horizontal-- 横向
        this.textDirection = "horizontal";
        //滤镜属性
        this.textfilter = "";
        this.textBaseline = "bottom";

        this.posOffsetX = 0;//X文本位置偏移 (像素)
        this.posOffsetY = 0;//Y文本位置偏移 (像素)

        this.shadowX = 0;//X阴影位置偏移 (像素)
        this.shadowY = 0;//Y阴影位置偏移 (像素)
        this.shadowBlur = 0;
        this.shadowColor = "RGBA(127,127,127,1)";
        this.scale = 1;
        this.allAroundEx = 1;
    }
    #drawText(context, drawText, startDrawX, endDrawX, startDrawY, endDrawY)
    {
        if(!context) return;

   
        context.lineWidth = parseInt(this.fontSize) / 10;
        var wordLen = context.measureText(drawText);
        if (drawText.length <= 0) return;
        var textXPos = this.textAlign == "center" ? (startDrawX + endDrawX) / 2
            : (this.textAlign == "left" ? startDrawX 
            :(this.textAlign == "right" ? endDrawX : 0));
        var textYPos = this.textBaseline == "middle" ? (startDrawY + endDrawY) / 2 
            : (this.textBaseline == "top" ? startDrawY 
            :(this.textBaseline == "bottom" ? endDrawY : 0));
        var smallGap = parseInt(this.fontSize) / 50;
        var xPos = this.textAlign == "center" ? textXPos - wordLen.width / 2 :( this.textAlign == "left" ? textXPos :(this.textAlign == "right" ? textXPos - wordLen.width : 0));

        //添加删除线
        if (this.isUnderLine) {
            context.beginPath();

            context.moveTo(xPos, (startDrawY + endDrawY) / 2  - context.lineWidth / 2 - smallGap);
            context.lineTo(xPos + wordLen.width, (startDrawY + endDrawY) / 2  - context.lineWidth / 2 - smallGap);

            context.strokeStyle = this.textColor;
            context.stroke();
            context.closePath();
        }

        //添加下滑线
        if (this.delLine) {
            context.beginPath();
            context.moveTo(xPos, endDrawY - context.lineWidth / 2);
            context.lineTo(xPos + wordLen.width, endDrawY - context.lineWidth / 2);
            context.strokeStyle = this.textColor;
            context.stroke();
            context.closePath();
        }

        context.fillText(drawText, textXPos, textYPos);

    }
    #drawTextVertical(context, drawText, startDrawX, endDrawX, startDrawY, endDrawY)
    {
        if(!context || endDrawX < 0 || endDrawY < 0) return;
        var textLen = context.measureText(drawText);
    
        var lineHei = this.lineHeight.length > 0 ? parseInt(this.lineHeight) : parseInt(this.fontSize);
        var textXPos = this.textAlign == "center" ? startDrawX + lineHei / 2 :(this.textAlign == "left" ? startDrawX :(this.textAlign == "right" ? startDrawX + lineHei : 0));
        var textYPos = this.textAlign == "center" ? startDrawY + (this.height - textLen.width) / 2 :(this.textAlign == "left" ? startDrawY :(this.textAlign == "right" ? endDrawY - textLen.width : 0));
        let letterSpacing = parseInt(this.wordSpace); // 设置字间距
        for(let i = 0; i < drawText.length; i++)
        { 
            const str = drawText.slice(i,i+1).toString(); 
            var charLen = context.measureText(str);
            if(str.match(/[A-Za-z0-9]/)&&(textYPos < endDrawY))
            { 
                // 非汉字 旋转 
                context.save(); 
                var RotationX = this.textAlign == "center" ? textXPos :(this.textAlign == "left" ? textXPos +charLen.width:(this.textAlign == "right" ? textXPos - charLen.width : 0));
                var RotationY = this.textAlign == "center" ? textYPos+charLen.width/2 :(this.textAlign == "left" ? textYPos :(this.textAlign == "right" ? textYPos+charLen.width : 0));
                context.translate(RotationX,RotationY); 
                context.rotate(Math.PI/180*90); 
                context.textBaseline = 'middle'; 
                context.fillText(str,0,0); 
                context.restore(); 
                textYPos+=charLen.width+letterSpacing; // 计算文字宽度
            }else if(str.match(/[\u4E00-\u9FA5]/)&&(textYPos < endDrawY))
            { 
                context.save(); 
                context.textBaseline = 'top';    
                context.fillText(str,textXPos,textYPos); 
                context.restore(); 
                textYPos+=lineHei+letterSpacing; // 计算文字宽度 
            } 
        }
    }
    #drawHorizontalText(context, words, startPosX, startPosY)
    {
        if(!context) return;
        //var startPosX = this.offsetX > 0 ? 0 :0 - this.offsetX;
        //var startPosY = this.offsetY > 0 ? 0 :0 - this.offsetY;
        var endPosX = startPosX + this.width;
        var endPosY = startPosY + this.height;

        var len = words.length;
        var drawLen = 0;

        var lineHei = this.lineHeight.length > 0 ? parseInt(this.lineHeight) : parseInt(this.fontSize);
        var starDrawY = startPosY;
        var lineStr = "";
    
        for(var j = 0; j < len; j++) 
        {
            if (starDrawY > endPosY) {
                break;
            }
            //var spacingVal = parseInt(canvas.style.letterSpacing);
            var wordLen = context.measureText(words[j]);
            drawLen += wordLen.width;
    
            if (drawLen < this.width)
            {
                lineStr += words[j]; 
                continue;              
            }
            else
            {
                if(lineStr.length > 0)
                {
                    this.#drawText(context, lineStr, startPosX, endPosX, starDrawY , starDrawY + lineHei);
                    //ctx.fillText(lineStr, x, y,testLen);
                    lineStr = "";
                    drawLen = 0;
                    starDrawY += (lineHei + this.lineSpace);
                    j--;
                }
                else
                {
                    var tempLenVal = 0;
                    var lineChar = "";
                    for (let index = 0; index < words[j].length; index++) 
                    {
                        lineChar = words[j][index];
                        var charLen = context.measureText(lineChar);
                        tempLenVal += charLen.width;
                        if(tempLenVal < this.width)
                        {
                            lineStr += lineChar;
                            continue;
                        }
                        else
                        {
                            this.#drawText(context, lineStr, startPosX, endPosX, starDrawY , starDrawY + lineHei);
                            //ctx.fillText(lineStr, x, y,testLen);
                            lineStr = "";
                            tempLenVal = 0;
                            starDrawY +=(lineHei + this.lineSpace);
                        }   
                    }
                    drawLen = tempLenVal;
                }
            }
        }
        if(lineStr.length > 0)
        {
            this.#drawText(context, lineStr, startPosX, endPosX, starDrawY , starDrawY + lineHei);
        }
    }
    #drawVerticalText(context, words, startPosX, startPosY)
    {

        if(!context) return;

        //var startPosX = this.offsetX > 0 ? 0 :0 - this.offsetX;
        //var startPosY = this.offsetY > 0 ? 0 :0 - this.offsetY;
        var endPosX = startPosX + this.width;
        var endPosY = startPosY + this.height;

        
        var drawLen = 0;
        var lineHei = this.lineHeight.length > 0 ? parseInt(this.lineHeight) : parseInt(this.fontSize);
        var startPosX = endPosX - lineHei;
        var lineStr = "";
        var len = words.length;
        for(var j = 0; j < len; j++) 
        {
            if (startPosX < 0) {
                break;
            }

            var wordLen = context.measureText(words[j]);
            drawLen += wordLen.width;
    
            if (drawLen < this.height)
            {
                lineStr += words[j]; 
                continue;              
            }
            else
            {
                if(lineStr.length > 0)
                {
                    this.#drawTextVertical(context, lineStr, startPosX, endPosX, startPosY , endPosY);
                    //ctx.fillText(lineStr, x, y,testLen);
                    lineStr = "";
                    drawLen = 0;
                    startPosX -= (lineHei + this.lineSpace);
                    j--;
                }
                else
                {
                    var tempLenVal = 0;
                    var lineChar = "";
                    for (let index = 0; index < words[j].length; index++) 
                    {
                        lineChar = words[j][index];
                        var charLen = context.measureText(lineChar);
                        tempLenVal += charLen.width;
                        if(tempLenVal < this.height)
                        {
                            lineStr += lineChar;
                            continue;
                        }
                        else
                        {
                            this.#drawTextVertical(context, lineStr, startPosX, endPosX, startPosY , endPosY);
                            //ctx.fillText(lineStr, x, y,testLen);
                            lineStr = "";
                            tempLenVal = 0;
                            startPosX -=(lineHei + this.lineSpace);
                        }   
                    }
                    drawLen = tempLenVal;
                }
            }
        }
        if(lineStr.length > 0)
        {
            this.#drawTextVertical(context, lineStr, startPosX, endPosX, startPosY , endPosY);
        }
    }
    drawTextWrapAutomatic(text)
    {
        var posOffsetX = Math.abs(this.shadowX) + this.allAroundEx  + this.shadowBlur / 10; 
        var posOffsetY = Math.abs(this.shadowY) + this.allAroundEx  + this.shadowBlur / 10;


        var canvas = new OffscreenCanvas((this.width + posOffsetX + this.allAroundEx) * this.scale, (this.height  + posOffsetY + this.allAroundEx)* this.scale);
        var context = canvas.getContext('2d');
        context.fillStyle = '#00FF0099';
        context.fillRect(0,0,(this.width + posOffsetX+ this.allAroundEx) * this.scale, (this.height + posOffsetY+ this.allAroundEx) * this.scale);
        posOffsetX = this.shadowX >= 0 ? this.allAroundEx  : posOffsetX ;
        posOffsetY = this.shadowY >= 0 ? this.allAroundEx  : posOffsetY ;

        context.fillStyle = this.textColor;
        context.textAlign = this.textAlign;
        this.posOffsetX = posOffsetX;
        this.posOffsetY = posOffsetY;
        var fontStr = this.fontStyle+' ' + this.fontVariant +' '+ this.fontWeight +' ' + this.fontSize;
        fontStr += this.lineHeight.length > 0 ? ('/' + this.lineHeight) : ' ';
        fontStr += this.fontFamily;
        context.font = fontStr;
        context.filter = this.textfilter;
        context.textBaseline = this.textBaseline;
        context.shadowColor = this.shadowColor;     
        context.shadowOffsetX = this.shadowX * this.scale;     
        context.shadowOffsetY = this.shadowY * this.scale;     
        context.shadowBlur = this.shadowBlur;
        context.shadowColor = this.shadowColor;
        context.scale(this.scale,this.scale);
        var fruits = splitString(text);
        if ("horizontal" == this.textDirection) {

            this.#drawHorizontalText(context, fruits, posOffsetX, posOffsetY);
        }else if ("vertical" == this.textDirection) {
            this.#drawVerticalText(context, fruits, posOffsetX, posOffsetY);
        }
        context.fillStyle = '#0000FF99';
        context.fillRect(posOffsetX,posOffsetY,this.width * this.scale, this.height * this.scale);
        context.scale(0.5,0.5);
        return canvas;      
    }
    setTextStyle(textStyle)
    {
        let { width, height, textColor,textAlign,fontStyle,fontVariant,
            fontWeight,fontSize,lineHeight,fontFamily,isUnderLine,delLine,
            lineSpace,wordSpace,textDirection,textfilter,textBaseline,shadowX,
            shadowY,shadowBlur,shadowColor,scale,allAroundEx} = textStyle;
        this.width = width ?? this.width;
        this.height = height ?? this.height;
        this.textColor = textColor ?? this.textColor;
        this.textAlign = textAlign ?? this.textAlign; 
        this.fontStyle = fontStyle ?? this.fontStyle;
        this.fontVariant = fontVariant ?? this.fontVariant;
        this.fontWeight = fontWeight ?? this.fontWeight;
        this.fontSize = fontSize ?? this.fontSize;
        this.lineHeight = lineHeight ?? this.lineHeight;
        this.fontFamily = fontFamily ?? this.fontFamily;
        this.isUnderLine = isUnderLine ?? this.isUnderLine;
        this.delLine = delLine ?? this.delLine;
        this.lineSpace = lineSpace ?? this.lineSpace;
        this.wordSpace = wordSpace ?? this.wordSpace;
        this.textDirection = textDirection ?? this.textDirection;
        this.textfilter = textfilter ?? this.textfilter;
        this.textBaseline = textBaseline ?? this.textBaseline;
        this.shadowX = shadowX ?? this.shadowX;
        this.shadowY = shadowY ?? this.shadowY;
        this.shadowBlur = shadowBlur ?? this.shadowBlur;
        this.shadowColor = shadowColor ?? this.shadowColor;
        this.scale = scale ?? this.scale;
        this.allAroundEx = allAroundEx ?? this.allAroundEx;
    }
}


export default TextRendering;