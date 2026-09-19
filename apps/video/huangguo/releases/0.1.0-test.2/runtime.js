/* 黄果短剧 0.1.0-test.2 Runtime */
var HuangGuoRemoteRuntime=(function(){
  var instance=null;
  function module(){if(instance)return instance;if(typeof HuangGuoCoreV1!=='object'||typeof HuangGuoProviderV1!=='object'||typeof HuangGuoImageV1!=='object'||typeof HuangGuoPlaybackV1!=='object'||typeof HuangGuoUIV1!=='object'||typeof HuangGuoPagesV2!=='object')throw new Error('黄果短剧 Test2 模块未完整加载');instance={version:'0.1.0-test.2',build:10102,home:HuangGuoPagesV2.home,library:HuangGuoPagesV2.library,rank:HuangGuoPagesV2.rank,topics:HuangGuoPagesV2.topics,listing:HuangGuoPagesV2.listing,search:HuangGuoPagesV2.search,detail:HuangGuoPagesV2.detail,mine:HuangGuoPagesV2.mine,settings:HuangGuoPagesV2.settings,play:HuangGuoPlaybackV1.play,decodeImage:HuangGuoImageV1.decode,saveSearch:HuangGuoCoreV1.saveSearch,toggleFav:HuangGuoCoreV1.toggleFav,clearLocal:HuangGuoCoreV1.clearLocal,invalidateEndpoint:HuangGuoCoreV1.invalidateEndpoint,discoverEndpoint:HuangGuoCoreV1.discover};return instance;}
  return{version:'0.1.0-test.2',build:10102,module:module};
})();
