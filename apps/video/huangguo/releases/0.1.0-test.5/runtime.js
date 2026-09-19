/* 黄果短剧 0.1.0-test.5 Runtime */
var HuangGuoRemoteRuntime=(function(){
  var instance=null;
  function module(){
    if(instance)return instance;
    if(typeof HuangGuoCoreV1!=='object'||typeof HuangGuoProviderV1!=='object'||typeof HuangGuoImageV1!=='object'||typeof HuangGuoPlaybackV1!=='object'||typeof HuangGuoUIV1!=='object'||typeof HuangGuoPagesV5!=='object')throw new Error('黄果短剧 Test5 模块未完整加载');
    instance={version:'0.1.0-test.5',build:10105,home:HuangGuoPagesV5.home,library:HuangGuoPagesV5.library,rank:HuangGuoPagesV5.rank,topics:HuangGuoPagesV5.topics,listing:HuangGuoPagesV5.listing,search:HuangGuoPagesV5.search,detail:HuangGuoPagesV5.detail,mine:HuangGuoPagesV5.mine,settings:HuangGuoPagesV5.settings,play:HuangGuoPlaybackV1.play,decodeImage:HuangGuoImageV1.decode,saveSearch:HuangGuoCoreV1.saveSearch,toggleFav:HuangGuoCoreV1.toggleFav,clearLocal:HuangGuoCoreV1.clearLocal,invalidateEndpoint:HuangGuoCoreV1.invalidateEndpoint,discoverEndpoint:HuangGuoCoreV1.discover};
    return instance;
  }
  return{version:'0.1.0-test.5',build:10105,module:module};
})();
