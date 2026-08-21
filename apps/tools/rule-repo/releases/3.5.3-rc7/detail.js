/* 我的规则仓库 3.5.3-rc7 - Native App Shell 5.0 detail */
(function(R){
R.detailPage=function(){
 var id=String((MY_PARAMS&&MY_PARAMS.hc_repo_item_id)||getParam('id')||''),item=this.findById(id,false),d=[];if(!item){setResult([{title:'这个程序暂时不可用',desc:'云端目录可能已经更新，请返回首页重新同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}if(item.entryType==='channel-group'||item.channelsPath)return this.channelPage(item);setPageTitle(item.name);try{setPagePicUrl(this.iconOf(item));}catch(e){}
 this.clearPresenceCache&&this.clearPresenceCache();var st=this.premiumStatusText(item),lastImport=this.lastImportedTime(item),lastOpen=this.lastOpenedTime?this.lastOpenedTime(item):0,localVersion=this.installedVersion(item)||'未记录',size=item.bytes?Math.max(1,Math.round(Number(item.bytes)/1024))+' KB':'--';
 d.push(this.hero(item.name,String(item.desc||item.categoryName||''),this.iconOf(item),'hiker://empty'));
 d.push(this.infoRow('云端版本',this.cleanVersion(item.version)));d.push(this.infoRow('本地记录',localVersion));d.push(this.infoRow('状态',st));d.push(this.infoRow('类型',item.categoryName||'--'));d.push(this.infoRow('运行方式',item.mode==='remote'?'远程代码':'本地代码'));d.push(this.infoRow('更新时间',item.updatedAt||'--'));if(item.bytes)d.push(this.infoRow('大小',size));
 if((item.tags||[]).length){for(var ti=0;ti<Math.min((item.tags||[]).length,6);ti++)d.push(this.tagChip((item.tags||[])[ti],ti,item.id+'-detail'));}
 d.push(this.sectionLine());d.push(this.primaryAction('打开程序',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)));d.push(this.secondaryAction(st==='可更新'?'更新到最新版':'导入 / 覆盖',$('#noLoading#').lazyRule(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))));
 d.push(this.sectionLine());d.push(this.sectionToolbar('常用操作','more','hiker://page/ruleRepoSettings?rule=&simple=true'));
 d.push(this.quickAction5(this.isFav(item)?'已收藏':'收藏','favorite',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)));
 d.push(this.quickAction5('检查更新','updates',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id,true);if(!x)return'toast://程序不存在';r.clearPresenceCache&&r.clearPresenceCache();return'toast://'+r.statusLabel(x)+' · 云端 '+r.cleanVersion(x.version);},item.id)));
 d.push(this.quickAction5('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));
 d.push(this.quickAction5('备份','backup',$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');return'copy://'+r.exportState();})));
 var moreCode="(function(){var r=$.require('hiker://page/ruleRepoCore'),v=String(input||''),id="+JSON.stringify(item.id)+";if(v==='设置')return 'hiker://page/ruleRepoSettings?rule=&simple=true';if(v==='清除版本记录'){r.removeInstalled(id);refreshPage(false);return 'toast://已清除仓库版本记录';}return 'hiker://empty';})()";d.push(this.quickAction5('更多','more',this.selectRoute('更多操作',['设置','清除版本记录'],moreCode,2)));
 if(lastImport||lastOpen){d.push(this.sectionLine());d.push(this.sectionToolbar('最近使用','history','hiker://page/ruleRepoHistory?rule=&simple=true'));var txt=[];if(lastImport)txt.push('导入 '+this.formatShortTime(lastImport));if(lastOpen)txt.push('打开 '+this.formatShortTime(lastOpen));d.push(this.infoRow('记录',txt.join(' · ')));}
 d.push(this.sectionLine());this.pushNav(d,'home');setResult(d);
};
})(HikerRuleRepo);
