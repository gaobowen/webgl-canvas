
import RichTextData from './RichTextData.js';
import { splitString } from './TextSplite.js';

class RichText
{
    constructor(){
        this.drawTextVec = [];
        this.width = 300;
        this.height = 150;
        this.drawType = 0;
        this.scale = 1;
    }
    #findRichTextData(wordIndex)
    {
        let len = this.drawTextVec.length;
        var preWordLen = 0;
        var lastWordlen = 0;
        for (let index = 0; index <len; ++index) {
            var element = this.drawTextVec[index];
            lastWordlen += element.text.length;
            if (wordIndex >= preWordLen && wordIndex <= lastWordlen - 1) {
                return element;
            }
            preWordLen = lastWordlen;
        }
        return null;
    }
    addRichTextData(textData)
    {
        this.drawTextVec.push(textData);
    }
    #drawHorizontalRichText(context,rowData,widStart, widEnd, heiStart, heiEnd, starIndex)
    {

        var wordIndex = starIndex;
        var textYPos = 0;
        var yPosStart = heiStart;
        
        for(var keyStr in rowData)
        {
            if (heiStart > heiEnd) {
                break;
            }
            var xPosStart = 0;
            let len = keyStr.length;
            var textXPos = 0;
            for (let index = 0; index < len; index++) {
                const element = keyStr[index];
                if (element.length <= 0) return;
                var tempData = this.#findRichTextData(wordIndex);
                if (0 == xPosStart) {
                    xPosStart = tempData.textAlign == "center" ? widStart + (this.width - rowData[keyStr][0]) / 2 :( tempData.textAlign == "left" ? widStart :(tempData.textAlign == "right" ? widEnd - rowData[keyStr][0] : 0));
                }
                textYPos = tempData.textBaseline == "middle" ? (yPosStart + rowData[keyStr][1]) / 2 :( tempData.textBaseline == "top" ? yPosStart :(tempData.textBaseline == "bottom" ? yPosStart + rowData[keyStr][1] : 0));  
                
                wordIndex++;
                context.fillStyle = tempData.textColor;
                context.textAlign = tempData.textAlign;
                var fontStr = tempData.fontStyle+' ' + tempData.fontVariant +' '+ tempData.fontWeight +' ' + tempData.fontSize;
                fontStr += tempData.lineHeight.length > 0 ? ('/' + tempData.lineHeight) : ' ';
                fontStr += tempData.fontFamily;                
                context.font = fontStr;
                context.filter = tempData.textfilter;
                context.textBaseline = tempData.textBaseline;
                context.lineWidth = parseInt(tempData.fontSize) / 10;
                var wordLen = context.measureText(element);
                var smallGap = parseInt(tempData.fontSize) / 50;
                textXPos = tempData.textAlign == "center" ? xPosStart + wordLen.width / 2 :( tempData.textAlign == "left" ? xPosStart :(tempData.textAlign == "right" ? xPosStart + wordLen.width : 0));     

                var xPos = tempData.textAlign == "center" ? textXPos - wordLen.width / 2 :( tempData.textAlign == "left" ? textXPos :(tempData.textAlign == "right" ? textXPos - wordLen.width : 0));
                var spaceVal = parseInt(tempData.wordSpace) ?? 0;
                //添加下滑线
                if (tempData.isUnderLine) {
                    context.beginPath();
                    context.moveTo(xPos, textYPos - context.lineWidth / 2 - smallGap);
                    context.lineTo(xPos + wordLen.width + spaceVal, textYPos - context.lineWidth / 2 - smallGap);
        
                    context.strokeStyle = tempData.textColor;
                    context.stroke();
                    context.closePath();
                }
                //添加删除线  
                if (tempData.delLine) {
                    context.beginPath();
                    context.moveTo(xPos, textYPos - rowData[keyStr][1] /2 - context.lineWidth / 2);
                    context.lineTo(xPos + wordLen.width + spaceVal, textYPos - rowData[keyStr][1] /2 - context.lineWidth / 2);
                    context.strokeStyle = tempData.textColor;
                    context.stroke();
                    context.closePath();
                }
        
                context.fillText(element,textXPos,textYPos);
                
                xPosStart += wordLen.width + spaceVal;
            }

            yPosStart += rowData[keyStr][1];
        }
    }
    //获得文本宽度，wordIndex定位文本位置
    #getTextWidth(context, text, wordIndex)
    {
        var textWidHei = [0,0];
        let lenText = text.length;
        for (let textIndex = 0; textIndex < lenText; ++textIndex) {
            const elementWord = text[textIndex];

            var tempData = this.#findRichTextData(wordIndex+textIndex);
            context.fillStyle = tempData.textColor;
            context.textAlign = tempData.textAlign;

            var fontStr = tempData.fontStyle+' ' + tempData.fontVariant +' '+ tempData.fontWeight +' ' + tempData.fontSize;
            fontStr += tempData.lineHeight.length > 0 ? ('/' + tempData.lineHeight) : ' ';
            fontStr += tempData.fontFamily;
            context.font = fontStr;
            var wordLen = context.measureText(elementWord);
               
            var lineHei = tempData.lineHeight.length > 0 ? parseInt(tempData.lineHeight) : parseInt(tempData.fontSize);
            textWidHei[1] = lineHei > textWidHei[1] ? lineHei : textWidHei[1];
            var spaceVal = parseInt(tempData.wordSpace) ?? 0;
            textWidHei[0] += wordLen.width + (lenText -1) * spaceVal;            
        }
        return textWidHei;
    }
     //根据传入的文本宽度（width），获得分割后的文本，wordIndex定位文本位置
    #splitWordByWidth(context, text, wordIndex, width)
    {
        if(!context) return null;
        //获得所有行及行高
        var rowWidth = 0;
        var rowheight = 0;
        var rowStr = "";
        var splitData = {};
        var splitResult = [];
        let lenText = text.length;
         for (let textIndex = 0; textIndex < lenText; ++textIndex) {
            const elementWord = text[textIndex];

            var tempData = this.#findRichTextData(wordIndex + textIndex);

            context.fillStyle = tempData.textColor;
            context.textAlign = tempData.textAlign;
            var fontStr = this.fontStyle+' ' + this.fontVariant +' '+ this.fontWeight +' ' + this.fontSize;
            fontStr += this.lineHeight.length > 0 ? ('/' + this.lineHeight) : ' ';
            fontStr += this.fontFamily;
            context.font = fontStr;
            var wordLen = context.measureText(elementWord);
            var spaceVal = parseInt(tempData.wordSpace) ?? 0;
            rowWidth += wordLen.width + spaceVal;
            var lineHei = tempData.lineHeight.length > 0 ? parseInt(tempData.lineHeight) : parseInt(tempData.fontSize);            
            lineHei += tempData.lineSpace;
            if(rowWidth > width)
            {
                var widAndHei = [0,0];
                widAndHei[0] = rowWidth - wordLen.width;
                widAndHei[1] = rowheight;
                splitData[rowStr] = widAndHei;
                splitResult.push(splitData);
                splitData = {};
                rowWidth =  wordLen.width;
                rowheight = 0;
                rowStr = "";
            }
            rowheight = lineHei > rowheight ? lineHei : rowheight;
            rowStr += elementWord;
        }
        if(rowStr.length > 0)
        {
            var widAndHei = [0,0];
            widAndHei[0] = rowWidth;
            widAndHei[1] = rowheight;
            splitData[rowStr] = widAndHei;
            splitResult.push(splitData);
            splitData = {};
        }
        return splitResult;
    }
    //逐个词绘制文本
    #wordForWordDrawRichText(context,words,xStart,yStart)
    {
        if(!context) return;
        
        var drawWidth = 0;
        var drawHeight = 0;
        var y = yStart;
        var lineStr = "";
        var wordIndex = 0;
        var len = words.length;
        var rowData = {};

        for(var j = 0; j < len; j++) 
        {        
            var wordwidHei = this.#getTextWidth(context, words[j], wordIndex);
            drawWidth += wordwidHei[0];
            
            if (drawWidth <= this.width)
            {
                wordIndex += words[j].length;
                drawHeight = wordwidHei[1] > drawHeight ? wordwidHei[1] : drawHeight;
                lineStr += words[j]; 
                continue;              
            }
            else
            {            
                if(lineStr.length > 0)
                {
                    var widAndHei = [0,0];
                    widAndHei[0] = drawWidth - wordwidHei[0];
                    widAndHei[1] = drawHeight;
                    rowData[lineStr] = widAndHei;
                    this.#drawHorizontalRichText(context, rowData, xStart, xStart + this.width, y, y + drawHeight, wordIndex - lineStr.length);
                    console.log(rowData);
                    rowData = {};
                    lineStr = "";
                    drawWidth = 0;
                    y += (drawHeight);
                    drawHeight = 0;
                    j--;
                    
                }
                else
                {
                    //var wordLen = words[j].length;
                    var splitWordResult = this.#splitWordByWidth(context, words[j], wordIndex, this.width);
                    for (let index = 0; index < splitWordResult.length; index++) {
                        const element = splitWordResult[index];
                        if (index == splitWordResult.length - 1) {
                            lineStr = Object.keys(element)[0];
                            wordIndex += lineStr.length;                         
                            drawWidth = element[Object.keys(element)[0]][0];
                            drawHeight = element[Object.keys(element)[0]][1];
                            break;
                        }                  
                        this.#drawHorizontalRichText(context, element, xStart, xStart + this.width, y, y + drawHeight, wordIndex - lineStr.length);
                        console.log(rowData);
                        wordIndex += Object.keys(element)[0].length;
                        drawHeight = element[Object.keys(element)[0]][1];
                        y += (drawHeight);
                        
                    }
                }
            }
        }

        if(lineStr.length > 0)
        {
            var widAndHei = [0,0];
            widAndHei[0] = drawWidth;
            widAndHei[1] = drawHeight;
            rowData[lineStr] = widAndHei;
            this.#drawHorizontalRichText(context, rowData, xStart, xStart + this.width, y, y+drawHeight, wordIndex - lineStr.length);
            console.log("1111111",rowData);
            rowData = {};
        }
    }
    //逐个字绘制文本
    #verbatimDrawRichText(context,words,xStart,yStart)
    {
        if(!context) return;
        //获得所有行及行高
        var rowWidth = 0;
        var rowheight = 0;
        var wordIndex = 0;
        var rowStr = "";
        var rowData = {};
        
        for (let index = 0; index < words.length; index++) {
            const element = words[index];

            let lenText = element.length;
            for (let textIndex = 0; textIndex < lenText; ++textIndex) {
                const elementWord = element[textIndex];

                var tempData = this.#findRichTextData(wordIndex);
                wordIndex++;
                context.fillStyle = tempData.textColor;
                context.textAlign = tempData.textAlign;
                var fontStr = tempData.fontStyle+' ' + tempData.fontVariant +' '+ tempData.fontWeight +' ' + tempData.fontSize;
                fontStr += tempData.lineHeight.length > 0 ? ('/' + tempData.lineHeight) : ' ';
                fontStr += tempData.fontFamily;                
                context.font = fontStr;
                var lineHei = tempData.lineHeight.length > 0 ? parseInt(tempData.lineHeight) : parseInt(tempData.fontSize);
                var wordLen = context.measureText(elementWord);
                var spaceVal = parseInt(tempData.wordSpace) ?? 0;
                rowWidth += wordLen.width + spaceVal;            
                     
                if(rowWidth > this.width)
                {
                    var widAndHei = [0,0];
                    widAndHei[0] = rowWidth - wordLen.width;
                    widAndHei[1] = rowheight;
                    rowData[rowStr] = widAndHei;
                    rowWidth =  wordLen.width;
                    rowheight = 0;
                    rowStr = "";
                }
                rowheight = lineHei > rowheight ? lineHei : rowheight;
                rowStr += elementWord;
            }
        }
        if (rowStr.length > 0) {
            var widAndHei = [0,0];
            widAndHei[0] = rowWidth;
            widAndHei[1] = rowheight;
            rowData[rowStr] = widAndHei;
        }
 
        this.#drawHorizontalRichText(context, rowData, xStart, xStart + this.width, yStart ,yStart + this.height, 0);
        console.log(rowData);
    }
    drawRichText()
    {     
        var canvas = new OffscreenCanvas(this.width * this.scale , this.height * this.scale);
        if(!canvas) return;
        var context = canvas.getContext('2d');
        if(!context) return;
        context.scale(this.scale, this.scale);
        let len = this.drawTextVec.length;
        var textStr = "";
        //获得绘制的所有文字
        for (let index = 0; index <len; ++index) {
            const element = this.drawTextVec[index];
            textStr += element.text;
        }
        //将绘制的所有文字按照单词分开
        var words = splitString(textStr);
        
        switch (this.drawType) {
            case 0:
                this.#wordForWordDrawRichText(context,words, 0, 0);
                break;
            case 1:
                this.#verbatimDrawRichText(context,words, 0, 0);     
                break;
            default:
                break;
        }
        return canvas;
    }
    
}

export default RichText;