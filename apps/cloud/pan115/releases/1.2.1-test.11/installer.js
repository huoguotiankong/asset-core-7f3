(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092231)return "toast://当前已是115 Test 1.2.1-test.11";
if(ver!==2026092230)return "toast://本版只在Test10上修复目录ID捕获，请先覆盖到1.2.1-test.10";
function readLocal(path){var s="";try{s=fetch(path)||"";}catch(e){}if(!s||s==="null"||s==="undefined")try{s=request(path)||"";}catch(e2){}if(!s||s==="null"||s==="undefined")try{s=readFile(path)||"";}catch(e3){}return String(s||"");}
function extractSearch(snapshot){if(!snapshot)return null;var r,ps;try{r=JSON.parse(snapshot);ps=JSON.parse(r.pages||"[]");}catch(e){return null;}if(Number(r.version||0)>=2026092225)return null;for(var i=0;i<ps.length;i++)if(ps[i]&&ps[i].path==="115Search"&&String(ps[i].rule||"").length>50)return ps[i];return null;}
var candidates=["hiker://files/cache/115_12104_file_manage_ux_test.json","hiker://files/cache/115_12103_file_manage_test.json","hiker://files/cache/115_12102_batch_manage_test.json","hiker://files/cache/115_12101_recycle_clear_test.json","hiker://files/cache/115_stable_120_rule.json"];
var legacy=null;for(var c=0;c<candidates.length;c++){legacy=extractSearch(readLocal(candidates[c]));if(legacy)break;}
if(!legacy)return "toast://未找到Test5前旧搜索快照，Test11不会覆盖当前规则";
var src=String(legacy.rule||"");var prefix="js:\n";var body=src.indexOf(prefix)===0?src.substring(prefix.length):src.replace(/^js:\s*/,"");
if(body.indexOf("setResult")<0)return "toast://未识别旧搜索输出结构，Test11不会覆盖";
var methods=[],re=/\.([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g,m;while((m=re.exec(body))!==null){var mn=String(m[1]||"");if(/search/i.test(mn)||mn==="getFiles"){if(methods.indexOf(mn)<0)methods.push(mn);}if(methods.length>=12)break;}
body=body.replace(/(^|[^A-Za-z0-9_$\.])request\s*\(/g,"$1__115CapRequest(");
body=body.replace(/(^|[^A-Za-z0-9_$\.])fetch\s*\(/g,"$1__115CapFetch(");
body=body.replace(/\bsetResult\s*\(/g,"__115CapSetResult(");
var helper='/*__115_LEGACY_RAW_CAPTURE_V2__*/\n'+
'var __115Raw=[];\n'+
'function __115Keep(v){try{if(v!==undefined&&v!==null)__115Raw.push(v);}catch(e){}return v;}\n'+
'function __115CapRequest(){var a=arguments,r;if(a.length>2)r=request(a[0],a[1],a[2]);else if(a.length>1)r=request(a[0],a[1]);else r=request(a[0]);return __115Keep(r);}\n'+
'function __115CapFetch(){var a=arguments,r;if(a.length>1)r=fetch(a[0],a[1]);else r=fetch(a[0]);return __115Keep(r);}\n'+
'function __115PatchApi(){try{var api=$.require("115Api"),old=api.newClient;if(!old||old.__cap11)return;var hints='+JSON.stringify(methods)+';var wrap=function(c){if(!c)return c;var hs=hints.concat(["searchFiles","filesSearch","fileSearch","search","getFiles"]),seen={};for(var i=0;i<hs.length;i++){var n=String(hs[i]||"");if(!n||seen[n]||typeof c[n]!=="function")continue;seen[n]=1;(function(name,fn){try{c[name]=function(){var r=fn.apply(c,arguments);__115Keep(r);return r;};}catch(e){}})(n,c[n]);}return c;};api.newClient=function(){return wrap(old.apply(api,arguments));};api.newClient.__cap11=true;}catch(e){}}\n'+
'function __115Text(v){return String(v==null?"":v).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/\\s+/g," ").trim();}\n'+
'function __115FolderName(v){return __115Text(v).replace(/^[📁📂🗂\\s]+/,"").trim();}\n'+
'function __115Obj(v){if(v===undefined||v===null)return null;if(typeof v==="string"){var s=String(v).trim();if(!s||((s.charAt(0)!=="{")&&(s.charAt(0)!=="[")))return null;try{return JSON.parse(s);}catch(e){return null;}}return v;}\n'+
'function __115FindCid(root,target){var want=String(target||"").toLowerCase(),seen=[],limit=0;function walk(v,depth){if(v===undefined||v===null||depth>10||limit>12000)return"";limit++;v=__115Obj(v)||v;if(typeof v!=="object")return"";for(var si=0;si<seen.length;si++)if(seen[si]===v)return"";seen.push(v);if(!(v instanceof Array)){var nm=String(v.n||v.file_name||v.fileName||v.name||v.fn||"");var fid=String(v.fid||v.file_id||v.fileId||"");var cid=String(v.cid||v.category_id||v.categoryId||v.folder_id||v.folderId||"");var fc=v.file_category!==undefined?Number(v.file_category):null;var isDir=(!fid&&!!cid)||(fc===0)||v.isDirectory===true||v.is_directory===true||Number(v.is_dir||0)===1;if(isDir&&cid&&nm&&nm.toLowerCase()===want)return cid;}if(v instanceof Array){for(var i=0;i<v.length;i++){var r=walk(v[i],depth+1);if(r)return r;}}else{for(var k in v){if(!Object.prototype.hasOwnProperty.call(v,k))continue;var r2=walk(v[k],depth+1);if(r2)return r2;}}return"";}return walk(root,0);}\n'+
'function __115Url(cid,name){return "hiker://page/115FileManage?rule=115.简&page=fypage&cid="+encodeURIComponent(String(cid))+"&cname="+encodeURIComponent(String(name||"目录"));}\n'+
'function __115CapSetResult(list){try{if(list&&list.length!==undefined){for(var i=0;i<list.length;i++){var it=list[i];if(!it||typeof it!=="object")continue;var clean=__115Text(it.title||"");if(String(it.title||"").indexOf("<font")>=0)it.title=clean;var desc=__115Text(it.desc||"");if(desc.indexOf("目录")>=0){var name=__115FolderName(clean),cid=__115FindCid(it,name);if(!cid){for(var r=__115Raw.length-1;r>=0&&!cid;r--)cid=__115FindCid(__115Raw[r],name);}if(cid){it.url=__115Url(cid,name);it.extra=it.extra||{};it.extra.cid=cid;}else{it.url="toast://目录ID仍未捕获："+name+"。请截图此提示";}}}}}catch(e){}setResult(list);}\n'+
'__115PatchApi();\n';
var patched=prefix+helper+body;
var replaced=false;for(var p=0;p<pages.length;p++){if(pages[p]&&pages[p].path==="115Search"){pages[p].name="115网盘搜索";pages[p].rule=patched;replaced=true;break;}}
if(!replaced)pages.push({col_type:legacy.col_type||"movie_3",name:"115网盘搜索",path:"115Search",rule:patched});
rule.pages=JSON.stringify(pages);rule.title="115.简";rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 搜索目录ID捕获";rule.version=2026092231;
var out="hiker://files/cache/115_12111_search_raw_capture.json";saveFile(out,JSON.stringify(rule));return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
