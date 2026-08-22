/* 汤头条 0.1.0-test.1 Runtime */
var TangTouTiaoRemoteRuntime=(function(){
  var instance=null;
  function module(){if(instance)return instance;if(typeof TangTouTiaoProtocolV010!=='object'||typeof TangTouTiaoCoreV010!=='object'||typeof TangTouTiaoUIV010!=='object'||typeof TangTouTiaoPagesV010!=='object')throw new Error('汤头条 Test1 模块未完整加载');
    var m={version:'0.1.0-test.1',build:10101,home:TangTouTiaoPagesV010.home,channels:TangTouTiaoPagesV010.channels,channel:TangTouTiaoPagesV010.channel,community:TangTouTiaoPagesV010.community,search:TangTouTiaoPagesV010.search,detail:TangTouTiaoPagesV010.detail,mine:TangTouTiaoPagesV010.mine,rank:TangTouTiaoPagesV010.rank,settings:TangTouTiaoPagesV010.settings,protocolProbe:function(){return TangTouTiaoProtocolV010.probe();},toggleFavFromDetail:function(s){var x=JSON.parse(String(s||'{}'));return TangTouTiaoCoreV010.toggleFav(x);}};instance=m;return m;}
  return{version:'0.1.0-test.1',build:10101,module:module};
})();
