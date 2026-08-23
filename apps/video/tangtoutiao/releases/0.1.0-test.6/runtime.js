/* 汤头条 0.1.0-test.6 Runtime */
var TangTouTiaoRemoteRuntime=(function(){
  var instance=null;
  function module(){
    if(instance)return instance;
    if(typeof TangTouTiaoProtocolV015!=='object'||typeof TangTouTiaoImageV015!=='object'||typeof TangTouTiaoCoreV015!=='object'||typeof TangTouTiaoUIV015!=='object'||typeof TangTouTiaoPlaybackV015!=='object'||typeof TangTouTiaoPagesV015!=='object')throw new Error('汤头条 Test6 模块未完整加载');
    var m={version:'0.1.0-test.6',build:10106,
      home:TangTouTiaoPagesV015.home,channels:TangTouTiaoPagesV015.channels,channel:TangTouTiaoPagesV015.channel,community:TangTouTiaoPagesV015.community,search:TangTouTiaoPagesV015.search,detail:TangTouTiaoPagesV015.detail,mine:TangTouTiaoPagesV015.mine,rank:TangTouTiaoPagesV015.rank,settings:TangTouTiaoPagesV015.settings,
      protocolProbe:function(){return TangTouTiaoProtocolV015.probe();},resetSession:function(full){return TangTouTiaoProtocolV015.resetSession(!!full);},sessionInfo:function(){return TangTouTiaoProtocolV015.sessionInfo();},
      playBest:function(p){return TangTouTiaoPlaybackV015.playBest(p);},playQuality:function(p,n){return TangTouTiaoPlaybackV015.playQuality(p,n);},playMulti:function(p){return TangTouTiaoPlaybackV015.playMulti(p);},
      toggleFavFromDetail:function(s){var x=JSON.parse(String(s||'{}'));return TangTouTiaoCoreV015.toggleFav(x);}
    };
    instance=m;return m;
  }
  return{version:'0.1.0-test.6',build:10106,module:module};
})();
