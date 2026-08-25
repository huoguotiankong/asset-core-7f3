/* ACFun 0.5.0-test.3 isolated Local-First overlay */
(function(){
if(typeof ac!=='object')throw new Error('ACFun Stable 0.4.9 runtime missing');
var VERSION='0.5.0-test.3',BUILD=50003;
var ROOT='hiker://files/rules/asset-core-local/acfun-test/b50003/';
var META=ROOT+'bundle_meta.json',BUNDLE=ROOT+'runtime_bundle.js',TRAMP="var ac=$.require('acfun50003');";
function compat(k){try{clearItem(k);}catch(e){}try{setItem(k,TRAMP);return true;}catch(e2){return false;}}
compat('acfun_core_src_v018');compat('acfun_core_src_v019');compat('acfun_remote_bundle_src');
ac.localFirstVersion=VERSION;ac.localFirstBuild=BUILD;ac.build='2026.08.25-local-0.5.0-test.3';ac.runtimeMode='stable-049-local-first-isolated-test';ac.storageGuardVersion=VERSION;
ac.localFirstInfo=function(){var m={};try{if(fileExist(META))m=JSON.parse(String(readFile(META)||'{}'));}catch(e){}return{version:VERSION,build:BUILD,ready:fileExist(BUNDLE),modules:Number(m.modules||0),bytes:Number(m.bytes||0),sourceRef:String(m.sourceRef||''),installedAt:Number(m.installedAt||0),imageDecoder:!!m.imageDecoder,storageGuard:VERSION,pageModule:'acfun50003',ruleTitle:'ACFun·测试版'};};
ac.localUpdatePage=function(){setPageTitle('ACFun·测试版本地化状态');var d=[],m=ac.localFirstInfo();d.push({title:'ACFun '+VERSION,desc:'Build '+BUILD+' · Stable 0.4.9 业务基线 · 独立测试命名空间',col_type:'long_text',url:'hiker://empty'});d.push({title:'缓存隔离',desc:'规则标题：ACFun·测试版\n主模块：acfun50003\n本地目录：b50003\n旧 ACFun/Test50001/Test50002 私有 KV 与 page module 不再参与本版启动。',col_type:'long_text',url:'hiker://empty'});d.push({title:'本地运行包',desc:(m.ready?'已就绪':'未完成')+' · '+m.modules+' 模块 · '+m.bytes+' B',col_type:'text_1',url:'hiker://empty'});d.push({title:'更新说明',desc:'真正更新继续由“我的规则仓库”统一管理。Stable0.4.9 / Candidate Alpha11 / Web3 均未修改。',col_type:'long_text',url:'hiker://empty'});setResult(d);};
})();
