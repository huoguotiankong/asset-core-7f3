/* 我的规则仓库·测试版 Bootstrap v1.0.45 - 3.5.6-rc9 / Local-First Runtime */
(function(){
var BOOT_VERSION='1.0.45-test';
var LOCAL_MANAGER_VERSION=210;
var LOCAL_MANAGER_URLS=[
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@c55bf6781ea0fdd41bbbfb0768e30c53eabc736b/libs/updater/v2.1.0/local_bundle_manager.js',
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/c55bf6781ea0fdd41bbbfb0768e30c53eabc736b/libs/updater/v2.1.0/local_bundle_manager.js',
 'https://github.com/huoguotiankong/asset-core-7f3/raw/c55bf6781ea0fdd41bbbfb0768e30c53eabc736b/libs/updater/v2.1.0/local_bundle_manager.js'
];
var RELEASE_URLS=[
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@9960d629bd6c45ba5d0b830167e7c688c683bf7b/apps/tools/rule-repo/releases/test-3.5.6-rc9/release.json',
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/9960d629bd6c45ba5d0b830167e7c688c683bf7b/apps/tools/rule-repo/releases/test-3.5.6-rc9/release.json',
 'https://github.com/huoguotiankong/asset-core-7f3/raw/9960d629bd6c45ba5d0b830167e7c688c683bf7b/apps/tools/rule-repo/releases/test-3.5.6-rc9/release.json'
];
var CONTROL_CONFIG={id:'rule-repo-test',timeout:8000,repoTemplates:[
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}',
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}',
 'https://github.com/huoguotiankong/asset-core-7f3/raw/{ref}/{path}'
]};
function valid(t){t=String(t==null?'':t);return !!t.trim()&&!/^\s*(<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found)/i.test(t);}
function fetchAny(us,label){var es=[];for(var i=0;i<us.length;i++)try{var t=fetch(String(us[i]),{timeout:8000,headers:{'Cache-Control':'no-cache'}});if(!valid(t))throw new Error('无效响应');return String(t);}catch(e){es.push((i+1)+':'+String(e.message||e));}throw new Error(String(label||'资源')+'全部镜像失败：'+es.join(' | '));}
function requireAny(us,ver,label){var es=[];for(var i=0;i<us.length;i++)try{require(String(us[i]),{headers:{'Cache-Control':'no-cache'}},Number(ver||1));return String(us[i]);}catch(e){es.push((i+1)+':'+String(e.message||e));}throw new Error(String(label||'模块')+'全部镜像失败：'+es.join(' | '));}
function release(){var r=JSON.parse(fetchAny(RELEASE_URLS,'RC9 Release'));if(String(r.id)!=='rule-repo-test'||Number(r.build)!==399)throw new Error('RC9 Release 身份异常');return r;}
function localManager(){requireAny(LOCAL_MANAGER_URLS,LOCAL_MANAGER_VERSION,'Local Bundle Manager 2.1.0');if(typeof HikerLocalBundle!=='object'||String(HikerLocalBundle.version)!=='2.1.0')throw new Error('Local Bundle Manager 版本异常');return HikerLocalBundle;}
function stateRaw(){try{return fileExist('__hclocal_rule-repo-test_state.json')?JSON.parse(String(readFile('__hclocal_rule-repo-test_state.json',0)||'{}')):{};}catch(e){return{};}}
var RuleRepoBoot={
 version:BOOT_VERSION,
 installLocal:function(force){var m=localManager(),r=release();if(force)try{m.removeBuild(CONTROL_CONFIG,r.build);}catch(e){}var x=m.ensure(CONTROL_CONFIG,r);if(!x||!x.ok)throw new Error(x&&x.error?x.error:'本地运行包安装失败');return x;},
 localStatus:function(){var s=stateRaw(),c=s.current||{},p=s.previous||{};return{current:c,previous:p,lastInstallError:String(s.lastInstallError||'')};},
 updatePage:function(){setPageTitle('测试版更新');var d=[],s=this.localStatus(),c=s.current||{};
  d.push({title:'我的规则仓库·测试版',desc:'当前 Shell 3.5.6-rc9 · Build 399\nLocal-First Runtime · Bundle Manager 2.1.0',img:'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg',col_type:'icon_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
  d.push({title:'本地运行包',desc:c&&c.build?'已安装 '+String(c.version||'')+' / Build '+Number(c.build||0):'尚未初始化；首次打开会自动下载',col_type:'text_1',url:'hiker://empty'});
  d.push({title:'检查新测试版',col_type:'text_2',url:$('#noLoading#').lazyRule(function(){showLoading('正在检查…');try{var us=['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/tools/rule-repo/test.json?_t='+Date.now(),'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/test.json?_t='+Date.now()];var t='',e='';for(var i=0;i<us.length;i++)try{t=fetch(us[i],{timeout:6000,headers:{'Cache-Control':'no-cache'}});if(String(t||'').trim())break;}catch(x){e=String(x.message||x);}var j=JSON.parse(String(t||'{}'));hideLoading();if(Number(j.build||0)>399)return'toast://发现 '+j.version+' / Build '+j.build+'，请回到版本中心覆盖导入';return'toast://当前已是最新测试版';}catch(ex){hideLoading();return'toast://检查失败：'+String(ex.message||ex||'网络异常');}})});
  d.push({title:'重装当前本地包',col_type:'text_2',url:$('#noLoading#').lazyRule(function(){showLoading('正在重新下载本地包…');try{var bus=['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/tools/rule-repo/bootstrap_test_v145.js','https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v145.js'];var ok=false,er='';for(var i=0;i<bus.length;i++)try{require(bus[i],{headers:{'Cache-Control':'no-cache'}},145);ok=true;break;}catch(x){er=String(x.message||x);}if(!ok)throw new Error(er||'Bootstrap加载失败');var x=RuleRepoBoot.installLocal(true);hideLoading();return'toast://本地运行包已重装：'+x.release.version;}catch(e){hideLoading();return'toast://重装失败：'+String(e.message||e);}})});
  d.push({col_type:'line'});d.push({title:'说明',desc:'正常打开只读取规则私有本地运行包；GitHub/CDN 只用于首次安装、显式检查更新和重装。新版本必须先完整下载并校验，再切换本地 active。',col_type:'text_1',url:'hiker://empty'});setResult(d);
 },
 load:function(){var r=release(),urls=function(m){return['https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+r.ref+'/'+m.path,'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+r.ref+'/'+m.path];};for(var i=0;i<r.modules.length;i++)requireAny(urls(r.modules[i]),r.build,String(r.modules[i].name||'模块'));if(typeof HikerRuleRepo!=='object')throw new Error('规则仓库 Runtime 加载失败');return HikerRuleRepo;},
 run:function(page){var r=this.load(),fn=r&&r[String(page||'home')];if(typeof fn!=='function')throw new Error('页面入口不存在：'+page);return fn.call(r);}
};
RULE_REPO_BOOTSTRAP_VERSION=BOOT_VERSION;
})();
