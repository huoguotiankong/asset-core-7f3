/* 我的规则仓库 v3.5.0-rc10 - safe release center */
(function(R){
R.updatesPage=function(){
setPageTitle('更新');var d=[],m,items;try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}catch(e){setResult([{title:'暂时无法检查更新',desc:this.friendlyError(e),url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
this.pushNav(d,'updates');var info={};try{if(typeof RuleRepoBoot==='object')info=RuleRepoBoot.info()||{};}catch(e){}var cur=info.current||{version:this.version,build:this.build},prev=info.previous||null,updates=items.filter(function(x){return x.entryType!=='channel-group'&&R.statusOf(x)==='可更新';});
d.push(this.hero('更新中心',(this.isTestChannel()?'测试版':'正式版')+' · '+String(cur.version||this.version)+'\n'+(updates.length?updates.length+' 个程序等待更新':'当前没有待更新程序'),this.uiIcon('updates'),'hiker://page/ruleRepoUpdate?rule=&simple=true'));
d.push(this.primaryAction('版本更新','hiker://page/ruleRepoUpdate?rule=&simple=true'));
d.push(this.secondaryAction('同步程序目录',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://目录已更新':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败，已保留当前目录';}})));
this.pushSpacer(d);if(updates.length){this.pushSection(d,'待更新','建议逐项确认后更新');updates.forEach(function(x){d.push(R.itemCard(x));});}else this.pushEmpty(d,'已是最新状态','程序目录变化会自动同步，也可以手动检查。');
this.pushSpacer(d);d.push(this.compactInfo('更新保障','新版本会先下载并验证，失败时不切换；同步失败也不会删除最后一个有效目录。','hiker://empty'));if(prev)d.push(this.compactInfo('可回退版本',String(prev.version||'上一版本'),'hiker://page/ruleRepoUpdate?rule=&simple=true'));
setResult(d);
};
})(HikerRuleRepo);
