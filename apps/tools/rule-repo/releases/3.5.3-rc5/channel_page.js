/* 我的规则仓库 3.5.3-rc5 - Target UI 3.0 version center */
(function(R){
R.channelPage=function(parent){
 setPageTitle(parent.name);var d=[],meta=this.channelMeta(parent),cs,i,stable=null,test=null,local=null;if(!meta){setResult([{title:'版本信息暂时不可用',desc:'请稍后重试，或返回首页执行一次同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}try{setPagePicUrl(this.iconOf(parent));}catch(e){}
 cs=meta.channels||[];for(i=0;i<cs.length;i++){if(cs[i].channel==='stable')stable=cs[i];else if(cs[i].channel==='test')test=cs[i];else if(cs[i].channel==='local')local=cs[i];}
 var selfRepo=String(parent.id||'')==='rule-repo',coexist=selfRepo||!!(parent.raw&&parent.raw.allowCoexist),count=(stable?1:0)+(test?1:0)+(local?1:0),currentText=selfRepo?(this.isTestChannel()?'测试版 '+this.version:'正式版 '+this.version):'按版本卡选择需要的版本',openName=selfRepo&&this.isTestChannel()?'我的规则仓库·测试版':String(parent.name||'');
 d.push(this.hero(parent.name,'一个程序 · 一个版本中心\n正式 / 测试 / 本地统一管理',this.iconOf(parent),'hiker://empty'));
 d.push(this.primaryAction('打开程序','hiker://home@'+openName+'||hiker://home'));d.push(this.secondaryAction('返回程序库','hiker://page/ruleRepoHome?rule=&simple=true'));
 d.push(this.sectionLine());d.push(this.metricInfo('版本',count));d.push(this.metricInfo('正式',stable?'有':'无'));d.push(this.metricInfo('测试',test?'有':'无'));d.push(this.metricInfo('本地',local?'有':'无'));
 d.push(this.sectionLine());d.push(this.sectionToolbar('常用操作','more','hiker://page/ruleRepoSettings?rule=&simple=true'));
 d.push(this.quickAction5(this.isFav(parent)?'已收藏':'收藏','favorite',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},parent.id)));
 d.push(this.quickAction5('同步','sync',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://目录已更新':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败';}})));
 d.push(this.quickAction5('记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));
 d.push(this.quickAction5('设置','settings','hiker://page/ruleRepoSettings?rule=&simple=true'));
 d.push(this.quickAction5('更多','more',$('返回首页,检查 Core 更新','更多操作').select(function(){var v=String(input||'');if(v==='检查 Core 更新')return'hiker://page/ruleRepoUpdate?rule=&simple=true';return'hiker://page/ruleRepoHome?rule=&simple=true';})));
 d.push(this.sectionLine());d.push(this.sectionToolbar('选择版本 · '+count,'updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push({title:currentText,col_type:'scroll_button',url:'hiker://empty',extra:{lineVisible:false}});
 if(stable)this.pushChannelBlock(d,parent,stable,selfRepo&&!this.isTestChannel());if(test)this.pushChannelBlock(d,parent,test,selfRepo&&this.isTestChannel());if(local)this.pushChannelBlock(d,parent,local,false);
 d.push(this.sectionLine());d.push(this.sectionToolbar('版本关系','backup','hiker://empty'));if(coexist)d.push(this.compactInfo('恢复保障','规则仓库正式版与测试版分名并存。测试异常时可直接从正式版重新导入测试版。','hiker://empty'));else if(local)d.push(this.compactInfo('覆盖规则','正式版与测试版同名覆盖；本地版使用独立名称，可与远程版同时保留。','hiker://empty'));else d.push(this.compactInfo('覆盖规则','正式版与测试版同名覆盖。测试异常时重新导入正式版即可恢复。','hiker://empty'));
 d.push(this.sectionLine());this.pushNav(d,'home');setResult(d);
};
})(HikerRuleRepo);
