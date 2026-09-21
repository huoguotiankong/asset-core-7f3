(function(){
var ruleUrl="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@3d7c6191a842b6f0f7aea7bda37a3b448f350505/apps/tools/magnet-jun/rules/skrbtso-top.json";
var raw="";
try{raw=fetch(ruleUrl);}catch(e){return "toast://下载 SkrBT 规则失败："+(e.message||e);}
var rule;
try{rule=JSON.parse(raw);}catch(e2){return "toast://SkrBT 规则内容异常";}
var testRule="";
try{testRule=fetch("hiker://home@磁力君.简·测试");}catch(e3){}
if(!testRule||testRule==="null")return "toast://请先安装磁力君.简·测试 Test6";
var path="hiker://files/rules/LoyDgIk/magnetjunProviders_v2.json";
var arr=[];
if(fileExist(path)){
    try{arr=JSON.parse(readFile(path)||"[]");}catch(e4){arr=[];}
}
if(!Array.isArray(arr))arr=[];
var idx=-1;
for(var i=0;i<arr.length;i++){
    if((arr[i]&&arr[i].id===rule.id)||(arr[i]&&arr[i].name===rule.name)){idx=i;break;}
}
if(idx>=0){
    var old=arr[idx]||{};
    var forbidden=!!old.forbidden;
    for(var k in rule)old[k]=rule[k];
    old.forbidden=forbidden;
    arr[idx]=old;
}else{
    arr.unshift(rule);
}
saveFile(path,JSON.stringify(arr));
return "toast://SkrBT 搜索规则已"+(idx>=0?"更新":"导入")+"，请返回磁力君刷新页面";
})()