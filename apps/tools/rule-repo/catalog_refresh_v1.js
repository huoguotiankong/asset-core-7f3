/* rule-repo RC26 catalog refresh 1.0 - bounded multi-mirror version check */
var RuleRepoCatalogRefresh=(function(){
var VERSION='1.0.0',REPO='huoguotiankong/asset-core-7f3';
var CATALOG_PATH='apps/tools/rule-repo/channel_catalog_snapshot.json';
var CATALOG_FILE='hiker://files/rules/asset-core-local/rule-repo-test/channel_catalog_v2.json';
var SELF_VERSION='3.5.6-rc26',SELF_BUILD=416,SELF_RULE='apps/tools/rule-repo/rule_repo_test_v163.txt';
function selfMeta(){return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-25 08:15',channels:[
{channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.5',build:389,displayVersion:'正式版 3.5.5 · Build 389',path:'apps/tools/rule-repo/rule_repo_remote_v355.txt',mode:'remote',updatedAt:'2026-08-24',recommended:true},
{channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:SELF_VERSION,build:SELF_BUILD,displayVersion:'测试版 '+SELF_VERSION+' · Build '+SELF_BUILD,path:SELF_RULE,mode:'remote-local-first',updatedAt:'2026-08-25',recommended:false,baseVersion:'3.5.5',targetVersion:'3.5.6'}
]};}
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
function parse(t){if(bad(t))return null;try{var x=JSON.parse(String(t));return x&&Number(x.schema||0)>=1&&x.apps&&typeof x.apps==='object'?x:null;}catch(e){return null;}}
function revNum(c){var s=String(c&&c.revision||'').replace(/\D/g,'');if(!s)return 0;if(s.length>15)s=s.slice(0,15);return Number(s)||0;}
function clone(o){try{return JSON.parse(JSON.stringify(o));}catch(e){return o;}}
function urls(){var ts=Date.now(),p=CATALOG_PATH;return[
'https://raw.githubusercontent.com/'+REPO+'/main/'+p+'?_rc26='+ts,
'https://github.com/'+REPO+'/raw/main/'+p+'?_rc26='+ts,
'https://cdn.jsdelivr.net/gh/'+REPO+'@main/'+p+'?_rc26='+ts
];}
function choose(rs){var best=null,bestN=-1;for(var i=0;i<(rs||[]).length;i++){var c=parse(rs[i]);if(!c)continue;var n=revNum(c);if(!best||n>bestN){best=c;bestN=n;}}return best;}
function fetchLatest(){var us=urls(),rs=null,best=null,errors=[];
try{if(typeof batchFetch==='function'){var reqs=[];for(var i=0;i<us.length;i++)reqs.push({url:us[i],options:{timeout:2800,headers:{'Cache-Control':'no-cache, no-store, max-age=0'}}});rs=batchFetch(reqs);best=choose(rs);}}catch(e0){errors.push('batch:'+String(e0.message||e0));}
if(!best){var seq=[];for(var j=0;j<us.length;j++){try{seq.push(String(fetch(us[j],{timeout:1800,headers:{'Cache-Control':'no-cache, no-store, max-age=0'}})||''));}catch(e1){seq.push('');errors.push((j+1)+':'+String(e1.message||e1));}}best=choose(seq);}
if(!best)throw new Error('版本目录三镜像均不可用'+(errors.length?'：'+errors.join(' | '):''));return best;}
function readLocal(){try{if(!fileExist(CATALOG_FILE))return null;return parse(readFile(CATALOG_FILE));}catch(e){return null;}}
function save(c){if(!c||!c.apps)throw new Error('版本目录格式无效');c=clone(c);c.apps['rule-repo']=selfMeta();writeFile(CATALOG_FILE,JSON.stringify(c));if(!fileExist(CATALOG_FILE))throw new Error('版本目录写入失败');var back=readLocal();if(!back)throw new Error('版本目录回读失败');return back;}
function ensureSelf(){var c=readLocal();if(!c)return false;save(c);return true;}
function metaOf(c,id){var m=c&&c.apps&&c.apps[String(id||'')];return m&&Array.isArray(m.channels)&&m.channels.length?clone(m):null;}
function refresh(id){var before=readLocal(),oldRev=String(before&&before.revision||''),c=save(fetchLatest()),m=metaOf(c,id);return{ok:true,revision:String(c.revision||''),oldRevision:oldRev,changed:String(c.revision||'')!==oldRev,meta:m,appId:String(id||'')};}
function current(id){var c=readLocal();return{ok:!!c,revision:String(c&&c.revision||''),meta:metaOf(c,id)};}
return{version:VERSION,refresh:refresh,current:current,ensureSelf:ensureSelf,selfMeta:selfMeta};
})();
