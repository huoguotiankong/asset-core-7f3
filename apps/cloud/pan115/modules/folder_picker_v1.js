(function(){
var d=[],api=$.require("115Api"),ops=$.require("115BatchOps"),client;
try{client=api.newClient();}catch(e){d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1"});setResult(d);return;}
function q(n,v){var x="";try{x=String(getParam(n,"")||"");}catch(e){}if(x){try{x=decodeURIComponent(x);}catch(e2){}return x;}try{if(typeof MY_PARAMS!=="undefined"&&MY_PARAMS&&MY_PARAMS[n]!=null)return String(MY_PARAMS[n]);}catch(e3){}return v||"";}
var op=q("op","copy"),selKey=q("selKey",""),sourceCid=q("sourceCid","0"),sourceName=q("sourceName","我的文件"),cid=q("cid","0"),cname=q("cname","根目录"),pageNo=1;try{pageNo=parseInt(MY_PAGE||1,10)||1;}catch(e4){}
var selected=ops.load(selKey),n=ops.count(selected),verb=op==="move"?"移动":"复制";
if(pageNo===1){
 d.push({title:"📂 选择目标文件夹",desc:"已选 "+n+" 项 · 当前："+cname,col_type:"text_1",extra:{lineVisible:false}});
 d.push({title:"✅ "+verb+"到这里",col_type:"text_2",url:$("确认将已选"+n+"项"+verb+"到「"+cname+"」？").confirm(function(operation,key,srcCid,srcName,targetCid,targetName){try{var o=$.require("115BatchOps"),m=o.load(key),list=o.ids(m);if(!list.length)return "toast://选择已失效，请返回重新选择";var r=o.exec(operation,list,String(srcCid),String(targetCid));if(!r.ok)return "toast://"+(operation==="move"?"移动":"复制")+"失败"+(r.count?"（已处理"+r.count+"项）":"")+"："+r.error;o.clear(key);return "hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(srcCid)+"&cname="+encodeURIComponent(srcName);}catch(ex){return "toast://操作失败："+String(ex.message||ex);}},op,selKey,sourceCid,sourceName,cid,cname)});
 d.push({title:"🏠 根目录",col_type:"text_2",url:"hiker://page/115FolderPicker?rule=115.简&page=fypage&op="+encodeURIComponent(op)+"&selKey="+encodeURIComponent(selKey)+"&sourceCid="+encodeURIComponent(sourceCid)+"&sourceName="+encodeURIComponent(sourceName)+"&cid=0&cname="+encodeURIComponent("根目录")});
}
var res;try{res=client.getFiles(String(cid),{offset:(pageNo-1)*50,pageSize:50,order:"file_name",asc:"1",showDir:"1"});}catch(e5){d.push({title:"读取文件夹失败",desc:String(e5.message||e5),col_type:"text_center_1"});setResult(d);return;}
var arr=(res&&res.files)||[],dirs=[];for(var i=0;i<arr.length;i++)if(arr[i]&&arr[i].isDirectory)dirs.push(arr[i]);
for(var j=0;j<dirs.length;j++){
 var f=dirs[j]||{},fid=String(f.fileId||""),name=String(f.name||"未命名");if(!fid)continue;
 d.push({title:"📁 "+name,col_type:"text_1",url:"hiker://page/115FolderPicker?rule=115.简&page=fypage&op="+encodeURIComponent(op)+"&selKey="+encodeURIComponent(selKey)+"&sourceCid="+encodeURIComponent(sourceCid)+"&sourceName="+encodeURIComponent(sourceName)+"&cid="+encodeURIComponent(fid)+"&cname="+encodeURIComponent(name)});
}
if(!dirs.length&&pageNo===1)d.push({title:"当前目录没有子文件夹",col_type:"text_center_1"});
setResult(d);
})();
