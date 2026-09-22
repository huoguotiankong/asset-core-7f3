(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092240)return "toast://当前已是115 Test 1.2.1-test.20";
if(ver!==2026092239)return "toast://本版基于已验证Test19，请先覆盖到1.2.1-test.19";
var fm="",store="",history="";
try{
 fm=fetch("https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@28863a2d3683a9c38a366a65e85a63278afe7204/apps/cloud/pan115/modules/file_manage_v9.js");
 store=fetch("https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@c24e71d63e5cb6a92897159c425b8d5dcf4bd497/apps/cloud/pan115/modules/play_store_v1.js");
 history=fetch("https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@c24e71d63e5cb6a92897159c425b8d5dcf4bd497/apps/cloud/pan115/modules/play_history_v2.js");
}catch(e2){return "toast://下载Test20模块失败："+e2.message;}
if(!fm||fm.indexOf("__PAN115_FILE_MANAGE_V9__")<0)return "toast://文件管理V9基线校验失败";
if(!store||store.indexOf("__PAN115_PLAY_STORE_V1__")<0)return "toast://播放记录核心校验失败";
if(!history||history.indexOf("__PAN115_PLAY_HISTORY_V2__")<0)return "toast://播放中心模块校验失败";
var toolbar=' d.push({title:"⭐ 常用",col_type:"text_4",url:"hiker://page/115FileShortcuts?rule=115.简&page=fypage"});';
var toolbarNew=toolbar+'\n d.push({title:"▶ 最近",col_type:"text_4",url:"hiker://page/115PlayHistory?rule=115.简&page=fypage"});';
if(fm.indexOf(toolbar)<0)return "toast://未找到Test17工具栏锚点";
fm=fm.replace(toolbar,toolbarNew);
var oldPlay='if(isDir)item.url="hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(fid)+"&cname="+encodeURIComponent(name)+"&trail="+encodeURIComponent(childTrailJson);else if(kind==="video")item.url=$().lazyRule(api.player.resolve,JSON.stringify({pc:f.pickCode||"",fid:fid,name:name,kind:"video"}));';
var newPlay='if(isDir)item.url="hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(fid)+"&cname="+encodeURIComponent(name)+"&trail="+encodeURIComponent(childTrailJson);else if(kind==="video")item.url=$().lazyRule(function(v){return $.require("115PlayStore").play(v);},JSON.stringify({pc:f.pickCode||"",fid:fid,name:name,size:Number(f.size||0),sourceCid:cid,sourceName:cname,trail:trailJson}));';
if(fm.indexOf(oldPlay)<0)return "toast://未找到Test17视频播放锚点";
fm=fm.replace(oldPlay,newPlay);
fm=fm.replace("/*__PAN115_FILE_MANAGE_V9__*/","/*__PAN115_FILE_MANAGE_V10__*/");
try{new Function(fm);new Function(store);new Function(history);}catch(parseErr){return "toast://Test20语法门禁失败："+String(parseErr.message||parseErr);}
function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
replacePage("115FileManage","文件管理",fm);
replacePage("115PlayStore","播放记录核心",store);
replacePage("115PlayHistory","最近播放",history);
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 最近播放安全重构";
rule.version=2026092240;
var out="hiker://files/cache/115_12120_play_history_safe.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
