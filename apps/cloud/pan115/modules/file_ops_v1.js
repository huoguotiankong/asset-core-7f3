(function(){
function checkResp(r){
 if(r===undefined||r===null||r==="")return r;
 if(typeof r==="string"){
  var s=String(r);if(/^\s*</.test(s))throw new Error("接口返回HTML");
  try{r=JSON.parse(s);}catch(e){return r;}
 }
 if(r&&r.state===false)throw new Error(r.error||r.msg||r.message||"115返回失败");
 if(r&&r.errno!==undefined&&Number(r.errno)!==0)throw new Error(r.error||r.msg||r.message||("115返回errno="+r.errno));
 if(r&&r.code!==undefined&&Number(r.code)!==0&&Number(r.code)!==200)throw new Error(r.message||r.msg||r.error||("115返回code="+r.code));
 return r;
}
function captureTransport(c){
 if(!c||typeof c.request!=="function"||typeof c.revertRecycleBin!=="function")throw new Error("当前115Api缺少可复用认证传输层");
 var orig=c.request,captured=null,replaced=false;
 var spy=function(){captured=Array.prototype.slice.call(arguments);return {state:true,code:0,data:{}};};
 try{c.request=spy;replaced=(c.request===spy);}catch(e){}
 if(!replaced)throw new Error("115Api.request不可接管");
 try{c.revertRecycleBin(["__hiker_transport_probe__"]);}catch(e2){}
 try{c.request=orig;}catch(e3){}
 if(!captured||!captured.length)throw new Error("未捕获到revertRecycleBin的认证请求");
 var openMode=false;
 function scan(v,dep){
  if(dep>8||v===null||v===undefined)return;
  if(typeof v==="string"){if(String(v).indexOf("/open/rb/revert")>=0)openMode=true;return;}
  if(v instanceof Array){for(var i=0;i<v.length;i++)scan(v[i],dep+1);return;}
  if(typeof v==="object"){for(var k in v)if(Object.prototype.hasOwnProperty.call(v,k))scan(v[k],dep+1);}
 }
 scan(captured,0);
 return {client:c,orig:orig,args:captured,openMode:openMode};
}
function encodeForm(form){
 var a=[];for(var k in form){if(!Object.prototype.hasOwnProperty.call(form,k))continue;var v=form[k];if(v===undefined||v===null)continue;a.push(encodeURIComponent(k)+"="+encodeURIComponent(String(v)));}return a.join("&");
}
function applySpec(t,path,form){
 var urlHit=false,payloadHit=false;
 function rw(v,dep){
  if(dep>10||v===null||v===undefined)return v;
  if(typeof v==="string"){
   var s=String(v);
   if(s.indexOf("/open/rb/revert")>=0){urlHit=true;return s.replace("/open/rb/revert",path);}
   if(s.indexOf("/rb/revert")>=0){urlHit=true;return s.replace("/rb/revert",path);}
   if(/^\s*\{/.test(s)&&/(rid|tid|recycle_item_ids)/i.test(s)){payloadHit=true;return JSON.stringify(form);}
   if(/(^|&)(rid(%5B|\[)|tid=|recycle_item_ids=)/i.test(s)){payloadHit=true;return encodeForm(form);}
   return s;
  }
  if(v instanceof Array){var a=[];for(var i=0;i<v.length;i++)a.push(rw(v[i],dep+1));return a;}
  if(typeof v==="object"){
   var o={},local=false;
   for(var k in v){if(!Object.prototype.hasOwnProperty.call(v,k))continue;
    if(/^(rid|rids|tid|recycle_item_ids)(\[.*\])?$/i.test(k)){local=true;continue;}
    o[k]=rw(v[k],dep+1);
   }
   if(local){for(var fk in form)if(Object.prototype.hasOwnProperty.call(form,fk))o[fk]=form[fk];payloadHit=true;}
   return o;
  }
  return v;
 }
 var args=[];for(var z=0;z<t.args.length;z++)args.push(rw(t.args[z],0));
 if(!urlHit)throw new Error("认证请求模板中未识别回收站还原地址");
 if(!payloadHit)throw new Error("认证请求模板中未识别回收站业务参数");
 return checkResp(t.orig.apply(t.client,args));
}
function cleanName(name){
 var s=String(name||"").trim();
 if(!s)throw new Error("名称不能为空");
 if(s.length>255)throw new Error("名称不能超过255个字符");
 if(s==="."||s==="..")throw new Error("不能使用该名称");
 return s;
}
function mkdir(parentCid,name){
 try{
  var n=cleanName(name),api=$.require("115Api"),c=api.newClient(),t=captureTransport(c);
  var path=t.openMode?"/open/folder/add":"/files/add";
  var form=t.openMode?{pid:String(parentCid||"0"),file_name:n}:{pid:String(parentCid||"0"),cname:n};
  var r=applySpec(t,path,form);
  return {ok:true,name:n,mode:t.openMode?"openapi":"webapi",raw:r};
 }catch(ex){return {ok:false,error:String(ex.message||ex)};}
}
function rename(fileId,newName,oldName){
 try{
  var id=String(fileId||"");if(!id)throw new Error("缺少文件ID");
  var n=cleanName(newName),old=String(oldName||"");
  if(old&&n===old)return {ok:false,error:"新名称与原名称相同"};
  var api=$.require("115Api"),c=api.newClient(),t=captureTransport(c);
  var path=t.openMode?"/open/ufile/update":"/files/edit";
  var form=t.openMode?{file_id:id,file_name:n}:{fid:id,file_name:n};
  var r=applySpec(t,path,form);
  return {ok:true,name:n,mode:t.openMode?"openapi":"webapi",raw:r};
 }catch(ex){return {ok:false,error:String(ex.message||ex)};}
}
$.exports={mkdir:mkdir,rename:rename};
})();
