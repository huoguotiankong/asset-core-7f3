/* JavDB v3 3.9.56-test.1: read-only authenticated GET fallback for APK 1.9.39.4.
   Avoid guessing user login state; never expose a token or log the Authorization header. */
(function(J){
  if(!J||typeof J.apiSafe!=='function'||typeof J.apiAuthSafe!=='function')
    throw new Error('JavDB AuthGate missing core API helpers');
  if(J.authGateVersion)return;
  J.authGateVersion='3.9.56-test.1';
  var unauth0=J.apiSafe,auth0=J.apiAuthSafe,more0=J.moreHub5;
  function s(x){return String(x==null?'':x);}
  function hasToken(){return !!s(getItem('jdb3_token','')).trim();}
  function clean(e){
    var v=s(e).replace(/Bearer\s+[A-Za-z0-9\-_\.]+/gi,'Bearer [redacted]');
    v=v.replace(/[A-Za-z0-9_-]{18,}\.[A-Za-z0-9_-]{18,}\.[A-Za-z0-9_-]{12,}/g,'[redacted jwt]');
    return v.slice(0,220);
  }
  function jwtError(r){return !r||r.ok?false:/JWTVerificationError|Unauthorized|HTTP\s*401|HTTP401|HTTP\s*403|HTTP403|请登录账号|token.expired|invalid.token|鉴权失败/i.test(s(r.error));}
  function endpoint(path){
    return /^\/api\/v1\/movies\/tags$|^\/api\/v2\/tags$|^\/api\/v1\/rankings(?:\/playback|\/actors)?$|^\/api\/v1\/movies\/top$/.test(s(path));
  }
  function tagShape(r){
    if(!r||!r.ok||!r.data)return r;
    var tags=r.data.tags,out=[],key,v;
    if(tags instanceof Array||!tags||typeof tags!=='object')return r;
    for(key in tags)if(Object.prototype.hasOwnProperty.call(tags,key)){
      v=tags[key];
      if(v instanceof Array)out.push({category_id:key,category:key,tags:v});
      else if(v&&v.tags instanceof Array)out.push({category_id:v.category_id||key,category:v.category||key,tags:v.tags});
    }
    if(out.length)r.data.tags=out;
    return r;
  }
  function stamp(path,kind,r){
    J._authGateLast={path:s(path).slice(0,90),method:kind,ok:!!(r&&r.ok),error:r&&r.error?clean(r.error):''};
  }
  J.apiSafe=function(path,params){
    var tok=hasToken(),primary=null,backup=null,authFirst=endpoint(path)&&tok;
    if(authFirst){
      primary=auth0.call(this,path,params||{});
      if(primary&&primary.ok){stamp(path,'token-auth',primary);return path==='/api/v2/tags'?tagShape(primary):primary;}
      // A healthy anonymous endpoint must continue to work if an authorization mode is rejected.
      backup=unauth0.call(this,path,params||{});
      if(backup&&backup.ok){stamp(path,'public-after-auth',backup);return backup;}
      if(jwtError(primary)){
        primary.error='当前账号 Token 已发送，但新版接口拒绝校验：'+clean(primary.error)+'。请到「账号接口诊断」分别核对用户接口与目标接口。';
        stamp(path,'token-rejected',primary);return primary;
      }
      if(backup){stamp(path,'auth-then-public',backup);return backup;}
      stamp(path,'auth-failed',primary);return primary;
    }
    primary=unauth0.call(this,path,params||{});
    if(primary&&primary.ok){stamp(path,'public',primary);return primary;}
    if(jwtError(primary)){
      if(!tok){
        primary.error='本小程序未检测到本地 API Token：'+clean(primary.error)+'。若已在官方 APP 登录，登录状态不一定与海阔共享。';
        stamp(path,'no-local-token',primary);return primary;
      }
      backup=auth0.call(this,path,params||{});
      if(backup&&backup.ok){stamp(path,'jwt-retry-auth',backup);return path==='/api/v2/tags'?tagShape(backup):backup;}
      if(jwtError(backup)){
        backup.error='已携带本地 Token 重试，接口仍拒绝：'+clean(backup.error)+'。请使用账号接口诊断核实登录状态。';
        stamp(path,'jwt-token-rejected',backup);return backup;
      }
      stamp(path,'jwt-auth-other-error',backup);return backup||primary;
    }
    stamp(path,'public-other-error',primary);return primary;
  };
  function row(title,desc,url){return{title:title,desc:desc||'',url:url||'hiker://empty',col_type:'text_2',extra:{lineVisible:false}};}
  J.authDiagPage=function(){
    setPageTitle('JavDB · 账号接口诊断');
    var d=[],tok=hasToken(),target=s(getMyVar('jdb3_diag56_target',''));
    d.push(row(tok?'本地 API Token：已保存':'本地 API Token：未检测到','不展示 Token 内容；网页/官方 APP 的登录状态不代表海阔小程序的授权状态。'));
    d.push(row('鉴权方式','运行核心将尝试原始 Token / Bearer，两者均由本程序现有授权方法处理。'));
    var opts=[['账号资料验证','user'],['分类接口验证','category'],['热播榜验证','ranking']],i,x;
    for(i=0;i<opts.length;i++){
      x=opts[i];d.push(row('检测 · '+x[0],target===x[1]?'本次已选择':'只读请求；不会退出账号或修改收藏',$('#noLoading#').lazyRule(function(k){putMyVar('jdb3_diag56_target',k);refreshPage(false);return'hiker://empty';},x[1])));
    }
    if(!target){
      d.push(row('说明','只有点击上面的检测项才会发出授权检查请求。'));
      setResult(d);return;
    }
    if(!tok){d.push(row('未执行检测','当前小程序没有本地 Token；请先检查其账号页面是否保留授权。','hiker://page/javdb3Account?rule=&simple=true'));setResult(d);return;}
    var path='',args={};
    if(target==='user')path='/api/v1/users';
    else if(target==='category'){path='/api/v1/movies/tags';args={filter_by:'0:t:::::',sort_by:'release',order_by:'desc',page:1,limit:1};}
    else if(target==='ranking'){path='/api/v1/rankings/playback';args={filter_by:'all',period:'daily'};}
    else{d.push(row('未知检测项','请重新选择'));setResult(d);return;}
    var r=auth0.call(this,path,args);
    if(r&&r.ok){
      d.push(row('验证通过','已收到该接口的授权响应，说明此路径本轮可用。'));
      var a=r.data&&r.data.movies;if(a instanceof Array)d.push(row('本页返回','影片 '+a.length+' 条；不含个人数据'));
    }else{
      d.push(row('验证失败',clean(r&&r.error||'请求未成功')));
      d.push(row('下一步','若账号资料验证成功而分类/排行失败，优先检查新版接口独立的权限或签名要求，不能直接要求重新登录。'));
    }
    setResult(d);
  };
  if(typeof more0==='function')J.moreHub5=function(){
    var orig=setResult,done=false,result=null,ret,err=null;
    try{
      setResult=function(a){done=true;result=a;};
      ret=more0.call(this);
    }catch(e){err=e;}finally{setResult=orig;}
    if(err)throw err;
    var a=done?result:ret;
    if(a instanceof Array){
      a.push(row('账号接口诊断','检查登录凭据与分类、排行接口的真实授权状态','hiker://page/javdb3AuthDiag?rule=&simple=true'));
      if(done)return orig(a);
    }
    return ret;
  };
})(JDB);
