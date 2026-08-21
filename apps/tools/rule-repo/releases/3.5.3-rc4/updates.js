/* 我的规则仓库 3.5.3-rc4 - native update center */
(function(R){
R.updatesPage=function(){
 setPageTitle('更新');var d=[],m,items;try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}catch(e){setResult([{title:'暂时无法检查更新',desc:this.friendlyError(e),url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 var info={};try{if(typeof RuleRepoBoot==='object')info=RuleRepoBoot.info()||{};}catch(e){}var cur=info.current||{version:this.version,build:this.build},prev=info.previous||null,updates=items.filter(function(x){return x.entryType!=='channel-group'&&R.statusOf(x)==='可更新';});
 d.push(this.hero('更新中心',(this.isTestChannel()?'测试版':'正式版')+' '+String(cur.version||this.version)+'\n'+(updates.length?updates.length+' 个程序等待更新':'当前没有待更新程序'),this.uiIcon('updates'),'hiker://page/ruleRepoUpdate?rule=&simple=true'));
 d.push(this.primaryAction('检查 Core 更新','hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push(this.secondaryAction('同步程序目录',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://目录已更新':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败，已保留当前目录';}})));
 d.push(this.sectionLine());d.push(this.metricInfo('当前',String(cur.version||this.version)));d.push(this.metricInfo('待更新',updates.length));d.push(this.metricInfo('目录',items.length));d.push(this.metricInfo('回退',prev?'可用':'无'));
 if(updates.length){this.pushSection(d,'待更新程序','逐项确认后更新');updates.forEach(function(x){d.push(R.itemCard(x));});}else this.pushEmpty(d,'已是最新状态','程序目录变化会自动同步，也可以手动检查。');
 d.push(this.sectionLine());this.pushSection(d,'维护工具','');d.push(this.quickAction('版本更新','updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push(this.quickAction('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));d.push(this.quickAction('设置','settings','hiker://page/ruleRepoSettings?rule=&simple=true'));d.push(this.quickAction('返回首页','home','hiker://page/ruleRepoHome?rule=&simple=true'));
 if(prev)d.push(this.compactInfo('上一版本',String(prev.version||'上一版本'),'hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push(this.sectionLine());this.pushNav(d,'updates');setResult(d);
};
})(HikerRuleRepo);
