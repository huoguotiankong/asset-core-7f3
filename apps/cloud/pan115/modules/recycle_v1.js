(function(){
var d=[];
var api=$.require("115Api"),client;
try{client=api.newClient();}catch(e){d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1"});setResult(d);return;}
function cookieFrom(obj,depth,seen){if(!obj||depth<0)return"";seen=seen||[];for(var si=0;si<seen.length;si++)if(seen[si]===obj)return"";seen.push(obj);try{for(var k in obj){var v=obj[k];if(typeof v==="string"&&v.indexOf("UID=")>=0&&v.indexOf("CID=")>=0)return v;if(v&&typeof v==="object"&&depth>0){var r=cookieFrom(v,depth-1,seen);if(r)return r;}}}catch(e){}return"";}
function cookie(){var c="";try{if(api&&typeof api.getCookie==="function")c=String(api.getCookie()||"");}catch(e){}if(!c)try{c=String(getCookie("https://115.com")||"");}catch(e2){}if(!c)try{c=String(getCookie("https://webapi.115.com")||"");}catch(e3){}if(!c)c=cookieFrom(client,2,[]);return c;}
function headers(){var ck=cookie();if(!ck)throw new Error("未能读取115登录Cookie");return{"Cookie":ck,"User-Agent":"Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36","Referer":"https://115.com/","Origin":"https://115.com"};}
function jsonReq(url,opt){var tx=request(url,opt||{});if(!tx||/^\s*</.test(tx))throw new Error("115接口返回非JSON");var j=JSON.parse(tx);if(j.state===false)throw new Error(j.error||j.msg||"请求失败");return j;}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return"";}}
var p=1;try{p=parseInt(MY_PAGE||1,10)||1;}catch(e4){}
if(p===1){d.push({title:"🗑 回收站",col_type:"text_1",extra:{lineVisible:false}});d.push({title:"↻ 刷新",col_type:"text_2",url:$("刷新").lazyRule(function(){refreshPage(false);return false;})});d.push({title:"📁 文件管理",col_type:"text_2",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")});}
var offset=(p-1)*40,j;
try{j=jsonReq("https://webapi.115.com/rb?aid=7&cid=0&format=json&offset="+offset+"&limit=40",{timeout:10000,headers:headers()});}
catch(e5){d.push({title:"读取回收站失败",desc:String(e5.message||e5),col_type:"text_center_1"});setResult(d);return;}
var a=j.data||[];
for(var i=0;i<a.length;i++){
 var x=a[i]||{},rid=String(x.id||""),name=String(x.file_name||"未命名");
 var desc=fmtSize(x.file_size||0);if(x.parent_name)desc+=(desc?" · ":"")+"原位置："+x.parent_name;
 d.push({title:"🗑 "+name,desc:desc,col_type:"text_1",url:$("还原「"+name+"」？").confirm(function(id){
  var api2=$.require("115Api"),c=api2.newClient();
  function cf(o,dep,seen){if(!o||dep<0)return"";seen=seen||[];for(var si=0;si<seen.length;si++)if(seen[si]===o)return"";seen.push(o);try{for(var k in o){var v=o[k];if(typeof v==="string"&&v.indexOf("UID=")>=0&&v.indexOf("CID=")>=0)return v;if(v&&typeof v==="object"&&dep>0){var r=cf(v,dep-1,seen);if(r)return r;}}}catch(e){}return"";}
  var ck="";try{if(api2&&typeof api2.getCookie==="function")ck=String(api2.getCookie()||"");}catch(e){}if(!ck)try{ck=String(getCookie("https://115.com")||"");}catch(e2){}if(!ck)try{ck=String(getCookie("https://webapi.115.com")||"");}catch(e3){}if(!ck)ck=cf(c,2,[]);if(!ck)return"toast://未能读取115登录Cookie";
  try{var tx=request("https://webapi.115.com/rb/revert",{method:"POST",timeout:10000,headers:{"Cookie":ck,"User-Agent":"Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36","Referer":"https://115.com/","Origin":"https://115.com","Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},body:"rid%5B0%5D="+encodeURIComponent(String(id))});if(!tx||/^\s*</.test(tx))throw new Error("接口返回非JSON");var jj=JSON.parse(tx);if(jj.state===false)throw new Error(jj.error||jj.msg||"还原失败");refreshPage(false);return"toast://已还原";}catch(ex){return"toast://还原失败："+String(ex.message||ex);}
 },rid)});
}
if(!a.length&&p===1)d.push({title:"回收站为空",col_type:"text_center_1"});
setResult(d);
})();