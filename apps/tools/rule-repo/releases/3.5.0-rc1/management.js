/* 我的规则仓库 v3.5.0 - state backup and batch management */
(function(R){
R.selectionKey='hc_repo_selection_v35';
R.batchModeKey='hc_repo_batch_mode_v35';
R.selectedIds=function(){return this.readList(this.selectionKey).map(String);};
R.isSelected=function(item){return this.selectedIds().indexOf(String(item&&item.id||''))>=0;};
R.toggleSelected=function(item){var id=String(item&&item.id||''),a=this.selectedIds(),i=a.indexOf(id),on=false;if(!id)return false;if(i>=0)a.splice(i,1);else{a.push(id);on=true;}this.writeList(this.selectionKey,a);return on;};
R.clearSelection=function(){clearItem(this.selectionKey);};
R.batchMode=function(){return getMyVar(this.batchModeKey,'0')==='1';};
R.setBatchMode=function(on){putMyVar(this.batchModeKey,on?'1':'0');if(!on)this.clearSelection();};
R.batchFavorite=function(on){var ids=this.selectedIds(),f=this.favIds(),count=0;ids.forEach(function(id){var i=f.indexOf(id);if(on&&i<0){f.push(id);count++;}else if(!on&&i>=0){f.splice(i,1);count++;}});this.writeList(this.favKey,f);return count;};
R.batchClearInstalled=function(){var ids=this.selectedIds(),o=this.installedMap(),count=0;ids.forEach(function(id){if(o[id]){delete o[id];count++;}});setItem(this.installedKey,JSON.stringify(o));return count;};
R.stateSnapshot=function(){var s=this.filterState?this.filterState():{};return{schema:1,id:'rule-repo-state',createdAt:Date.now(),core:{version:this.version,build:this.build},favorites:this.favIds(),installed:this.installedMap(),recent:this.readList(this.recentKey),searchHistory:this.searchHistory(),importHistory:this.importHistory(),settings:{cache_ms:this.getSetting('cache_ms',String(this.defaultCacheMs))},filters:s};};
R.exportState=function(){return JSON.stringify(this.stateSnapshot());};
R.restoreState=function(text){var x=this.safeJson(text,null);if(!x||x.id!=='rule-repo-state')throw new Error('备份格式不正确');if(Array.isArray(x.favorites))this.writeList(this.favKey,x.favorites);if(x.installed&&typeof x.installed==='object')setItem(this.installedKey,JSON.stringify(x.installed));if(Array.isArray(x.recent))this.writeList(this.recentKey,x.recent);if(Array.isArray(x.searchHistory))this.writeList(this.searchHistoryKey,x.searchHistory);if(Array.isArray(x.importHistory))this.writeList(this.importHistoryKey,x.importHistory);if(x.settings&&x.settings.cache_ms!=null)this.setSetting('cache_ms',String(x.settings.cache_ms));var f=x.filters||{},map={keyword:'hc_repo_kw',view:'hc_repo_view',category:'hc_repo_category',subCategory:'hc_repo_sub',tag:'hc_repo_tag',sort:'hc_repo_sort',mode:'hc_repo_mode'};Object.keys(map).forEach(function(k){if(f[k]!=null)putMyVar(map[k],String(f[k]));});return true;};
R.lastImportedTime=function(item){var id=String(item&&item.id||''),a=this.importHistory();for(var i=0;i<a.length;i++)if(String(a[i].id||'')===id)return Number(a[i].time||0);return 0;};
})(HikerRuleRepo);
