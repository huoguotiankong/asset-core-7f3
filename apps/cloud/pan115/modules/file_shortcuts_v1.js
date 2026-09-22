(function(){
/*__PAN115_FILE_SHORTCUTS_V1__*/
var d=[];
function readList(key){try{var a=JSON.parse(getItem(key,"[]"));return a instanceof Array?a:[];}catch(e){return[];}}
function writeList(key,a){try{setItem(key,JSON.stringify(a||[]));}catch(e){}}
function normTrail(x){var t=String((x&&x.trail)||"");if(t)return t;return JSON.stringify([{id:"0",name:"我的文件"},{id:String((x&&x.id)||"0"),name:String((x&&x.name)||"文件夹")}]);}
function route(x){return "hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(String(x.id||"0"))+"&cname="+encodeURIComponent(String(x.name||"文件夹"))+"&trail="+encodeURIComponent(normTrail(x));}
var fav=readList("115FMFavoriteDirsV1"),recent=readList("115FMRecentDirsV1");
d.push({title:"🏠 根目录",col_type:"text_4",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")+"&trail="+encodeURIComponent(JSON.stringify([{id:"0",name:"我的文件"}]))});
d.push({title:"🕘 清空最近",col_type:"text_4",url:recent.length?$("确认清空最近访问？").confirm(function(){setItem("115FMRecentDirsV1","[]");refreshPage(false);return "toast://已清空最近访问";}):"toast://最近访问为空"});
if(fav.length){
 d.push({title:"⭐ 收藏目录",col_type:"text_1",extra:{lineVisible:false}});
 for(var i=0;i<fav.length;i++){
  var x=fav[i]||{};if(!x.id)continue;
  d.push({title:"⭐ "+String(x.name||"文件夹"),desc:"点击打开",col_type:"text_1",url:route(x),extra:{longClick:[{title:"取消收藏",js:$.toString(function(id){try{var a=JSON.parse(getItem("115FMFavoriteDirsV1","[]"));if(!(a instanceof Array))a=[];var out=[];for(var i=0;i<a.length;i++)if(String((a[i]||{}).id||"")!==String(id))out.push(a[i]);setItem("115FMFavoriteDirsV1",JSON.stringify(out));refreshPage(false);return "toast://已取消收藏";}catch(e){return "toast://操作失败："+String(e.message||e);}},String(x.id))}]}});
 }
}else d.push({title:"⭐ 暂无收藏目录",desc:"在文件管理中长按文件夹即可收藏",col_type:"text_center_1"});
if(recent.length){
 d.push({title:"🕘 最近访问",col_type:"text_1",extra:{lineVisible:false}});
 for(var j=0;j<recent.length&&j<10;j++){
  var r=recent[j]||{};if(!r.id)continue;
  d.push({title:"🕘 "+String(r.name||"文件夹"),col_type:"text_1",url:route(r),extra:{longClick:[{title:"加入收藏",js:$.toString(function(raw){try{var x=JSON.parse(String(raw||"{}")),a=JSON.parse(getItem("115FMFavoriteDirsV1","[]"));if(!(a instanceof Array))a=[];var out=[x];for(var i=0;i<a.length&&out.length<20;i++)if(String((a[i]||{}).id||"")!==String(x.id||""))out.push(a[i]);setItem("115FMFavoriteDirsV1",JSON.stringify(out));refreshPage(false);return "toast://已收藏「"+String(x.name||"文件夹")+"」";}catch(e){return "toast://收藏失败："+String(e.message||e);}},JSON.stringify({id:String(r.id),name:String(r.name||"文件夹"),trail:normTrail(r)}))}]}});
 }
}else d.push({title:"暂无最近访问",desc:"打开文件夹后会自动记录",col_type:"text_center_1"});
setResult(d);
})();
