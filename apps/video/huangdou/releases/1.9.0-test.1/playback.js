/* 黄豆短剧 PlaybackAdapter 1.9.0-test.1 */
var HuangDouPlaybackV190=(function(){
  var V='1.9.0-test.1',KEY='hddj_play_strategy_v2',DIAG='hddj_play_diag_v2';
  function strategy(){var s=getItem(KEY,'smart');return /^(smart|legacy|web)$/.test(s)?s:'smart';}
  function saveDiag(o){try{o=o||{};o.time=new Date().getTime();setItem(DIAG,JSON.stringify(o));}catch(e){}}
  function diag(){try{return JSON.parse(getItem(DIAG,'{}')||'{}');}catch(e){return{};}}
  function token(c,id,ep){
    function one(){var txt=c.req('/play/token?r='+encodeURIComponent(id)+'&s='+encodeURIComponent(ep),{headers:{'Accept':'application/json'}}),o={};try{o=JSON.parse(txt||'{}');}catch(e){throw new Error('播放令牌响应不是 JSON');}return o&&o.t?String(o.t):'';}
    try{c.req('/account/guest',{method:'POST',body:'',headers:{'Content-Type':'application/json'}});}catch(ignore){}
    var t=one();
    if(t)return t;
    try{c.req('/account/guest',{method:'POST',body:'',headers:{'Content-Type':'application/json','Cache-Control':'no-cache'}});}catch(ignore2){}
    return one();
  }
  function webFallback(c,id,ep,msg){var u=c.host()+'/watch/details/'+encodeURIComponent(id)+'.html?ep='+encodeURIComponent(ep);saveDiag({ok:false,stage:'TOKEN_FAIL',route:'webRule',strategy:strategy(),id:String(id),ep:Number(ep)||0,error:String(msg||'未取得播放令牌')});return'webRule://'+u;}
  function play(c,id,ep){
    id=String(id||'').trim();ep=parseInt(ep||0);
    if(!id||!(ep>0)){saveDiag({ok:false,stage:'NO_SOURCE',route:'none',strategy:strategy(),id:id,ep:ep});return'toast://缺少剧集播放参数';}
    var s=strategy();
    if(s==='web')return webFallback(c,id,ep,'用户选择网页兼容模式');
    try{
      var t=token(c,id,ep);
      if(!t)return webFallback(c,id,ep,'未取得播放令牌，可能需要账号权限');
      var u=c.host()+'/play/'+encodeURIComponent(id)+'/'+encodeURIComponent(ep)+'.m3u8?t='+encodeURIComponent(t)+'#isVideo=true#';
      setItem('hddj_last_'+id,String(ep));
      if(s==='legacy'){
        saveDiag({ok:true,stage:'READY',route:'legacy-direct',strategy:s,id:id,ep:ep,host:c.host()});
        return u;
      }
      var ref=c.host()+'/watch/details/'+encodeURIComponent(id)+'.html?ep='+encodeURIComponent(ep);
      var model={urls:[u],names:['高清'],headers:[{'User-Agent':c.ua,'Referer':ref}]};
      saveDiag({ok:true,stage:'READY',route:'token-api-playmodel',strategy:s,id:id,ep:ep,host:c.host(),lines:1});
      return JSON.stringify(model);
    }catch(e){
      return webFallback(c,id,ep,String(e.message||e));
    }
  }
  return{version:V,strategyKey:KEY,diagKey:DIAG,strategy:strategy,diag:diag,play:play};
})();
