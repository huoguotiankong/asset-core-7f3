(function(){
var d=[];
var api=$.require("115Api");
var client;
try{client=api.newClient();}catch(e){d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1",url:"hiker://page/115Account?rule=115.简&page=fypage"});setResult(d);return;}
function q(n,v){var x="";try{x=String(getParam(n,"")||"");}catch(e){}if(x){try{x=decodeURIComponent(x);}catch(e2){}return x;}try{if(typeof MY_PARAMS!=="undefined"&&MY_PARAMS&&MY_PARAMS[n]!=null)return String(MY_PARAMS[n]);}catch(e3){}return v||"";}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return "";}}
function parseResp(r){if(r===undefined||r===null||r==="")return r;if(typeof r==="string"){var s=String(r);if(/^\s*</.test(s))throw new Error("115接口返回HTML");try{r=JSON.parse(s);}catch(e){return r;}}if(r&&r.state===false)throw new Error(r.error||r.msg||"115返回失败");if(r&&r.code!==undefined&&Number(r.code)!==0&&Number(r.code)!==200)throw new Error(r.message||r.msg||("115返回code="+r.code));return r;}
function requestDelete(c,id){var sid=String(id),body="fid%5B0%5D="+encodeURIComponent(sid),last="";
 var methods=["deleteFiles","deleteFile","removeFiles","removeFile","trashFiles","trashFile","fsDelete"];
 for(var i=0;i<methods.length;i++){var n=methods[i];try{if(c&&typeof c[n]==="function"){var args=(n==="deleteFile"||n==="removeFile"||n==="trashFile")?[sid]:[[sid]];parseResp(c[n].apply(c,args));return true;}}catch(e0){last=n+"："+String(e0.message||e0);}}
 if(!c||typeof c.request!=="function")throw new Error((last?last+"；":"")+"当前115Api没有request入口");
 var url="https://webapi.115.com/rb/delete";
 var tries=[
  {url:url,method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},body:body},
  {url:url,method:"POST",form:{"fid[0]":sid}},
  {url:url,method:"POST",data:{"fid[0]":sid}}
 ];
 for(var j=0;j<tries.length;j++){try{parseResp(c.request(tries[j]));return true;}catch(e1){last="request#"+(j+1)+"："+String(e1.message||e1);}}
 throw new Error(last||"删除请求失败");
}
var cid=q("cid","0"),cname=q("cname","我的文件"),pageNo=1;try{pageNo=parseInt(MY_PAGE||1,10)||1;}catch(e4){}
if(pageNo===1){d.push({title:"📁 "+cname,col_type:"text_1",extra:{lineVisible:false}});d.push({title:"🗑 回收站",col_type:"text_2",url:"hiker://page/115Recycle?rule=115.简&page=fypage"});d.push({title:"↻ 刷新",col_type:"text_2",url:$("刷新").lazyRule(function(){refreshPage(false);return false;})});}
var res;try{res=client.getFiles(String(cid),{offset:(pageNo-1)*50,pageSize:50,order:"file_name",asc:"1",showDir:"1"});}catch(e5){d.push({title:"读取文件失败",desc:String(e5.message||e5),col_type:"text_center_1"});setResult(d);return;}
var arr=(res&&res.files)||[];
for(var i=0;i<arr.length;i++){
 var f=arr[i]||{},fid=String(f.fileId||""),name=String(f.name||"未命名"),isDir=!!f.isDirectory;
 var item={title:(isDir?"📁 ":"📄 ")+name,desc:isDir?"":fmtSize(f.size),col_type:"text_1",url:"toast://长按可管理",extra:{longClick:[]}};
 if(isDir)item.url="hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(fid)+"&cname="+encodeURIComponent(name);else{var kind="";try{kind=api.tool.fileKind(name);}catch(e6){}if(kind==="video")item.url=$().lazyRule(api.player.resolve,JSON.stringify({pc:f.pickCode||"",fid:fid,name:name,kind:"video"}));}
 item.extra.longClick.push({title:"删除到回收站",js:$.toString(function(id,nm){return $("确认删除「"+nm+"」？\n删除后可在回收站还原").confirm(function(fileId){try{var api2=$.require("115Api"),c=api2.newClient(),sid=String(fileId),body="fid%5B0%5D="+encodeURIComponent(sid),last="";function ck(r){if(r===undefined||r===null||r==="")return r;if(typeof r==="string"){var s=String(r);if(/^\s*</.test(s))throw new Error("接口返回HTML");try{r=JSON.parse(s);}catch(ep){return r;}}if(r&&r.state===false)throw new Error(r.error||r.msg||"115返回失败");if(r&&r.code!==undefined&&Number(r.code)!==0&&Number(r.code)!==200)throw new Error(r.message||r.msg||("115返回code="+r.code));return r;}var names=["deleteFiles","deleteFile","removeFiles","removeFile","trashFiles","trashFile","fsDelete"],done=false;for(var k=0;k<names.length&&!done;k++){var n=names[k];try{if(c&&typeof c[n]==="function"){var a=(n==="deleteFile"||n==="removeFile"||n==="trashFile")?[sid]:[[sid]];ck(c[n].apply(c,a));done=true;}}catch(em){last=n+"："+String(em.message||em);}}if(!done&&c&&typeof c.request==="function"){var u="https://webapi.115.com/rb/delete",ts=[{url:u,method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},body:body},{url:u,method:"POST",form:{"fid[0]":sid}},{url:u,method:"POST",data:{"fid[0]":sid}}];for(var z=0;z<ts.length&&!done;z++){try{ck(c.request(ts[z]));done=true;}catch(er){last="request#"+(z+1)+"："+String(er.message||er);}}}if(!done)return "toast://删除失败："+(last||"无可用删除入口");refreshPage(false);return "toast://已移入回收站";}catch(ex){return "toast://删除失败："+String(ex.message||ex);}},id);},fid,name)});
 d.push(item);
}
if(!arr.length&&pageNo===1)d.push({title:"这里是空的",col_type:"text_center_1"});
setResult(d);
})();