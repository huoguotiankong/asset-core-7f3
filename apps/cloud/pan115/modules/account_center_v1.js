(function(){
/*__PAN115_ACCOUNT_CENTER_V1__*/
var d=[],api=$.require("115Api"),client=null,loginErr="";
try{client=api.newClient();}catch(e){loginErr=String(e.message||e);}
function first(o,keys,def){if(!o||typeof o!=="object")return def;for(var i=0;i<keys.length;i++){var k=keys[i];if(o[k]!==undefined&&o[k]!==null&&o[k]!=="")return o[k];}return def;}
function obj(v){return v&&typeof v==="object"?v:{};}
function num(v){var n=Number(v||0);return isNaN(n)?0:n;}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return String(n||0);}}
function fmtDate(v){var n=Number(v||0);if(!n)return"";if(n<100000000000)n*=1000;try{var t=new Date(n),m=t.getMonth()+1,dd=t.getDate();return t.getFullYear()+"-"+(m<10?"0":"")+m+"-"+(dd<10?"0":"")+dd;}catch(e){return"";}}
function sizeInfo(x){x=obj(x);var n=num(first(x,["size","Size"],0)),f=String(first(x,["sizeFormat","size_format","SizeFormat"],"")||"");return {n:n,t:f||(n?fmtSize(n):"")};}
function target(){var h="0",c="0";try{h=String(getItem("115HikerVisionCid","0")||"0");}catch(e){}try{c=String(getItem("115CloudDownloadCid","0")||"0");}catch(e2){}if(h!=="0")return{id:h,name:"海阔视界"};if(c!=="0")return{id:c,name:"云下载/离线下载"};return{id:"0",name:"根目录"};}
if(!client){
 d.push({title:"👤 115账号未连接",desc:loginErr||"请先完成登录",col_type:"text_center_1"});
 d.push({title:"登录 / 账号管理",col_type:"text_1",url:"hiker://page/115Account?rule=115.简&page=fypage"});
 setResult(d);return;
}
var user=null,info=null,userErr="",infoErr="";
try{if(typeof client.getUser==="function")user=client.getUser();}catch(e3){userErr=String(e3.message||e3);}
try{if(typeof client.getInfo==="function")info=client.getInfo();}catch(e4){infoErr=String(e4.message||e4);}
user=obj(user);info=obj(info);
var name=String(first(user,["userName","user_name","name"],"115用户")),face=String(first(user,["face","avatar"],"")||""),vip=num(first(user,["vip","Vip"],0)),expire=num(first(user,["expire","Expire"],0));
var hero={title:"👤 "+name,desc:"已登录"+(vip?" · VIP":"")+(expire?" · 到期 "+fmtDate(expire):""),col_type:face?"avatar":"text_1",url:"hiker://page/115Account?rule=115.简&page=fypage",extra:{lineVisible:false}};if(face)hero.pic_url=face;d.push(hero);
var sp=obj(first(info,["spaceInfo","space_info"],{})),total=sizeInfo(first(sp,["allTotal","all_total"],{})),used=sizeInfo(first(sp,["allUse","all_use"],{})),remain=sizeInfo(first(sp,["allRemain","all_remain"],{}));
if(total.n||used.n||remain.n||total.t||used.t||remain.t){var pct=total.n>0?Math.round(used.n*1000/total.n)/10:0;d.push({title:"☁ 存储空间",desc:(used.t?"已用 "+used.t:"")+(total.t?(used.t?" / ":"")+total.t:"")+(remain.t?" · 剩余 "+remain.t:"")+(total.n?" · "+pct+"%":""),col_type:"text_1",extra:{lineVisible:false}});}else d.push({title:"☁ 存储空间",desc:infoErr?"容量信息暂不可用":"当前驱动未返回容量信息",col_type:"text_1",extra:{lineVisible:false}});
d.push({title:"📁 文件",col_type:"text_4",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")});
d.push({title:"⬇ 离线",col_type:"text_4",url:"hiker://page/115OfflineCenter?rule=115.简&page=fypage"});
d.push({title:"🗑 回收",col_type:"text_4",url:"hiker://page/115Recycle?rule=115.简&page=fypage"});
d.push({title:"↻ 刷新",col_type:"text_4",url:$("刷新").lazyRule(function(){refreshPage(false);return"hiker://empty";})});
var tg=target();d.push({title:"离线保存目录",desc:tg.name,col_type:"text_1",url:tg.id!=="0"?("hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(tg.id)+"&cname="+encodeURIComponent(tg.name)):"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件"),extra:{lineVisible:false}});
d.push({title:"登录与账号管理",desc:"扫码登录、切换账号等继续使用原115账号页",col_type:"text_1",url:"hiker://page/115Account?rule=115.简&page=fypage",extra:{lineVisible:false}});
d.push({title:"诊断与高级设置",desc:"版本、缓存状态、界面状态重置",col_type:"text_1",url:"hiker://page/115AccountDiag?rule=115.简&page=fypage",extra:{lineVisible:false}});
if(userErr)d.push({title:"账号信息读取受限",desc:userErr,col_type:"text_center_1"});
setResult(d);
})();
