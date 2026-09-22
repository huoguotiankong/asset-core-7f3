(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092239)return "toast://当前已是115 Test 1.2.1-test.19";
if(ver!==2026092238&&ver!==2026092237)return "toast://本修复版仅支持Test17/Test18直接覆盖";
var fm="",history="";
try{
 fm=fetch("https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@28863a2d3683a9c38a366a65e85a63278afe7204/apps/cloud/pan115/modules/file_manage_v9.js");
 history=fetch("https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@78551e00d383afd6637e8fa06d5fed99d4436df4/apps/cloud/pan115/modules/play_history_v1.js");
}catch(e2){return "toast://下载Test19修复模块失败："+e2.message;}
if(!fm||fm.indexOf("__PAN115_FILE_MANAGE_V9__")<0)return "toast://文件管理V9恢复模块校验失败";
if(!history||history.indexOf("__PAN115_PLAY_HISTORY_V1__")<0)return "toast://播放记录模块校验失败";
function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
replacePage("115FileManage","文件管理",fm);
replacePage("115PlayHistory","最近播放",history);
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 文件管理紧急修复";
rule.version=2026092239;
var out="hiker://files/cache/115_12119_file_manage_hotfix.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
