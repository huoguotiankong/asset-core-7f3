(function(){
var ruleUrl="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@5e1c6f7adb6bebd6eddd76d0183a8b2a2448a415/apps/tools/magnet-jun/rules/btlm-in-v3.json";
var raw="";
try{raw=fetch(ruleUrl);}catch(e){return "toast://下载 BT联盟 v3 规则失败："+(e.message||e);}
var rule;
try{rule=JSON.parse(raw);}catch(e2){return "toast://BT联盟 v3 规则内容异常";}
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
}else{arr.unshift(rule);}
saveFile(path,JSON.stringify(arr));
try{clearItem("mj_btlm_fast_route_v2");}catch(e6){}
try{clearItem("mj_btlm_route_v3");}catch(e7){}
return "toast://BT联盟 v3 搜索规则已"+(idx>=0?"更新":"导入")+"，已清除旧路由缓存";
})()
