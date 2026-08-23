/* 汤头条 0.1.0-test.3 Runtime */
var TangTouTiaoRemoteRuntime=(function(){
  var instance=null;
  function module(){if(instance)return instance;if(typeof TangTouTiaoProtocolV012!=='object'||typeof TangTouTiaoCoreV011!=='object'||typeof TangTouTiaoUIV012!=='object'||typeof TangTouTiaoPagesV012!=='object')throw new Error('汤头条 Test3 模块未完整加载');
    var m={version:'0.1.0-test.3',build:10103,home:TangTouTiaoPagesV012.home,channels:TangTouTiaoPagesV012.channels,channel:TangTouTiaoPagesV012.channel,community:TangTouTiaoPagesV012.community,search:TangTouTiaoPagesV012.search,detail:TangTouTiaoPagesV012.detail,mine:TangTouTiaoPagesV012.mine,rank:TangTouTiaoPagesV012.rank,settings:TangTouTiaoPagesV012.settings,protocolProbe:function(){return TangTouTiaoProtocolV012.probe();},resetSession:function(full){return TangTouTiaoProtocolV012.resetSession(!!full);},sessionInfo:function(){return TangTouTiaoProtocolV012.sessionInfo();},toggleFavFromDetail:function(s){var x=JSON.parse(String(s||'{}'));return TangTouTiaoCoreV011.toggleFav(x);}};instance=m;return m;}
  return{version:'0.1.0-test.3',build:10103,module:module};
})();
