/* ACFAN 0.1.0-test.2 runtime */
var ACFANRuntime=(function(){
  var instance=null;
  function module(){if(instance)return instance;if(typeof ACFANCore!=='object'||typeof ACFANProtocol!=='object'||typeof ACFANProvider!=='object'||typeof ACFANImage!=='object'||typeof ACFANPlayback!=='object'||typeof ACFANUI!=='object'||typeof ACFANPages!=='object')throw new Error('ACFAN Test2 模块未完整加载');instance={version:'0.1.0-test.2',build:10102,home:ACFANPages.home,search:ACFANPages.search,detail:ACFANPages.detail,comments:ACFANPages.comments,comicReader:ACFANPages.comicReader,fictionReader:ACFANPages.fictionReader,bridge:ACFANPages.bridge,mine:ACFANPages.mine,settings:ACFANPages.settings,decodeImage:ACFANImage.decode,directAudio:ACFANPlayback.directAudio,saveSearch:ACFANCore.saveSearch,toggleFav:ACFANCore.toggleFav,clearLocal:ACFANCore.clear,setH5:ACFANCore.setH5,refreshSession:function(){ACFANProtocol.discoverHosts(true);return ACFANProtocol.ensureTraveler(true);}};return instance;}
  return{version:'0.1.0-test.2',build:10102,module:module};
})();
