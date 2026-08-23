/* 我的规则仓库·测试版 Bootstrap v1.0.37 - 3.5.6-rc2 / Fast Home 14.1 */
(function(){
function reqAny(urls,ver,label){var errs=[];for(var i=0;i<urls.length;i++){try{require(String(urls[i]),{headers:{'Cache-Control':'no-cache'}},Number(ver||1));return String(urls[i]);}catch(e){errs.push((i+1)+':'+String(e.message||e));}}throw new Error(String(label||'模块')+'全部镜像失败：'+errs.join(' | '));}
var BASE_SHA='790f168fb86d73d3ddd52324045568bc49abc13a',BASE_PATH='apps/tools/rule-repo/bootstrap_test_v136.js';
reqAny([
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BASE_SHA+'/'+BASE_PATH,
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BASE_SHA+'/'+BASE_PATH,
 'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BASE_SHA+'/'+BASE_PATH
],137,'Test Bootstrap 基线');
RULE_REPO_BOOTSTRAP_VERSION='1.0.37-test';
RULE_REPO_CONFIG.minBuild=392;
var old=RULE_REPO_CONFIG.defaultRelease,mods=[],src=old.modules||[];
for(var i=0;i<src.length;i++){var n=String(src[i]&&src[i].name||'');if(n==='fastHomeUpdateIndex'||n==='fastHomeUpdateIndexV2')continue;mods.push(src[i]);}
mods.push({name:'fastHomeUpdateIndexV2',path:'apps/tools/rule-repo/releases/test-3.5.6-rc2/home_fast_update_patch.js'});
RULE_REPO_CONFIG.defaultRelease={schema:1,id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.6-rc2',build:392,ref:'main',modules:mods,verify:{global:'HikerRuleRepo',property:'version',equals:'3.5.6-rc2'}};
})();
