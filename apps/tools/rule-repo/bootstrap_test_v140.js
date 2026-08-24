/* 我的规则仓库·测试版 Bootstrap v1.0.40 - 3.5.6-rc5 / Runtime State Migration 14.4 */
(function(){
function reqAny(urls,ver,label){var errs=[];for(var i=0;i<urls.length;i++){try{require(String(urls[i]),{headers:{'Cache-Control':'no-cache'}},Number(ver||1));return String(urls[i]);}catch(e){errs.push((i+1)+':'+String(e.message||e));}}throw new Error(String(label||'模块')+'全部镜像失败：'+errs.join(' | '));}
var BASE_SHA='4975352e33a23809c1de45b17c6ba8d16a42172d',BASE_PATH='apps/tools/rule-repo/bootstrap_test_v139.js';
reqAny([
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BASE_SHA+'/'+BASE_PATH,
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BASE_SHA+'/'+BASE_PATH,
 'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BASE_SHA+'/'+BASE_PATH
],139,'Test Bootstrap RC4 基线');
RULE_REPO_BOOTSTRAP_VERSION='1.0.40-test';
RULE_REPO_CONFIG.minBuild=395;
var old=RULE_REPO_CONFIG.defaultRelease,mods=[],src=old.modules||[];
for(var i=0;i<src.length;i++){var n=String(src[i]&&src[i].name||'');if(n==='runtimeStateMigration')continue;mods.push(src[i]);}
mods.push({name:'runtimeStateMigration',path:'apps/tools/rule-repo/releases/test-3.5.6-rc5/runtime_state_migration_patch.js'});
RULE_REPO_CONFIG.defaultRelease={schema:1,id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.6-rc5',build:395,ref:'main',modules:mods,verify:{global:'HikerRuleRepo',property:'version',equals:'3.5.6-rc5'}};
})();
