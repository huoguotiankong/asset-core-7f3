/* 我的规则仓库 v3.4.3 stability patch */
if(typeof HikerRuleRepo==='object'){
  HikerRuleRepo.version='3.4.3';
  HikerRuleRepo.build=343;
  HikerRuleRepo.stableBuild=true;
  HikerRuleRepo.defaultCacheMs=1800000;

  HikerRuleRepo.rawText=function(path){
    var t=fetch(this.rawUrl(path),{
      timeout:20000,
      headers:{'Cache-Control':'no-cache'}
    });
    t=String(t==null?'':t);
    if(!t||/^\s*\{\s*"message"\s*:/i.test(t)||/^\s*<!doctype\b/i.test(t)||/^\s*<html\b/i.test(t)||/^\s*(Too Many Requests|Bad Gateway|Service Unavailable|Gateway Timeout)/i.test(t)){
      throw new Error('Raw读取失败：'+path);
    }
    return t;
  };

  HikerRuleRepo.apiText=function(path){
    var eApi=null,eRaw=null;
    try{
      return base64Decode(String(this.apiJson(path).content).replace(/\s+/g,''));
    }catch(e1){eApi=e1;}
    try{
      return this.rawText(path);
    }catch(e2){eRaw=e2;}
    throw new Error('云端读取失败：'+path+'；API='+String(eApi&&(eApi.message||eApi)||'')+'；Raw='+String(eRaw&&(eRaw.message||eRaw)||''));
  };

  HikerRuleRepo.manifest=function(force){
    var now=Date.now(),ts=Number(getItem(this.cacheTsKey,'0')||0),cached=getItem(this.cacheKey,''),stale=cached?this.safeJson(cached,null):null;
    if(!force&&stale&&Array.isArray(stale.items)&&now-ts<this.cacheMs())return stale;
    try{
      var x=JSON.parse(this.apiText(this.manifestPath));
      if(!x||!Array.isArray(x.items))throw new Error('manifest格式错误');
      setItem(this.cacheKey,JSON.stringify(x));
      setItem(this.cacheTsKey,String(now));
      return x;
    }catch(e){
      if(stale&&Array.isArray(stale.items))return stale;
      throw e;
    }
  };
}
