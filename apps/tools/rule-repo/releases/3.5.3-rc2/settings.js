/* 我的规则仓库 3.5.3-rc2 - premium settings */
(function(R){
R.settingsPage=function(){
 setPageTitle('设置');var d=[],cache=this.cacheMs(),probe=this.probeMs(),src=this.lastCloudSource?this.lastCloudSource():'--';this.pushNav(d,'settings');
 this.pushSpacer(d);this.pushSection(d,'同步与更新','保持自动、稳定，异常时优先保留可用数据');
 d.push(this.quickAction('自动检查','updates',$('关闭,30秒,60秒,180秒,300秒','自动检查频率').select(function(){var map={'关闭':0,'30秒':30000,'60秒':60000,'180秒':180000,'300秒':300000},r=$.require('hiker://page/ruleRepoCore');r.setSetting('probe_ms',map[String(input||'60秒')]);refreshPage(false);return'toast://已设置';})));
 d.push(this.quickAction('离线缓存','history',$('5分钟,15分钟,30分钟,60分钟','离线缓存时间').select(function(){var map={'5分钟':300000,'15分钟':900000,'30分钟':1800000,'60分钟':3600000},r=$.require('hiker://page/ruleRepoCore');r.setSetting('cache_ms',map[String(input||'30分钟')]||1800000);refreshPage(false);return'toast://已设置';})));
 d.push(this.quickAction('立即同步','home',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://同步完成':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败，已保留当前目录';}})));
 d.push(this.quickAction('版本更新','settings','hiker://page/ruleRepoUpdate?rule=&simple=true'));
 d.push(this.compactInfo('当前策略',(probe<=0?'自动检查已关闭':'每 '+Math.round(probe/1000)+' 秒检查变化')+' · 缓存 '+Math.round(cache/60000)+' 分钟 · '+src,'hiker://empty'));
 this.pushSpacer(d);this.pushSection(d,'数据管理','备份和整理规则仓库自己的记录');
 d.push(this.quickAction('备份','favorite',$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');return'copy://'+r.exportState();})));
 d.push(this.quickAction('恢复','history',$('粘贴备份 JSON','').input(function(){try{var r=$.require('hiker://page/ruleRepoCore');r.restoreState(String(input||''));r.clearSelection();refreshPage(false);return'toast://已恢复';}catch(e){return'toast://恢复失败';}})));
 d.push(this.quickAction('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));
 d.push(this.quickAction('清理数据','settings',$('最近打开,搜索历史,收藏,导入记录','选择要清理的内容').select(function(){var r=$.require('hiker://page/ruleRepoCore'),v=String(input||'');if(v==='最近打开')r.clearOpenHistory();else if(v==='搜索历史')r.clearSearchHistory();else if(v==='收藏')r.clearFavorites();else if(v==='导入记录'){r.clearImportHistory();r.clearInstalled();}refreshPage(false);return'toast://已清理 '+v;})));
 this.pushSpacer(d);this.pushSection(d,'关于','工程信息统一放在这里');
 d.push(this.quickAction('版本信息','updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));
 d.push(this.quickAction('产品说明','home','hiker://page/ruleRepoAbout?rule=&simple=true'));
 d.push(this.quickAction('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));
 d.push(this.quickAction('诊断信息','settings',$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore'),src=r.lastCloudSource?r.lastCloudSource():'--',rev=String(getItem(r.manifestRevisionKey,'--')||'--');return'confirm://Core '+r.version+'\nbuild '+r.build+'\nrevision '+rev+'\nsource '+src;})));
 setResult(d);
};
R.aboutPage=function(){
 setPageTitle('关于');var d=[],repo=this.findById('rule-repo')||{};d.push(this.hero('我的规则仓库','海阔视界专属 · 规则管理中心\n稳定 · 清晰 · 可升级 · 可恢复',this.iconOf(repo),'hiker://empty'));
 this.pushSpacer(d);this.pushSection(d,'核心能力','');d.push(this.quickAction('分类管理','category','hiker://page/ruleRepoCategory?rule=&simple=true'));d.push(this.quickAction('搜索','search','hiker://page/ruleRepoSearch?rule=&simple=true'));d.push(this.quickAction('版本更新','updates','hiker://page/ruleRepoUpdates?rule=&simple=true'));d.push(this.quickAction('备份恢复','history','hiker://page/ruleRepoSettings?rule=&simple=true'));
 this.pushSpacer(d);d.push(this.compactInfo('当前版本',this.version+' · '+(this.isTestChannel()?'测试通道':'正式通道'),'hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push(this.compactInfo('产品原则','一个程序一个入口 · 正式/测试分层 · 常用操作优先 · 异常可恢复','hiker://empty'));d.push(this.compactInfo('版本基线',this.isTestChannel()?'基于 Stable 3.5.2 继续开发':'当前稳定基线','hiker://empty'));
 setResult(d);
};
})(HikerRuleRepo);
