/* 我的规则仓库·测试版 Bootstrap v1.0.42 - 3.5.6-rc7 / Fast Version Center 14.6 */
(function(){
function reqAny(urls,ver,label){var errs=[];for(var i=0;i<urls.length;i++){try{require(String(urls[i]),{headers:{'Cache-Control':'no-cache'}},Number(ver||1));return String(urls[i]);}catch(e){errs.push((i+1)+':'+String(e.message||e));}}throw new Error(String(label||'模块')+'全部镜像失败：'+errs.join(' | '));}
var BASE_SHA='ff98f1fe77bb3e5c7980b97a6c959f05694fdb9f',BASE_PATH='apps/tools/rule-repo/bootstrap_test_v141.js';
reqAny([
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BASE_SHA+'/'+BASE_PATH,
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BASE_SHA+'/'+BASE_PATH,
 'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BASE_SHA+'/'+BASE_PATH
],141,'Test Bootstrap RC6 基线');
RULE_REPO_BOOTSTRAP_VERSION='1.0.42-test';
RULE_REPO_CONFIG.minBuild=397;
var old=RULE_REPO_CONFIG.defaultRelease,mods=[],src=old.modules||[];
for(var i=0;i<src.length;i++){var n=String(src[i]&&src[i].name||'');if(n==='fastVersionCenter')continue;mods.push(src[i]);}
mods.push({name:'fastVersionCenter',path:'apps/tools/rule-repo/releases/test-3.5.6-rc7/fast_version_center_patch.js'});
RULE_REPO_CONFIG.defaultRelease={schema:1,id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.6-rc7',build:397,ref:'main',modules:mods,verify:{global:'HikerRuleRepo',property:'version',equals:'3.5.6-rc7'}};
})();
