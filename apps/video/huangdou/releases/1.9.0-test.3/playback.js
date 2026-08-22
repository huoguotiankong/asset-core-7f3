/* 黄豆短剧 PlaybackAdapter 1.9.0-test.3 */
var HuangDouPlaybackV190=(function(){
  var V='1.9.0-test.3',KEY='hddj_play_strategy_v3',DIAG='hddj_play_diag_v3';
  function strategy(){var s=getItem(KEY,'direct');return /^(direct|web)$/.test(s)?s:'direct';}
  function saveDiag(o){try{o=o||{};o.time=new Date().getTime();setItem(DIAG,JSON.stringify(o));}catch(e){}}
  function diag(){try{return JSON.parse(getItem(DIAG,'{}')||'{}');}catch(e){return{};}}
  function token(c,id,ep){
    function one(){
      var txt=c.req('/play/token?r='+encodeURIComponent(id)+'&s='+encodeURIComponent(ep),{headers:{'Accept':'application/json','Cache-Control':'no-cache'}}),o={};
      try{o=JSON.parse(txt||'{}');}catch(e){throw new Error('播放令牌响应不是 JSON');}
      return o&&o.t?String(o.t):'';
    }
    try{c.req('/account/guest',{method:'POST',body:'',headers:{'Content-Type':'application/json','Cache-Control':'no-cache'}});}catch(ignore){}
    var t=one();
    if(t)return t;
    try{c.req('/account/guest',{method:'POST',body:'',headers:{'Content-Type':'application/json','Cache-Control':'no-cache'}});}catch(ignore2){}
    return one();
  }
  function episodePage(c,id,ep){return c.host()+'/watch/details/'+encodeURIComponent(id)+'.html?ep='+encodeURIComponent(ep);}
  function play(c,id,ep){
    id=String(id||'').trim();ep=parseInt(ep||0);
    if(!id||!(ep>0)){
      saveDiag({ok:false,stage:'NO_SOURCE',route:'none',strategy:strategy(),id:id,ep:ep});
      return'toast://缺少剧集播放参数';
    }
    var s=strategy();
    if(s==='web'){
      saveDiag({ok:false,stage:'WEB_OPEN',route:'http-page',strategy:s,id:id,ep:ep,host:c.host()});
      return episodePage(c,id,ep);
    }
    try{
      var t=token(c,id,ep);
      if(!t){
        saveDiag({ok:false,stage:'TOKEN_FAIL',route:'none',strategy:s,id:id,ep:ep,host:c.host(),error:'未取得播放令牌'});
        return'toast://当前集未取得播放令牌，可在详情底部打开官网确认权限';
      }
      var u=c.host()+'/play/'+encodeURIComponent(id)+'/'+encodeURIComponent(ep)+'.m3u8?t='+encodeURIComponent(t)+'#isVideo=true#';
      setItem('hddj_last_'+id,String(ep));
      saveDiag({ok:true,stage:'READY',route:'token-direct',strategy:s,id:id,ep:ep,host:c.host(),lines:1});
      return u;
    }catch(e){
      saveDiag({ok:false,stage:'TOKEN_FAIL',route:'none',strategy:s,id:id,ep:ep,host:c.host(),error:String(e.message||e)});
      return'toast://播放失败：'+String(e.message||e);
    }
  }
  return{version:V,strategyKey:KEY,diagKey:DIAG,strategy:strategy,diag:diag,play:play,episodePage:episodePage};
})();
