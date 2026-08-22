/* 黄豆短剧 PlaybackAdapter 1.9.0-test.4 */
var HuangDouPlaybackV190=(function(){
  var V='1.9.0-test.4',KEY='hddj_play_strategy_v4',DIAG='hddj_play_diag_v4';
  function strategy(){var s=getItem(KEY,'direct');return /^(direct|web)$/.test(s)?s:'direct';}
  function saveDiag(o){try{o=o||{};o.time=new Date().getTime();setItem(DIAG,JSON.stringify(o));}catch(e){}}
  function diag(){try{return JSON.parse(getItem(DIAG,'{}')||'{}');}catch(e){return{};}}
  function episodePage(c,id,ep){return c.host()+'/watch/details/'+encodeURIComponent(id)+'.html?ep='+encodeURIComponent(ep);}
  function cookie(c){try{return String(getCookie(c.host())||'');}catch(e){return'';}}
  function tokenOnce(c,id,ep){
    var txt=c.req('/play/token?r='+encodeURIComponent(id)+'&s='+encodeURIComponent(ep),{headers:{'Accept':'application/json','Cache-Control':'no-cache'}}),o={};
    try{o=JSON.parse(txt||'{}');}catch(e){throw new Error('播放令牌响应不是 JSON');}
    return o&&o.t?String(o.t):'';
  }
  function token(c,id,ep){
    var t='';
    try{t=tokenOnce(c,id,ep);}catch(ignore){}
    if(t)return t;
    try{c.req('/account/guest',{method:'POST',body:'',headers:{'Content-Type':'application/json','Cache-Control':'no-cache'}});}catch(ignore2){}
    return tokenOnce(c,id,ep);
  }
  function headers(c,id,ep){
    var h={'User-Agent':c.ua,'Referer':episodePage(c,id,ep)},ck=cookie(c);
    if(ck)h.Cookie=ck;
    return h;
  }
  function headerValue(v){return String(v||'').replace(/;/g,'；；');}
  function playerUrl(url,h){
    var a=['User-Agent@'+headerValue(h['User-Agent']),'Referer@'+headerValue(h.Referer)];
    if(h.Cookie)a.push('Cookie@'+headerValue(h.Cookie));
    return url+';{'+a.join('&&')+'}';
  }
  function probe(c,url,id,ep){
    var h=headers(c,id,ep),raw=fetch(url,{headers:h,timeout:8000,withHeaders:true}),pack=null,body='',hs={};
    try{pack=JSON.parse(String(raw||''));}catch(e){}
    if(pack&&typeof pack==='object'&&pack.body!=null){body=String(pack.body||'');hs=pack.headers||{};}else body=String(raw||'');
    var ok=/^\s*#EXTM3U/i.test(body),sample=body.replace(/\s+/g,' ').slice(0,180),auth=/登录|會員|会员|金币|购买|付费|解锁|未授权|无权限|權限|forbidden|unauthorized|payment/i.test(body);
    return{ok:ok,auth:auth,html:/^\s*<!doctype html|^\s*<html/i.test(body),sample:sample,headers:hs,requestHeaders:h};
  }
  function authPrompt(c,id,ep,locked,msg){
    var ref=episodePage(c,id,ep),text=locked?'该集被官网标记为锁定内容，当前会话未取得可播放 HLS。是否打开官网完成登录/购买？':'当前站点会话未取得可播放 HLS。是否打开官网检查账号/权限？';
    saveDiag({ok:false,stage:'AUTH_FAIL',route:'official-web',strategy:strategy(),id:String(id),ep:Number(ep)||0,host:c.host(),locked:!!locked,error:String(msg||'')});
    return'confirm://'+text+'.js:'+JSON.stringify('web://'+ref);
  }
  function play(c,id,ep,locked){
    id=String(id||'').trim();ep=parseInt(ep||0);locked=!!locked;
    if(!id||!(ep>0)){saveDiag({ok:false,stage:'NO_SOURCE',route:'none',strategy:strategy(),id:id,ep:ep});return'toast://缺少剧集播放参数';}
    if(strategy()==='web')return'web://'+episodePage(c,id,ep);
    try{
      var t=token(c,id,ep);
      if(!t)return authPrompt(c,id,ep,locked,'未取得播放令牌');
      var u=c.host()+'/play/'+encodeURIComponent(id)+'/'+encodeURIComponent(ep)+'.m3u8?t='+encodeURIComponent(t),p=null;
      try{p=probe(c,u,id,ep);}catch(pe){
        var hh=headers(c,id,ep);setItem('hddj_last_'+id,String(ep));
        saveDiag({ok:true,stage:'PROBE_ERROR',route:'token-direct-with-session',strategy:'direct',id:id,ep:ep,host:c.host(),locked:locked,cookie:!!hh.Cookie,error:String(pe.message||pe)});
        return playerUrl(u,hh);
      }
      if(!p.ok){
        if(locked||p.auth||p.html)return authPrompt(c,id,ep,locked,p.sample||'媒体响应不是 HLS');
        saveDiag({ok:false,stage:'HLS_FAIL',route:'probe',strategy:'direct',id:id,ep:ep,host:c.host(),locked:locked,cookie:!!p.requestHeaders.Cookie,error:p.sample||'媒体响应不是 HLS'});
        return'toast://该集媒体响应不是有效 HLS，已记录播放诊断';
      }
      setItem('hddj_last_'+id,String(ep));
      saveDiag({ok:true,stage:'READY',route:'token-direct-with-session',strategy:'direct',id:id,ep:ep,host:c.host(),locked:locked,cookie:!!p.requestHeaders.Cookie,lines:1});
      return playerUrl(u,p.requestHeaders);
    }catch(e){
      saveDiag({ok:false,stage:'TOKEN_FAIL',route:'none',strategy:'direct',id:id,ep:ep,host:c.host(),locked:locked,error:String(e.message||e)});
      return'toast://播放失败：'+String(e.message||e);
    }
  }
  return{version:V,strategyKey:KEY,diagKey:DIAG,strategy:strategy,diag:diag,play:play,episodePage:episodePage};
})();
