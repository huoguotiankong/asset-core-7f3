(function(){
var d=[],api=$.require("115Api"),client;
try{client=api.newClient();}catch(e){d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1"});setResult(d);return;}
function q(n,v){var x="";try{x=String(getParam(n,"")||"");}catch(e){}if(x){try{x=decodeURIComponent(x);}catch(e2){}return x;}try{if(typeof MY_PARAMS!=="undefined"&&MY_PARAMS&&MY_PARAMS[n]!=null)return String(MY_PARAMS[n]);}catch(e3){}return v||"";}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return String(n||"");}}
function fmtTime(v){if(v===undefined||v===null||v==="")return"";var s=String(v);if(/^\d+$/.test(s)){try{var n=Number(s);if(n<100000000000)n*=1000;var dt=new Date(n);function p(x){return x<10?"0"+x:String(x);}return dt.getFullYear()+"-"+p(dt.getMonth()+1)+"-"+p(dt.getDate())+" "+p(dt.getHours())+":"+p(dt.getMinutes())+":"+p(dt.getSeconds());}catch(e){return s;}}return s;}
function val(o,names,fallback){for(var i=0;i<names.length;i++){var k=names[i];try{if(o&&o[k]!==undefined&&o[k]!==null&&String(o[k])!=="")return o[k];}catch(e){}}return fallback;}
function kindLabel(name,isDir){if(isDir)return"文件夹";var k="";try{k=String(api.tool.fileKind(name)||"");}catch(e){}if(k==="video")return"视频";if(k==="image")return"图片";if(k==="audio")return"音频";if(k==="document")return"文档";return"文件";}
var fid=q("fid",""),fallbackName=q("name","未命名"),isDir=q("dir","0")==="1",fallbackSize=Number(q("size","0")||0),fallbackPc=q("pc",""),sourceCid=q("sourceCid","0"),sourceName=q("sourceName","我的文件"),sourceTrail=q("sourceTrail","");
if(!fid){d.push({title:"缺少文件ID",col_type:"text_center_1"});setResult(d);return;}
var f=null;try{if(client&&typeof client.getFile==="function")f=client.getFile(String(fid));}catch(e2){}
if(!f||typeof f!=="object")f={};
var name=String(val(f,["name","fileName","file_name"],fallbackName)||fallbackName),size=Number(val(f,["size","fileSize","file_size"],fallbackSize)||0),pc=String(val(f,["pickCode","pick_code","pc"],fallbackPc)||""),sha1=String(val(f,["sha1","sha","file_sha1"],"")||""),parentId=String(val(f,["parentId","parent_id","pid","cid"],sourceCid)||sourceCid),ctime=fmtTime(val(f,["createTime","create_time","user_ctime","ctime"],"")),mtime=fmtTime(val(f,["updateTime","update_time","user_utime","mtime","time"],""));
try{if(f.isDirectory!==undefined)isDir=!!f.isDirectory;}catch(e3){}
var kind=kindLabel(name,isDir);
d.push({title:(isDir?"📁 ":"📄 ")+name,desc:kind+(isDir?"":" · "+fmtSize(size)),col_type:"text_1",extra:{lineVisible:false}});
if(isDir){var trail=[];try{trail=JSON.parse(sourceTrail||"[]");if(!(trail instanceof Array))trail=[];}catch(e4){trail=[];}trail.push({id:String(fid),name:name});d.push({title:"📂 打开文件夹",col_type:"text_2",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(fid)+"&cname="+encodeURIComponent(name)+"&trail="+encodeURIComponent(JSON.stringify(trail))});}
else{var fk="";try{fk=String(api.tool.fileKind(name)||"");}catch(e5){}if(fk==="video")d.push({title:"▶ 播放",col_type:"text_2",url:$().lazyRule(api.player.resolve,JSON.stringify({pc:pc,fid:fid,name:name,kind:"video"}))});}
d.push({title:"↩ 返回文件管理",col_type:"text_2",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(sourceCid)+"&cname="+encodeURIComponent(sourceName)+(sourceTrail?"&trail="+encodeURIComponent(sourceTrail):"")});
d.push({title:"名称",desc:name,col_type:"text_1"});
d.push({title:"类型",desc:kind,col_type:"text_1"});
if(!isDir)d.push({title:"大小",desc:fmtSize(size)+(size?" · "+String(size)+" B":""),col_type:"text_1"});
if(mtime)d.push({title:"修改时间",desc:mtime,col_type:"text_1"});
if(ctime)d.push({title:"创建时间",desc:ctime,col_type:"text_1"});
d.push({title:"文件ID",desc:fid,col_type:"text_1",url:"copy://"+fid});
d.push({title:"父目录ID",desc:parentId,col_type:"text_1",url:"copy://"+parentId});
if(pc)d.push({title:"PickCode",desc:pc,col_type:"text_1",url:"copy://"+pc});
if(sha1)d.push({title:"SHA1",desc:sha1,col_type:"text_1",url:"copy://"+sha1});
setResult(d);
})();
