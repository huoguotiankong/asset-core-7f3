/* Rule Repo 3.5.2 build 364 - Stable/Test/Local channel runtime */
(function(R){
R.coreWrap=function(b64,call){
  return "js:var __b64="+JSON.stringify(String(b64||''))+";var __bytes=java.util.Base64.getDecoder().decode(__b64);var __gis=new java.util.zip.GZIPInputStream(new java.io.ByteArrayInputStream(__bytes));var __bos=new java.io.ByteArrayOutputStream();var __buf=java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,4096);var __n;while((__n=__gis.read(__buf))>0){__bos.write(__buf,0,__n);}__gis.close();var __code=String(new java.lang.String(__bos.toByteArray(),'UTF-8'));eval(__code+'\\n'+"+JSON.stringify(String(call||''))+ ");";
};
R.auditJavdbLocal=function(text){
  text=String(text||'');
  var bad=['github.com','raw.githubusercontent.com','api.github.com','huoguotiankong','@users.noreply.github.com','/mnt/data','/home/','/Users/','Hankun8'],i;
  for(i=0;i<bad.length;i++)if(text.toLowerCase().indexOf(String(bad[i]).toLowerCase())>=0)throw new Error('本地版隐私检查未通过：'+bad[i]);
  if(/gh[pousr]_[0-9A-Za-z_]{20,}/.test(text))throw new Error('本地版隐私检查未通过：疑似 GitHub Token');
  if(/Bearer\s+[0-9A-Za-z._~+\/-]{16,}/i.test(text))throw new Error('本地版隐私检查未通过：疑似硬编码 Authorization');
  if(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text))throw new Error('本地版隐私检查未通过：疑似邮箱');
  return true;
};
R.buildJavdbLocal=function(x){
  x=x||{};
  var meta=JSON.parse(this.apiText(String(x.meta||'')));
  var rt=this.apiText(String(x.runtime||''));
  eval(rt);
  if(typeof JDBCLOUD!=='object')throw new Error('JavDB构建器加载失败');
  var core=JDBCLOUD.get('core',7,'hc_build_jdb_core_3941_b364');
  var cm=JDBCLOUD.customData();
  var o={},k;
  for(k in meta)if(meta.hasOwnProperty(k)&&k!=='home_call'&&k!=='pages_meta')o[k]=meta[k];
  o.title=String(x.localTitle||'JavDB v3 本地版');
  if(x.localRuleVersion)o.version=Number(x.localRuleVersion);
  if(x.stripAuthor)o.author='';
  o.find_rule=this.coreWrap(core,String(meta.home_call||'JDB.home();'));
  o.searchFind=String(cm.__searchFind||'');
  var pp=[],a=meta.pages_meta||[],i,p,q;
  for(i=0;i<a.length;i++){
    p=a[i]||{};
    q={col_type:String(p.col_type||'text_1'),name:String(p.name||''),path:String(p.path||'')};
    if(String(p.kind||'')==='core')q.rule=this.coreWrap(core,String(p.call||''));
    else q.rule=String(cm[String(p.key||p.path||'')]||'');
    if(!q.rule)throw new Error('页面模块缺失：'+q.path);
    pp.push(q);
  }
  o.pages=JSON.stringify(pp);
  var ret='海阔视界，首页频道￥home_rule￥'+JSON.stringify(o);
  this.auditJavdbLocal(ret);
  return ret;
};
R.retitleRemoteRule=function(x){
  var s=this.apiText(String(x.path||''));
  var mark='海阔视界，首页频道￥home_rule￥';
  if(s.indexOf(mark)!==0)throw new Error('远程规则格式错误');
  var o=JSON.parse(s.substring(mark.length));
  o.title=String(x.forcedTitle||x.name||o.title||'');
  if(x.forcedRuleVersion)o.version=Number(x.forcedRuleVersion);
  return mark+JSON.stringify(o);
};
R._channelLocalBaseImportRule=R.importRule;
R.importRule=function(raw){
  var x;
  try{
    x=typeof raw==='string'?JSON.parse(raw):raw;
    x=x&&x.raw?x.raw:x;
    if(x&&String(x.codec||'')==='javdb_local_build'){
      var localItem=this.normalizeItem(x,0);this.recordRecent(localItem);
      var localRet=this.buildJavdbLocal(x);
      this.recordInstalled(localItem);this.recordImportHistory(localItem);return localRet;
    }
    if(x&&String(x.codec||'')==='javdb_retitle_remote'){
      var remoteItem=this.normalizeItem(x,0);this.recordRecent(remoteItem);
      var remoteRet=this.retitleRemoteRule(x);
      this.recordInstalled(remoteItem);this.recordImportHistory(remoteItem);return remoteRet;
    }
  }catch(e){return 'toast://版本导入失败：'+String(e.message||e);}
  return this._channelLocalBaseImportRule(raw);
};
R.pushChannelCard=function(d,parent,c,recommended){
  var self=this,ch=String(c.channel||''),label=ch==='stable'?'正式版':(ch==='test'?'测试版':(ch==='local'?'本地版':'版本'));
  var badge=ch==='stable'?'稳定 · 推荐':(ch==='test'?'远程测试':(ch==='local'?'纯本地':'可用'));
  var raw={
    id:String(c.id||''),name:String(c.name||parent.name||''),version:String(c.version||''),desc:String(c.desc||''),path:String(c.path||''),
    codec:String(c.codec||''),meta:String(c.meta||''),runtime:String(c.runtime||''),localTitle:String(c.localTitle||''),localRuleVersion:c.localRuleVersion,
    stripAuthor:!!c.stripAuthor,forcedTitle:String(c.forcedTitle||''),forcedRuleVersion:c.forcedRuleVersion,bytes:c.bytes,sha256:String(c.sha256||''),
    category:parent.category,categoryName:parent.categoryName,subCategory:parent.subCategory,
    tags:['版本',ch==='stable'?'正式':(ch==='test'?'测试':(ch==='local'?'本地':'其它'))],mode:String(c.mode||'remote'),updatedAt:String(c.updatedAt||''),
    icon:String(c.icon||self.iconOf(parent)),openTitle:String(c.openTitle||c.name||parent.name||'')
  };
  var item=self.normalizeItem(raw,0),status=self.displayStatus(item),hl=Array.isArray(c.highlights)?c.highlights.slice(0,3):[];
  d.push({title:label+'  ·  '+badge,desc:String(c.displayVersion||c.version||'')+'\n'+String(c.desc||'')+(hl.length?'\n'+hl.join(' · '):''),img:String(c.icon||self.iconOf(parent)),pic_url:String(c.icon||self.iconOf(parent)),url:$('#noLoading#').lazyRule(function(z){return $.require('hiker://page/ruleRepoCore').importRule(z);},JSON.stringify(raw)),col_type:'icon_1_left_pic',extra:{lineVisible:false}});
  d.push({title:'导入'+label,url:$('#noLoading#').lazyRule(function(z){return $.require('hiker://page/ruleRepoCore').importRule(z);},JSON.stringify(raw)),col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'仓库记录  '+status,url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'更新于 '+String(c.updatedAt||'未标记'),url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});
};
R.channelPage=function(parent){
  setPageTitle(parent.name);var d=[],meta=this.channelMeta(parent),i,cs,stable=null,test=null,local=null;
  if(!meta){setResult([{title:'版本信息暂时不可用',desc:'请稍后重试，或返回首页后执行一次同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1'}]);return;}
  try{setPagePicUrl(this.iconOf(parent));}catch(e){}
  cs=meta.channels||[];
  for(i=0;i<cs.length;i++){
    if(cs[i].channel==='stable')stable=cs[i];
    else if(cs[i].channel==='test')test=cs[i];
    else if(cs[i].channel==='local')local=cs[i];
  }
  var coexist=String(parent.id||'')==='rule-repo'||!!(parent.raw&&parent.raw.allowCoexist);
  var heroDesc=coexist?'正式版与测试版独立并存':(local?'正式/测试同名覆盖 · 本地版独立并存':'正式版稳定使用 · 测试版覆盖体验');
  d.push(this.hero(parent.name,heroDesc,this.iconOf(parent),'hiker://empty'));
  var topType=local?'text_3':'text_2';
  if(stable)d.push({title:'Stable  '+String(stable.version||''),url:'hiker://empty',col_type:topType,extra:{lineVisible:false}});
  if(test)d.push({title:'Test  '+String(test.version||''),url:'hiker://empty',col_type:topType,extra:{lineVisible:false}});
  if(local)d.push({title:'Local  '+String(local.version||''),url:'hiker://empty',col_type:topType,extra:{lineVisible:false}});
  if(stable){this.pushSpacer(d);this.pushSection(d,'正式版','远程代码 · 稳定日常使用');this.pushChannelCard(d,parent,stable,true);}
  if(test){this.pushSpacer(d);this.pushSection(d,'测试版','远程代码 · 新功能与修复先行验证');this.pushChannelCard(d,parent,test,false);}
  if(local){this.pushSpacer(d);this.pushSection(d,'本地版','纯本地完整代码 · 独立安装');this.pushChannelCard(d,parent,local,false);}
  this.pushSpacer(d);
  if(coexist){
    d.push({title:'正式版与测试版可以同时保留',desc:'“我的规则仓库”承担自举恢复职责，因此是正式/测试分名并存的默认例外。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  }else if(local){
    d.push({title:'三版本关系',desc:'正式版与测试版使用相同规则名，导入时互相覆盖；本地版使用“'+String(parent.name||'')+' 本地版”，可以独立保留。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  }else{
    d.push({title:'切换版本就是覆盖安装',desc:'正式版与测试版保持相同程序名；测试异常时重新导入正式版覆盖恢复。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  }
  setResult(d);
};
R.build=364;
R.releaseLabel='Stable 3.5.2 · Build 364';
})(HikerRuleRepo);
