/* MyAv 0.1.1-test.2 · cloud magnet menu + custom cross-app search */
var MyAvEnhance10202=(function(){
var VERSION='0.1.1-test.2',BUILD=10202;
var ROOT='hiker://files/rules/asset-core-local/myav-test/b10202/';
var ENTRY=ROOT+'local_entry.js',BASE_ENTRY=ROOT+'base_011t1_entry.js';
var BASE_REF='a59c57bb599a622c53e3ffca689aa94f98636f23';
var BASE_PATH='apps/video/myav/releases/0.1.1-test.1/local_entry.js';
var SEARCH_KEY='myav_external_search_targets_v1';
var BASE_CACHE=null;
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function urls(ref,path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+ref+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+ref+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+ref+'/'+path];}
function ensureFile(local,ref,path,marker){if(fileExist(local)){try{var old=String(readFile(local)||'');if(!bad(old)&&old.indexOf(marker)>=0)return local;}catch(_e){}try{deleteFile(local);}catch(_e2){}}var us=urls(ref,path),es=[],i,s='';for(i=0;i<us.length;i++){try{s=String(fetch(us[i],{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(bad(s)||s.indexOf(marker)<0)throw new Error('无效响应');writeFile(local,s);if(!fileExist(local))throw new Error('写入失败');return local;}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error(path+' 下载失败：'+es.join(' | '));}
function base(){if(BASE_CACHE&&typeof BASE_CACHE.module==='function')return BASE_CACHE;ensureFile(BASE_ENTRY,BASE_REF,BASE_PATH,'0.1.1-test.1');var src=String(readFile(BASE_ENTRY)||''),MyAvLocal=null;if(bad(src)||src.indexOf('0.1.1-test.1')<0)throw new Error('MyAv 0.1.1-test.1 Base Entry 内容无效');eval(src);if(!MyAvLocal||typeof MyAvLocal.module!=='function')throw new Error('MyAv 0.1.1-test.1 Base Entry 未导出');BASE_CACHE=MyAvLocal;return BASE_CACHE;}
function parseJson(s,d){try{return JSON.parse(String(s||''));}catch(e){return d;}}
function searchTargets(){var a=parseJson(getItem(SEARCH_KEY,'[]'),[]),out=[],seen={},i,x,n,r;if(!(a instanceof Array))a=[];for(i=0;i<a.length;i++){x=a[i]||{};r=String(x.rule||x.name||'').trim();n=String(x.name||r).trim();if(!r||seen[r.toLowerCase()])continue;seen[r.toLowerCase()]=1;out.push({name:n||r,rule:r});}return out;}
function saveTargets(a){setItem(SEARCH_KEY,JSON.stringify(a||[]));return a||[];}
function externalSearchUrl(rule,kw){return $('#noLoading#').lazyRule(function(rule,kw){rule=String(rule||'').trim();kw=String(kw||'').trim();if(!rule||!kw)return'toast://缺少搜索目标或关键词';var raw='';try{raw=String(request('hiker://home@'+rule)||'');}catch(e){try{raw=String(fetch('hiker://home@'+rule)||'');}catch(_e){raw='';}}if(!raw||raw==='null')return'toast://未安装 '+rule;return'hiker://search?s='+encodeURIComponent(kw)+'&rule='+encodeURIComponent(rule);},rule,kw);}
function section(title,desc){return{title:'▌ '+title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
function line(title,desc,url){return{title:title,desc:desc||'',url:url||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
function chip(title,url){return{title:title,url:url,col_type:'scroll_button',extra:{lineVisible:false}};}
function magnetAction(title,kind,magnet){return{title:title,js:$.toString(function(kind,m){
  m=String(m||'').replace(/&amp;/gi,'&').trim();kind=String(kind||'');
  if(!m||m.indexOf('magnet:?')!==0)return'toast://未识别到磁力链接';
  function home(rule){var raw='';try{raw=String(request('hiker://home@'+rule)||'');}catch(e){try{raw=String(fetch('hiker://home@'+rule)||'');}catch(_e){raw='';}}return raw;}
  function parseRule(raw){var s=String(raw||'').trim(),p=s.indexOf('￥home_rule￥'),o=null;if(p>=0)s=s.substring(p+'￥home_rule￥'.length);else{p=s.indexOf('{');if(p>=0)s=s.substring(p);}try{o=JSON.parse(s);}catch(e){o=null;}return o;}
  function pagesOf(o){var p=o&&o.pages;if(!p)return[];if(p instanceof Array)return p;try{var a=JSON.parse(String(p));return a instanceof Array?a:[];}catch(e){return[];}}
  function installed(cands){for(var i=0;i<cands.length;i++){var raw=home(cands[i]);if(raw&&raw!=='null')return{name:cands[i],raw:raw,obj:parseRule(raw)};}return null;}
  function score(kind,x){var n=String(x&&x.name||''),p=String(x&&x.path||''),r=String(x&&x.rule||''),s=(n+' '+p+' '+r).toLowerCase(),v=0,pl=p.toLowerCase();
    if(kind==='xunlei'){if(pl==='download')v+=120;if(pl==='diaoyong')v+=100;if(/迅雷|磁力|离线/.test(n))v+=70;if(/realurl|magnet|download|diaoyong/.test(s))v+=30;}
    else if(kind==='pikpak'){if(pl==='fxlj')v+=130;if(pl==='pikpak')v+=120;if(pl==='diaoyong')v+=90;if(/pikpak|磁力|云添加|离线/.test(n+s))v+=50;}
    else if(kind==='guangya'){if(pl==='magnet')v+=120;if(/磁力|云添加|离线/.test(n))v+=90;if(/magnet|cloud.?add|offline|offlineadd|addtask|add/.test(pl))v+=70;if(/磁力|云添加|resolve_res|create_task|realurl|magnet/.test(s))v+=35;if(/diaoyong|fxlj|调用/.test(s))v+=20;}
    else if(kind==='123'){if(pl==='download')v+=120;if(pl==='diaoyong')v+=100;if(/123|磁力|离线/.test(n+s))v+=40;}
    return v;
  }
  function bestPage(kind,inst){var ps=pagesOf(inst&&inst.obj),best=null,bs=0;for(var i=0;i<ps.length;i++){var sc=score(kind,ps[i]);if(sc>bs&&ps[i]&&ps[i].path){best=ps[i];bs=sc;}}return best;}
  function pageUrl(path,rule,params){var a=['rule='+encodeURIComponent(rule),'page=fypage'],k;for(k in params)if(Object.prototype.hasOwnProperty.call(params,k))a.push(encodeURIComponent(k)+'='+encodeURIComponent(String(params[k])));return'hiker://page/'+path+'?'+a.join('&');}
  var inst,p,em=encodeURIComponent(m);
  if(kind==='115'){
    inst=installed(['115.简','115']);if(!inst)return'toast://未安装 115 小程序';
    return'hiker://page/115Offline?rule='+encodeURIComponent(inst.name)+'&page=fypage&add='+em;
  }
  if(kind==='xunlei'){
    inst=installed(['迅雷','迅雷云盘','迅雷云盘.简']);if(!inst)return'toast://未安装 迅雷小程序';p=bestPage(kind,inst);
    if(p&&String(p.path).toLowerCase()==='diaoyong')return'hiker://page/'+p.path+'?rule='+encodeURIComponent(inst.name)+'&page=fypage#'+m;
    if(p)return pageUrl(p.path,inst.name,{realurl:m,url:m,add:m,magnet:m,input:m});
    return'hiker://page/download?rule='+encodeURIComponent(inst.name)+'&page=fypage&realurl='+em;
  }
  if(kind==='pikpak'){
    inst=installed(['PikPak','PikPak.简','pikpak']);if(!inst)return'toast://未安装 PikPak 小程序';p=bestPage(kind,inst);
    if(p)return pageUrl(p.path,inst.name,{realurl:m,url:m,add:m,magnet:m,input:m});
    return'hiker://page/fxlj?rule='+encodeURIComponent(inst.name)+'&page=fypage&realurl='+em;
  }
  if(kind==='guangya'){
    inst=installed(['光鸭云盘','光鸭']);if(!inst)return'toast://未检测到光鸭云盘小程序，请先确认规则已安装';p=bestPage(kind,inst);
    try{if(typeof setClipBoard==='function')setClipBoard(m);else if(typeof copy==='function')copy(m);}catch(_c){}
    if(p)return pageUrl(p.path,inst.name,{realurl:m,url:m,add:m,magnet:m,input:m});
    return'hiker://search?s='+em+'&rule='+encodeURIComponent(inst.name);
  }
  if(kind==='123'){
    inst=installed(['123网盘','123云盘']);if(!inst)return'toast://未安装 123 云盘小程序';p=bestPage(kind,inst);
    if(p)return pageUrl(p.path,inst.name,{shareurl:m,realurl:m,url:m,add:m,magnet:m,input:m});
    return'hiker://page/Download?rule='+encodeURIComponent(inst.name)+'&page=fypage&shareurl='+em;
  }
  return'toast://暂不支持该目标';
},kind,magnet)};}
function magnetMenu(link){var m=String(link||'').replace(/&amp;/gi,'&').trim();return[
  magnetAction('115','115',m),
  magnetAction('迅雷','xunlei',m),
  magnetAction('PikPak','pikpak',m),
  magnetAction('光鸭','guangya',m),
  magnetAction('123','123',m),
  {title:'复制磁链',js:$.toString(function(x){x=String(x||'').replace(/&amp;/gi,'&').trim();return x?'copy://'+x:'toast://未识别到磁力链接';},m)}
];}
function capture(run,patch){var oldSet=null,got=null,hooked=false,err=null,ret=null;try{oldSet=setResult;var cap=function(v){got=v;};setResult=cap;hooked=(setResult===cap);}catch(e){hooked=false;}if(!hooked){ret=run();return ret instanceof Array?patch(ret):ret;}try{ret=run();}catch(e2){err=e2;}finally{try{setResult=oldSet;}catch(_e){}}if(err)throw err;if(got instanceof Array)return oldSet(patch(got));if(got!=null)return oldSet(got);return ret instanceof Array?patch(ret):ret;}
function codeFromItems(items){var i,t,m;for(i=0;i<items.length;i++){t=String(items[i]&&items[i].title||'');m=t.match(/^番号\s*[·・:]\s*(.+)$/);if(m)return String(m[1]||'').trim();}for(i=0;i<items.length;i++){t=String(items[i]&&items[i].desc||'');m=t.match(/\b(?:FC2[-_ ]?(?:PPV[-_ ]?)?\d{4,}|[A-Za-z]{2,12}[-_. ]?\d{2,6}(?:[-_.][A-Za-z0-9]+)*)\b/i);if(m)return String(m[0]||'').trim().replace(/[ _]+/g,'-');}return'';}
function externalBlock(keyword){var a=searchTargets(),out=[section('自定义搜索',a.length?'用当前番号调用其它已配置小程序搜索':'尚未配置搜索小程序')],i,t;if(!a.length){out.push(chip('＋ 设置搜索小程序','hiker://page/myavExternalSearch?rule='+encodeURIComponent((typeof MY_RULE==='object'&&MY_RULE&&MY_RULE.title)?MY_RULE.title:'MyAv')+'&simple=true'));return out;}for(i=0;i<a.length;i++){t=a[i];out.push(chip(t.name,externalSearchUrl(t.rule,keyword)));}out.push(chip('管理','hiker://page/myavExternalSearch?rule='+encodeURIComponent((typeof MY_RULE==='object'&&MY_RULE&&MY_RULE.title)?MY_RULE.title:'MyAv')+'&simple=true'));return out;}
function injectDetail(items){if(!(items instanceof Array))return items;var code=codeFromItems(items),blk,at,i,t;if(!code)return items;blk=externalBlock(code);at=items.length;for(i=0;i<items.length;i++){t=String(items[i]&&items[i].title||'');if(t.indexOf('▌ 档案')===0){at=i;break;}}Array.prototype.splice.apply(items,[at,0].concat(blk));return items;}
function injectSearch(items){if(!(items instanceof Array))return items;var kw='';try{kw=String(getMyVar('myav_search_kw','')||'').trim();}catch(e){}if(!kw)return items;var p=1;try{p=parseInt(MY_PAGE,10)||1;}catch(_e){}if(p!==1)return items;var blk=externalBlock(kw),at=Math.min(items.length,4),i,t;for(i=0;i<items.length;i++){t=String(items[i]&&items[i].title||'');if(t.indexOf('▌ 搜索结果')===0){at=i+1;break;}}Array.prototype.splice.apply(items,[at,0].concat(blk));return items;}
function managerPage(){var d=[],a=searchTargets(),i,t;setPageTitle('MyAv · 自定义搜索');d.push(section('跨小程序搜索','详情页与搜索页会把当前番号/关键词传给已配置的小程序'));
d.push(line('从已安装小程序选择','优先读取海阔已安装规则；如果当前版本不提供规则列表，可使用下方手动添加',$('#noLoading#').lazyRule(function(key){var raw=null,a=[],names=[],seen={},i,x,n;try{if(typeof getAppRules==='function')raw=getAppRules();}catch(e){raw=null;}try{if(typeof raw==='string')raw=JSON.parse(raw);}catch(_e){raw=[];}if(raw instanceof Array)a=raw;else if(raw&&typeof raw==='object'){for(var k in raw)if(Object.prototype.hasOwnProperty.call(raw,k))a.push(raw[k]);}for(i=0;i<a.length;i++){x=a[i]||{};n=String(x.title||x.name||x.rule||x.rule_name||'').trim();if(n&&!seen[n.toLowerCase()]){seen[n.toLowerCase()]=1;names.push(n);}}names.sort();if(!names.length)return'toast://当前海阔版本未返回已安装规则列表，请使用“手动添加”';return $(names,1,'选择要调用搜索的小程序').select(function(key){var rule=String(input||'').trim();if(!rule)return'hiker://empty';var old=[];try{old=JSON.parse(getItem(key,'[]'));}catch(e){old=[];}if(!(old instanceof Array))old=[];for(var i=0;i<old.length;i++)if(String(old[i]&&old[i].rule||'').toLowerCase()===rule.toLowerCase())return'toast://已存在 '+rule;old.push({name:rule,rule:rule});setItem(key,JSON.stringify(old));refreshPage(false);return'toast://已添加 '+rule;},key);},SEARCH_KEY)));
d.push(line('手动添加','输入“显示名|规则名”；只输入一个名称时显示名与规则名相同',$('','例如：青豆剧场|青豆剧场').input(function(key){var s=String(input||'').trim();if(!s)return'toast://请输入小程序名称';var p=s.split('|'),name=String(p[0]||'').trim(),rule=String(p[1]||p[0]||'').trim(),a=[];try{a=JSON.parse(getItem(key,'[]'));}catch(e){a=[];}if(!(a instanceof Array))a=[];for(var i=0;i<a.length;i++)if(String(a[i]&&a[i].rule||'').toLowerCase()===rule.toLowerCase())return'toast://已存在 '+rule;a.push({name:name||rule,rule:rule});setItem(key,JSON.stringify(a));refreshPage(false);return'toast://已添加 '+(name||rule);},SEARCH_KEY)));
d.push(section('已配置',a.length?a.length+' 个目标 · 点击可试搜，长按可删除':'暂无目标'));if(!a.length)d.push(line('还没有搜索目标','先从已安装小程序选择，或手动添加规则名'));
for(i=0;i<a.length;i++){t=a[i];d.push({title:t.name,desc:'规则：'+t.rule+'\n点击输入关键词测试 · 长按删除',url:$('', '输入测试关键词').input(function(rule){var q=String(input||'').trim();if(!q)return'toast://请输入关键词';var raw='';try{raw=String(request('hiker://home@'+rule)||'');}catch(e){try{raw=String(fetch('hiker://home@'+rule)||'');}catch(_e){raw='';}}if(!raw||raw==='null')return'toast://未安装 '+rule;return'hiker://search?s='+encodeURIComponent(q)+'&rule='+encodeURIComponent(rule);},t.rule),col_type:'text_1',extra:{lineVisible:false,longClick:[{title:'删除',js:$.toString(function(key,rule){var a=[];try{a=JSON.parse(getItem(key,'[]'));}catch(e){a=[];}var out=[];for(var i=0;i<a.length;i++)if(String(a[i]&&a[i].rule||'').toLowerCase()!==String(rule||'').toLowerCase())out.push(a[i]);setItem(key,JSON.stringify(out));refreshPage(false);return'toast://已删除 '+rule;},SEARCH_KEY,t.rule)}]}});}
d.push(section('调用合同','默认使用海阔通用定向搜索，不依赖目标小程序私有页面'));
d.push(line('搜索路由','hiker://search?s=<关键词>&rule=<规则名>'));
d.push(line('隐私','配置仅保存在本机，不包含 Cookie / Token / Authorization，也不会写回 GitHub'));
setResult(d);}
function patchModule(m){if(!m||typeof m.core!=='function')throw new Error('MyAv Base Module 未就绪');var C=m.core();if(!C)throw new Error('MyAv Core 未就绪');C.magnetLongClicks=magnetMenu;C.externalSearchTargets=searchTargets;C.externalSearchSave=saveTargets;C.externalSearchUrl=externalSearchUrl;
  if(typeof m.detail==='function'){var od=m.detail;m.detail=function(){return capture(function(){return od.call(m);},injectDetail);};}
  if(typeof m.search==='function'){var os=m.search;m.search=function(){return capture(function(){return os.call(m);},injectSearch);};}
  if(typeof m.settings==='function'){var ost=m.settings;m.settings=function(){return capture(function(){return ost.call(m);},function(items){if(!(items instanceof Array))return items;var blk=[section('跨小程序搜索','详情/搜索页可把番号或关键词交给其它海阔小程序'),line('管理自定义搜索目标',searchTargets().length+' 个已配置目标','hiker://page/myavExternalSearch?rule='+encodeURIComponent((typeof MY_RULE==='object'&&MY_RULE&&MY_RULE.title)?MY_RULE.title:'MyAv')+'&simple=true')];Array.prototype.splice.apply(items,[items.length,0].concat(blk));return items;});};}
  m.externalSearch=managerPage;m.version=VERSION;m.build=BUILD;m.magnetLongPressMenu='115>xunlei>pikpak>guangya>123>copy';m.customExternalSearch=true;m.baseVersion='0.1.1-test.1';return m;}
function module(){return patchModule(base().module());}
function info(){var b=base(),x={};try{x=b.info?b.info():{};}catch(e){x={ready:false,error:String(e.message||e)};}x.version=VERSION;x.build=BUILD;x.baseVersion='0.1.1-test.1';x.magnetMenu=['115','迅雷','PikPak','光鸭','123','复制磁链'];x.customExternalSearch=true;x.searchTargets=searchTargets().length;return x;}
function statusPage(){setPageTitle('MyAv · 增强诊断');var d=[],x=info();d.push(line('MyAv '+VERSION,'Build '+BUILD+' · 基于 '+x.baseVersion+' 的低侵入增强'));d.push(line('磁力长按','115 → 迅雷 → PikPak → 光鸭 → 123 → 复制磁链'));d.push(line('光鸭调用','点击时读取当前已安装规则 pages，动态寻找磁力/云添加/离线入口；找不到专页时退回定向搜索'));d.push(line('自定义搜索',String(x.searchTargets||0)+' 个本机目标；详情页与搜索页按当前番号/关键词调用'));d.push(line('业务边界','线路 A/B/C/D、登录、详情解析、第三方播放与收藏链继承 0.1.1-test.1，不在本轮重写'));setResult(d);}
return{version:VERSION,build:BUILD,module:module,info:info,statusPage:statusPage,entry:ENTRY,base:base};
})();
var MyAvLocal=MyAvEnhance10202;
