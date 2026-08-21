/* 我的规则仓库 v3.5.0-rc6 - product design system */
(function(R){
R.uiAssetRoot='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/tools/rule-repo/assets/ui/';
R.uiIcon=function(name){return this.uiAssetRoot+name+'.svg';};
R.isTestChannel=function(){return String(this.statePrefix||'').indexOf('test')>=0;};
R.productTitle=function(){return this.isTestChannel()?'我的规则仓库·测试版':'我的规则仓库';};
R.cleanVersion=function(v){return String(v||'').replace(/^remote-/,'').replace(/^stable-/,'');};
R.displayStatus=function(item){if(item&&item.entryType==='channel-group')return'多版本';var s=this.statusOf(item);return s==='可更新'?'有新版本':(s==='已同步'?'已导入':'未导入');};
R.navPages={home:'hiker://page/ruleRepoHome?rule=&simple=true',category:'hiker://page/ruleRepoCategory?rule=&simple=true',search:'hiker://page/ruleRepoSearch?rule=&simple=true',updates:'hiker://page/ruleRepoUpdates?rule=&simple=true',settings:'hiker://page/ruleRepoSettings?rule=&simple=true'};
R.pushNav=function(d,active){var nav=[['首页','home','home'],['分类','category','category'],['搜索','search','search'],['更新','updates','updates'],['设置','settings','settings']],self=this;nav.forEach(function(x){d.push({title:(active===x[1]?'● ':'')+x[0],img:self.uiIcon(x[2]),pic_url:self.uiIcon(x[2]),url:self.navPages[x[1]],col_type:'icon_5',extra:{lineVisible:false}});});};
R.pushSection=function(d,title,desc){d.push({title:title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false,textAlign:'left'}});};
R.scopeChip=function(title,value,active,key){return{title:(String(active)===String(value)?'● ':'')+title,col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value),extra:{lineVisible:false}};};
R.actionIcon=function(title,icon,url){return{title:title,img:this.uiIcon(icon),pic_url:this.uiIcon(icon),url:url||'hiker://empty',col_type:'icon_4',extra:{lineVisible:false}};};
R.hero=function(title,desc,img,url){return{title:title,desc:desc||'',img:img,pic_url:img,url:url||'hiker://empty',col_type:'icon_1_left_pic',extra:{lineVisible:false}};};
R.noticeKey=R.statePrefix+'ui_notice_355';
R.shouldShowUiNotice=function(){return getItem(this.noticeKey,'0')!=='1';};
R.markUiNoticeSeen=function(){setItem(this.noticeKey,'1');};
R.pushUiNotice=function(d){if(!this.shouldShowUiNotice())return;d.push({title:'界面已焕新',desc:'减少技术信息和重复按钮，突出常用操作、版本状态与最近使用。',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');r.markUiNoticeSeen();refreshPage(false);return'toast://已了解';}),col_type:'text_1',extra:{lineVisible:false}});};
R.formatShortTime=function(ts){var s=this.formatTime(ts);return s==='未记录'?'未记录':s.slice(5);};
})(HikerRuleRepo);
