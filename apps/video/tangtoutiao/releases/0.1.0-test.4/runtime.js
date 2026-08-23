/* 汤头条 0.1.0-test.4 Runtime */
var TangTouTiaoRemoteRuntime=(function(){
  var instance=null;
  function module(){if(instance)return instance;if(typeof TangTouTiaoProtocolV013!=='object'||typeof TangTouTiaoCoreV013!=='object'||typeof TangTouTiaoUIV013!=='object'||typeof TangTouTiaoPlaybackV013!=='object'||typeof TangTouTiaoPagesV013!=='object')throw new Error('汤头条 Test4 模块未完整加载');
    var m={version:'0.1.0-test.4',build:10104,home:TangTouTiaoPagesV013.home,channels:TangTouTiaoPagesV013.channels,channel:TangTouTiaoPagesV013.channel,community:TangTouTiaoPagesV013.community,search:TangTouTiaoPagesV013.search,detail:TangTouTiaoPagesV013.detail,mine:TangTouTiaoPagesV013.mine,rank:TangTouTiaoPagesV013.rank,settings:TangTouTiaoPagesV013.settings,protocolProbe:function(){return TangTouTiaoProtocolV013.probe();},resetSession:function(full){return TangTouTiaoProtocolV013.resetSession(!!full);},sessionInfo:function(){return TangTouTiaoProtocolV013.sessionInfo();},playSource:function(p){return TangTouTiaoPlaybackV013.play(p);},toggleFavFromDetail:function(s){var x=JSON.parse(String(s||'{}'));return TangTouTiaoCoreV013.toggleFav(x);}};instance=m;return m;}
  return{version:'0.1.0-test.4',build:10104,module:module};
})();
