/* 我的规则仓库 v3.5.3-rc1 - runtime contract */
(function(R){
R.runtimeContractVersion='1.3.0';
R.assertRuntimeContract=function(){
  var required=['home','categoryPage','searchPage','updatesPage','detailPage','channelPage','historyPage','settingsPage','aboutPage','pushNav','pushSection','pushSpacer','pushEmpty','formatTime','scopeChip','itemCard','selectCard','recentTile','actionIcon','hero','friendlyError','compactInfo','primaryAction','secondaryAction','metricCard','metricInfo','categoryTile','quickAction','safeDecodeKeyword','channelRaw','channelCard','channelImportAction','channelMeta','ruleRepoChannelFallback','channelInstallRaw','channelProductCard','syncManifest','manifest','items','findById','importRule'];
  var missing=[],i;for(i=0;i<required.length;i++)if(typeof this[required[i]]!=='function')missing.push(required[i]);
  if(missing.length)throw new Error('运行时契约缺失：'+missing.join(', '));
  return true;
};
})(HikerRuleRepo);
