/* 我的规则仓库 3.5.3-rc5 - experimental installed-rule presence probe */
(function(R){
R.installProbeSchema='1.0.0';
R._presenceCache={};
R.installProbeEnabled=function(){return this.getSetting('install_probe','1')!=='0';};
R.clearPresenceCache=function(){this._presenceCache={};};
R.presenceTitle=function(item){
 if(!item)return'';
 if(String(item.id||'')==='rule-repo')return this.isTestChannel&&this.isTestChannel()?'我的规则仓库·测试版':'我的规则仓库';
 return String(item.raw&&item.raw.openTitle||item.openTitle||item.name||'').replace(/\|/g,'');
};
R.rulePresence=function(item){
 if(!item)return null;
 if(String(item.id||'')==='rule-repo')return true;
 if(!this.installProbeEnabled())return null;
 var title=this.presenceTitle(item);if(!title)return null;
 var key=String(item.id||title);if(Object.prototype.hasOwnProperty.call(this._presenceCache,key))return this._presenceCache[key];
 var result=null;
 try{
  var raw=request('hiker://home@'+title);
  result=!(raw===null||raw===undefined||String(raw)==='null'||String(raw)==='');
 }catch(e){result=null;}
 this._presenceCache[key]=result;return result;
};
R.actualStatus=function(item){
 if(item&&item.entryType==='channel-group')return'版本中心';
 var repoStatus=this.statusOf(item),present=this.rulePresence(item);
 if(repoStatus==='可更新'&&(present===true||this.installedVersion(item)))return'可更新';
 if(present===true)return repoStatus==='可更新'?'可更新':'已安装';
 if(present===false)return'未安装';
 if(repoStatus==='已同步')return'已记录';
 return'未安装';
};
R.actualInstalled=function(item){var p=this.rulePresence(item);if(p===true)return true;if(p===false)return false;return !!this.installedVersion(item);};
R.stats=(function(base){return function(items){
 var out=base.call(this,items||[]),installed=0,updates=0;
 for(var i=0;i<(items||[]).length;i++){
  var x=items[i];if(x.entryType==='channel-group'){if(this.actualInstalled(x))installed++;continue;}
  if(this.actualInstalled(x))installed++;
  if(this.actualStatus(x)==='可更新')updates++;
 }
 out.installed=installed;out.updates=updates;return out;
};})(R.stats);
R.applyFilters=(function(base){return function(items,state){
 state=state||this.filterState();
 if(state.view!=='installed')return base.call(this,items,state);
 var copy={keyword:state.keyword,view:'all',category:state.category,subCategory:state.subCategory,tag:state.tag,sort:state.sort,mode:state.mode},a=base.call(this,items,copy),self=this;
 return a.filter(function(x){return self.actualInstalled(x);});
};})(R.applyFilters);
})(HikerRuleRepo);
