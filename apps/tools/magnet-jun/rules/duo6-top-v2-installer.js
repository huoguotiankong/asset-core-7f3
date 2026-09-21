(function(){
var ruleUrl="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@783982cba4cb1189edf43df6ef0ad4eff9007a86/apps/tools/magnet-jun/rules/duo6-top-v2.json";
var raw="";
try{raw=fetch(ruleUrl);}catch(e){return "toast://下载 磁力多 v2 搜索规则失败："+(e.message||e);}
var rule;
try{rule=JSON.parse(raw);}catch(e2){return "toast://磁力多 v2 搜索规则内容异常";}
var testRaw="";
try{testRaw=fetch("hiker://home@磁力君.简·测试");}catch(e3){}
if(!testRaw||testRaw==="null")return "toast://请先安装磁力君.简·测试 Test6";
try{
    var testObj=JSON.parse(testRaw);
    if(Number(testObj.version||0)<2026092106)return "toast://磁力君.简·测试版本过旧，请先升级到 Test6";
}catch(e4){return "toast://读取磁力君.简·测试版本失败";}
var path="hiker://files/rules/LoyDgIk/magnetjunProviders_v2.json";
var arr=[];
if(fileExist(path)){try{arr=JSON.parse(readFile(path)||"[]");}catch(e5){arr=[];}}
if(!Array.isArray(arr))arr=[];
var idx=-1;
for(var i=0;i<arr.length;i++){
    if((arr[i]&&arr[i].id===rule.id)||(arr[i]&&arr[i].name===rule.name)){idx=i;break;}
}
if(idx>=0){
    var old=arr[idx]||{},forbidden=!!old.forbidden;
    for(var k in rule)old[k]=rule[k];
    old.forbidden=forbidden;
    arr[idx]=old;
}else{
    arr.unshift(rule);
}
saveFile(path,JSON.stringify(arr));
return "toast://磁力多 v2 已"+(idx>=0?"更新":"导入")+"：正则优先快速解析 + DOM 兜底";
})()