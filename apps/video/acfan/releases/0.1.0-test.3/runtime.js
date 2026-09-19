/* ACFAN 0.1.0-test.3 runtime */
var ACFANRuntime=(function(){
  var instance=null;
  function module(){if(instance)return instance;if(typeof ACFANCore!=='object'||typeof ACFANProtocol!=='object'||typeof ACFANProvider!=='object'||typeof ACFANImage!=='object'||typeof ACFANPlayback!=='object'||typeof ACFANUI!=='object'||typeof ACFANPages!=='object')throw new Error('ACFAN Test3 模块未完整加载');instance={version:'0.1.0-test.3',build:10103,home:ACFANPages.home,search:ACFANPages.search,detail:ACFANPages.detail,comments:ACFANPages.comments,comicReader:ACFANPages.comicReader,fictionReader:ACFANPages.fictionReader,bridge:ACFANPages.bridge,mine:ACFANPages.mine,settings:ACFANPages.settings,directAudio:ACFANPlayback.directAudio,saveSearch:ACFANCore.saveSearch,toggleFav:ACFANCore.toggleFav,clearLocal:ACFANCore.clear,setH5:ACFANCore.setH5,refreshSession:function(){ACFANProtocol.discoverHosts(true);return ACFANProtocol.ensureTraveler(true);}};return instance;}
  return{version:'0.1.0-test.3',build:10103,module:module};
})();
