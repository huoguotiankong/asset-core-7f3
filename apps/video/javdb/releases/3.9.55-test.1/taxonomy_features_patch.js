/* JavDB v3 3.9.55-test.1: APK 1.9.39.4 RC taxonomy resilience and opt-in features.
 * Test only. No Stable files, signing parameters, VIP media or stored credentials changed.
 */
(function(J){
  if(!J || typeof J.apiSafe!=='function')throw new Error('JavDB taxonomy patch needs JDB.apiSafe');
  if(J.apk1939Compatibility)return;
  J.apk1939Compatibility='3.9.55-test.1';
  var api0=J.apiSafe,auth0=J.apiAuthSafe;
  var typeOK={'0':1,'1':1,'2':1,'3':1,'4':1};
  var sortOK={release:1,update:1,score:1,hit:1,want_watch_count:1,watched_count:1};
  function str(x){return String(x==null?'':x);}
  function safeText(x){return J.mask(str(x).replace(/<[^>]*>/g,' ').slice(0,500));}
  function validFilter(s){
    var p=str(s).split(':');
    return p.length===7&&!!typeOK[p[0]]&&p[1]==='t'&&/^[pmcsiv]?$/.test(p[2])&&p.slice(3).every(function(v){return /^[a-zA-Z0-9,_\.\-]*$/.test(v);});
  }
  function categoryType(){var t=str(getMyVar('jdb3_cat46_type','0'));return typeOK[t]?t:'0';}
  function plain(type,main){return (typeOK[type]?type:'0')+':t:'+(main||'')+'::::';}
  function asMovies(r){
    if(!r||!r.ok)return null;
    var d=r.data||{},v=d.movies;
    if(v instanceof Array)return v;
    if(d.items instanceof Array){d.movies=d.items;return d.movies;}
    if(d.results instanceof Array){d.movies=d.results;return d.movies;}
    if(v&&v.items instanceof Array){d.movies=v.items;return d.movies;}
    return null;
  }
  function normalizeTags(r){
    if(!r||!r.ok||!r.data)return r;
    var v=r.data.tags,i,k,out=[];
    if(v instanceof Array)return r;
    if(!v||typeof v!=='object')return r;
    for(k in v)if(Object.prototype.hasOwnProperty.call(v,k)){
      var g=v[k];
      if(g instanceof Array)out.push({category_id:k,category:k,tags:g});
      else if(g&&g.tags instanceof Array)out.push({category_id:g.category_id||k,category:g.category||k,tags:g.tags});
    }
    if(out.length)r.data.tags=out;
    return r;
  }
  function apiCall(path,params){
    var r=api0.call(this,path,params),f,sp,t,attempt,rr,query,notes=[],items;
    if(path==='/api/v2/tags')return normalizeTags(r);
    if(path!=='/api/v1/movies/tags')return r;
    params=params||{};f=str(params.filter_by);
    this._taxLast={requested:f,used:f,reason:'',page:Number(params.page||1),error:r&&r.error?str(r.error):''};
    if(asMovies(r)!==null)return r;
    if(!validFilter(f)){this._taxLast.reason='参数不符合当前 APP 分类协议';return r;}
    sp=f.split(':');t=sp[0];
    function probe(p,why){
      if(!validFilter(p.filter_by))return null;
      rr=api0.call(J,path,p);
      if(asMovies(rr)!==null){
        J._taxLast.used=p.filter_by;
        J._taxLast.reason=why;
        J._taxLast.error='';
        return rr;
      }
      return null;
    }
    // Only retry on actual API failure or malformed response. A valid empty result is not an error.
    if(!r||!r.ok||!r.data||!(r.data.movies instanceof Array)){
      if(str(params.sort_by)!=='release'||str(params.order_by)!=='desc'){
        query={filter_by:f,sort_by:'release',order_by:'desc',page:Number(params.page||1),limit:Number(params.limit||48)};
        attempt=probe(query,'当前排序不可用，已临时使用发布日期');
        if(attempt)return attempt;
      }
      // A broken multi-tag filter is not silently replaced with an unrelated category.
      if(sp[3]&&sp[3].indexOf(',')>=0){
        query={filter_by:[sp[0],sp[1],sp[2],sp[3].split(',')[0],sp[4],sp[5],sp[6]].join(':'),sort_by:'release',order_by:'desc',page:Number(params.page||1),limit:Number(params.limit||48)};
        attempt=probe(query,'组合标签请求失败，临时仅保留第一个标签');
        if(attempt)return attempt;
      }
      // Only when the unfiltered base category itself fails, try the APK-confirmed playable form.
      if(!sp[2]&&!sp[3]&&!sp[4]&&!sp[5]&&!sp[6]){
        query={filter_by:plain(t,'p'),sort_by:'release',order_by:'desc',page:Number(params.page||1),limit:Number(params.limit||48)};
        attempt=probe(query,'基础分类接口异常，已回退到可播放分类');
        if(attempt)return attempt;
      }
    }
    return r;
  }
  J.apiSafe=apiCall;

  function callCaptured(fn,modify){
    var orig=setResult,got=null,called=false,ret,err=null,hook=false;
    try{setResult=function(v){got=v;called=true;};hook=setResult!==orig;}catch(e){hook=false;}
    if(!hook)return fn();
    try{ret=fn();}catch(e2){err=e2;}finally{setResult=orig;}
    if(err)throw err;
    if(called){if(got instanceof Array)modify(got);return orig(got);}
    if(ret instanceof Array)modify(ret);
    return ret;
  }
  function row(title,desc,url){
    return {title:title,desc:desc||'',url:url||'hiker://empty',col_type:'text_2',extra:{lineVisible:false}};
  }
  var oldFilters=J.filters;
  if(typeof oldFilters==='function')J.filters=function(){
    var self=this;
    if(!typeOK[str(getMyVar('jdb3_cat46_type','0'))])putMyVar('jdb3_cat46_type','0');
    self._taxLast=null;
    return callCaptured(function(){return oldFilters.call(self);},function(items){
      if(Number(MY_PAGE||1)!==1)return;
      var s=self._taxLast||{},note=s.reason;
      if(note)items.unshift(row('筛选兼容提示',note+'；原参数 '+safeText(s.requested),'hiker://empty'));
      // A safe, explicit reset is preferable to silently erasing selected filters.
      items.unshift(row('重置复杂筛选','遇到失效标签时清空标签/年份/月份/时长，保留类别', $('#noLoading#').lazyRule(function(){
        ['jdb3_cat46_extra','jdb3_cat46_year','jdb3_cat46_month','jdb3_cat46_duration','jdb3_cat46_group'].forEach(function(k){clearMyVar(k);});
        putMyVar('jdb3_cat46_sort','release desc');refreshPage(false);return'hiker://empty';
      })));
    });
  };

  var home0=J.home;
  if(typeof home0==='function')J.home=function(){
    var self=this;
    return callCaptured(function(){return home0.call(self);},function(items){
      if(Number(MY_PAGE||1)!==1)return;
      items.splice(Math.min(2,items.length),0,{
        title:'🎲 手气不错',desc:'官方 1.9.39 随机推荐 · 登录后使用',
        url:'hiker://page/javdb3Lucky?rule=&simple=true',
        col_type:'text_2',extra:{lineVisible:false}
      });
    });
  };

  function anyList(d,names){
    var i,v,k;
    if(d instanceof Array)return d;
    if(!d||typeof d!=='object')return[];
    for(i=0;i<names.length;i++){k=names[i];v=d[k];if(v instanceof Array)return v;}
    if(d.data)return anyList(d.data,names);
    return[];
  }
  J.luckyPage=function(){
    setPageTitle('手气不错');
    var d=[row('🎲 换一组推荐','使用官方随机推荐接口','#noLoading#')],tok=str(getItem('jdb3_token',''));
    d[0].url=$('#noLoading#').lazyRule(function(){refreshPage(false);return'hiker://empty';});
    if(!tok){d.push(row('需要 JavDB 账号登录','官方新版要求登录后使用随机推荐','hiker://page/javdb3Account?rule=&simple=true'));setResult(d);return;}
    var r=typeof auth0==='function'?auth0.call(this,'/api/v1/movies/lucky',{}):this.apiSafe('/api/v1/movies/lucky',{});
    if(!r||!r.ok){d.push(row('随机推荐暂不可用',safeText(r&&r.error||'接口未返回成功；请检查登录及 API 状态'),'hiker://page/javdb3Status?rule=&simple=true'));setResult(d);return;}
    var list=anyList(r.data,['movies','recommend_movies','recommendations','items','results']),one=r.data&&r.data.movie;
    if(!list.length&&one&&typeof one==='object')list=[one];
    for(var i=0;i<list.length;i++)d.push(this.movieCard(list[i],this.coverLayout('lucky','movie_3')));
    if(!list.length)d.push(row('没有收到影片列表','接口响应结构与旧版不同；不会显示虚构的推荐结果'));
    setResult(d);
  };
  J.notificationsPage=function(){
    setPageTitle('站内通知');
    var d=[],tok=str(getItem('jdb3_token',''));
    if(!tok){d.push(row('登录后查看通知','JavDB 账号通知需要授权','hiker://page/javdb3Account?rule=&simple=true'));setResult(d);return;}
    var r=typeof auth0==='function'?auth0.call(this,'/api/v2/users/notifications',{page:Number(MY_PAGE||1)}):this.apiSafe('/api/v2/users/notifications',{page:Number(MY_PAGE||1)});
    if(!r||!r.ok){d.push(row('通知读取失败',safeText(r&&r.error||'请检查登录状态')));setResult(d);return;}
    var a=anyList(r.data,['notifications','list','items','results']),i,x,txt;
    for(i=0;i<a.length;i++){x=a[i]||{};txt=x.content||x.message||x.body||x.text||x.title||'';if(txt&&typeof txt==='object')txt=txt.text||txt.content||txt.title||'';
      d.push(row(safeText(x.title||x.type||'通知'),safeText(txt).slice(0,400)));
    }
    if(!a.length&&Number(MY_PAGE||1)===1)d.push(row('暂无通知','当前账号没有返回可展示的通知'));
    setResult(d);
  };
  var more0=J.moreHub5;
  if(typeof more0==='function')J.moreHub5=function(){
    var self=this;
    return callCaptured(function(){return more0.call(self);},function(items){
      var index=items.length,i;
      for(i=0;i<items.length;i++)if(str(items[i]&&items[i].title).indexOf('账号中心')>=0){index=i+1;break;}
      items.splice(index,0,row('站内通知','查看新版 APP 同步的账号通知','hiker://page/javdb3Notifications?rule=&simple=true'));
    });
  };
})(JDB);
