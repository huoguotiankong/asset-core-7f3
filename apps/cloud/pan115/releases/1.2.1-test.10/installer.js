(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092230)return "toast://当前已是115 Test 1.2.1-test.10";
if(ver!==2026092229)return "toast://本版只在已实机确认搜索恢复的Test9上打补丁，请先覆盖到1.2.1-test.9";
var page=null;
for(var i=0;i<pages.length;i++)if(pages[i]&&pages[i].path==="115Search"){page=pages[i];break;}
if(!page||!page.rule)return "toast://当前规则缺少115Search页面";
var src=String(page.rule||"");
if(src.indexOf("__115_LEGACY_FOLDER_PATCH_V1__")>=0)return "toast://当前搜索页已包含Test10文件夹补丁";
if(src.indexOf("setResult")<0)return "toast://未识别到旧搜索页输出结构，Test10不会覆盖";
var prefix="js:\n";
var body=src.indexOf(prefix)===0?src.substring(prefix.length):src.replace(/^js:\s*/,"");
var methods=[],mre=/\.([A-Za-z_$][A-Za-z0-9_$]*search[A-Za-z0-9_$]*)\s*\(/ig,mm;
while((mm=mre.exec(body))!==null){var mn=String(mm[1]||"");if(mn&&methods.indexOf(mn)<0)methods.push(mn);if(methods.length>=6)break;}
body=body.replace(/\bsetResult\s*\(/g,"__115LegacySearchSetResult(");
var helper='/*__115_LEGACY_FOLDER_PATCH_V1__*/\n'+
'function __115CleanSearchText(v){return String(v==null?"":v).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/\\s+/g," ").trim();}\n'+
'function __115FolderDisplayName(v){return __115CleanSearchText(v).replace(/^[📁📂🗂\\s]+/,"").trim();}\n'+
'function __115FolderPageUrl(cid,name){return "hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(String(cid||"0"))+"&cname="+encodeURIComponent(String(name||"目录"));}\n'+
'function __115ExtractSearchItems(o){if(!o)return[];if(typeof o==="string"){try{o=JSON.parse(o);}catch(e){return[];}}if(o instanceof Array)return o;if(o.data instanceof Array)return o.data;if(o.list instanceof Array)return o.list;if(o.files instanceof Array)return o.files;if(o.data&&typeof o.data==="object"){if(o.data.data instanceof Array)return o.data.data;if(o.data.list instanceof Array)return o.data.list;if(o.data.files instanceof Array)return o.data.files;}return[];}\n'+
'function __115FolderLookupUrl(name,kw,directCid,methodHints){if(directCid)return __115FolderPageUrl(directCid,name);return $().lazyRule(function(n,q,hints){\n'+
' function items(o){if(!o)return[];if(typeof o==="string"){try{o=JSON.parse(o);}catch(e){return[];}}if(o instanceof Array)return o;if(o.data instanceof Array)return o.data;if(o.list instanceof Array)return o.list;if(o.files instanceof Array)return o.files;if(o.data&&typeof o.data==="object"){if(o.data.data instanceof Array)return o.data.data;if(o.data.list instanceof Array)return o.data.list;if(o.data.files instanceof Array)return o.data.files;}return[];}\n'+
' function pick(arr){for(var i=0;i<arr.length;i++){var x=arr[i]||{},nm=String(x.n||x.file_name||x.name||x.fn||""),fid=String(x.fid||x.file_id||""),cid=String(x.cid||x.category_id||x.categoryId||"");if(!fid&&cid&&nm===n)return cid;}for(var j=0;j<arr.length;j++){var y=arr[j]||{},yn=String(y.n||y.file_name||y.name||y.fn||""),yf=String(y.fid||y.file_id||""),yc=String(y.cid||y.category_id||y.categoryId||"");if(!yf&&yc&&yn.toLowerCase()===String(n).toLowerCase())return yc;}return"";}\n'+
' var tried={},hs=String(hints||"").split(",");hs=hs.concat(["searchFiles","filesSearch","fileSearch","search"]);\n'+
' try{var api=$.require("115Api"),c=api.newClient();for(var a=0;a<hs.length;a++){var mn=String(hs[a]||"");if(!mn||tried[mn]||typeof c[mn]!=="function")continue;tried[mn]=1;try{var rr=c[mn](String(q||n));var id=pick(items(rr));if(id)return "hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(id)+"&cname="+encodeURIComponent(n);}catch(e0){}}}catch(e1){}\n'+
' function req(term){var u="https://webapi.115.com/files/search?search_value="+encodeURIComponent(String(term||""))+"&format=json&offset=0&limit=100&cid=0&_t="+(new Date().getTime());var opt={};try{var ck=getCookie("https://115.com");if(ck)opt.headers={Cookie:ck,Referer:"https://115.com/"};}catch(ec){}var txt="";try{txt=request(u,opt);}catch(er){try{txt=fetch(u,opt);}catch(ef){txt="";}}return items(txt);}\n'+
' var terms=[];if(q)terms.push(String(q));if(n&&terms.indexOf(String(n))<0)terms.push(String(n));for(var k=0;k<terms.length;k++){var cid=pick(req(terms[k]));if(cid)return "hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(cid)+"&cname="+encodeURIComponent(n);}\n'+
' return "toast://已找到目录结果，但未解析到目录ID："+n;\n'+
'},String(name||""),String(kw||""),String(methodHints||""));}\n'+
'function __115LegacySearchSetResult(list){try{var kw="";try{kw=String(getParam("kw","")||"");try{kw=decodeURIComponent(kw);}catch(e0){}}catch(e1){}var hints='+JSON.stringify(methods.join(','))+';if(list&&list.length!==undefined){for(var i=0;i<list.length;i++){var it=list[i];if(!it||typeof it!=="object")continue;var cleanTitle=__115CleanSearchText(it.title||"");if(String(it.title||"").indexOf("<font")>=0)it.title=cleanTitle;var desc=__115CleanSearchText(it.desc||"");if(desc.indexOf("目录")>=0){var name=__115FolderDisplayName(cleanTitle),ex=it.extra||{},cid=String(ex.cid||ex.categoryId||ex.category_id||ex.folderId||ex.folder_id||"");if(name)it.url=__115FolderLookupUrl(name,kw,cid,hints);}}}}catch(e){}setResult(list);}\n';
page.rule=prefix+helper+body;
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 旧搜索链文件夹修复";
rule.version=2026092230;
var out="hiker://files/cache/115_12110_legacy_search_folder_patch.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
