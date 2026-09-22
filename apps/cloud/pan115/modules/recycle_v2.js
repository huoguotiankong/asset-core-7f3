(function(){
var d=[];
var api=$.require("115Api"),client;
try{client=api.newClient();}catch(e){d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1"});setResult(d);return;}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return"";}}
function listRecycle(c,offset,limit){
 var fn=null;
 try{if(c&&typeof c.listRecycleBin==="function")fn=c.listRecycleBin;}catch(e){}
 if(!fn)try{if(c&&typeof c.getRecycleBin==="function")fn=c.getRecycleBin;}catch(e2){}
 if(!fn)throw new Error("当前115Api未提供回收站列表方法");
 return fn.call(c,Number(offset||0),Number(limit||40));
}
function restoreRecycle(c,ids){
 var fn=null;
 try{if(c&&typeof c.revertRecycleBin==="function")fn=c.revertRecycleBin;}catch(e){}
 if(!fn)try{if(c&&typeof c.restoreRecycleBin==="function")fn=c.restoreRecycleBin;}catch(e2){}
 if(!fn)throw new Error("当前115Api未提供回收站还原方法");
 return fn.call(c,ids);
}
var p=1;try{p=parseInt(MY_PAGE||1,10)||1;}catch(e3){}
if(p===1){
 d.push({title:"🗑 回收站",col_type:"text_1",extra:{lineVisible:false}});
 d.push({title:"↻ 刷新",col_type:"text_2",url:$("刷新").lazyRule(function(){refreshPage(false);return false;})});
 d.push({title:"📁 文件管理",col_type:"text_2",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")});
}
var offset=(p-1)*40,raw;
try{raw=listRecycle(client,offset,40);}catch(e4){d.push({title:"读取回收站失败",desc:String(e4.message||e4),col_type:"text_center_1"});setResult(d);return;}
var a=[];
if(raw instanceof Array)a=raw;
else if(raw&&raw.data instanceof Array)a=raw.data;
else if(raw&&raw.items instanceof Array)a=raw.items;
else if(raw&&raw.list instanceof Array)a=raw.list;
for(var i=0;i<a.length;i++){
 var x=a[i]||{};
 var rid=String(x.fileId||x.file_id||x.id||x.rid||"");
 var name=String(x.fileName||x.file_name||x.name||"未命名");
 var size=Number(x.fileSize||x.file_size||x.size||0);
 var parent=String(x.parentName||x.parent_name||"");
 var desc=fmtSize(size);if(parent)desc+=(desc?" · ":"")+"原位置："+parent;
 d.push({title:"🗑 "+name,desc:desc,col_type:"text_1",url:$("还原「"+name+"」？").confirm(function(id){
  try{
   var api2=$.require("115Api"),c=api2.newClient(),fn=null;
   try{if(c&&typeof c.revertRecycleBin==="function")fn=c.revertRecycleBin;}catch(e0){}
   if(!fn)try{if(c&&typeof c.restoreRecycleBin==="function")fn=c.restoreRecycleBin;}catch(e1){}
   if(!fn)return "toast://当前115Api未提供回收站还原方法";
   fn.call(c,[String(id)]);
   refreshPage(false);
   return "toast://已还原";
  }catch(ex){return "toast://还原失败："+String(ex.message||ex);}
 },rid)});
}
if(!a.length&&p===1)d.push({title:"回收站为空",col_type:"text_center_1"});
setResult(d);
})();