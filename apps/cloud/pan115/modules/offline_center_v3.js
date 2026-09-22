(function(){
/*__PAN115_OFFLINE_CENTER_V3__*/
var d=[];
var api=$.require("115Api");
var client;
try{client=api.newClient();}catch(e){
 d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1",url:"hiker://page/115Account?rule=115.简&page=fypage"});
 setResult(d);return;
}
function pageNo(){try{return parseInt(MY_PAGE||1,10)||1;}catch(e){return 1;}}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return "";}}
function pad(n){return n<10?"0"+n:String(n);}
function fmtTime(v){
 var n=Number(v||0);if(!n)return "";if(n<1000000000000)n*=1000;
 try{var t=new Date(n);return pad(t.getMonth()+1)+"-"+pad(t.getDate())+" "+pad(t.getHours())+":"+pad(t.getMinutes());}catch(e){return "";}
}
function fmtLeft(v){
 var s=Math.floor(Number(v||0));if(!s)return "";
 if(s>=86400)return Math.ceil(s/86400)+"天";
 if(s>=3600)return Math.ceil(s/3600)+"小时";
 if(s>=60)return Math.ceil(s/60)+"分钟";
 return s+"秒";
}
function validLink(s){return /^(magnet:\?|ed2k:\/\/|https?:\/\/)/i.test(String(s||"").trim());}
function taskStatus(t){
 var st=Number((t&&t.status)!=null?t.status:0);
 if(st===2||(t&&t.fileId))return "done";
 if(st===-1)return "failed";
 if(st===1)return "active";
 return "waiting";
}
function statusText(t){
 var s=taskStatus(t),x="";
 if(s==="done")x="已完成";
 else if(s==="failed")x="失败";
 else if(s==="active")x="下载中";
 else x="等待中";
 var p=Number((t&&t.percent)||0);
 if(s==="active"&&p>0)x+=" · "+(Math.round(p*100)/100)+"%";
 var r=Number((t&&t.rateDownload)||0);
 if(s==="active"&&r>0)x+=" · "+fmtSize(r)+"/s";
 var left=fmtLeft((t&&t.leftTime)||0);
 if(s==="active"&&left)x+=" · 剩余"+left;
 var z=Number((t&&t.size)||0);
 if(z>0)x+=" · "+fmtSize(z);
 var tm=fmtTime((t&&t.updateTime)||(t&&t.addTime)||0);
 if(tm)x+=" · "+tm;
 return x;
}
function resultUrlFromInfo(info){
 return "hiker://page/115OfflineResult?rule=115.简&page=fypage&fid="+encodeURIComponent(String(info.fid||""))+"&pid="+encodeURIComponent(String(info.pid||""))+"&hash="+encodeURIComponent(String(info.hash||""))+"&name="+encodeURIComponent(String(info.name||"离线结果"));
}
function completedUrl(t){
 var info={fid:String((t&&t.fileId)||""),pid:String((t&&t.dirId)||""),hash:String((t&&t.infoHash)||""),name:String((t&&t.name)||"离线结果")};
 return $().lazyRule(function(raw){
   var info;try{info=JSON.parse(String(raw||"{}"));}catch(e){info={};}
   var a=$.require("115Api"),c=a.newClient();
   function fallback(){return "hiker://page/115OfflineResult?rule=115.简&page=fypage&fid="+encodeURIComponent(String(info.fid||""))+"&pid="+encodeURIComponent(String(info.pid||""))+"&hash="+encodeURIComponent(String(info.hash||""))+"&name="+encodeURIComponent(String(info.name||"离线结果"));}
   function isNoise(n){return /(sample|preview|trailer|teaser|promo|试看|试播|预告|花絮|广告|宣传)/i.test(String(n||""));}
   try{
     if(info.fid){
       var root=c.getFile(String(info.fid));
       if(root&&root.fileId){
         if(!root.isDirectory){
           var k="";try{k=a.tool.fileKind(root.name);}catch(e0){}
           if(k==="video")return a.player.resolve(JSON.stringify({pc:root.pickCode||"",fid:root.fileId||"",name:root.name||info.name||"",kind:"video"}));
           return fallback();
         }
         var r=c.getFiles(String(root.fileId),{offset:0,pageSize:100,order:"file_name",asc:"1",showDir:"1"}),ar=(r&&r.files)||[],vs=[];
         for(var i=0;i<ar.length;i++){
           var f=ar[i]||{};if(f.isDirectory)continue;var kind="";try{kind=a.tool.fileKind(f.name);}catch(e1){}
           if(kind==="video"&&!isNoise(f.name))vs.push(f);
         }
         if(vs.length===1){var v=vs[0];return a.player.resolve(JSON.stringify({pc:v.pickCode||"",fid:v.fileId||"",name:v.name||info.name||"",kind:"video"}));}
       }
     }
   }catch(ex){}
   return fallback();
 },JSON.stringify(info));
}
function cachedTarget(){
 var h="0",c="0",m="root-fallback";
 try{h=String(getItem("115HikerVisionCid","0")||"0");}catch(e){}
 try{c=String(getItem("115CloudDownloadCid","0")||"0");}catch(e2){}
 try{m=String(getItem("115OfflineTargetMode","root-fallback")||"root-fallback");}catch(e3){}
 var id=h!=="0"?h:(c!=="0"?c:"0");
 var name=h!=="0"?"海阔视界":(c!=="0"?"云下载/离线下载":"根目录");
 return {id:id,name:name,mode:m};
}
function filterKey(){var k="all";try{k=String(getItem("115OfflineCenterFilterV1","all")||"all");}catch(e){}return /^(all|active|done|failed)$/.test(k)?k:"all";}
function filterName(k){return k==="active"?"进行中":(k==="done"?"已完成":(k==="failed"?"失败":"全部"));}
function match(t,k){if(k==="all")return true;var s=taskStatus(t);if(k==="active")return s==="active"||s==="waiting";return s===k;}
var pg=pageNo(),fk=filterKey(),target=cachedTarget(),res;
try{res=client.listOfflineTask(pg);}catch(e4){
 if(pg===1)d.push({title:"读取离线任务失败",desc:String(e4.message||e4),col_type:"text_center_1"});
 setResult(d);return;
}
var all=(res&&res.tasks)||[],total=Number((res&&res.total)||all.length||0),pageCount=Number((res&&res.pageCount)||1);
if(pg===1){
 d.push({title:"粘贴链接",col_type:"input",url:$.toString(function(){
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
     c.addOfflineTaskURIs([u],dest);refreshPage(false);return "toast://已提交到115离线任务";
   }catch(ex){return "toast://提交失败："+String(ex.message||ex);}
 })});
 d.push({title:"📁 保存目录："+target.name,desc:"共 "+total+" 个任务"+(pageCount>1?" · "+pageCount+" 页":""),col_type:"text_1",url:target.id!=="0"?("hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(target.id)+"&cname="+encodeURIComponent(target.name)):"toast://首次提交任务时会自动识别保存目录",extra:{lineVisible:false}});
 d.push({title:"◉ "+filterName(fk),col_type:"text_4",url:$().lazyRule(function(k){var a=["all","active","done","failed"],i=a.indexOf(String(k));i=(i+1)%a.length;setItem("115OfflineCenterFilterV1",a[i]);refreshPage(false);return "hiker://empty";},fk)});
 d.push({title:"↻ 刷新",col_type:"text_4",url:$("刷新").lazyRule(function(){refreshPage(false);return "hiker://empty";})});
 d.push({title:"📁 文件",col_type:"text_4",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")});
 d.push({title:"🗑 回收",col_type:"text_4",url:"hiker://page/115Recycle?rule=115.简&page=fypage"});
}
var shown=0;
for(var i=0;i<all.length;i++){
 var t=all[i]||{};if(!match(t,fk))continue;shown++;
 var name=String(t.name||t.url||"离线任务"),hash=String(t.infoHash||""),s=taskStatus(t),desc=statusText(t),url=s==="done"?completedUrl(t):"toast://"+(s==="failed"?"任务失败，长按可处理":"任务尚未完成，稍后手动刷新");
 var item={title:(s==="done"?"🎬 ":(s==="failed"?"⚠ ":(s==="active"?"⬇ ":"⏳ ")))+name,desc:desc,col_type:"text_1",url:url,extra:{longClick:[]}};
 if(s==="done")item.extra.longClick.push({title:"打开结果页",js:$.toString(function(fid,pid,h,n){return "hiker://page/115OfflineResult?rule=115.简&page=fypage&fid="+encodeURIComponent(fid)+"&pid="+encodeURIComponent(pid)+"&hash="+encodeURIComponent(h)+"&name="+encodeURIComponent(n);},String(t.fileId||""),String(t.dirId||""),hash,name)});
 if(t.url)item.extra.longClick.push({title:"复制原链接",js:"copy://"+String(t.url)});
 if(hash)item.extra.longClick.push({title:"复制 info_hash",js:"copy://"+hash});
 if(hash)item.extra.longClick.push({title:"移除任务记录（保留文件）",js:$.toString(function(h,n){return $("确认移除任务记录「"+n+"」？\n已下载文件不会删除").confirm(function(x){try{$.require("115Api").newClient().deleteOfflineTasks([String(x)],false);refreshPage(false);return "toast://已移除任务记录";}catch(e){return "toast://移除失败："+String(e.message||e);}},h);},hash,name)});
 if(s==="failed"&&hash&&t.url&&validLink(t.url))item.extra.longClick.push({title:"重新提交",js:$.toString(function(h,u){return $("确认重新提交此任务？").confirm(function(x,link){try{var c=$.require("115Api").newClient();c.deleteOfflineTasks([String(x)],false);var dest=String(getItem("115HikerVisionCid","0")||"0");if(dest==="0")dest=String(getItem("115CloudDownloadCid","0")||"0");c.addOfflineTaskURIs([String(link)],dest);refreshPage(false);return "toast://已重新提交";}catch(e){return "toast://重新提交失败："+String(e.message||e);}},h,u);},hash,String(t.url))});
 d.push(item);
}
if(!shown&&pg===1)d.push({title:all.length?"当前没有符合筛选的任务":"暂无离线任务",desc:all.length?"切换筛选即可":"可在上方粘贴链接创建任务",col_type:"text_center_1"});
setResult(d);
})();
