(function(){
/*__PAN115_PLAY_HISTORY_V1__*/
var d=[];
var api=$.require("115Api");
function readList(key){try{var a=JSON.parse(getItem(key,"[]"));return a instanceof Array?a:[];}catch(e){return[];}}
function writeList(key,a){try{setItem(key,JSON.stringify(a||[]));}catch(e){}}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return "";}}
function fmtTime(v){var n=Number(v||0);if(!n)return"";try{var t=new Date(n),p=function(x){return x<10?"0"+x:String(x);};return p(t.getMonth()+1)+"-"+p(t.getDate())+" "+p(t.getHours())+":"+p(t.getMinutes());}catch(e){return"";}}
function trailText(raw){try{var a=JSON.parse(String(raw||"[]")),out=[];if(!(a instanceof Array))return"";for(var i=0;i<a.length;i++){var n=String((a[i]||{}).name||"");if(n)out.push(n);}return out.join(" › ");}catch(e){return"";}}
function isFav(id){var a=readList("115PlayFavoriteV1");for(var i=0;i<a.length;i++)if(String((a[i]||{}).fid||"")===String(id))return true;return false;}
function toggleFav(x){var a=readList("115PlayFavoriteV1"),out=[],found=false;for(var i=0;i<a.length;i++){var q=a[i]||{};if(String(q.fid||"")===String(x.fid||"")){found=true;continue;}out.push(q);}if(!found){x.favAt=Date.now();out.unshift(x);}if(out.length>100)out=out.slice(0,100);writeList("115PlayFavoriteV1",out);return !found;}
function playUrl(x){return $().lazyRule(function(raw){var v;try{v=JSON.parse(String(raw||"{}"));}catch(e){v={};}try{var a=[];try{a=JSON.parse(getItem("115PlayRecentV1","[]"));if(!(a instanceof Array))a=[];}catch(e0){a=[];}v.playAt=Date.now();var out=[v];for(var i=0;i<a.length&&out.length<50;i++)if(String((a[i]||{}).fid||"")!==String(v.fid||""))out.push(a[i]);setItem("115PlayRecentV1",JSON.stringify(out));}catch(e1){}try{return $.require("115Api").player.resolve(JSON.stringify({pc:String(v.pc||""),fid:String(v.fid||""),name:String(v.name||""),kind:"video"}));}catch(ex){return "toast://播放失败："+String(ex.message||ex);}},JSON.stringify(x));}
var tab=String(getItem("115PlayCenterTabV1","recent")||"recent");if(tab!=="fav")tab="recent";
var recent=readList("115PlayRecentV1"),fav=readList("115PlayFavoriteV1"),list=tab==="fav"?fav:recent;
d.push({title:(tab==="recent"?"● ":"")+"最近",col_type:"text_4",url:$().lazyRule(function(){setItem("115PlayCenterTabV1","recent");refreshPage(false);return"hiker://empty";})});
d.push({title:(tab==="fav"?"● ":"")+"收藏",col_type:"text_4",url:$().lazyRule(function(){setItem("115PlayCenterTabV1","fav");refreshPage(false);return"hiker://empty";})});
d.push({title:"📁 文件",col_type:"text_4",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")});
d.push({title:"清空",col_type:"text_4",url:$(tab==="fav"?"确认清空收藏视频？":"确认清空最近播放？").confirm(function(k){setItem(k,"[]");refreshPage(false);return"toast://已清空";},tab==="fav"?"115PlayFavoriteV1":"115PlayRecentV1")});
if(!list.length){d.push({title:tab==="fav"?"暂无收藏视频":"暂无最近播放",desc:tab==="fav"?"在文件管理中长按视频即可收藏":"从文件管理播放视频后会自动记录",col_type:"text_center_1"});setResult(d);return;}
for(var i=0;i<list.length;i++){
 var x=list[i]||{},fid=String(x.fid||"");if(!fid)continue;
 var path=trailText(x.trail),desc="";if(Number(x.size||0)>0)desc=fmtSize(x.size);var tm=fmtTime(x.playAt||x.favAt);if(tm)desc+=(desc?" · ":"")+tm;if(path)desc+=(desc?"\n":"")+path;
 var item={title:"🎬 "+String(x.name||"视频"),desc:desc,col_type:"text_1",url:playUrl(x),extra:{longClick:[]}};
 item.extra.longClick.push({title:isFav(fid)?"取消收藏":"收藏视频",js:$.toString(function(raw){var v;try{v=JSON.parse(String(raw||"{}"));}catch(e){v={};}try{var a=[];try{a=JSON.parse(getItem("115PlayFavoriteV1","[]"));if(!(a instanceof Array))a=[];}catch(e0){a=[];}var out=[],found=false;for(var i=0;i<a.length;i++){var q=a[i]||{};if(String(q.fid||"")===String(v.fid||"")){found=true;continue;}out.push(q);}if(!found){v.favAt=Date.now();out.unshift(v);}if(out.length>100)out=out.slice(0,100);setItem("115PlayFavoriteV1",JSON.stringify(out));refreshPage(false);return"toast://"+(found?"已取消收藏":"已收藏");}catch(ex){return"toast://操作失败："+String(ex.message||ex);}},JSON.stringify(x))});
 if(String(x.sourceCid||"")){item.extra.longClick.push({title:"打开所在目录",js:$.toString(function(cid,name,trail){return"hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(String(cid||"0"))+"&cname="+encodeURIComponent(String(name||"文件夹"))+(trail?"&trail="+encodeURIComponent(String(trail)):"");},String(x.sourceCid||"0"),String(x.sourceName||"所在目录"),String(x.trail||""))});}
 item.extra.longClick.push({title:"移除此条",js:$.toString(function(key,id){try{var a=JSON.parse(getItem(key,"[]"));if(!(a instanceof Array))a=[];var out=[];for(var i=0;i<a.length;i++)if(String((a[i]||{}).fid||"")!==String(id))out.push(a[i]);setItem(key,JSON.stringify(out));refreshPage(false);return"toast://已移除";}catch(e){return"toast://移除失败";}},tab==="fav"?"115PlayFavoriteV1":"115PlayRecentV1",fid)});
 d.push(item);
}
setResult(d);
})();
