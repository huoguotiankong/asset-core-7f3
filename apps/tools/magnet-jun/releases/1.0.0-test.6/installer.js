(function(){
var base="";
try{base=fetch("https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@749f5f16361a534b088c666081f0bbf52089dd41/apps/tools/magnet-jun/releases/1.0.0-test.5/installer.js");}catch(e){return "toast://下载 Test5 基线失败："+e.message;}
if(!base||base.indexOf("magnetjun_test5_rule.json")<0)return "toast://Test5 基线异常";
try{eval(base);}catch(e2){return "toast://生成 Test5 基线失败："+e2.message;}
var raw=fetch("hiker://files/cache/magnetjun_test5_rule.json");
if(!raw||raw==="null")return "toast://未生成 Test5 规则缓存";
var rule;try{rule=JSON.parse(raw);}catch(e3){return "toast://解析 Test5 规则失败："+e3.message;}
var pages;try{pages=typeof rule.pages==="string"?JSON.parse(rule.pages||"[]"):(rule.pages||[]);}catch(e4){return "toast://解析页面失败："+e4.message;}
function page(path){for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path)return pages[i];}return null;}
function put(path,name,code,col){var p=page(path);if(p){p.rule=code;p.name=name||p.name;}else{pages.push({col_type:col||"text_1",name:name,path:path,rule:code});}}
var root="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@f37dfd49d4f6db4cdd2b0e1dc10346af35d00a9c/apps/tools/magnet-jun/releases/1.0.0-test.6/";
var configs="",importer="",manage="",edit="",core="",sou="";
try{
    configs=fetch(root+"configs.js");
    importer=fetch(root+"import.js");
    manage=fetch(root+"rule_manage.js");
    edit=fetch(root+"rule_edit.js");
    core=fetch(root+"search_core.js");
    sou=fetch(root+"search_page.js");
}catch(e5){return "toast://下载 Test6 模块失败："+e5.message;}
if(!configs||configs.indexOf("magnetjunProviders_v2.json")<0)return "toast://Test6 configs 模块异常";
if(!importer||importer.indexOf("mjParseImport")<0)return "toast://Test6 import 模块异常";
if(!manage||manage.indexOf("规则管理")<0)return "toast://Test6 ruleManage 模块异常";
if(!edit||edit.indexOf("新增搜索规则")<0)return "toast://Test6 ruleEdit 模块异常";
if(!core||core.indexOf("mjRunScript")<0)return "toast://Test6 搜索核心异常";
if(!sou||sou.indexOf("⚙ 规则")<0)return "toast://Test6 搜索页异常";
put("configs","搜索规则配置",configs,"text_1");
put("import","搜索规则导入",importer,"text_1");
put("ruleManage","规则管理",manage,"text_1");
put("ruleEdit","规则编辑",edit,"text_1");
put("MJSearchCore","磁力搜索核心",core,"movie_3");
put("sou","磁力搜索",sou,"movie_3");
rule.preRule="";
rule.title="磁力君.简·测试";
rule.author=String(rule.author||"").replace(/ · 全新搜索 Test5/g,"")+" · 可管理搜索 Test6";
rule.version=2026092106;
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/magnetjun_test6_rule.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()