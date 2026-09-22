(function(){
/*__PAN115_FOLDER_SEARCH_V1__*/
var d=[];
var api=$.require("115Api");
var client;
try{client=api.newClient();}catch(e){d.push({title:"115未登录",desc:String(e.message||e),col_type:"text_center_1",url:"hiker://page/115Account?rule=115.简&page=fypage"});setResult(d);return;}
function q(n,v){var x="";try{x=String(getParam(n,"")||"");}catch(e){}if(x){try{x=decodeURIComponent(x);}catch(e2){}return x;}try{if(typeof MY_PARAMS!=="undefined"&&MY_PARAMS&&MY_PARAMS[n]!=null)return String(MY_PARAMS[n]);}catch(e3){}return v||"";}
function fmtSize(n){try{return api.tool.formatSize(Number(n||0));}catch(e){return "";}}
function fmtTime(v){if(v===undefined||v===null||v==="")return "";var s=String(v);if(/^\d+$/.test(s)){try{var n=Number(s);if(n<100000000000)n*=1000;var dt=new Date(n);function p(x){return x<10?"0"+x:String(x);}return dt.getFullYear()+"-"+p(dt.getMonth()+1)+"-"+p(dt.getDate())+" "+p(dt.getHours())+":"+p(dt.getMinutes());}catch(e){return s;}}return s;}
function extKind(name){var s=String(name||"").toLowerCase(),m=/\.([a-z0-9]{1,8})$/.exec(s),e=m?m[1]:"";if(/^(mp4|mkv|avi|mov|wmv|flv|ts|m2ts|rmvb|webm|m4v)$/.test(e))return"video";if(/^(jpg|jpeg|png|gif|webp|bmp|heic|avif)$/.test(e))return"image";if(/^(mp3|flac|wav|aac|m4a|ape|ogg|wma)$/.test(e))return"audio";if(/^(pdf|txt|doc|docx|xls|xlsx|ppt|pptx|epub|mobi|azw3|md)$/.test(e))return"document";if(/^(zip|rar|7z|tar|gz|bz2|xz)$/.test(e))return"archive";return"other";}
function kindOf(f){if(f&&f.isDirectory)return"folder";try{var k=api.tool.fileKind(String((f&&f.name)||""));if(k)return String(k);}catch(e){}return extKind((f&&f.name)||"");}
function iconOf(k){if(k==="folder")return"📁 ";if(k==="video")return"🎬 ";if(k==="image")return"🖼 ";if(k==="audio")return"🎵 ";if(k==="document")return"📄 ";if(k==="archive")return"🗜 ";return"📦 ";}
function trailForChild(rawTrail,id,name){var a=[];try{a=JSON.parse(String(rawTrail||"[]"));if(!(a instanceof Array))a=[];}catch(e){a=[];}if(!a.length)a.push({id:"0",name:"我的文件"});var last=a[a.length-1]||{};if(String(last.id||"")!==String(id))a.push({id:String(id),name:String(name||"文件夹")});if(a.length>16)a=a.slice(a.length-16);return JSON.stringify(a);}
var cid=q("cid","0"),cname=q("cname","我的文件"),trail=q("trail",""),kw=q("kw","").trim(),start=parseInt(q("start","0"),10)||0;
if(start<0)start=0;
if(!trail)trail=JSON.stringify([{id:String(cid),name:String(cname)}]);
d.push({title:"搜索",desc:"",col_type:"input",url:$.toString(function(cid0,name0,trail0){var s=String(input||"").trim();if(!s)return"toast://请输入关键词";return"hiker://page/115FolderSearch?rule=115.简&page=fypage&cid="+encodeURIComponent(String(cid0))+"&cname="+encodeURIComponent(String(name0))+"&trail="+encodeURIComponent(String(trail0))+"&kw="+encodeURIComponent(s)+"&start=0";},cid,cname,trail),extra:{titleVisible:true,defaultValue:kw}});
d.push({title:"📁 "+cname,col_type:"text_4",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(cid)+"&cname="+encodeURIComponent(cname)+"&trail="+encodeURIComponent(trail)});
if(!kw){d.push({title:"搜索当前目录",desc:"只搜索这一层，不进入子文件夹",col_type:"text_center_1"});setResult(d);return;}
var pageSize=100,maxPages=5,offset=start,scanned=0,matches=[],ended=false,lastCount=0;
for(var p=0;p<maxPages;p++){
 var r;try{r=client.getFiles(String(cid),{offset:offset,pageSize:pageSize,order:"file_name",asc:"1",showDir:"1"});}catch(ex){d.push({title:"搜索失败",desc:String(ex.message||ex),col_type:"text_center_1"});setResult(d);return;}
 var arr=(r&&r.files)||[];lastCount=arr.length;scanned+=arr.length;
 for(var i=0;i<arr.length;i++){var f=arr[i]||{},nm=String(f.name||"");if(nm.toLowerCase().indexOf(kw.toLowerCase())>=0)matches.push(f);}
 offset+=arr.length;
 if(arr.length<pageSize){ended=true;break;}
}
d.push({title:"“"+kw+"” · "+matches.length+" 条",desc:"已扫描 "+scanned+" 项",col_type:"text_1",extra:{lineVisible:false}});
for(var j=0;j<matches.length;j++){
 var f=matches[j]||{},fid=String(f.fileId||""),name=String(f.name||"未命名"),isDir=!!f.isDirectory;if(!fid)continue;
 var kind=kindOf(f),mt=f.updateTime||f.userUtime||f.user_utime||f.fileMtime||f.mtime||f.time||"",desc=isDir?fmtTime(mt):fmtSize(f.size),ts=fmtTime(mt);if(!isDir&&ts)desc+=(desc?" · ":"")+ts;
 var item={title:iconOf(kind)+name,desc:desc,col_type:"text_1",url:"toast://长按可管理",extra:{longClick:[]}};
 if(isDir){var childTrail=trailForChild(trail,fid,name);item.url="hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(fid)+"&cname="+encodeURIComponent(name)+"&trail="+encodeURIComponent(childTrail);}else if(kind==="video")item.url=$().lazyRule(function(v){try{return $.require("115PlayStore").play(v);}catch(e){try{var x=JSON.parse(String(v||"{}"));return $.require("115Api").player.resolve(JSON.stringify({pc:String(x.pc||""),fid:String(x.fid||""),name:String(x.name||""),kind:"video"}));}catch(ex){return"toast://播放失败："+String(ex.message||ex);}}},JSON.stringify({pc:f.pickCode||"",fid:fid,name:name,size:Number(f.size||0),sourceCid:cid,sourceName:cname,trail:trail}));
 item.extra.longClick.push({title:"文件信息",js:$.toString(function(id,nm,dir,sz,pc,sourceCid,sourceName,sourceTrail){return"hiker://page/115FileInfo?rule=115.简&page=fypage&fid="+encodeURIComponent(id)+"&name="+encodeURIComponent(nm)+"&dir="+(dir?"1":"0")+"&size="+encodeURIComponent(String(sz||0))+"&pc="+encodeURIComponent(String(pc||""))+"&sourceCid="+encodeURIComponent(sourceCid)+"&sourceName="+encodeURIComponent(sourceName)+"&sourceTrail="+encodeURIComponent(sourceTrail);},fid,name,isDir,Number(f.size||0),String(f.pickCode||""),cid,cname,trail)});
 d.push(item);
}
if(!matches.length)d.push({title:"这一批没有匹配结果",desc:ended?"已到目录末尾":"可继续扫描下一批",col_type:"text_center_1"});
if(!ended&&lastCount===pageSize)d.push({title:"继续扫描",desc:"下一批最多扫描 500 项",col_type:"text_center_1",url:"hiker://page/115FolderSearch?rule=115.简&page=fypage&cid="+encodeURIComponent(cid)+"&cname="+encodeURIComponent(cname)+"&trail="+encodeURIComponent(trail)+"&kw="+encodeURIComponent(kw)+"&start="+encodeURIComponent(String(offset))});
setResult(d);
})();
