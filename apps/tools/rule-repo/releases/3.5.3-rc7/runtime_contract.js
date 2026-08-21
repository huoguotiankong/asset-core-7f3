/* 我的规则仓库 3.5.3-rc7 - runtime contract */
(function(R){
R.runtimeContractVersion='1.8.1';
R.assertRuntimeContract=function(){
 var required=['home','categoryPage','searchPage','updatesPage','detailPage','channelPage','historyPage','settingsPage','aboutPage','pushNav','pushSection','pushSpacer','pushEmpty','formatTime','scopeChip','itemCard','selectCard','recentTile','actionIcon','hero','friendlyError','compactInfo','primaryAction','secondaryAction','sectionLine','programLine','metricCard','metricInfo','categoryTile','quickAction','quickAction5','sectionToolbar','safeDecodeKeyword','premiumStatusText','statusLabel','tagChip','pushProgram','categorySplitCell','channelMeta','ruleRepoChannelFallback','channelInstallRaw','channelProductCard','pushChannelBlock','installProbeEnabled','rulePresence','actualStatus','actualInstalled','clearPresenceCache','syncManifest','manifest','items','findById','importRule','productStatusShort','infoPair','sectionTitlePair','selectRoute','inputRoute','uiIconState','infoRow'];
 var missing=[],i;for(i=0;i<required.length;i++)if(typeof this[required[i]]!=='function')missing.push(required[i]);
 if(missing.length)throw new Error('运行时契约缺失：'+missing.join(', '));return true;
};
})(HikerRuleRepo);
