/* JavDB v3 3.9.57-test.1 · dynamic Guangya route discovery */
var JavDBRelease3957=(function(){
var VERSION='3.9.57-test.1',BUILD=2026111603;
var ROOT='hiker://files/rules/asset-core-local/javdb-v3-test/b2026111603/';
var ENTRY=ROOT+'local_entry.js',BASE_ENTRY=ROOT+'base_3952_entry.js';
var BASE_REF='78551e00d383afd6637e8fa06d5fed99d4436df4';
var BASE_PATH='apps/video/javdb/releases/3.9.52-test.1/local_entry.js';
var BASE_CACHE=null;
var PATCH_LOCAL=ROOT+'taxonomy_features_patch.js',PATCH_REF='4fa91e8c99413186bda7f21da6e80ff4aa8e827f';
var PATCH_PATH='apps/video/javdb/releases/3.9.55-test.1/taxonomy_features_patch.js';
var PATCH_CACHE='';
function taxonomyPatch(){if(PATCH_CACHE)return PATCH_CACHE;
  ensureFile(PATCH_LOCAL,PATCH_REF,PATCH_PATH,'3.9.55-test.1');
  PATCH_CACHE=String(readFile(PATCH_LOCAL)||'');
  if(bad(PATCH_CACHE)||PATCH_CACHE.indexOf('apk1939Compatibility')<0)throw new Error('分类补丁缺失或损坏');
  return PATCH_CACHE;
}
var AUTH_LOCAL=ROOT+'auth_gate_patch.js',AUTH_REF='ec4d43c44c14d1c830e221d1f366461d8bbcaf5b';
var AUTH_PATH='apps/video/javdb/releases/3.9.56-test.1/auth_gate_patch.js',AUTH_CACHE='';
function authPatch(){if(AUTH_CACHE)return AUTH_CACHE;
  ensureFile(AUTH_LOCAL,AUTH_REF,AUTH_PATH,'3.9.56-test.1');
  AUTH_CACHE=String(readFile(AUTH_LOCAL)||'');
  if(bad(AUTH_CACHE)||AUTH_CACHE.indexOf('authGateVersion')<0)throw new Error('账号鉴权补丁缺失或损坏');
  return AUTH_CACHE;
}
var HOME_LOCAL=ROOT+'home_layout_patch.js',HOME_REF='047bcdaa59fd6140a84dc6aea2deb73cbf67f835';
var HOME_PATH='apps/video/javdb/releases/3.9.57-test.1/home_layout_patch.js',HOME_CACHE='';
function homePatch(){if(HOME_CACHE)return HOME_CACHE;
  ensureFile(HOME_LOCAL,HOME_REF,HOME_PATH,'3.9.57-test.1');
  HOME_CACHE=String(readFile(HOME_LOCAL)||'');
  if(bad(HOME_CACHE)||HOME_CACHE.indexOf('homeLayoutVersion')<0)throw new Error('首页布局补丁缺失');
  return HOME_CACHE;
}
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function urls(ref,path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+ref+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+ref+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+ref+'/'+path];}
function ensureFile(local,ref,path,marker){if(fileExist(local)){try{var old=String(readFile(local)||'');if(!bad(old)&&old.indexOf(marker)>=0)return local;}catch(_e){}try{deleteFile(local);}catch(_e2){}}var us=urls(ref,path),es=[],i,s='';for(i=0;i<us.length;i++){try{s=String(fetch(us[i],{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(bad(s)||s.indexOf(marker)<0)throw new Error('无效响应');writeFile(local,s);if(!fileExist(local))throw new Error('写入失败');return local;}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error(path+' 下载失败：'+es.join(' | '));}
function base(){if(BASE_CACHE&&typeof BASE_CACHE.module==='function')return BASE_CACHE;ensureFile(BASE_ENTRY,BASE_REF,BASE_PATH,'3.9.52-test.1');var src=String(readFile(BASE_ENTRY)||''),JavDBLocal=null;if(bad(src)||src.indexOf('3.9.52-test.1')<0)throw new Error('JavDB 3.9.52 Base Entry 内容无效');eval(src);if(!JavDBLocal||typeof JavDBLocal.module!=='function')throw new Error('JavDB 3.9.52 Base Entry 未导出');BASE_CACHE=JavDBLocal;return BASE_CACHE;}
function magnetFromString(v){var s=String(v==null?'':v).replace(/&amp;/gi,'&'),m=null,d='';m=s.match(/magnet:\?xt=urn:btih:[^\"'<>\\\s]+/i);if(m)return String(m[0]);if(/%3A|%3F|%3D/i.test(s)){try{d=decodeURIComponent(s);m=d.match(/magnet:\?xt=urn:btih:[^\"'<>\\\s]+/i);if(m)return String(m[0]).replace(/&amp;/gi,'&');}catch(_e){}}return'';}
function findMagnet(v,depth,seen){if(depth>6||v==null)return'';var t=typeof v,m='',i,k,keys;if(t==='string'||t==='number')return magnetFromString(v);if(t!=='object')return'';seen=seen||[];for(i=0;i<seen.length;i++)if(seen[i]===v)return'';seen.push(v);keys=['magnet','url','href','link','input','value','js'];for(i=0;i<keys.length;i++){k=keys[i];try{if(v[k]!=null){m=findMagnet(v[k],depth+1,seen);if(m)return m;}}catch(_e2){}}if(v instanceof Array){for(i=0;i<v.length;i++){m=findMagnet(v[i],depth+1,seen);if(m)return m;}return'';}for(k in v){if(!Object.prototype.hasOwnProperty.call(v,k)||keys.indexOf(k)>=0)continue;try{m=findMagnet(v[k],depth+1,seen);if(m)return m;}catch(_e3){}}return'';}
function actionGuangya(magnet){return{title:'光鸭',js:$.toString(function(m){
  m=String(m||'').replace(/&amp;/gi,'&').trim();
  if(!m||m.indexOf('magnet:?')!==0)return'toast://未识别到磁力链接';
  function home(rule){try{return String(request('hiker://home@'+rule)||'');}catch(e){return'';}}
  function parseRule(raw){var s=String(raw||'').trim(),p=s.indexOf('￥home_rule￥'),o=null;if(p>=0)s=s.substring(p+'￥home_rule￥'.length);else{p=s.indexOf('{');if(p>=0)s=s.substring(p);}try{o=JSON.parse(s);}catch(e){o=null;}return o;}
  function pagesOf(o){var p=o&&o.pages;if(!p)return[];if(p instanceof Array)return p;try{var a=JSON.parse(String(p));return a instanceof Array?a:[];}catch(e){return[];}}
  function score(x){var n=String(x&&x.name||''),p=String(x&&x.path||''),r=String(x&&x.rule||''),s=(n+' '+p+' '+r).toLowerCase(),v=0;if(p==='magnet')v+=100;if(/磁力|云添加|离线/.test(n))v+=80;if(/magnet|cloud.?add|cloudadd|offline|offlineadd|addtask|add/.test(p.toLowerCase()))v+=60;if(/磁力|云添加|resolve_res|create_task|realurl|magnet/.test(s))v+=30;if(/diaoyong|fxlj|调用/.test(s))v+=15;return v;}
  var rules=['光鸭云盘','光鸭'],ri,raw,o,ps,i,best=null,bestScore=0,sc,ruleName='';
  for(ri=0;ri<rules.length;ri++){raw=home(rules[ri]);if(!raw||raw==='null')continue;o=parseRule(raw);if(!o)continue;ps=pagesOf(o);for(i=0;i<ps.length;i++){sc=score(ps[i]);if(sc>bestScore&&ps[i]&&ps[i].path){best=ps[i];bestScore=sc;ruleName=rules[ri];}}if(bestScore>=80)break;}
  try{if(typeof setClipBoard==='function')setClipBoard(m);else if(typeof copy==='function')copy(m);}catch(_c){}
  if(best&&best.path){var em=encodeURIComponent(m),er=encodeURIComponent(ruleName);return'hiker://page/'+best.path+'?rule='+er+'&page=fypage&realurl='+em+'&url='+em+'&add='+em+'&magnet='+em+'&input='+em;}
  for(ri=0;ri<rules.length;ri++){raw=home(rules[ri]);if(raw&&raw!=='null')return'hiker://search?s='+encodeURIComponent(m)+'&rule='+encodeURIComponent(rules[ri]);}
  return'toast://未检测到光鸭云盘小程序，请先确认规则已安装';
},magnet)};}
function patchGuangya(items){if(!(items instanceof Array))return items;var i,j,x,m,a,t,arr,hit;for(i=0;i<items.length;i++){x=items[i];if(!x||typeof x!=='object')continue;m=findMagnet(x,0,[]);if(!m)continue;x.extra=x.extra&&typeof x.extra==='object'?x.extra:{};arr=x.extra.longClick instanceof Array?x.extra.longClick:[];hit=false;for(j=0;j<arr.length;j++){a=arr[j];t=String(a&&a.title||'');if(/光鸭|guang\s*ya|guangya/i.test(t)){arr[j]=actionGuangya(m);hit=true;break;}}if(!hit){for(j=0;j<arr.length;j++){t=String(arr[j]&&arr[j].title||'');if(/123/.test(t)){arr.splice(j,0,actionGuangya(m));hit=true;break;}}}x.extra.longClick=arr;}return items;}
function capture(run,patch){var oldSet=null,got=null,hooked=false,err=null,ret=null;try{oldSet=setResult;var cap=function(v){got=v;};setResult=cap;hooked=(setResult===cap);}catch(e){hooked=false;}if(!hooked){ret=run();return ret instanceof Array?patch(ret):ret;}try{ret=run();}catch(e2){err=e2;}finally{try{setResult=oldSet;}catch(_e){}}if(err)throw err;if(got instanceof Array)return oldSet(patch(got));if(got!=null)return oldSet(got);return ret instanceof Array?patch(ret):ret;}
function module(){var b=base(),m=b.module();if(!m||typeof m.custom!=='function')throw new Error('JavDB 3.9.52 Base Module 未就绪');var oldCustom=m.custom;m.custom=function(key){if(key==='javdb3Magnets')return capture(function(){return oldCustom.call(m,key);},patchGuangya);return oldCustom.call(m,key);};var oldCore=m.core;
if(typeof oldCore!=='function')throw new Error('JavDB Base Core 未就绪');
m.core=function(call){
  var s=String(call||'').replace(/\s+/g,'');
  if(/^JDB\.(home|filters|category|rankHub5|rank|actorHub4|moreHub5|luckyPage|notificationsPage|authDiagPage|preview)\(\);?$/.test(s)){
    var prefix='eval('+JSON.stringify(taxonomyPatch())+');eval('+JSON.stringify(authPatch())+');';if(s==='JDB.home();')prefix+='eval('+JSON.stringify(homePatch())+');';return oldCore.call(m,prefix+String(call||''));
  }
  return oldCore.call(m,call);
};
m.version=VERSION;m.build=BUILD;m.guangyaRouteDiscovery=true;m.vipPlaybackBase='3.9.51-test.1';return m;}
function info(){var b=base(),x={};try{x=b.info?b.info():{};}catch(e){x={ready:false,error:String(e.message||e)};}x.version=VERSION;x.build=BUILD;x.baseVersion='3.9.52-test.1';x.guangyaRouteDiscovery=true;x.taxonomyRepair='1.9.39.4-RC';x.authorizationRepair='JWT API gate';x.previewRepair='api/v4/movies auth';x.homeLayout='compact-5-icons-tabs';x.luckyAndNotifications='experimental';x.vipPlaybackUnchanged=true;return x;}
function statusPage(){setPageTitle('JavDB · 光鸭调用诊断');var d=[];d.push({title:'JavDB v3 '+VERSION,desc:'Build '+BUILD+' · 动态识别光鸭页面',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'为什么改',desc:'当前设备明确提示“找不到 magnet 这个页面”，说明已安装的光鸭规则并未注册固定 magnet path，不能继续写死。',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});d.push({title:'新调用方式',desc:'点击光鸭时读取已安装 光鸭云盘 / 光鸭 的 home rule，解析 pages，优先寻找“磁力 / 云添加 / 离线 / add / diaoyong / fxlj”等真实页面，再把磁链同时通过 realurl/url/add/magnet/input 传入。',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});d.push({title:'兼容回退',desc:'找不到专用页面时，退回该规则的定向搜索入口；同时尝试把磁链写入剪贴板供旧版光鸭读取。',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});d.push({title:'其它功能',desc:'115 / 迅雷 / PikPak / 123 / 复制磁链、磁链 metadata、VIP 播放均保持不变。',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});d.push({title:'分类适配与新版入口',desc:'兼容 /api/v2/tags 与 /api/v1/movies/tags，新增手气不错、站内通知；需要实机确认新接口响应及授权',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});d.push({title:'JWT 接口修复',desc:'分类、排行、演员 GET 请求按需要携带现有 Token；通过「更多 → 账号接口诊断」检查真实授权，绝不展示或清除 Token。',url:'hiker://page/javdb3AuthDiag?rule=&simple=true',col_type:'text_2',extra:{lineVisible:false}});d.push({title:'预览图与首页优化',desc:'预览图注入现有鉴权重试；首页五个快捷入口一行显示，随机推荐收进频道栏，封面减少重复日期。',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});setResult(d);}
return{version:VERSION,build:BUILD,module:module,info:info,statusPage:statusPage,entry:ENTRY,builder:function(){var b=base();return b.builder?b.builder():null;},patch:function(force){var b=base();return b.patch?b.patch(force):null;},upgrade:function(force){var b=base();return b.upgrade?b.upgrade(force):null;}};
})();
var JavDBLocal=JavDBRelease3957;
