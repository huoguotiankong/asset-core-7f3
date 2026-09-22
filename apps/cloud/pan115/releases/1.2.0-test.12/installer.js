(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到115.简，请保留当前已登录的115.简";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver!==2026092212&&ver!==2026092211) return "toast://当前115版本不是Test10/Test11基线，停止覆盖";
var fr=String(rule.find_rule||"");
if(!fr) return "toast://当前115首页规则为空，停止覆盖";
var before=fr;
fr=fr.split("encodeURIComponent(ruleTitle)").join("ruleTitle");
fr=fr.split("encodeURIComponent(r)").join("r");
if(fr===before) return "toast://Test12未找到需要修复的rule路由，请勿覆盖";
rule.find_rule=fr;
rule.title="115.简";
rule.author="AI&三鲜汤 · APP化首页 Phase1 Test12 路由热修";
rule.version=2026092213;
var out="hiker://files/cache/115_12012_app_home_routefix.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
