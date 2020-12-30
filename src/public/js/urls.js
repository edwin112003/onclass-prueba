'use strict'
function hash(value){
    let bufLen = 32;
    let baseMult = (bufLen + value.length)/5.73;
    function moveBytes(i, buf, charCode, mult){
        buf[i] = (buf[i] + charCode * mult)<< 1
        buf[i] = (buf[i] *mult) >>3
    }
    function _hash(value){
        let buf = Buffer.alloc(bufLen);
        let i ;
        let mult;
        let charCode;
        for(let c of value){
            charCode = c.charCodeAt();
            for(i =0; i<bufLen; i++){
                mult = baseMult * (i+1);
                moveBytes(i,buf,charCode, mult);
            }
        }
        return buf;
    }
    return _hash(value).toString('hex');
}

console.log('buenas');
console.log(hash('buenas'));
