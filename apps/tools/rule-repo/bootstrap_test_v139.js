/* 我的规则仓库·测试版 Bootstrap v1.0.39 - 3.5.6-rc4 / Version Center Bridge 14.3 */
(function(){
function reqAny(urls,ver,label){var errs=[];for(var i=0;i<urls.length;i++){try{require(String(urls[i]),{headers:{'Cache-Control':'no-cache'}},Number(ver||1));return String(urls[i]);}catch(e){errs.push((i+1)+':'+String(e.message||e));}}throw new Error(String(label||'模块')+'全部镜像失败：'+errs.join(' | '));}
var BASE_SHA='0030aaf336c8b253d1f5733790f95233f5c1638c',BASE_PATH='apps/tools/rule-repo/bootstrap_test_v138.js';
reqAny([
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BASE_SHA+'/'+BASE_PATH,
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BASE_SHA+'/'+BASE_PATH,
 'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BASE_SHA+'/'+BASE_PATH
],138,'Test Bootstrap RC3 基线');
RULE_REPO_BOOTSTRAP_VERSION='1.0.39-test';
RULE_REPO_CONFIG.minBuild=394;
var old=RULE_REPO_CONFIG.defaultRelease,mods=[],src=old.modules||[];
for(var i=0;i<src.length;i++){var n=String(src[i]&&src[i].name||'');if(n==='versionCenterNativeOpenBridge')continue;mods.push(src[i]);}
mods.push({name:'versionCenterNativeOpenBridge',path:'apps/tools/rule-repo/releases/test-3.5.6-rc4/version_center_bridge_patch.js'});
RULE_REPO_CONFIG.defaultRelease={schema:1,id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.6-rc4',build:394,ref:'main',modules:mods,verify:{global:'HikerRuleRepo',property:'version',equals:'3.5.6-rc4'}};
})();
