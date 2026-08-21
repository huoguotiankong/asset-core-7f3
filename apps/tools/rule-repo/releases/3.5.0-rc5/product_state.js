/* 我的规则仓库 v3.5.0-rc5 - product state / activity layer */
(function(R){
R.openHistoryKey=R.statePrefix+'open_history_v1';
R.noticeSeenKey=R.statePrefix+'notice_seen_v1';
R.readOpenHistory=function(){return this.readList(this.openHistoryKey);};
R.recordOpen=function(item){if(!item)return;var id=String(item.id||''),a=this.readOpenHistory().filter(function(x){return String(x.id||'')!==id;});a.unshift({id:id,name:String(item.name||''),version:String(item.version||''),time:Date.now()});if(a.length>20)a=a.slice(0,20);this.writeList(this.openHistoryKey,a);this.recordRecent(item);};
R.openHistoryIds=function(){return this.readOpenHistory().map(function(x){return String(x.id||'');});};
R.lastOpenedTime=function(item){var id=String(item&&item.id||''),a=this.readOpenHistory();for(var i=0;i<a.length;i++)if(String(a[i].id||'')===id)return Number(a[i].time||0);return 0;};
R.openRule=function(item){this.recordOpen(item);var title=String(item&&item.raw&&item.raw.openTitle||item&&item.openTitle||item&&item.name||'').replace(/\|/g,'');return 'hiker://home@'+title+'||hiker://home';};
R.clearOpenHistory=function(){clearItem(this.openHistoryKey);};
R.favoriteItems=function(items){var ids=this.favIds(),map={};ids.forEach(function(id,i){map[String(id)]=i;});return(items||[]).filter(function(x){return map[x.id]!=null;}).sort(function(a,b){return map[a.id]-map[b.id];});};
R.recentItems=function(items,limit){var ids=this.openHistoryIds(),m={};(items||[]).forEach(function(x){m[x.id]=x;});var out=[];ids.forEach(function(id){if(m[id])out.push(m[id]);});return out.slice(0,limit||5);};
R.actionSummary=function(items){var stats=this.stats(items||[]),recent=this.recentItems(items||[],1);return{updates:stats.updates||0,favorites:stats.favorites||0,recent:recent.length?recent[0]:null,lastSync:this.lastManifestTime(),revision:String(getItem(this.manifestRevisionKey,'')||'')};};
R.stateSnapshot=(function(base){return function(){var s=base.call(this);s.openHistory=this.readOpenHistory();s.schema=2;return s;};})(R.stateSnapshot);
R.restoreState=(function(base){return function(text){var x=this.safeJson(text,null);var ok=base.call(this,text);if(x&&Array.isArray(x.openHistory))this.writeList(this.openHistoryKey,x.openHistory);return ok;};})(R.restoreState);
})(HikerRuleRepo);
