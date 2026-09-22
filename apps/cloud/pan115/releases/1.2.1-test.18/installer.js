(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092238)return "toast://当前已是115 Test 1.2.1-test.18";
if(ver!==2026092237)return "toast://本版基于已验证Test17，请先覆盖到1.2.1-test.17";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@472a400c989a77162e884b7d985359aa7a4225c3/apps/cloud/pan115/modules/";
var history="";
try{history=fetch(base+"play_history_v1.js");}catch(e2){return "toast://下载播放记录模块失败："+e2.message;}
if(!history||history.indexOf("__PAN115_PLAY_HISTORY_V1__")<0||history.indexOf("115PlayRecentV1")<0)return "toast://播放记录模块校验失败";
function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
var foundFM=false;
for(var i=0;i<pages.length;i++){
 var p=pages[i]||{};
 if(p.path!=="115FileManage")continue;
 foundFM=true;
 var fm=String(p.rule||"");
 if(fm.indexOf("__PAN115_FILE_MANAGE_V9__")<0)return "toast://当前文件管理不是Test17 V9基线，停止覆盖";
 if(fm.indexOf("__PAN115_PLAY_HISTORY_HOOK_V1__")<0){
   var newBtn=' d.push({title:"▶ 最近",col_type:"text_4",url:"hiker://page/115PlayHistory?rule=115.简&page=fypage"});\n /*__PAN115_PLAY_HISTORY_HOOK_V1__*/\n';
   var btnMark=' d.push({title:"＋ 新建"';
   var bi=fm.indexOf(btnMark);if(bi<0)return "toast://未找到文件管理工具栏插入点";
   fm=fm.slice(0,bi)+newBtn+fm.slice(bi);
   var oldPlay='else if(kind==="video")item.url=$().lazyRule(api.player.resolve,JSON.stringify({pc:f.pickCode||"",fid:fid,name:name,kind:"video"}));';
   var newPlay='else if(kind==="video")item.url=$().lazyRule(function(raw){var v;try{v=JSON.parse(String(raw||"{}"));}catch(e){v={};}try{var a=[];try{a=JSON.parse(getItem("115PlayRecentV1","[]"));if(!(a instanceof Array))a=[];}catch(e0){a=[];}v.playAt=Date.now();var out=[v];for(var i=0;i<a.length&&out.length<50;i++)if(String((a[i]||{}).fid||"")!==String(v.fid||""))out.push(a[i]);setItem("115PlayRecentV1",JSON.stringify(out));}catch(e1){}try{return $.require("115Api").player.resolve(JSON.stringify({pc:String(v.pc||""),fid:String(v.fid||""),name:String(v.name||""),kind:"video"}));}catch(ex){return "toast://播放失败："+String(ex.message||ex);}},JSON.stringify({pc:f.pickCode||"",fid:fid,name:name,size:Number(f.size||0),sourceCid:cid,sourceName:cname,trail:trailJson}));';
   if(fm.indexOf(oldPlay)<0)return "toast://未找到Test17视频播放插入点";
   fm=fm.replace(oldPlay,newPlay);
   var infoMark=' item.extra.longClick.push({title:"文件信息"';
   var ii=fm.indexOf(infoMark);if(ii<0)return "toast://未找到文件长按菜单插入点";
   var favCode=' if(!isDir&&kind==="video")item.extra.longClick.push({title:"收藏/取消收藏视频",js:$.toString(function(raw){var v;try{v=JSON.parse(String(raw||"{}"));}catch(e){v={};}try{var a=[];try{a=JSON.parse(getItem("115PlayFavoriteV1","[]"));if(!(a instanceof Array))a=[];}catch(e0){a=[];}var out=[],found=false;for(var i=0;i<a.length;i++){var q=a[i]||{};if(String(q.fid||"")===String(v.fid||"")){found=true;continue;}out.push(q);}if(!found){v.favAt=Date.now();out.unshift(v);}if(out.length>100)out=out.slice(0,100);setItem("115PlayFavoriteV1",JSON.stringify(out));return "toast://"+(found?"已取消收藏":"已收藏");}catch(ex){return "toast://操作失败："+String(ex.message||ex);}},JSON.stringify({pc:f.pickCode||"",fid:fid,name:name,size:Number(f.size||0),sourceCid:cid,sourceName:cname,trail:trailJson})));\n';
   fm=fm.slice(0,ii)+favCode+fm.slice(ii);
 }
 p.rule=fm;
}
if(!foundFM)return "toast://当前115缺少文件管理页，停止覆盖";
replacePage("115PlayHistory","最近播放",history);
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 最近播放与视频收藏";
rule.version=2026092238;
var out="hiker://files/cache/115_12118_play_history.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
