(function(){
function parseObj(s){try{var o=JSON.parse(String(s||"{}"));return o&&typeof o==="object"?o:{};}catch(e){return {};}}
function load(key){return parseObj(getItem(String(key),"{}"));}
function save(key,map){setItem(String(key),JSON.stringify(map||{}));}
function clear(key){setItem(String(key),"{}");}
function ids(map){var out=[];for(var k in map){if(Object.prototype.hasOwnProperty.call(map,k)&&map[k])out.push(String(k));}return out;}
function count(map){return ids(map).length;}
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
function encodeForm(form){var a=[];for(var k in form){if(!Object.prototype.hasOwnProperty.call(form,k))continue;var v=form[k];if(v===undefined||v===null)continue;a.push(encodeURIComponent(k)+"="+encodeURIComponent(String(v)));}return a.join("&");}
function buildSpec(op,part,sourceCid,targetCid,openMode){
 var form={},path="";
 if(openMode){
  if(op==="delete"){path="/open/ufile/delete";form={file_ids:part.join(","),parent_id:String(sourceCid||"0")};}
  else if(op==="copy"){path="/open/ufile/copy";form={pid:String(targetCid||"0"),file_id:part.join(","),no_dupli:"0"};}
  else if(op==="move"){path="/open/ufile/move";form={file_ids:part.join(","),to_cid:String(targetCid||"0")};}
 }else{
  if(op==="delete"){path="/rb/delete";form={pid:String(sourceCid||"0")};}
  else if(op==="copy"){path="/files/copy";form={pid:String(targetCid||"0")};}
  else if(op==="move"){path="/files/move";form={pid:String(targetCid||"0"),move_proid:""};}
  for(var i=0;i<part.length;i++)form["fid["+i+"]"]=String(part[i]);
 }
 if(!path)throw new Error("不支持的批量操作："+op);
 return {path:path,form:form};
}
function applySpec(t,spec){
 var urlHit=false,payloadHit=false,form=spec.form,path=spec.path;
 function rw(v,dep){
  if(dep>10||v===null||v===undefined)return v;
  if(typeof v==="string"){
   var s=String(v);
   if(s.indexOf("/open/rb/revert")>=0){urlHit=true;return s.replace("/open/rb/revert",path);}
   if(s.indexOf("/rb/revert")>=0){urlHit=true;return s.replace("/rb/revert",path);}
   if(/^\s*\{/.test(s)&&/(rid|tid|recycle_item_ids)/i.test(s)){try{payloadHit=true;return JSON.stringify(form);}catch(ej){}}
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
function exec(op,idList,sourceCid,targetCid){
 var all=[];for(var i=0;i<(idList||[]).length;i++){var s=String(idList[i]||"");if(s)all.push(s);}
 if(!all.length)return {ok:false,count:0,error:"没有已选项目"};
 if(all.length>1000)return {ok:false,count:0,error:"一次最多处理1000项，请分批操作"};
 if(op==="move"&&String(sourceCid||"0")===String(targetCid||"0"))return {ok:false,count:0,error:"目标目录与当前目录相同"};
 for(var j=0;j<all.length;j++)if((op==="move"||op==="copy")&&String(all[j])===String(targetCid||""))return {ok:false,count:0,error:"不能把已选文件夹复制/移动到它自身"};
 var done=0;
 try{
  var api=$.require("115Api"),c=api.newClient(),t=captureTransport(c),size=100;
  for(var p=0;p<all.length;p+=size){var part=all.slice(p,p+size),spec=buildSpec(op,part,sourceCid,targetCid,t.openMode);applySpec(t,spec);done+=part.length;}
  return {ok:true,count:done,mode:t.openMode?"openapi":"webapi"};
 }catch(ex){return {ok:false,count:done,error:String(ex.message||ex)};}
}
$.exports={load:load,save:save,clear:clear,ids:ids,count:count,exec:exec};
})();
