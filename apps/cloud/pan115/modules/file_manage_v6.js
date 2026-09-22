(function(){
var d=[];
var api=$.require("115Api");
var client;
try{client=api.newClient();}catch(e){d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1",url:"hiker://page/115Account?rule=115.简&page=fypage"});setResult(d);return;}
function q(n,v){var x="";try{x=String(getParam(n,"")||"");}catch(e){}if(x){try{x=decodeURIComponent(x);}catch(e2){}return x;}try{if(typeof MY_PARAMS!=="undefined"&&MY_PARAMS&&MY_PARAMS[n]!=null)return String(MY_PARAMS[n]);}catch(e3){}return v||"";}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return "";}}
var cid=q("cid","0"),cname=q("cname","我的文件"),pageNo=1;try{pageNo=parseInt(MY_PAGE||1,10)||1;}catch(e4){}
if(pageNo===1){d.push({title:"📁 "+cname,col_type:"text_1",extra:{lineVisible:false}});d.push({title:"☑ 批量管理",col_type:"text_3",url:"hiker://page/115FileBatch?rule=115.简&page=fypage&cid="+encodeURIComponent(cid)+"&cname="+encodeURIComponent(cname)});d.push({title:"🗑 回收站",col_type:"text_3",url:"hiker://page/115Recycle?rule=115.简&page=fypage"});d.push({title:"↻ 刷新",col_type:"text_3",url:$("刷新").lazyRule(function(){refreshPage(false);return false;})});}
var res;try{res=client.getFiles(String(cid),{offset:(pageNo-1)*50,pageSize:50,order:"file_name",asc:"1",showDir:"1"});}catch(e5){d.push({title:"读取文件失败",desc:String(e5.message||e5),col_type:"text_center_1"});setResult(d);return;}
var arr=(res&&res.files)||[];
for(var i=0;i<arr.length;i++){
 var f=arr[i]||{},fid=String(f.fileId||""),name=String(f.name||"未命名"),isDir=!!f.isDirectory;
 var item={title:(isDir?"📁 ":"📄 ")+name,desc:isDir?"":fmtSize(f.size),col_type:"text_1",url:"toast://长按可管理",extra:{longClick:[]}};
 if(isDir)item.url="hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(fid)+"&cname="+encodeURIComponent(name);else{var kind="";try{kind=api.tool.fileKind(name);}catch(e6){}if(kind==="video")item.url=$().lazyRule(api.player.resolve,JSON.stringify({pc:f.pickCode||"",fid:fid,name:name,kind:"video"}));}
 item.extra.longClick.push({title:"删除到回收站",js:$.toString(function(id,nm){return $("确认删除「"+nm+"」？\n删除后可在回收站还原").confirm(function(fileId){
  try{
   var api2=$.require("115Api"),c=api2.newClient(),sid=String(fileId);
   function ck(r){if(r===undefined||r===null||r==="")return r;if(typeof r==="string"){var s=String(r);if(/^\s*</.test(s))throw new Error("接口返回HTML");try{r=JSON.parse(s);}catch(ep){return r;}}if(r&&r.state===false)throw new Error(r.error||r.msg||"115返回失败");if(r&&r.code!==undefined&&Number(r.code)!==0&&Number(r.code)!==200)throw new Error(r.message||r.msg||("115返回code="+r.code));return r;}
   if(c&&typeof c.deleteFiles==="function"){ck(c.deleteFiles([sid]));refreshPage(false);return "toast://已移入回收站";}
   if(!c||typeof c.request!=="function"||typeof c.revertRecycleBin!=="function")throw new Error("当前115Api缺少可复用的认证传输层");
   var orig=c.request,captured=null,spy=function(){captured=Array.prototype.slice.call(arguments);return {state:true,code:0,data:{}};},replaced=false;
   try{c.request=spy;replaced=(c.request===spy);}catch(es){}
   if(!replaced)throw new Error("115Api.request不可接管");
   try{c.revertRecycleBin(["__hiker_transport_probe__"]);}catch(probeErr){}
   try{c.request=orig;}catch(erestore){}
   if(!captured||!captured.length)throw new Error("未捕获到revertRecycleBin的request调用；request参数数="+String(orig.length||0));
   var urlHit=false,payloadHit=false;
   function copyRewrite(v,depth){
    if(depth>8)return v;
    if(v===null||v===undefined)return v;
    if(typeof v==="string"){
     var s=String(v);
     if(/\/rb\/(revert|clean)(?=\?|#|$)/i.test(s)){urlHit=true;return s.replace(/\/rb\/(revert|clean)(?=\?|#|$)/i,"/rb/delete");}
     if(/^\s*\{/.test(s)&&/(rid|password|recycle_item_ids)/i.test(s)){try{return JSON.stringify(copyRewrite(JSON.parse(s),depth+1));}catch(ej){}}
     if(/(^|&)(rid(%5B|\[)|password=|recycle_item_ids=|tid=)/i.test(s)){payloadHit=true;return "fid%5B0%5D="+encodeURIComponent(sid);}
     return s;
    }
    if(v instanceof Array){var a=[];for(var ai=0;ai<v.length;ai++)a.push(copyRewrite(v[ai],depth+1));return a;}
    if(typeof v==="object"){
     var o={},localPayload=false;
     for(var k in v){if(!Object.prototype.hasOwnProperty.call(v,k))continue;
      if(/^(password|rid|rids|recycle_item_ids|tid)(\[.*\])?$/i.test(k)){localPayload=true;continue;}
      var nv=copyRewrite(v[k],depth+1);o[k]=nv;
     }
     if(localPayload){o["fid[0]"]=sid;payloadHit=true;}
     return o;
    }
    return v;
   }
   var args=[];for(var z=0;z<captured.length;z++)args.push(copyRewrite(captured[z],0));
   if(!urlHit)throw new Error("已捕获认证请求，但未识别rb/revert地址");
   if(!payloadHit)throw new Error("已捕获认证请求，但未识别rid参数");
   var out=orig.apply(c,args);ck(out);
   refreshPage(false);return "toast://已移入回收站";
  }catch(ex){return "toast://删除失败："+String(ex.message||ex);}
 },id);},fid,name)});
 d.push(item);
}
if(!arr.length&&pageNo===1)d.push({title:"这里是空的",col_type:"text_center_1"});
setResult(d);
})();
