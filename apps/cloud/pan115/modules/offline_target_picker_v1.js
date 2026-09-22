(function(){
/*__PAN115_OFFLINE_TARGET_PICKER_V1__*/
var d=[],api=$.require("115Api"),client;
try{client=api.newClient();}catch(e){d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1",url:"hiker://page/115Account?rule=115.简&page=fypage"});setResult(d);return;}
function q(n,v){var x="";try{x=String(getParam(n,"")||"");}catch(e){}if(x){try{x=decodeURIComponent(x);}catch(e2){}return x;}try{if(typeof MY_PARAMS!=="undefined"&&MY_PARAMS&&MY_PARAMS[n]!=null)return String(MY_PARAMS[n]);}catch(e3){}return v||"";}
function parseTrail(raw,cid,cname){var a=[];try{a=JSON.parse(String(raw||"[]"));if(!(a instanceof Array))a=[];}catch(e){a=[];}if(!a.length)a.push({id:"0",name:"我的文件"});var last=a[a.length-1]||{};if(String(last.id||"")!==String(cid))a.push({id:String(cid),name:String(cname||"文件夹")});if(a.length>16)a=a.slice(a.length-16);return a;}
function trailText(a){var out=[];for(var i=0;i<a.length;i++)out.push(String((a[i]&&a[i].name)||"?"));return out.join(" › ");}
function current(){var id="0",name="自动选择";try{id=String(getItem("115OfflineCustomCid","0")||"0");}catch(e){}try{name=String(getItem("115OfflineCustomName","")||"");}catch(e2){}return{id:id,name:id!=="0"?(name||"自定义目录"):"自动选择"};}
var cid=q("cid","0"),cname=q("cname","我的文件"),trail=parseTrail(q("trail",""),cid,cname),trailJson=JSON.stringify(trail),pg=1;try{pg=parseInt(MY_PAGE||1,10)||1;}catch(e4){}
if(pg===1){
 var cur=current();
 d.push({title:"📁 离线保存目录",desc:trailText(trail),col_type:"text_1",extra:{lineVisible:false}});
 d.push({title:"✅ 设为这里",col_type:"text_4",url:$("确认把「"+cname+"」设为默认离线保存目录？").confirm(function(id,nm,tr){setItem("115OfflineCustomCid",String(id||"0"));setItem("115OfflineCustomName",String(nm||"我的文件"));setItem("115OfflineCustomTrail",String(tr||""));setItem("115OfflineTargetMode","custom");return "hiker://page/115OfflineCenter?rule=115.简&page=fypage";},cid,cname,trailJson)});
 d.push({title:"↺ 自动",col_type:"text_4",url:$("恢复自动选择保存目录？").confirm(function(){setItem("115OfflineCustomCid","0");setItem("115OfflineCustomName","");setItem("115OfflineCustomTrail","");setItem("115OfflineTargetMode","auto");return "hiker://page/115OfflineCenter?rule=115.简&page=fypage";})});
 d.push({title:"🏠 根目录",col_type:"text_4",url:"hiker://page/115OfflineTargetPicker?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")+"&trail="+encodeURIComponent(JSON.stringify([{id:"0",name:"我的文件"}]))});
 var up=trail.length>1?trail[trail.length-2]:null,upTrail=trail.length>1?trail.slice(0,trail.length-1):trail;
 d.push({title:"⬆ 上一级",col_type:"text_4",url:up?("hiker://page/115OfflineTargetPicker?rule=115.简&page=fypage&cid="+encodeURIComponent(String(up.id||"0"))+"&cname="+encodeURIComponent(String(up.name||"我的文件"))+"&trail="+encodeURIComponent(JSON.stringify(upTrail))):"toast://已经在根目录"});
 d.push({title:"＋ 新建",col_type:"text_4",url:$("","新建文件夹").input(function(parentId){var name=String(input||"").trim();if(!name)return "toast://已取消";try{var o=$.require("115FileOps"),r=o.mkdir(String(parentId),name);if(!r.ok)return "toast://新建失败："+r.error;refreshPage(false);return "toast://已新建「"+r.name+"」";}catch(ex){return "toast://新建失败："+String(ex.message||ex);}},cid)});
 if(cur.id!=="0")d.push({title:"当前默认："+cur.name,desc:"点击可直接打开当前默认目录",col_type:"text_1",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(cur.id)+"&cname="+encodeURIComponent(cur.name),extra:{lineVisible:false}});
}
var res;try{res=client.getFiles(String(cid),{offset:(pg-1)*50,pageSize:50,order:"file_name",asc:"1",showDir:"1"});}catch(e5){d.push({title:"读取文件夹失败",desc:String(e5.message||e5),col_type:"text_center_1"});setResult(d);return;}
var arr=(res&&res.files)||[],count=0;
for(var i=0;i<arr.length;i++){
 var f=arr[i]||{};if(!f.isDirectory)continue;var fid=String(f.fileId||""),name=String(f.name||"未命名");if(!fid)continue;count++;
 var child=trail.slice(0);child.push({id:fid,name:name});if(child.length>16)child=child.slice(child.length-16);
 d.push({title:"📁 "+name,col_type:"text_1",url:"hiker://page/115OfflineTargetPicker?rule=115.简&page=fypage&cid="+encodeURIComponent(fid)+"&cname="+encodeURIComponent(name)+"&trail="+encodeURIComponent(JSON.stringify(child))});
}
if(!count&&pg===1)d.push({title:"当前目录没有子文件夹",col_type:"text_center_1"});
setResult(d);
})();