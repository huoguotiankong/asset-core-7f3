/* 我的规则仓库 3.5.3-rc5 - Target UI 3.0 detail */
(function(R){
R.detailPage=function(){
 var id=String((MY_PARAMS&&MY_PARAMS.hc_repo_item_id)||getParam('id')||''),item=this.findById(id,false),d=[];if(!item){setResult([{title:'这个程序暂时不可用',desc:'云端目录可能已经更新，请返回首页重新同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}if(item.entryType==='channel-group'||item.channelsPath)return this.channelPage(item);setPageTitle(item.name);try{setPagePicUrl(this.iconOf(item));}catch(e){}
 this.clearPresenceCache&&this.clearPresenceCache();var st=this.premiumStatusText(item),lastImport=this.lastImportedTime(item),lastOpen=this.lastOpenedTime?this.lastOpenedTime(item):0;
 d.push(this.hero(item.name,this.cleanVersion(item.version)+' · '+this.statusLabel(item)+'\n'+String(item.desc||item.categoryName||''),this.iconOf(item),'hiker://empty'));
 d.push(this.primaryAction('打开',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)));d.push(this.secondaryAction(st==='可更新'?'更新到最新版':'导入 / 覆盖',$('#noLoading#').lazyRule(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))));
 d.push(this.sectionLine());d.push(this.metricInfo('版本',this.cleanVersion(item.version)));d.push(this.metricInfo('状态',st));d.push(this.metricInfo('分类',item.categoryName||'--'));d.push(this.metricInfo('方式',item.mode==='remote'?'远程':'本地'));
 if((item.tags||[]).length){for(var ti=0;ti<Math.min((item.tags||[]).length,6);ti++)d.push(this.tagChip((item.tags||[])[ti],ti,item.id+'-detail'));}
 d.push(this.sectionLine());d.push(this.sectionToolbar('常用操作','more','hiker://page/ruleRepoSettings?rule=&simple=true'));
 d.push(this.quickAction5(this.isFav(item)?'已收藏':'收藏','favorite',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)));
 d.push(this.quickAction5('检查','updates',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id,true);if(!x)return'toast://程序不存在';r.clearPresenceCache&&r.clearPresenceCache();return'toast://'+r.statusLabel(x)+' · 云端 '+r.cleanVersion(x.version);},item.id)));
 d.push(this.quickAction5('分享','share',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';return'copy://'+x.name+'\n版本 '+r.cleanVersion(x.version)+'\n分类 '+String(x.categoryName||'')+'\n'+String(x.desc||'');},item.id)));
 d.push(this.quickAction5('备份','backup',$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');return'copy://'+r.exportState();})));
 d.push(this.quickAction5('更多','more',$('活动记录,设置,清除版本记录','更多操作').select(function(id){var r=$.require('hiker://page/ruleRepoCore'),v=String(input||'');if(v==='活动记录')return'hiker://page/ruleRepoHistory?rule=&simple=true';if(v==='设置')return'hiker://page/ruleRepoSettings?rule=&simple=true';if(v==='清除版本记录'){r.removeInstalled(id);refreshPage(false);return'toast://已清除仓库版本记录';}return'hiker://empty';},item.id)));
 d.push(this.sectionLine());d.push(this.sectionToolbar('程序信息','category','hiker://page/ruleRepoCategory?rule=&simple=true'));
 d.push(this.compactInfo('分类',String(item.categoryName||'--')+(item.subCategory?' · '+item.subCategory:''),'hiker://page/ruleRepoCategory?rule=&simple=true'));d.push(this.compactInfo('更新时间',String(item.updatedAt||'--'),'hiker://empty'));if(lastImport||lastOpen){var txt=[];if(lastImport)txt.push('导入 '+this.formatShortTime(lastImport));if(lastOpen)txt.push('打开 '+this.formatShortTime(lastOpen));d.push(this.compactInfo('最近使用',txt.join(' · '),'hiker://page/ruleRepoHistory?rule=&simple=true'));}
 d.push(this.sectionLine());this.pushNav(d,'home');setResult(d);
};
})(HikerRuleRepo);
