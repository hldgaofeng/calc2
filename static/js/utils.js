
function randomInt(Min,Max, genotinarr, geinarr){
    Min = parseInt(Min);
    Max = parseInt(Max);
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range);
    if( typeof(genotinarr) != 'undefined' && genotinarr.length > 0 ) {
        // 确保产生的随机数的个位数不在数组中
        for(var i = 0;  genotinarr.indexOf(num % 10) >= 0 && i < 1000; i ++) {
            num = randomInt(Min, Max);
        }
    }
    if( typeof(geinarr) != 'undefined' && geinarr.length > 0 ) {
        // 确保产生的随机数的个位数存在于数组中
        for(var i = 0;  geinarr.indexOf(num % 10) < 0 && i < 1000; i ++) {
            num = randomInt(Min, Max);
        }
    }
    return num;
}

