function checkNum(num) {
	var reg = /^[0-9]+.?[0-9]*$/; 
}
function checkEng(num) {
	var reg = /^[A-Za-z]+$/;
	return reg.test(num)
}
function patchEn(temp) {
    var reg = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;
    if(reg.test(temp)){
        return true;
    }else{
        return false;
    }
}
//将文本分割成多个单词
function splitString(socStr)
{
    var fruits = [];

    var words = socStr.split(/\s+/);
    if (words.length < 1) {
        return fruits;
    }
    
    for (let index = 0; index < words.length; index++) {
        var elementWord = words[index];
        if (elementWord.length < 1) continue;
        if(elementWord.length == 1)
        {
            fruits.push(elementWord[0]);
            continue;
        }
        var tempStr = "";
        for (let ch = 1; ch < elementWord.length; ch++) {
 
            var preCharLenth = /[\u4e00-\u9fa5]/.test(elementWord[ch - 1]) ? 2 : 1;
            var curCharLenth = /[\u4e00-\u9fa5]/.test(elementWord[ch]) ? 2 : 1;
            tempStr += elementWord[ch - 1];
            if (preCharLenth != curCharLenth) 
            {
                if (1 == curCharLenth) {
                    var curChar = elementWord[ch];
                    var isNumAndEng = checkNum(curChar) || checkEng(curChar);

                    if (isNumAndEng) 
                    {
                        fruits.push(tempStr);
                        tempStr = "";
                        if (ch == elementWord.length - 1) 
                        {
                            fruits.push(elementWord[ch]);
                        }
                    }
                    else
                    {
                        if (ch == elementWord.length - 1) 
                        {
                            tempStr += elementWord[ch]; 
                            fruits.push(tempStr);
                        }
                    }
                }
                else{
                    fruits.push(tempStr);
                    tempStr = "";
                    if (ch == elementWord.length - 1) 
                    {
                        fruits.push(elementWord[ch]);
                    }
                }
            }
            else
            {
                if (2 == curCharLenth) {
                    fruits.push(tempStr);
                    tempStr = "";
                    if (ch == elementWord.length - 1) 
                    {
                        fruits.push(elementWord[ch]);
                    }
                }
                else
                {
                    var preChar = elementWord[ch - 1];
                    var preIsChar = checkNum(preChar) || checkEng(preChar);
                    
                    var curChar = elementWord[ch];
                    var isChar = checkNum(curChar) || checkEng(curChar);
                    
                    patchEn(elementWord[ch]);
                    if (!preIsChar && isChar && patchEn(elementWord[ch - 1])) 
                    {
                        fruits.push(tempStr);
                        tempStr = "";
                        if (ch == elementWord.length - 1) 
                        {
                            fruits.push(elementWord[ch]);
                        }
                    }
                    else
                    {
                        if (ch == elementWord.length - 1) 
                        {
                            tempStr += elementWord[ch]; 
                            fruits.push(tempStr);
                        }
                    }

                }
            }
        }
    }
    return fruits;
}

export {
  splitString
}