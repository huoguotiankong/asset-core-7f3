/* 汤头条 0.1.0-test.2 Runtime */
var TangTouTiaoRemoteRuntime=(function(){
  var instance=null;
  function module(){if(instance)return instance;if(typeof TangTouTiaoProtocolV011!=='object'||typeof TangTouTiaoCoreV011!=='object'||typeof TangTouTiaoUIV011!=='object'||typeof TangTouTiaoPagesV011!=='object')throw new Error('汤头条 Test2 模块未完整加载');
    var m={version:'0.1.0-test.2',build:10102,home:TangTouTiaoPagesV011.home,channels:TangTouTiaoPagesV011.channels,channel:TangTouTiaoPagesV011.channel,community:TangTouTiaoPagesV011.community,search:TangTouTiaoPagesV011.search,detail:TangTouTiaoPagesV011.detail,mine:TangTouTiaoPagesV011.mine,rank:TangTouTiaoPagesV011.rank,settings:TangTouTiaoPagesV011.settings,protocolProbe:function(){return TangTouTiaoProtocolV011.probe();},toggleFavFromDetail:function(s){var x=JSON.parse(String(s||'{}'));return TangTouTiaoCoreV011.toggleFav(x);}};instance=m;return m;}
  return{version:'0.1.0-test.2',build:10102,module:module};
})();
