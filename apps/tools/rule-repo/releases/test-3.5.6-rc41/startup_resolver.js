/* RC41 multi-mirror startup resolver. Only boot transport changes; Stable 3.5.5 runtime remains exact. */
(function(){
if(typeof RuleRepoLocalBoot==='object'||typeof RuleRepoBoot==='object')return;
var U=[
'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/bcb8c921beda29412d01a7c8a54c80efa48712f7/apps/tools/rule-repo/releases/test-3.5.6-rc40/startup_loader.js',
'https://github.com/huoguotiankong/asset-core-7f3/raw/bcb8c921beda29412d01a7c8a54c80efa48712f7/apps/tools/rule-repo/releases/test-3.5.6-rc40/startup_loader.js',
'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@bcb8c921beda29412d01a7c8a54c80efa48712f7/apps/tools/rule-repo/releases/test-3.5.6-rc40/startup_loader.js'
],S=[
'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/5036c15d8beabd4ade6482b0bcdd02910ceb6d43/apps/tools/rule-repo/bootstrap_v155.js',
'https://github.com/huoguotiankong/asset-core-7f3/raw/5036c15d8beabd4ade6482b0bcdd02910ceb6d43/apps/tools/rule-repo/bootstrap_v155.js',
'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@5036c15d8beabd4ade6482b0bcdd02910ceb6d43/apps/tools/rule-repo/bootstrap_v155.js'
],E=[];
for(var i=0;i<U.length;i++){try{require(U[i],431);if(typeof RuleRepoLocalBoot==='object')return;}catch(e){E.push((i+1)+':'+String(e.message||e));}}
for(var j=0;j<S.length;j++){try{require(S[j],{headers:{'Cache-Control':'no-cache'}},155);if(typeof RuleRepoBoot==='object')return;}catch(e2){E.push('S'+(j+1)+':'+String(e2.message||e2));}}
throw new Error('RC41启动入口全部失败：'+E.join(' | '));
})();
