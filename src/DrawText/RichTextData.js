class RichTextData
{
    constructor(){
        this.text = "";
        this.textColor = "black"
        //对齐方式： left right center start end;
        this.textAlign = "center"
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
        this.fontFamily = "monospace";
        //bool 是否设置下划线
        this.isUnderLine = false;
        //bool 是否设置删除线
        this.delLine = false;
        //行间距
        this.lineSpace = 1;
        //字间距
        this.wordSpace = "1px";

        //文字方向 vertical -- 竖向 horizontal-- 横向
        this.textDirection = "horizontal"
        //滤镜属性
        this.textfilter = "";
        this.textBaseline = "bottom";
    }
    setTextStyle(textStyle)
    {
        let {text,textColor,textAlign,fontStyle,fontVariant,
            fontWeight,fontSize,lineHeight,fontFamily,isUnderLine,delLine,
            lineSpace,wordSpace,textDirection,textfilter,textBaseline} = textStyle;
        this.text = text ?? this.text;
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
    }
}

export default RichTextData;