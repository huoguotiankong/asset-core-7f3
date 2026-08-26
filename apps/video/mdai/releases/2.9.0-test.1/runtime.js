/* 麻豆AI 2.9.0-test.1 - composed runtime */
var MDAIRemoteRuntime=(function(){
  var instance=null;
  function module(){
    if(instance)return instance;
    if(typeof MDAICoreV290!=='object'||typeof MDAIPlaybackV270!=='object'||typeof MDAIUIV290!=='object'||typeof MDAICommunityV290!=='object'||typeof MDAIHomeV290!=='object'||typeof MDAILibraryV290!=='object'||typeof MDAISearchMineV290!=='object'||typeof MDAIDetailV290!=='object'||typeof MDAISettingsV290!=='object')throw new Error('麻豆AI 2.9 模块未完整加载');
    var c=MDAICoreV290.module(),p=MDAIPlaybackV270,comm=MDAICommunityV290;
    c.home=function(){return MDAIHomeV290.home(c);};
    c.library=function(){return MDAILibraryV290.library(c);};
    c.search=function(){return MDAISearchMineV290.search(c);};
    c.mine=function(){return MDAISearchMineV290.mine(c);};
    c.detail=function(){return MDAIDetailV290.detail(c,p,comm);};
    c.comments=function(){return MDAIDetailV290.comments(c,comm);};
    c.settings=function(){return MDAISettingsV290.settings(c,p);};
    c.play=function(seed){return p.play(c,seed);};
    instance=c;return instance;
  }
  return{build:'2.9.0-test.1',version:'2.9.0-test.1',delivery:'local-first-native',module:module};
})();
