/* 我的规则仓库·测试版 Bootstrap v1.0.41 - 3.5.6-rc6 / Generic Channel Hydration 14.5 */
(function(){
function reqAny(urls,ver,label){var errs=[];for(var i=0;i<urls.length;i++){try{require(String(urls[i]),{headers:{'Cache-Control':'no-cache'}},Number(ver||1));return String(urls[i]);}catch(e){errs.push((i+1)+':'+String(e.message||e));}}throw new Error(String(label||'模块')+'全部镜像失败：'+errs.join(' | '));}
var BASE_SHA='3adc11820b38008f87c92cb01f5713a56b4c8714',BASE_PATH='apps/tools/rule-repo/bootstrap_test_v140.js';
reqAny([
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BASE_SHA+'/'+BASE_PATH,
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BASE_SHA+'/'+BASE_PATH,
 'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BASE_SHA+'/'+BASE_PATH
],140,'Test Bootstrap RC5 基线');
RULE_REPO_BOOTSTRAP_VERSION='1.0.41-test';
RULE_REPO_CONFIG.minBuild=396;
var old=RULE_REPO_CONFIG.defaultRelease,mods=[],src=old.modules||[];
for(var i=0;i<src.length;i++){var n=String(src[i]&&src[i].name||'');if(n==='genericChannelHydration')continue;mods.push(src[i]);}
mods.push({name:'genericChannelHydration',path:'apps/tools/rule-repo/releases/test-3.5.6-rc6/generic_channel_hydration_patch.js'});
RULE_REPO_CONFIG.defaultRelease={schema:1,id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.6-rc6',build:396,ref:'main',modules:mods,verify:{global:'HikerRuleRepo',property:'version',equals:'3.5.6-rc6'}};
})();
