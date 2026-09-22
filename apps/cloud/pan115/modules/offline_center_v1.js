(function(){
/*__PAN115_OFFLINE_CENTER_V1__*/
var d=[];
var api=$.require("115Api");
var client;
try{client=api.newClient();}catch(e){
 d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1",url:"hiker://page/115Account?rule=115.简&page=fypage"});
 setResult(d);return;
}
function pageNo(){try{return parseInt(MY_PAGE||1,10)||1;}catch(e){return 1;}}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return "";}}
function validLink(s){return /^(magnet:\?|ed2k:\/\/|https?:\/\/)/i.test(String(s||"").trim());}
function taskStatus(t){
 var st=Number((t&&t.status)!=null?t.status:0),pct=Number((t&&t.percent)||0),rate=Number((t&&t.rateDownload)||0);
 if(st===2||(t&&t.fileId))return "done";
 if(st===-1)return "failed";
 if(st===1)return "active";
 return "waiting";
}
function statusText(t){
 var s=taskStatus(t),x="";
 if(s==="done")x="✅ 已完成";
 else if(s==="failed")x="❌ 失败";
 else if(s==="active")x="⬇ 下载中";
 else x="⏳ 等待中";
 var p=Number((t&&t.percent)||0);if(s==="active"&&p>0)x+=" · "+(Math.round(p*100)/100)+"%";
 var r=Number((t&&t.rateDownload)||0);if(s==="active"&&r>0)x+=" · "+fmtSize(r)+"/s";
 var z=Number((t&&t.size)||0);if(z>0)x+=" · "+fmtSize(z);
 return x;
}
function resultUrl(t){
 var fid=String((t&&t.fileId)||""),pid=String((t&&t.dirId)||""),hash=String((t&&t.infoHash)||""),name=String((t&&t.name)||"离线结果");
 return "hiker://page/115OfflineResult?rule=115.简&page=fypage&fid="+encodeURIComponent(fid)+"&pid="+encodeURIComponent(pid)+"&hash="+encodeURIComponent(hash)+"&name="+encodeURIComponent(name);
}
function cachedTarget(){
 var h="0",c="0",m="root-fallback";
 try{h=String(getItem("115HikerVisionCid","0")||"0");}catch(e){}
 try{c=String(getItem("115CloudDownloadCid","0")||"0");}catch(e2){}
 try{m=String(getItem("115OfflineTargetMode","root-fallback")||"root-fallback");}catch(e3){}
 var id=h!=="0"?h:(c!=="0"?c:"0");
 var name=h!=="0"?"海阔视界":(c!=="0"?"云下载/离线下载":"根目录（待首次提交时识别）");
 return {id:id,name:name,mode:m};
}
function filterKey(){var k="all";try{k=String(getItem("115OfflineCenterFilterV1","all")||"all");}catch(e){}return /^(all|active|done|failed)$/.test(k)?k:"all";}
function filterName(k){return k==="active"?"进行中":(k==="done"?"已完成":(k==="failed"?"失败":"全部"));}
function match(t,k){if(k==="all")return true;var s=taskStatus(t);if(k==="active")return s==="active"||s==="waiting";return s===k;}
var pg=pageNo(),fk=filterKey(),target=cachedTarget();
if(pg===1){
 d.push({title:'<b>⬇ 115 离线下载中心</b>'.fontcolor("#2B6CB0"),desc:"手动刷新 · 单次请求 · 不后台轮询",col_type:"rich_text",extra:{textSize:19,lineVisible:false}});
 d.push({title:"粘贴 magnet / ed2k / HTTP(S) 链接",desc:"提交后不会持续轮询，稍后手动刷新查看状态",col_type:"input",url:$.toString(function(){
   var u=String(input||"").trim();if(!u)return "toast://请输入下载链接";
   if(!/^(magnet:\?|ed2k:\/\/|https?:\/\/)/i.test(u))return "toast://仅支持 magnet / ed2k / HTTP(S)";
   try{
     var a=$.require("115Api"),c=a.newClient(),dest="0",cloud="";
     try{var h=String(getItem("115HikerVisionCid","0")||"0");if(h&&h!=="0")dest=h;}catch(e0){}
     if(dest==="0"){
       try{
         var rr=c.getFiles("0",{offset:0,pageSize:120,order:"file_name",asc:"1",showDir:"1"}),ar=(rr&&rr.files)||[];
         for(var i=0;i<ar.length;i++){
           var f=ar[i]||{};if(!f.isDirectory)continue;var n=String(f.name||"").trim(),id=String(f.fileId||"");if(!id)continue;
           if(n==="海阔视界"){dest=id;setItem("115HikerVisionCid",id);setItem("115OfflineTargetMode","hiker-root");break;}
           if(!cloud&&/^(云下载|离线下载)$/i.test(n))cloud=id;
         }
         if(dest==="0"&&cloud){dest=cloud;setItem("115CloudDownloadCid",cloud);setItem("115OfflineTargetMode","cloud-root-fallback");}
       }catch(e1){}
     }
     if(dest==="0")try{var cc=String(getItem("115CloudDownloadCid","0")||"0");if(cc&&cc!=="0"){dest=cc;setItem("115OfflineTargetMode","cloud-cache-fallback");}}catch(e2){}
     if(dest==="0")try{setItem("115OfflineTargetMode","root-fallback");}catch(e3){}
     c.addOfflineTaskURIs([u],dest);refreshPage(false);return "toast://已提交到115离线任务；稍后手动刷新查看状态";
   }catch(ex){return "toast://提交失败："+String(ex.message||ex);}
 })});
 d.push({title:"📁 保存目录："+target.name,desc:target.id!=="0"?("CID: "+target.id+" · "+target.mode):"优先 海阔视界，其次 云下载/离线下载，最后根目录",col_type:"text_1",url:target.id!=="0"?("hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(target.id)+"&cname="+encodeURIComponent(target.name)):"toast://首次提交任务时会自动识别保存目录",extra:{lineVisible:false}});
 d.push({title:"◉ "+filterName(fk),col_type:"text_4",url:$().lazyRule(function(k){var a=["all","active","done","failed"],i=a.indexOf(String(k));i=(i+1)%a.length;setItem("115OfflineCenterFilterV1",a[i]);refreshPage(false);return "hiker://empty";},fk)});
 d.push({title:"↻ 刷新",col_type:"text_4",url:$("刷新").lazyRule(function(){refreshPage(false);return "hiker://empty";})});
 d.push({title:"📁 文件",col_type:"text_4",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")});
 d.push({title:"🗑 回收站",col_type:"text_4",url:"hiker://page/115Recycle?rule=115.简&page=fypage"});
}
var res;
try{res=client.listOfflineTask(pg);}catch(e4){d.push({title:"读取离线任务失败",desc:String(e4.message||e4),col_type:"text_center_1"});setResult(d);return;}
var all=(res&&res.tasks)||[],shown=0;
for(var i=0;i<all.length;i++){
 var t=all[i]||{};if(!match(t,fk))continue;shown++;
 var name=String(t.name||t.url||"离线任务"),hash=String(t.infoHash||""),s=taskStatus(t),desc=statusText(t);
 if(hash)desc+="\n"+hash;
 var item={title:(s==="done"?"🎬 ":(s==="failed"?"⚠ ":"📥 "))+name,desc:desc,col_type:"text_1",url:s==="done"?resultUrl(t):"toast://"+(s==="failed"?"任务失败，长按可处理":"任务尚未完成，稍后手动刷新"),extra:{longClick:[]}};
 if(hash)item.extra.longClick.push({title:"移除任务记录（保留文件）",js:$.toString(function(h,n){return $("确认移除任务记录「"+n+"」？\n已下载文件不会删除").confirm(function(x){try{$.require("115Api").newClient().deleteOfflineTasks([String(x)],false);refreshPage(false);return "toast://已移除任务记录";}catch(e){return "toast://移除失败："+String(e.message||e);}},h);},hash,name)});
 if(s==="failed"&&hash&&t.url&&validLink(t.url))item.extra.longClick.push({title:"删除失败任务并重新提交",js:$.toString(function(h,u){return $("确认重新提交此任务？").confirm(function(x,link){try{var c=$.require("115Api").newClient();c.deleteOfflineTasks([String(x)],false);var dest=String(getItem("115HikerVisionCid","0")||"0");if(dest==="0")dest=String(getItem("115CloudDownloadCid","0")||"0");c.addOfflineTaskURIs([String(link)],dest);refreshPage(false);return "toast://已重新提交";}catch(e){return "toast://重新提交失败："+String(e.message||e);}},h,u);},hash,String(t.url))});
 d.push(item);
}
if(!shown&&pg===1)d.push({title:all.length?"当前筛选条件下没有任务":"暂无离线任务",desc:all.length?"点击上方筛选按钮切换":"可在上方粘贴磁链或下载链接",col_type:"text_center_1"});
setResult(d);
})();
