/* 我的规则仓库·测试版 3.5.5-rc3 - Remote Delivery Protocol 2.0 */
(function(R){
var baseFallback=R.ruleRepoChannelFallback;
R.version='3.5.5-rc3';
R.build=389;
R.channel='test';
R.baseStableVersion='3.5.4';
R.baseStableBuild=384;
R.targetVersion='3.5.5';
R.releaseLabel='Single Workspace 13.2.3 · Remote Delivery Protocol 2.0';
R.updateProtocolVersion='2.0.4';
R.isTestChannel=function(){return true;};
R.ruleRepoChannelFallback=function(){
 var data=baseFallback.call(this),list=data&&data.channels||[];
 for(var i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){
  list[i].version='3.5.5-rc3';
  list[i].baseVersion='3.5.4';
  list[i].targetVersion='3.5.5';
  list[i].build=389;
  list[i].displayVersion='Test 3.5.5-rc3 · Build 389 · Delivery Protocol 2.0';
  list[i].path='apps/tools/rule-repo/rule_repo_test_v135.txt';
  list[i].updatedAt='2026-08-23';
  list[i].desc='更新元数据改为 Raw/WebRaw/API/CDN 容错 + 本地最后成功指针；发布改用原子提交';
  list[i].highlights=['可变指针不再由 CDN 抢先短路','元数据失败继续使用本地安全版本','旧/延迟指针禁止降级','发布文件一次原子提交'];
 }
 return data;
};
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
