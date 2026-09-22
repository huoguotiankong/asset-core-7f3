(function(){
/*__PAN115_PLAY_HISTORY_V2__*/
var d=[];
var api=$.require("115Api");
var store=$.require("115PlayStore");
function read(key){try{var a=JSON.parse(getItem(key,"[]"));return a instanceof Array?a:[];}catch(e){return[];}}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return"";}}
function fmtTime(v){var n=Number(v||0);if(!n)return"";try{var t=new Date(n),p=function(x){return x<10?"0"+x:String(x);};return p(t.getMonth()+1)+"-"+p(t.getDate())+" "+p(t.getHours())+":"+p(t.getMinutes());}catch(e){return"";}}
function trailText(raw){try{var a=JSON.parse(String(raw||"[]")),out=[];if(!(a instanceof Array))return"";for(var i=0;i<a.length;i++){var n=String((a[i]||{}).name||"");if(n)out.push(n);}return out.join(" › ");}catch(e){return"";}}
var tab=String(getItem("115PlayCenterTabV2","recent")||"recent");if(tab!=="fav")tab="recent";
var recent=read("115PlayRecentV2"),fav=read("115PlayFavoriteV2"),list=tab==="fav"?fav:recent;
d.push({title:(tab==="recent"?"● ":"")+"最近",col_type:"text_4",url:$().lazyRule(function(){setItem("115PlayCenterTabV2","recent");refreshPage(false);return"hiker://empty";})});
d.push({title:(tab==="fav"?"● ":"")+"收藏",col_type:"text_4",url:$().lazyRule(function(){setItem("115PlayCenterTabV2","fav");refreshPage(false);return"hiker://empty";})});
d.push({title:"📁 文件",col_type:"text_4",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")});
d.push({title:"清空",col_type:"text_4",url:$(tab==="fav"?"确认清空收藏视频？":"确认清空最近播放？").confirm(function(key){setItem(key,"[]");refreshPage(false);return"toast://已清空";},tab==="fav"?"115PlayFavoriteV2":"115PlayRecentV2")});
if(!list.length){d.push({title:tab==="fav"?"暂无收藏视频":"暂无最近播放",desc:tab==="fav"?"先播放视频，再到最近页长按收藏":"从文件管理播放视频后自动记录",col_type:"text_center_1"});setResult(d);return;}
for(var i=0;i<list.length;i++){
 var x=list[i]||{},fid=String(x.fid||"");if(!fid)continue;
 var desc="",sz=Number(x.size||0);if(sz>0)desc=fmtSize(sz);var tm=fmtTime(x.playAt||x.favAt);if(tm)desc+=(desc?" · ":"")+tm;var path=trailText(x.trail);if(path)desc+=(desc?"\n":"")+path;
 var raw=JSON.stringify(x),item={title:"🎬 "+String(x.name||"视频"),desc:desc,col_type:"text_1",url:$().lazyRule(function(v){return $.require("115PlayStore").play(v);},raw),extra:{longClick:[]}};
 item.extra.longClick.push({title:store.isFav(fid)?"取消收藏":"收藏视频",js:$.toString(function(v){var r=$.require("115PlayStore").toggle(v);refreshPage(false);return r;},raw)});
 if(String(x.sourceCid||""))item.extra.longClick.push({title:"打开所在目录",js:$.toString(function(cid,name,trail){return"hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(String(cid||"0"))+"&cname="+encodeURIComponent(String(name||"文件夹"))+(trail?"&trail="+encodeURIComponent(String(trail)):"");},String(x.sourceCid||"0"),String(x.sourceName||"所在目录"),String(x.trail||""))});
 item.extra.longClick.push({title:"移除此条",js:$.toString(function(key,id){try{var a=JSON.parse(getItem(key,"[]"));if(!(a instanceof Array))a=[];var out=[];for(var j=0;j<a.length;j++)if(String((a[j]||{}).fid||"")!==String(id))out.push(a[j]);setItem(key,JSON.stringify(out));refreshPage(false);return"toast://已移除";}catch(e){return"toast://移除失败";}},tab==="fav"?"115PlayFavoriteV2":"115PlayRecentV2",fid)});
 d.push(item);
}
setResult(d);
})();
