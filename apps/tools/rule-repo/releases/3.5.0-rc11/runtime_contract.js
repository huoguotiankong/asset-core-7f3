/* 我的规则仓库 v3.5.0-rc11 - UI Pro runtime contract */
(function(R){
R.runtimeContractVersion='1.1.1';
R.assertRuntimeContract=function(){
 var required=['home','categoryPage','searchPage','updatesPage','detailPage','channelPage','channelMeta','historyPage','settingsPage','aboutPage','pushNav','pushSection','pushSpacer','pushEmpty','formatTime','scopeChip','itemCard','selectCard','recentTile','actionIcon','hero','friendlyError','compactInfo','primaryAction','secondaryAction','metricCard','categoryChip','safeDecodeKeyword','channelCard','channelImportAction','syncManifest','manifest','items','findById','importRule'];
 var missing=[];for(var i=0;i<required.length;i++)if(typeof this[required[i]]!=='function')missing.push(required[i]);
 if(missing.length)throw new Error('运行时契约缺失：'+missing.join(', '));
 return true;
};
})(HikerRuleRepo);
