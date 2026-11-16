/* JavDB v3 Test59: official search Custom entry authentication and safe account API diagnostics.
 * Only the old standalone jdbApiPath(path,params) helper is replaced.
 * Search UI, keyword/actor/fallback logic, Hiker searchFind output remain unchanged.
 */
var JavDBSearchAudit3959=(function(){
  var version='3.9.59-test.1';
  var allowed={javdb3Search:true,__searchFind:true};
  var begin='function jdbApiPath(path,params){';
  var until='\nfunction jdbSection(';
  var replacement=[
    'function jdbApiPath(path,params){',
    '  var r=JDB.apiSafe(String(path),params||{});',
    '  if(r&&r.ok)return r.data||{};',
    '  var e=String(r&&r.error||"搜索接口请求失败");',
    '  throw new Error(e);',
    '}'
  ].join('\n');
  function rewrite(src,name){
    src=String(src==null?'':src);
    if(!allowed[name])throw new Error('禁止覆盖非官方搜索模块');
    var a=src.indexOf(begin),b=a>=0?src.indexOf(until,a):-1;
    if(a<0||b<=a||src.indexOf(begin,a+begin.length)>=0||!src.includes("'/api/v2/search'"))
      throw new Error('JavDB Search 原始模块结构已变更，拒绝猜测性修改');
    var prior=src.slice(a,b);
    if(prior.indexOf("fetch(url,")<0||prior.indexOf("jdbSignature()")<0)
      throw new Error('JavDB Search 旧请求 helper 不匹配');
    return src.slice(0,a)+replacement+src.slice(b);
  }
  function text(x){return String(x==null?'':x);}
  function redact(v){
    return text(v)
      .replace(/Bearer\s+[A-Za-z0-9_.-]+/gi,'Bearer [hidden]')
      .replace(/[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{12,}/g,'[hidden token]')
      .replace(/(?:authorization|token|cookie)\s*[:=]\s*[^\s,;]+/gi,'[hidden credential]')
      .replace(/<[^>]+>/g,' ')
      .slice(0,220);
  }
  function diag(J){
    J.authDiagPage=function(){
      setPageTitle('JavDB · API 鉴权检查');
      var rows=[],token=!!text(getItem('jdb3_token','')).trim(),
          choice=text(getMyVar('jdb3_diag59_target','')),
          choices=[['账号资料','user'],['搜索（meyd-831）','search'],['分类标签','tags'],['热播日榜','ranking']];
      function row(t,d,u){return{title:t,desc:d||'',url:u||'hiker://empty',col_type:'text_2',extra:{lineVisible:false}};}
      rows.push(row('本地 API 凭据：'+(token?'存在':'未检测到'),
        '只显示凭据是否存在，不显示 Token、Cookie、账号信息；官方 APP 的登录不能自动等同海阔小程序登录。'));
      for(var i=0;i<choices.length;i++){
        (function(k){
          rows.push(row('检测 '+choices[k][0],choice===choices[k][1]?'已选 · 以下为本次结果':'点击后才发起只读请求',
            $('#noLoading#').lazyRule(function(v){putMyVar('jdb3_diag59_target',v);refreshPage(false);return 'hiker://empty';},choices[k][1])));
        })(i);
      }
      if(!choice){rows.push(row('说明','仅对所选项目发起只读请求，不执行收藏、点赞或播放。'));setResult(rows);return;}
      if(!token){rows.push(row('检测未执行','海阔规则当前未保存本地 API Token；无需提供截图中的凭据明文。'));setResult(rows);return;}
      var r=null,path='',params={};
      if(choice==='user'){path='/api/v1/users';r=J.apiAuthSafe(path,{});}
      else if(choice==='search'){path='/api/v2/search';params={q:'meyd-831',page:1,type:'movie',movie_type:'all',movie_sort_by:'relevance',movie_filter_by:'all'};r=J.apiSafe(path,params);}
      else if(choice==='tags'){path='/api/v2/tags';params={type:'0'};r=J.apiSafe(path,params);}
      else if(choice==='ranking'){path='/api/v1/rankings/playback';params={filter_by:'all',period:'daily'};r=J.apiSafe(path,params);}
      else{rows.push(row('未知检查项','请重新选择'));setResult(rows);return;}
      if(r&&r.ok){
        var n=0,d=r.data||{},a=d.movies||d.items||d.results;
        if(a instanceof Array)n=a.length;
        rows.push(row('授权请求通过',choice==='search'?'搜索成功返回 '+n+' 条；可再从正常搜索页检验展示/排序':'对应官方接口本次请求成功'));
      }else{
        rows.push(row('接口仍拒绝或异常',redact(r&&r.error||'未获得有效响应')));
        rows.push(row('下一步','若账号资料验证成功但搜索失败，应检查该端点新权限、签名和参数合同；若账号资料也失败，先核查本地 Token 的有效性。'));
      }
      rows.push(row('请求分类',choice+' · 只展示响应结果，不展示请求头或敏感字段'));
      setResult(rows);
    };
    J.authSurfaceVersion=version;
    return J;
  }
  return{version:version,rewrite:rewrite,diag:diag};
})();
