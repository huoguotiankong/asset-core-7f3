(function(){
/*__PAN115_FILE_MANAGE_V9__*/
var d=[];
var api=$.require("115Api");
var client;
try{client=api.newClient();}catch(e){d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1",url:"hiker://page/115Account?rule=115.简&page=fypage"});setResult(d);return;}
function q(n,v){var x="";try{x=String(getParam(n,"")||"");}catch(e){}if(x){try{x=decodeURIComponent(x);}catch(e2){}return x;}try{if(typeof MY_PARAMS!=="undefined"&&MY_PARAMS&&MY_PARAMS[n]!=null)return String(MY_PARAMS[n]);}catch(e3){}return v||"";}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return "";}}
function fmtTime(v){if(v===undefined||v===null||v==="")return "";var s=String(v);if(/^\d+$/.test(s)){try{var n=Number(s);if(n<100000000000)n*=1000;var dt=new Date(n);function p(x){return x<10?"0"+x:String(x);}return dt.getFullYear()+"-"+p(dt.getMonth()+1)+"-"+p(dt.getDate())+" "+p(dt.getHours())+":"+p(dt.getMinutes());}catch(e){return s;}}return s;}
function parseTrail(raw,cid,cname){var a=[];try{a=JSON.parse(String(raw||"[]"));if(!(a instanceof Array))a=[];}catch(e){a=[];}if(!a.length)a.push({id:"0",name:"我的文件"});var last=a[a.length-1]||{};if(String(last.id||"")!==String(cid))a.push({id:String(cid),name:String(cname||"文件夹")});if(a.length>16)a=a.slice(a.length-16);return a;}
function trailText(a){var out=[];for(var i=0;i<a.length;i++)out.push(String((a[i]&&a[i].name)||"?"));return out.join(" › ");}
function extKind(name){var s=String(name||"").toLowerCase(),m=/\.([a-z0-9]{1,8})$/.exec(s),e=m?m[1]:"";if(/^(mp4|mkv|avi|mov|wmv|flv|ts|m2ts|rmvb|webm|m4v)$/.test(e))return"video";if(/^(jpg|jpeg|png|gif|webp|bmp|heic|avif)$/.test(e))return"image";if(/^(mp3|flac|wav|aac|m4a|ape|ogg|wma)$/.test(e))return"audio";if(/^(pdf|txt|doc|docx|xls|xlsx|ppt|pptx|epub|mobi|azw3|md)$/.test(e))return"document";if(/^(zip|rar|7z|tar|gz|bz2|xz)$/.test(e))return"archive";return"other";}
function kindOf(f){if(f&&f.isDirectory)return"folder";try{var k=api.tool.fileKind(String((f&&f.name)||""));if(k)return String(k);}catch(e){}return extKind((f&&f.name)||"");}
function iconOf(k){if(k==="folder")return"📁 ";if(k==="video")return"🎬 ";if(k==="image")return"🖼 ";if(k==="audio")return"🎵 ";if(k==="document")return"📄 ";if(k==="archive")return"🗜 ";return"📦 ";}
function matchFilter(f,key){if(key==="all")return true;if(key==="folder")return !!(f&&f.isDirectory);if(f&&f.isDirectory)return false;var k=kindOf(f);if(key==="other")return k!=="video"&&k!=="image"&&k!=="audio"&&k!=="document"&&k!=="archive";return k===key;}
function readList(key){try{var a=JSON.parse(getItem(key,"[]"));return a instanceof Array?a:[];}catch(e){return[];}}
function isFav(id){var a=readList("115FMFavoriteDirsV1");for(var i=0;i<a.length;i++)if(String((a[i]||{}).id||"")===String(id))return true;return false;}
function saveRecent(id,name,trail){if(!id||String(id)==="0")return;var a=readList("115FMRecentDirsV1"),out=[{id:String(id),name:String(name||"文件夹"),trail:String(trail||""),at:Date.now()}];for(var i=0;i<a.length&&out.length<12;i++)if(String((a[i]||{}).id||"")!==String(id))out.push(a[i]);try{setItem("115FMRecentDirsV1",JSON.stringify(out));}catch(e){}}
function toggleFav(id,name,trail){var a=readList("115FMFavoriteDirsV1"),found=false,out=[];for(var i=0;i<a.length;i++){var x=a[i]||{};if(String(x.id||"")===String(id)){found=true;continue;}out.push(x);}if(!found)out.unshift({id:String(id),name:String(name||"文件夹"),trail:String(trail||"")});if(out.length>20)out=out.slice(0,20);try{setItem("115FMFavoriteDirsV1",JSON.stringify(out));}catch(e){}return !found;}
var sorts=[{o:"file_name",a:"1",t:"名称↑"},{o:"file_name",a:"0",t:"名称↓"},{o:"user_utime",a:"0",t:"时间↓"},{o:"user_utime",a:"1",t:"时间↑"},{o:"file_size",a:"0",t:"大小↓"},{o:"file_size",a:"1",t:"大小↑"}];
var filters=[{k:"all",t:"全部"},{k:"folder",t:"文件夹"},{k:"video",t:"视频"},{k:"image",t:"图片"},{k:"audio",t:"音频"},{k:"document",t:"文档"},{k:"archive",t:"压缩包"},{k:"other",t:"其它"}];
var cid=q("cid","0"),cname=q("cname","我的文件"),trail=parseTrail(q("trail",""),cid,cname),pageNo=1;try{pageNo=parseInt(MY_PAGE||1,10)||1;}catch(e4){}
var sortIdx=parseInt(getItem("115FMSortV1","0"),10)||0;if(sortIdx<0||sortIdx>=sorts.length)sortIdx=0;
var filterIdx=parseInt(getItem("115FMFilterV1","0"),10)||0;if(filterIdx<0||filterIdx>=filters.length)filterIdx=0;
var sort=sorts[sortIdx],filter=filters[filterIdx],trailJson=JSON.stringify(trail);
if(pageNo===1){
 saveRecent(cid,cname,trailJson);
 d.push({title:"📁 "+cname,desc:trailText(trail),col_type:"text_1",extra:{lineVisible:false}});
 d.push({title:"🏠 根目录",col_type:"text_4",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")+"&trail="+encodeURIComponent(JSON.stringify([{id:"0",name:"我的文件"}]))});
 var up=trail.length>1?trail[trail.length-2]:null,upTrail=trail.length>1?trail.slice(0,trail.length-1):trail;
 d.push({title:"⬆ 上一级",col_type:"text_4",url:up?("hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(String(up.id||"0"))+"&cname="+encodeURIComponent(String(up.name||"我的文件"))+"&trail="+encodeURIComponent(JSON.stringify(upTrail))):"toast://已经在根目录"});
 d.push({title:"⭐ 常用",col_type:"text_4",url:"hiker://page/115FileShortcuts?rule=115.简&page=fypage"});
 d.push({title:"＋ 新建",col_type:"text_4",url:$("","新建文件夹").input(function(parentId){var name=String(input||"").trim();if(!name)return "toast://已取消";try{var o=$.require("115FileOps"),r=o.mkdir(String(parentId),name);if(!r.ok)return "toast://新建失败："+r.error;refreshPage(false);return "toast://已新建「"+r.name+"」";}catch(ex){return "toast://新建失败："+String(ex.message||ex);}},cid)});
 d.push({title:"☑ 批量",col_type:"text_4",url:"hiker://page/115FileBatch?rule=115.简&page=fypage&cid="+encodeURIComponent(cid)+"&cname="+encodeURIComponent(cname)+"&trail="+encodeURIComponent(trailJson)});
 d.push({title:"⇅ "+sort.t,col_type:"text_4",url:$().lazyRule(function(idx,max){var n=(Number(idx)+1)%Number(max);setItem("115FMSortV1",String(n));refreshPage(false);return "hiker://empty";},sortIdx,sorts.length)});
 d.push({title:"◉ "+filter.t,col_type:"text_4",url:$().lazyRule(function(idx,max){var n=(Number(idx)+1)%Number(max);setItem("115FMFilterV1",String(n));refreshPage(false);return "hiker://empty";},filterIdx,filters.length)});
 d.push({title:"🗑 回收",col_type:"text_4",url:"hiker://page/115Recycle?rule=115.简&page=fypage"});
 d.push({title:"↻ 刷新",col_type:"text_4",url:$("刷新").lazyRule(function(){refreshPage(false);return "hiker://empty";})});
}
var res;try{res=client.getFiles(String(cid),{offset:(pageNo-1)*50,pageSize:50,order:sort.o,asc:sort.a,showDir:"1"});}catch(e5){d.push({title:"读取文件失败",desc:String(e5.message||e5),col_type:"text_center_1"});setResult(d);return;}
var all=(res&&res.files)||[],arr=[];for(var ai=0;ai<all.length;ai++)if(matchFilter(all[ai],filter.k))arr.push(all[ai]);
for(var i=0;i<arr.length;i++){
 var f=arr[i]||{},fid=String(f.fileId||""),name=String(f.name||"未命名"),isDir=!!f.isDirectory;if(!fid)continue;
 var kind=kindOf(f),mt=f.updateTime||f.userUtime||f.user_utime||f.fileMtime||f.mtime||f.time||"",desc=isDir?fmtTime(mt):fmtSize(f.size);var ts=fmtTime(mt);if(!isDir&&ts)desc+=(desc?" · ":"")+ts;
 var childTrail=trail.slice(0);childTrail.push({id:fid,name:name});if(childTrail.length>16)childTrail=childTrail.slice(childTrail.length-16);var childTrailJson=JSON.stringify(childTrail);
 var item={title:iconOf(kind)+name,desc:desc,col_type:"text_1",url:"toast://长按可管理",extra:{longClick:[]}};
 if(isDir)item.url="hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(fid)+"&cname="+encodeURIComponent(name)+"&trail="+encodeURIComponent(childTrailJson);else if(kind==="video")item.url=$().lazyRule(api.player.resolve,JSON.stringify({pc:f.pickCode||"",fid:fid,name:name,kind:"video"}));
 if(isDir)item.extra.longClick.push({title:isFav(fid)?"取消收藏目录":"收藏目录",js:$.toString(function(id,nm,tr){try{var a=[];try{a=JSON.parse(getItem("115FMFavoriteDirsV1","[]"));if(!(a instanceof Array))a=[];}catch(e0){a=[];}var found=false,out=[];for(var i=0;i<a.length;i++){var x=a[i]||{};if(String(x.id||"")===String(id)){found=true;continue;}out.push(x);}if(!found)out.unshift({id:String(id),name:String(nm||"文件夹"),trail:String(tr||"")});if(out.length>20)out=out.slice(0,20);setItem("115FMFavoriteDirsV1",JSON.stringify(out));refreshPage(false);return "toast://"+(found?"已取消收藏":"已收藏「"+nm+"」");}catch(ex){return "toast://操作失败："+String(ex.message||ex);}},fid,name,childTrailJson)});
 item.extra.longClick.push({title:"文件信息",js:$.toString(function(id,nm,dir,sz,pc,sourceCid,sourceName,sourceTrail){return "hiker://page/115FileInfo?rule=115.简&page=fypage&fid="+encodeURIComponent(id)+"&name="+encodeURIComponent(nm)+"&dir="+(dir?"1":"0")+"&size="+encodeURIComponent(String(sz||0))+"&pc="+encodeURIComponent(String(pc||""))+"&sourceCid="+encodeURIComponent(sourceCid)+"&sourceName="+encodeURIComponent(sourceName)+"&sourceTrail="+encodeURIComponent(sourceTrail);},fid,name,isDir,Number(f.size||0),String(f.pickCode||""),cid,cname,trailJson)});
 item.extra.longClick.push({title:"重命名",js:$.toString(function(id,nm,dir){return $("","重命名").input(function(fileId,oldName){var next=String(input||"").trim();if(!next)return "toast://已取消";try{var o=$.require("115FileOps"),r=o.rename(String(fileId),next,String(oldName));if(!r.ok)return "toast://重命名失败："+r.error;refreshPage(false);return "toast://已重命名为「"+r.name+"」";}catch(ex){return "toast://重命名失败："+String(ex.message||ex);}},id,nm);},fid,name,isDir)});
 item.extra.longClick.push({title:"复制到…",js:$.toString(function(id,nm,dir,sz,sourceCid,sourceName,sourceTrail){try{var o=$.require("115BatchOps"),key="115SingleSelV1_"+String(id),m={};m[String(id)]={name:String(nm||""),dir:!!dir,size:Number(sz||0)};o.save(key,m);return "hiker://page/115FolderPicker?rule=115.简&page=fypage&op=copy&selKey="+encodeURIComponent(key)+"&sourceCid="+encodeURIComponent(sourceCid)+"&sourceName="+encodeURIComponent(sourceName)+"&sourceTrail="+encodeURIComponent(sourceTrail)+"&cid=0&cname="+encodeURIComponent("我的文件")+"&trail="+encodeURIComponent(JSON.stringify([{id:"0",name:"我的文件"}]));}catch(ex){return "toast://打开复制目标失败："+String(ex.message||ex);}},fid,name,isDir,Number(f.size||0),cid,cname,trailJson)});
 item.extra.longClick.push({title:"移动到…",js:$.toString(function(id,nm,dir,sz,sourceCid,sourceName,sourceTrail){try{var o=$.require("115BatchOps"),key="115SingleSelV1_"+String(id),m={};m[String(id)]={name:String(nm||""),dir:!!dir,size:Number(sz||0)};o.save(key,m);return "hiker://page/115FolderPicker?rule=115.简&page=fypage&op=move&selKey="+encodeURIComponent(key)+"&sourceCid="+encodeURIComponent(sourceCid)+"&sourceName="+encodeURIComponent(sourceName)+"&sourceTrail="+encodeURIComponent(sourceTrail)+"&cid=0&cname="+encodeURIComponent("我的文件")+"&trail="+encodeURIComponent(JSON.stringify([{id:"0",name:"我的文件"}]));}catch(ex){return "toast://打开移动目标失败："+String(ex.message||ex);}},fid,name,isDir,Number(f.size||0),cid,cname,trailJson)});
 item.extra.longClick.push({title:"删除到回收站",js:$.toString(function(id,nm,sourceCid){return $("确认删除「"+nm+"」？").confirm(function(fileId,cid0){try{var o=$.require("115BatchOps"),r=o.exec("delete",[String(fileId)],String(cid0),"");if(!r.ok)return "toast://删除失败："+r.error;refreshPage(false);return "toast://已移入回收站";}catch(ex){return "toast://删除失败："+String(ex.message||ex);}},id,sourceCid);},fid,name,cid)});
 d.push(item);
}
if(!arr.length&&pageNo===1)d.push({title:all.length?"当前筛选下没有项目":"这里是空的",desc:all.length?"切换上方筛选即可":"",col_type:"text_center_1"});
setResult(d);
})();
