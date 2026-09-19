/* 黄果短剧 0.1.0-test.4 Runtime */
var HuangGuoRemoteRuntime=(function(){
  var instance=null;
  function module(){if(instance)return instance;if(typeof HuangGuoCoreV1!=='object'||typeof HuangGuoProviderV1!=='object'||typeof HuangGuoImageV1!=='object'||typeof HuangGuoPlaybackV1!=='object'||typeof HuangGuoUIV1!=='object'||typeof HuangGuoPagesV3!=='object')throw new Error('黄果短剧 Test4 模块未完整加载');instance={version:'0.1.0-test.4',build:10104,home:HuangGuoPagesV3.home,library:HuangGuoPagesV3.library,rank:HuangGuoPagesV3.rank,topics:HuangGuoPagesV3.topics,listing:HuangGuoPagesV3.listing,search:HuangGuoPagesV3.search,detail:HuangGuoPagesV3.detail,mine:HuangGuoPagesV3.mine,settings:HuangGuoPagesV3.settings,play:HuangGuoPlaybackV1.play,decodeImage:HuangGuoImageV1.decode,saveSearch:HuangGuoCoreV1.saveSearch,toggleFav:HuangGuoCoreV1.toggleFav,clearLocal:HuangGuoCoreV1.clearLocal,invalidateEndpoint:HuangGuoCoreV1.invalidateEndpoint,discoverEndpoint:HuangGuoCoreV1.discover};return instance;}
  return{version:'0.1.0-test.4',build:10104,module:module};
})();
