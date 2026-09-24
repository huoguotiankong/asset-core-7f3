/* 磁力君.简 1.0.0-test.1 · Build10101 */
var MagnetJun=(function(){
var VERSION='1.0.0-test.1',BUILD=10101;
var ADAPTER_REF='5f652b003410a8518d2879b3e99db2d27ef6bc43';
var ADAPTER_URL='https://raw.githubusercontent.com/ApolloRioo/R/'+ADAPTER_REF+'/Hiker/%E7%A3%81%E5%8A%9B%E5%90%9B.%E7%AE%80';
var CACHE_ROOT='hiker://files/rules/asset-core-local/magnetjun/';
var ADAPTER_CACHE=CACHE_ROOT+'legacy_adapters_20250608.js';
var SOURCE_STATE_KEY='magnetjun_source_state_v1';
var MODE_KEY='magnetjun_open_mode_v1';
var HISTORY_KEY='magnetjun_search_history_v1';
var SEARCH_MODE_KEY='magnetjun_search_mode_v1';
var LEGACY_CONFIG='hiker://files/rules/LoyDgIk/ciliSimpleRules.json';
var RULE_NAME='磁力君.简';
var _adapters=null;
function trim(s){return String(s==null?'':s).trim();}
function parseJson(s,d){try{return JSON.parse(String(s||''));}catch(e){return d;}}
function safeDecode(s){s=String(s==null?'':s);try{return decodeURIComponent(s);}catch(e){return s;}}
function validJs(s){s=String(s||'').replace(/^\uFEFF/,'').trim();return s&&s.indexOf('var rrules')>=0&&s.indexOf('$.exports')>=0&&!/^(?:<!doctype|<html|Bad Gateway|Not Found|Too Many Requests|Service Unavailable)/i.test(s);}
function fetchAdaptersSource(){
  var local='';
  try{if(fileExist(ADAPTER_CACHE)){local=String(readFile(ADAPTER_CACHE)||'');if(validJs(local))return local;}}catch(e){}
  var s='';try{s=String(fetch(ADAPTER_URL,{timeout:7000})||'');}catch(e2){s='';}
  if(!validJs(s))throw new Error('默认搜索源加载失败，请检查网络后重试');
  try{writeFile(ADAPTER_CACHE,s);}catch(_e){}
  return s;
}
function compileStoredRule(x){
  if(!x||!x.name||!x.find)return null;var r={};
  for(var k in x)if(Object.prototype.hasOwnProperty.call(x,k))r[k]=x[k];
  try{if(typeof r.find==='string'){var f=new Function('s','page','user','basicUrl',r.find);r.find=function(s,page){return f(s,page,r.user||{},r.basicUrl||'');};}}
  catch(e){return null;}
  try{if(r.findAliUrl&&typeof r.findAliUrl==='string'){var fa=new Function('input','basicUrl',r.findAliUrl);r.findAliUrl=function(input){return fa(input,r.basicUrl||'');};}}
  catch(e2){r.findAliUrl=null;}
  return r;
}
function loadAdapters(){
  if(_adapters)return _adapters;
  var out=[],seen={},legacy=[];
  try{if(fileExist(LEGACY_CONFIG)){legacy=parseJson(readFile(LEGACY_CONFIG),[]);if(legacy instanceof Array){for(var i=0;i<legacy.length;i++){var cr=compileStoredRule(legacy[i]);if(cr&&cr.name&&!seen[cr.name]){seen[cr.name]=1;out.push(cr);}}}}}catch(e){}
  if(!out.length){
    var src=fetchAdaptersSource().replace(/^\s*js:\s*/,''),rrules=null,version='';
    eval(src);
    if(rrules instanceof Array){for(var j=0;j<rrules.length;j++){var r=rrules[j];if(r&&r.name&&!seen[r.name]){seen[r.name]=1;out.push(r);}}}
  }
  _adapters=out;return out;
}
function state(){var x=parseJson(getItem(SOURCE_STATE_KEY,'{}'),{});return x&&typeof x==='object'?x:{};}
function saveState(x){setItem(SOURCE_STATE_KEY,JSON.stringify(x||{}));}
function enabledAdapters(){var a=loadAdapters(),st=state(),out=[];for(var i=0;i<a.length;i++){var n=a[i].name;if(st[n]===false)continue;out.push(a[i]);}return out;}
function getMode(){var m=getItem(MODE_KEY,'PikPak');if(m==='PIKPAK')m='PikPak';if(m==='115生活')m='115';if(m==='迅雷下载')m='迅雷';return m;}
function setMode(m){setItem(MODE_KEY,m);return m;}
function getSearchMode(){return parseInt(getItem(SEARCH_MODE_KEY,'0'),10)||0;}
function setSearchMode(v){setItem(SEARCH_MODE_KEY,String(v?1:0));}
function installed(rule){var raw='';try{raw=String(request('hiker://home@'+rule)||'');}catch(e){try{raw=String(fetch('hiker://home@'+rule)||'');}catch(_e){raw='';}}return !!raw&&raw!=='null';}
function parseHome(raw){var s=String(raw||''),p=s.indexOf('￥home_rule￥');if(p>=0)s=s.substring(p+'￥home_rule￥'.length);else{p=s.indexOf('{');if(p>=0)s=s.substring(p);}return parseJson(s,null);}
function appInfo(rule){var raw='';try{raw=String(request('hiker://home@'+rule)||'');}catch(e){try{raw=String(fetch('hiker://home@'+rule)||'');}catch(_e){raw='';}}return raw&&raw!=='null'?{name:rule,raw:raw,obj:parseHome(raw)}:null;}
function appPages(inst){var p=inst&&inst.obj&&inst.obj.pages;if(!p)return[];if(p instanceof Array)return p;return parseJson(p,[]);}
function bestPage(kind,inst){var ps=appPages(inst),best=null,score=-1;for(var i=0;i<ps.length;i++){var x=ps[i]||{},n=String(x.name||''),p=String(x.path||''),s=(n+' '+p+' '+String(x.rule||'')).toLowerCase(),v=0;if(kind==='guangya'){if(p.toLowerCase()==='magnet')v+=120;if(/磁力|云添加|离线/.test(n))v+=90;if(/magnet|cloud.?add|offline|addtask|add|diaoyong|fxlj/.test(s))v+=50;}else if(kind==='123'){if(/diaoyong|download|offline/.test(s))v+=80;if(/123|磁力|离线/.test(n+s))v+=40;}if(v>score&&p){score=v;best=x;}}return best;}
function pageUrl(path,rule,params){var u='hiker://page/'+path+'?rule='+rule+'&page=fypage';for(var k in params)if(Object.prototype.hasOwnProperty.call(params,k))u+='&'+k+'='+encodeURIComponent(String(params[k]));return u;}
function handoffUrl(magnet,mode){
  var m=trim(magnet).replace(/&amp;/gi,'&');if(!m)return'toast://磁链为空';mode=mode||getMode();
  if(mode==='复制磁链')return'copy://'+m;
  if(mode==='海阔视界')return m;
  if(mode==='查询元数据')return'hiker://page/magnetMeta?rule='+RULE_NAME+'&curl='+encodeURIComponent(m);
  if(mode==='115'){var a115=appInfo('115.简')||appInfo('115');if(!a115)return'toast://未安装 115 小程序';return'hiker://page/115Offline?rule='+a115.name+'&page=fypage&add='+encodeURIComponent(m);}
  if(mode==='迅雷'){if(!installed('迅雷'))return'toast://未安装 迅雷小程序';return'hiker://page/diaoyong?rule=迅雷&page=fypage#'+m;}
  if(mode==='PikPak'){if(!installed('PikPak'))return'toast://未安装 PikPak 小程序';return'hiker://page/fxlj?rule=PikPak&realurl='+encodeURIComponent(m);}
  if(mode==='光鸭'){var gy=appInfo('光鸭云盘')||appInfo('光鸭');if(!gy)return'toast://未安装 光鸭小程序';var pg=bestPage('guangya',gy);try{if(typeof setClipBoard==='function')setClipBoard(m);else copy(m);}catch(_e){}if(pg&&pg.path)return pageUrl(pg.path,gy.name,{realurl:m,url:m,add:m,magnet:m,input:m});return'hiker://search?s='+m+'&rule='+gy.name;}
  if(mode==='123'){var p123=appInfo('123云盘')||appInfo('123网盘');if(!p123)return'toast://未安装 123 云盘小程序';var p=bestPage('123',p123);if(p&&p.path)return pageUrl(p.path,p123.name,{realurl:m,url:m,add:m,magnet:m,input:m,shareurl:m});return'hiker://search?s='+m+'&rule='+p123.name;}
  return m;
}
function longClicks(m){var names=['115','迅雷','PikPak','光鸭','123','复制磁链'];var out=[];for(var i=0;i<names.length;i++){out.push({title:names[i],js:$.toString(function(x,mode){var raw='';function installed(rule){try{raw=String(request('hiker://home@'+rule)||'');}catch(e){try{raw=String(fetch('hiker://home@'+rule)||'');}catch(_e){raw='';}}return raw&&raw!=='null';}if(mode==='复制磁链')return'copy://'+x;if(mode==='迅雷'){if(!installed('迅雷'))return'toast://未安装 迅雷小程序';return'hiker://page/diaoyong?rule=迅雷&page=fypage#'+x;}if(mode==='PikPak'){if(!installed('PikPak'))return'toast://未安装 PikPak 小程序';return'hiker://page/fxlj?rule=PikPak&realurl='+encodeURIComponent(x);}if(mode==='115'){var r=installed('115.简')?'115.简':(installed('115')?'115':'');if(!r)return'toast://未安装 115 小程序';return'hiker://page/115Offline?rule='+r+'&page=fypage&add='+encodeURIComponent(x);}if(mode==='光鸭'){var r2=installed('光鸭云盘')?'光鸭云盘':(installed('光鸭')?'光鸭':'');if(!r2)return'toast://未安装 光鸭小程序';try{if(typeof setClipBoard==='function')setClipBoard(x);else copy(x);}catch(e2){}return'hiker://search?s='+x+'&rule='+r2;}if(mode==='123'){var r3=installed('123云盘')?'123云盘':(installed('123网盘')?'123网盘':'');if(!r3)return'toast://未安装 123 云盘小程序';return'hiker://search?s='+x+'&rule='+r3;}return x;},m,names[i])});}return out;}
function resolveItem(rule,item){var u=trim(item&&item.url);if(!u)return'';if(u.indexOf('magnet:?')===0||u.indexOf('ed2k://')===0)return u;if(rule.findAliUrl){try{var r=rule.findAliUrl(u);if(typeof r==='string')return r;if(r&&typeof r==='object'&&r.ciliUrl)return r.ciliUrl;}catch(e){throw e;}}return u;}
function highlight(t,q){t=String(t||'');q=trim(q);if(!q)return t;try{var e=q.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&');return t.replace(new RegExp('('+e+')','ig'),function(x){return x.fontcolor('#FF00FF');});}catch(e2){return t;}}
function findAdapter(name){var a=loadAdapters();for(var i=0;i<a.length;i++)if(a[i].name===name)return a[i];return null;}
function openResult(ruleName,itObj,mode){var rule=findAdapter(ruleName);if(!rule)return'toast://搜索源不存在：'+ruleName;var u=trim(itObj&&itObj.url),m=u;if(!u)return'toast://资源链接为空';if(u.indexOf('magnet:?')!==0&&u.indexOf('ed2k://')!==0&&rule.findAliUrl){try{var r=rule.findAliUrl(u);if(typeof r==='string')m=r;else if(r&&typeof r==='object'&&r.ciliUrl)m=r.ciliUrl;}catch(e){return'toast://'+ruleName+' 解析磁链失败：'+String(e.message||e);}}if(!m)return'toast://未解析到资源链接';if(m.indexOf('magnet:?')!==0&&m.indexOf('ed2k://')!==0)return m.indexOf('http')===0?'web://'+m:m;return handoffUrl(m,mode||getMode());}
function resultLongClicks(ruleName,it){var names=['115','迅雷','PikPak','光鸭','123','复制磁链'];var out=[];for(var i=0;i<names.length;i++)out.push({title:names[i],js:$.toString(function(ruleName,it,mode){try{return $.require('magnetjun').openResult(ruleName,it,mode);}catch(e){return'toast://调用失败：'+String(e.message||e);}},ruleName,{url:it.url,sharePwd:it.sharePwd||''},names[i])});return out;}
function resultItem(rule,it,q){if(!it)return null;if(it.skip)return it;var title=String(it.title||'').replace(/^““””/,'');var desc='““””'+String(rule.name||'').fontcolor('#777777')+'&nbsp;'+String(it.desc||'');var u=$('#noLoading#').lazyRule(function(ruleName,itObj){try{return $.require('magnetjun').openResult(ruleName,itObj);}catch(e){return'toast://打开失败：'+String(e.message||e);}},rule.name,{url:it.url,sharePwd:it.sharePwd||''});return{title:'““””'+highlight(title,q),desc:desc,url:u,pic_url:it.pic_url||it.img||'',col_type:(it.pic_url||it.img)?'movie_1_vertical_pic':'text_1',extra:{inheritTitle:false,noPic:true,longClick:resultLongClicks(rule.name,it)}};}
function history(){var a=parseJson(getItem(HISTORY_KEY,'[]'),[]);return a instanceof Array?a:[];}
function record(q){q=trim(q);if(!q)return;var a=history(),out=[q];for(var i=0;i<a.length&&out.length<20;i++)if(a[i]!==q)out.push(a[i]);setItem(HISTORY_KEY,JSON.stringify(out));}
function queryFromContext(){var q='';try{q=trim(getMyVar('magnetjun_q',''));}catch(e){}if(!q)try{q=trim(MY_PARAMS&&MY_PARAMS.searchTerms);}catch(e2){}if(!q)try{q=safeDecode(getParam('searchTerms',''));}catch(e3){}if(!q)try{q=trim(getParam('s',''));}catch(e4){}if(!q)try{q=trim(getParam('kw',''));}catch(e5){}if(!q)try{q=trim(getParam('q',''));}catch(e6){}return q;}
function header(d,q){var sm=getSearchMode(),mode=getMode();d.push({title:'搜索：'+(sm?'精准':'聚合'),url:$('#noLoading#').lazyRule(function(){var v=parseInt(getItem('magnetjun_search_mode_v1','0'),10)||0;setItem('magnetjun_search_mode_v1',String(v?0:1));refreshPage(false);return'hiker://empty';}),col_type:'icon_2_round',pic_url:'hiker://images/icon_search6',extra:{lineVisible:false}});d.push({title:'模式：'+mode,url:'select://'+JSON.stringify({title:'磁力君.简 · 打开方式',options:['PikPak','115','迅雷','光鸭','123','复制磁链','查询元数据','海阔视界','搜索源管理'],col:2,js:$.toString(function(){if(input==='搜索源管理')return'hiker://page/magnetSources?rule=磁力君.简&simple=true';setItem('magnetjun_open_mode_v1',input);refreshPage(false);return'toast://已切换：'+input;})}),col_type:'icon_2_round',pic_url:'hiker://images/icon_menu6',extra:{lineVisible:false}});d.push({title:'🔎',desc:'输入关键词、番号或磁力链接',col_type:'input',url:$.toString(function(){var q=String(input||'').trim();if(!q)return'hiker://empty';if(q.indexOf('magnet:?')===0)return'hiker://page/magnetMeta?rule=磁力君.简&curl='+encodeURIComponent(q);putMyVar('magnetjun_q',q);refreshPage(false);return'hiker://empty';}),extra:{onChange:"putMyVar('magnetjun_q',input)",defaultValue:q,id:'magnetjun_search_input'}});}
function sourceChips(d){var all=loadAdapters(),st=state(),selected=getItem('magnetjun_selected_source','');d.push({title:selected?'全部':'““全部””',url:$('#noLoading#').lazyRule(function(){clearItem('magnetjun_selected_source');refreshPage(false);return'hiker://empty';}),col_type:'scroll_button'});for(var i=0;i<all.length;i++){var n=all[i].name;if(st[n]===false)continue;d.push({title:selected===n?'““'+n+'””':n,url:$('#noLoading#').lazyRule(function(n){setItem('magnetjun_selected_source',n);refreshPage(false);return'hiker://empty';},n),col_type:'scroll_button'});}}
function emptyState(d){var h=history();if(h.length){d.push({title:'最近搜索',desc:'点击快速搜索 · 长按首页菜单可清空',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});for(var i=0;i<Math.min(h.length,8);i++)d.push({title:h[i],url:$('#noLoading#').lazyRule(function(q){putMyVar('magnetjun_q',q);refreshPage(false);return'hiker://empty';},h[i]),col_type:'scroll_button'});}else d.push({title:'输入关键词开始聚合搜索',desc:'支持番号 / 片名 / Hash / 磁力链接\n可在“搜索源管理”启停搜索源',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});}
function search(){
 addListener('onClose',$.toString(function(){clearMyVar('magnetjun_q');}));var q=queryFromContext();if(q)putMyVar('magnetjun_q',q);var d=[];header(d,q);sourceChips(d);if(!q){emptyState(d);setResult(d);return;}
 record(q);var selected=getItem('magnetjun_selected_source',''),all=enabledAdapters(),data=[];for(var i=0;i<all.length;i++)if(!selected||all[i].name===selected)data.push(all[i]);if(!data.length){d.push({title:'没有可用搜索源',desc:'请到搜索源管理启用至少一个搜索源',url:'hiker://page/magnetSources?rule='+RULE_NAME+'&simple=true',col_type:'text_center_1'});setResult(d);return;}
 var page=parseInt(MY_PAGE,10)||1,realPage=selected?page:1,marker='magnetjun_loading_'+Date.now();d.push({title:'正在搜索 '+data.length+' 个来源…',desc:'第 '+page+' 页',url:'hiker://empty',col_type:'text_center_1',extra:{id:marker,lineVisible:false}});setResult(d);
 var tasks=[];for(var j=0;j<data.length;j++)tasks.push({func:function(rule){try{return{ok:true,rule:rule,list:rule.find(q,realPage)||[]};}catch(e){return{ok:false,rule:rule,error:String(e.message||e),list:[]};}},param:data[j],id:'src@'+data[j].name});
 batchExecute(tasks,{func:function(param,id,error,res){param.done=(param.done||0)+1;param.found=param.found||0;param.errors=param.errors||[];if(res&&res.ok&&res.list instanceof Array){var rr=[];for(var k=0;k<res.list.length;k++){var x=resultItem(res.rule,res.list[k],q);if(x){if(getSearchMode()&&String(res.list[k].title||'').toLowerCase().indexOf(q.toLowerCase())<0)continue;rr.push(x);}}if(rr.length){param.found+=rr.length;addItemBefore(marker,rr);}}else if(res&&!res.ok){param.errors.push(res.rule.name+'：'+res.error);}if(param.done>=param.total){deleteItem(marker);if(!param.found)addItemAfter('magnetjun_search_input',{title:'没有搜索到资源',desc:param.errors.length?('失败来源 '+param.errors.length+' 个，可到搜索源管理调整'):'换个关键词试试',url:'hiker://page/magnetSources?rule=磁力君.简&simple=true',col_type:'text_center_1',extra:{lineVisible:false}});}},param:{done:0,total:tasks.length,found:0,errors:[]}});
}
function externalSearch(){var q='';try{q=trim(MY_KEYWORD);}catch(e){}if(!q)q=trim(getParam('searchTerms',''));setResult([{title:'聚合搜索：'+q,desc:'在磁力君.简中搜索',url:'hiker://page/magnetSearch?rule='+RULE_NAME+'&page=fypage&searchTerms='+encodeURIComponent(q)+'&simple=true',col_type:'text_1',extra:{lineVisible:false}}]);}
function home(){search();}
function sources(){setPageTitle('磁力君.简 · 搜索源管理');var d=[],a=loadAdapters(),st=state(),enabled=0;for(var i=0;i<a.length;i++)if(st[a[i].name]!==false)enabled++;d.push({title:'搜索源',desc:'当前 '+enabled+' / '+a.length+' 个启用\n点击启用/禁用；默认搜索源来自旧版固定快照，不再自动跟随上游更新',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'全部启用',url:$('#noLoading#').lazyRule(function(){setItem('magnetjun_source_state_v1','{}');refreshPage(false);return'toast://已全部启用';}),col_type:'scroll_button'},{title:'清除缓存',url:$('#noLoading#').lazyRule(function(path){try{deleteFile(path);}catch(e){}refreshPage(false);return'toast://已清除搜索源缓存';},ADAPTER_CACHE),col_type:'scroll_button'});for(var j=0;j<a.length;j++){var n=a[j].name,on=st[n]!==false;d.push({title:(on?'● ':'○ ')+n,desc:on?'已启用':'已禁用',url:$('#noLoading#').lazyRule(function(n){var st={};try{st=JSON.parse(getItem('magnetjun_source_state_v1','{}'));}catch(e){}st[n]=st[n]===false?true:false;setItem('magnetjun_source_state_v1',JSON.stringify(st));refreshPage(false);return'hiker://empty';},n),col_type:'text_1',extra:{lineVisible:false}});}setResult(d);}
function settings(){setPageTitle('磁力君.简 · 设置');var d=[];d.push({title:'磁力君.简',desc:VERSION+' · Build '+BUILD+'\n应用名已正式去掉“测试”；测试仅作为版本通道，不进入程序名称',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'默认打开方式',desc:getMode(),url:'select://'+JSON.stringify({title:'默认打开方式',options:['PikPak','115','迅雷','光鸭','123','复制磁链','查询元数据','海阔视界'],col:2,js:$.toString(function(){setItem('magnetjun_open_mode_v1',input);refreshPage(false);return'toast://已切换：'+input;})}),col_type:'text_1'});d.push({title:'搜索源管理',desc:'启用 / 禁用聚合搜索源',url:'hiker://page/magnetSources?rule='+RULE_NAME+'&simple=true',col_type:'text_1'});d.push({title:'清空搜索历史',url:$('#noLoading#').lazyRule(function(){clearItem('magnetjun_search_history_v1');return'toast://已清空';}),col_type:'text_1'});d.push({title:'外部搜索合同',desc:'hiker://page/magnetSearch?rule=磁力君.简&page=fypage&searchTerms=<关键词>\n兼容 MyAv/JavDB 等程序直接传入番号并自动搜索',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});setResult(d);}
function meta(){setPageTitle('磁力元数据');var m=safeDecode(getParam('curl',''));var d=[];if(!m){d.push({title:'缺少磁力链接',col_type:'text_center_1',url:'hiker://empty'});setResult(d);return;}d.push({title:'磁力链接',desc:m,url:'copy://'+m,col_type:'text_1',extra:{lineVisible:false,longClick:longClicks(m)}});try{var json=JSON.parse(request('https://whatslink.info/api/v1/link?url='+encodeURIComponent(m),{timeout:7000}));if(json&&json.name)d.push({title:json.name,desc:(json.size?('大小：'+json.size+'\n'):'')+(json.count?('文件数：'+json.count):''),url:'hiker://empty',col_type:'text_1'});if(json&&json.screenshots instanceof Array)for(var i=0;i<json.screenshots.length;i++)d.push({title:'预览 '+(i+1),pic_url:json.screenshots[i].screenshot,url:json.screenshots[i].screenshot,col_type:'pic_1_full'});}catch(e){d.push({title:'元数据暂时不可用',desc:String(e.message||e),url:'hiker://empty',col_type:'text_center_1'});}setResult(d);}
function info(){return{version:VERSION,build:BUILD,name:RULE_NAME,adapterRef:ADAPTER_REF,adapterCache:ADAPTER_CACHE};}
function module(){return{home:home,search:search,externalSearch:externalSearch,sources:sources,settings:settings,meta:meta,openResult:openResult,info:info,version:VERSION,build:BUILD};}
return{module:module,info:info,version:VERSION,build:BUILD};
})();
var MagnetJunLocal=MagnetJun;
