(function(){
var d=[];
var api=$.require("115Api");
var client;
try{client=api.newClient();}catch(e){
 d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1",url:"hiker://page/115Account?rule=115.简&page=fypage"});
 setResult(d);return;
}
function q(n,v){
 var x="";try{x=String(getParam(n,"")||"");}catch(e){}
 if(x){try{x=decodeURIComponent(x);}catch(e2){}return x;}
 try{if(typeof MY_PARAMS!=="undefined"&&MY_PARAMS&&MY_PARAMS[n]!=null)return String(MY_PARAMS[n]);}catch(e3){}
 return v||"";
}
function cookieFrom(obj,depth,seen){
 if(!obj||depth<0)return "";
 seen=seen||[];
 for(var si=0;si<seen.length;si++)if(seen[si]===obj)return "";
 seen.push(obj);
 try{
  for(var k in obj){
   var v=obj[k];
   if(typeof v==="string"&&v.indexOf("UID=")>=0&&v.indexOf("CID=")>=0)return v;
   if(v&&typeof v==="object"&&depth>0){var r=cookieFrom(v,depth-1,seen);if(r)return r;}
  }
 }catch(e){}
 return "";
}
function cookie(){
 var c="";
 try{if(api&&typeof api.getCookie==="function")c=String(api.getCookie()||"");}catch(e){}
 if(!c)try{c=String(getCookie("https://115.com")||"");}catch(e2){}
 if(!c)try{c=String(getCookie("https://webapi.115.com")||"");}catch(e3){}
 if(!c)c=cookieFrom(client,2,[]);
 return c;
}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return "";}}
var cid=q("cid","0");
var cname=q("cname","我的文件");
var pageNo=1;try{pageNo=parseInt(MY_PAGE||1,10)||1;}catch(e4){}
if(pageNo===1){
 d.push({title:"📁 "+cname,col_type:"text_1",extra:{lineVisible:false}});
 d.push({title:"🗑 回收站",col_type:"text_2",url:"hiker://page/115Recycle?rule=115.简&page=fypage"});
 d.push({title:"↻ 刷新",col_type:"text_2",url:$("刷新").lazyRule(function(){refreshPage(false);return false;})});
}
var res;
try{res=client.getFiles(String(cid),{offset:(pageNo-1)*50,pageSize:50,order:"file_name",asc:"1",showDir:"1"});}
catch(e5){d.push({title:"读取文件失败",desc:String(e5.message||e5),col_type:"text_center_1"});setResult(d);return;}
var arr=(res&&res.files)||[];
for(var i=0;i<arr.length;i++){
 var f=arr[i]||{};
 var fid=String(f.fileId||"");
 var name=String(f.name||"未命名");
 var isDir=!!f.isDirectory;
 var item={title:(isDir?"📁 ":"📄 ")+name,desc:isDir?"":fmtSize(f.size),col_type:"text_1",url:"toast://长按可删除",extra:{longClick:[]}};
 if(isDir)item.url="hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(fid)+"&cname="+encodeURIComponent(name);
 else{
  var kind="";try{kind=api.tool.fileKind(name);}catch(e6){}
  if(kind==="video")item.url=$().lazyRule(api.player.resolve,JSON.stringify({pc:f.pickCode||"",fid:fid,name:name,kind:"video"}));
 }
 item.extra.longClick.push({title:"删除到回收站",js:$.toString(function(id,nm){
  return $("确认删除「"+nm+"」？\n删除后可在回收站还原").confirm(function(fileId){
   var api2=$.require("115Api"),c=api2.newClient();
   function cf(o,dep,seen){if(!o||dep<0)return"";seen=seen||[];for(var si=0;si<seen.length;si++)if(seen[si]===o)return"";seen.push(o);try{for(var k in o){var v=o[k];if(typeof v==="string"&&v.indexOf("UID=")>=0&&v.indexOf("CID=")>=0)return v;if(v&&typeof v==="object"&&dep>0){var r=cf(v,dep-1,seen);if(r)return r;}}}catch(e){}return"";}
   var ck="";try{if(api2&&typeof api2.getCookie==="function")ck=String(api2.getCookie()||"");}catch(e){}if(!ck)try{ck=String(getCookie("https://115.com")||"");}catch(e2){}if(!ck)try{ck=String(getCookie("https://webapi.115.com")||"");}catch(e3){}if(!ck)ck=cf(c,2,[]);if(!ck)return"toast://未能读取115登录Cookie";
   try{var tx=request("https://webapi.115.com/rb/delete",{method:"POST",timeout:10000,headers:{"Cookie":ck,"User-Agent":"Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36","Referer":"https://115.com/","Origin":"https://115.com","Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},body:"fid%5B0%5D="+encodeURIComponent(String(fileId))});if(!tx||/^\s*</.test(tx))throw new Error("接口返回非JSON");var jj=JSON.parse(tx);if(jj.state===false)throw new Error(jj.error||jj.msg||"删除失败");refreshPage(false);return"toast://已移入回收站";}catch(ex){return"toast://删除失败："+String(ex.message||ex);}
  },id);
 },fid,name)});
 d.push(item);
}
if(!arr.length&&pageNo===1)d.push({title:"这里是空的",col_type:"text_center_1"});
setResult(d);
})();