/* 我的规则仓库 v3.5.0-rc12 - product detail */
(function(R){
R.detailPage=function(){
 var id=String((MY_PARAMS&&MY_PARAMS.hc_repo_item_id)||getParam('id')||''),item=this.findById(id,false),d=[];if(!item){setResult([{title:'这个程序暂时不可用',desc:'云端目录可能已经更新，请返回首页重新同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}if(item.entryType==='channel-group'||item.channelsPath)return this.channelPage(item);setPageTitle(item.name);try{setPagePicUrl(this.iconOf(item));}catch(e){}
 var st=this.displayStatus(item),lastImport=this.lastImportedTime(item),lastOpen=this.lastOpenedTime?this.lastOpenedTime(item):0;
 d.push(this.hero(item.name,this.cleanVersion(item.version)+' · '+st+'\n'+String(item.desc||''),this.iconOf(item),'hiker://empty'));
 d.push(this.primaryAction('打开',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)));
 d.push(this.secondaryAction(st==='有新版本'?'更新到最新版':'导入 / 覆盖',$('#noLoading#').lazyRule(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))));
 this.pushSpacer(d);d.push(this.metricInfo('版本',this.cleanVersion(item.version)));d.push(this.metricInfo('状态',st));d.push(this.metricInfo('分类',item.categoryName||'--'));d.push(this.metricInfo('更新',String(item.updatedAt||'--').slice(5)));
 this.pushSpacer(d);this.pushSection(d,'快捷操作','');d.push(this.actionIcon(this.isFav(item)?'已收藏':'收藏','favorite',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)));d.push(this.actionIcon('检查更新','updates',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id,true);if(!x)return'toast://程序不存在';return'toast://'+r.displayStatus(x)+' · 云端 '+r.cleanVersion(x.version);},item.id)));d.push(this.actionIcon('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));d.push(this.actionIcon('设置','settings','hiker://page/ruleRepoSettings?rule=&simple=true'));
 if(lastImport||lastOpen){this.pushSpacer(d);this.pushSection(d,'最近使用','');var txt=[];if(lastImport)txt.push('导入 '+this.formatShortTime(lastImport));if(lastOpen)txt.push('打开 '+this.formatShortTime(lastOpen));d.push(this.compactInfo('活动',txt.join(' · '),'hiker://page/ruleRepoHistory?rule=&simple=true'));}
 if((item.tags||[]).length){this.pushSpacer(d);this.pushSection(d,'能力标签','');(item.tags||[]).slice(0,8).forEach(function(t){d.push({title:'#'+t,col_type:'scroll_button',url:'hiker://page/ruleRepoSearch?rule=&simple=true&kw='+encodeURIComponent(t),extra:{lineVisible:false}});});}
 setResult(d);
};
})(HikerRuleRepo);
