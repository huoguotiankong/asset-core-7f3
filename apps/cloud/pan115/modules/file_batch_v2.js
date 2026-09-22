(function(){
var d=[],api=$.require("115Api"),ops=$.require("115BatchOps"),client;
try{client=api.newClient();}catch(e){d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1"});setResult(d);return;}
function q(n,v){var x="";try{x=String(getParam(n,"")||"");}catch(e){}if(x){try{x=decodeURIComponent(x);}catch(e2){}return x;}try{if(typeof MY_PARAMS!=="undefined"&&MY_PARAMS&&MY_PARAMS[n]!=null)return String(MY_PARAMS[n]);}catch(e3){}return v||"";}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return"";}}
function trailText(raw,cname){var a=[];try{a=JSON.parse(String(raw||"[]"));if(!(a instanceof Array))a=[];}catch(e){}if(!a.length)return String(cname||"我的文件");var out=[];for(var i=0;i<a.length;i++)out.push(String((a[i]&&a[i].name)||"?"));return out.join(" › ");}
var sorts=[{o:"file_name",a:"1"},{o:"file_name",a:"0"},{o:"user_utime",a:"0"},{o:"user_utime",a:"1"},{o:"file_size",a:"0"},{o:"file_size",a:"1"}];
var cid=q("cid","0"),cname=q("cname","我的文件"),sourceTrail=q("trail",""),key="115BatchSelV1_"+cid,pageNo=1;try{pageNo=parseInt(MY_PAGE||1,10)||1;}catch(e4){}
var sortIdx=parseInt(getItem("115FMSortV1","0"),10)||0;if(sortIdx<0||sortIdx>=sorts.length)sortIdx=0;var sort=sorts[sortIdx];
var selected=ops.load(key),selCount=ops.count(selected);
if(pageNo===1){
 d.push({title:"☑ 批量管理 · "+cname,desc:trailText(sourceTrail,cname)+"\n点击条目选择/取消；复制和移动会进入目标文件夹选择页",col_type:"text_1",extra:{lineVisible:false}});
 d.push({title:"已选 "+selCount+" 项",col_type:"text_1",extra:{id:"115BatchCount",lineVisible:false}});
}
var res;try{res=client.getFiles(String(cid),{offset:(pageNo-1)*50,pageSize:50,order:sort.o,asc:sort.a,showDir:"1"});}catch(e5){d.push({title:"读取文件失败",desc:String(e5.message||e5),col_type:"text_center_1"});setResult(d);return;}
var arr=(res&&res.files)||[],lite=[];
for(var li=0;li<arr.length;li++){var lf=arr[li]||{},lid=String(lf.fileId||"");if(lid)lite.push({id:lid,name:String(lf.name||"未命名"),dir:!!lf.isDirectory,size:Number(lf.size||0)});}
if(pageNo===1){
 d.push({title:"全选本页",col_type:"text_3",url:$().lazyRule(function(selKey,json){try{var a=JSON.parse(json||"[]"),m={};try{m=JSON.parse(getItem(selKey,"{}"))||{};}catch(e){}for(var i=0;i<a.length;i++){var x=a[i]||{};if(x.id)m[String(x.id)]={name:String(x.name||""),dir:!!x.dir,size:Number(x.size||0)};}setItem(selKey,JSON.stringify(m));refreshPage(false);return "toast://已选择本页";}catch(ex){return "toast://全选失败："+String(ex.message||ex);}},key,JSON.stringify(lite))});
 d.push({title:"清空选择",col_type:"text_3",url:$().lazyRule(function(selKey){setItem(selKey,"{}");refreshPage(false);return "toast://已清空选择";},key)});
 d.push({title:"↩ 浏览",col_type:"text_3",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(cid)+"&cname="+encodeURIComponent(cname)+(sourceTrail?"&trail="+encodeURIComponent(sourceTrail):"")});
 d.push({title:"删除",col_type:"text_3",url:$("批量删除已选项目？\n删除后可在回收站还原").confirm(function(selKey,sourceCid){try{var o=$.require("115BatchOps"),m=o.load(selKey),list=o.ids(m);if(!list.length)return "toast://请先选择文件或文件夹";var r=o.exec("delete",list,String(sourceCid),"");if(!r.ok)return "toast://批量删除失败"+(r.count?"（已处理"+r.count+"项）":"")+"："+r.error;o.clear(selKey);refreshPage(false);return "toast://已删除"+r.count+"项到回收站";}catch(ex){return "toast://批量删除失败："+String(ex.message||ex);}},key,cid)});
 d.push({title:"复制",col_type:"text_3",url:$().lazyRule(function(selKey,sourceCid,sourceName,trail){try{var o=$.require("115BatchOps"),n=o.count(o.load(selKey));if(!n)return "toast://请先选择文件或文件夹";return "hiker://page/115FolderPicker?rule=115.简&page=fypage&op=copy&selKey="+encodeURIComponent(selKey)+"&sourceCid="+encodeURIComponent(sourceCid)+"&sourceName="+encodeURIComponent(sourceName)+"&sourceTrail="+encodeURIComponent(trail)+"&cid=0&cname="+encodeURIComponent("我的文件")+"&trail="+encodeURIComponent(JSON.stringify([{id:"0",name:"我的文件"}]));}catch(ex){return "toast://打开目标目录失败："+String(ex.message||ex);}},key,cid,cname,sourceTrail)});
 d.push({title:"移动",col_type:"text_3",url:$().lazyRule(function(selKey,sourceCid,sourceName,trail){try{var o=$.require("115BatchOps"),n=o.count(o.load(selKey));if(!n)return "toast://请先选择文件或文件夹";return "hiker://page/115FolderPicker?rule=115.简&page=fypage&op=move&selKey="+encodeURIComponent(selKey)+"&sourceCid="+encodeURIComponent(sourceCid)+"&sourceName="+encodeURIComponent(sourceName)+"&sourceTrail="+encodeURIComponent(trail)+"&cid=0&cname="+encodeURIComponent("我的文件")+"&trail="+encodeURIComponent(JSON.stringify([{id:"0",name:"我的文件"}]));}catch(ex){return "toast://打开目标目录失败："+String(ex.message||ex);}},key,cid,cname,sourceTrail)});
}
for(var i=0;i<arr.length;i++){
 var f=arr[i]||{},fid=String(f.fileId||""),name=String(f.name||"未命名"),isDir=!!f.isDirectory;if(!fid)continue;
 var on=!!selected[fid],prefix=on?"☑ ":"☐ ",desc=isDir?"文件夹":fmtSize(f.size);
 d.push({title:prefix+(isDir?"📁 ":"📄 ")+name,desc:desc,col_type:"text_1",url:$().lazyRule(function(selKey,id,nm,dir,sz,itemId){try{var m={};try{m=JSON.parse(getItem(selKey,"{}"))||{};}catch(e){}var added=false;if(m[id])delete m[id];else{m[id]={name:nm,dir:!!dir,size:Number(sz||0)};added=true;}setItem(selKey,JSON.stringify(m));var cnt=0;for(var k in m)if(Object.prototype.hasOwnProperty.call(m,k)&&m[k])cnt++;try{updateItem("115BatchCount",{title:"已选 "+cnt+" 项"});}catch(e2){}try{updateItem(itemId,{title:(added?"☑ ":"☐ ")+(dir?"📁 ":"📄 ")+nm});}catch(e3){}return "toast://"+(added?"已选择":"已取消")+" · 共"+cnt+"项";}catch(ex){return "toast://选择失败："+String(ex.message||ex);}},key,fid,name,isDir,Number(f.size||0),"115BatchItem_"+fid),extra:{id:"115BatchItem_"+fid,lineVisible:false}});
}
if(!arr.length&&pageNo===1)d.push({title:"这里是空的",col_type:"text_center_1"});
setResult(d);
})();
