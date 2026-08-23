/* 汤头条 0.1.0-test.5 Runtime */
var TangTouTiaoRemoteRuntime=(function(){
  var instance=null;
  function module(){
    if(instance)return instance;
    if(typeof TangTouTiaoProtocolV013!=='object'||typeof TangTouTiaoImageV014!=='object'||typeof TangTouTiaoCoreV014!=='object'||typeof TangTouTiaoUIV014!=='object'||typeof TangTouTiaoPlaybackV014!=='object'||typeof TangTouTiaoPagesV014!=='object')throw new Error('汤头条 Test5 模块未完整加载');
    var m={version:'0.1.0-test.5',build:10105,
      home:TangTouTiaoPagesV014.home,channels:TangTouTiaoPagesV014.channels,channel:TangTouTiaoPagesV014.channel,community:TangTouTiaoPagesV014.community,search:TangTouTiaoPagesV014.search,detail:TangTouTiaoPagesV014.detail,mine:TangTouTiaoPagesV014.mine,rank:TangTouTiaoPagesV014.rank,settings:TangTouTiaoPagesV014.settings,
      protocolProbe:function(){return TangTouTiaoProtocolV013.probe();},resetSession:function(full){return TangTouTiaoProtocolV013.resetSession(!!full);},sessionInfo:function(){return TangTouTiaoProtocolV013.sessionInfo();},
      playBest:function(p){return TangTouTiaoPlaybackV014.playBest(p);},playQuality:function(p,n){return TangTouTiaoPlaybackV014.playQuality(p,n);},playMulti:function(p){return TangTouTiaoPlaybackV014.playMulti(p);},
      toggleFavFromDetail:function(s){var x=JSON.parse(String(s||'{}'));return TangTouTiaoCoreV014.toggleFav(x);}
    };
    instance=m;return m;
  }
  return{version:'0.1.0-test.5',build:10105,module:module};
})();
