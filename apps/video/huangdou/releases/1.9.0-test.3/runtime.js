/* 黄豆短剧 1.9.0-test.3 composed runtime */
var HuangDouRemoteRuntime=(function(){
  var instance=null;
  function module(){
    if(instance)return instance;
    if(typeof HuangDouCoreV182!=='object'||typeof HuangDouUIV190!=='object'||typeof HuangDouPlaybackV190!=='object'||typeof HuangDouContentV190!=='object'||typeof HuangDouDetailV190!=='object')throw new Error('黄豆短剧 1.9 模块未完整加载');
    var c=HuangDouCoreV182.module(),p=HuangDouPlaybackV190;
    c.version='20260822-v1.9.0-test.3-player-cleanup';
    c.home=function(){return HuangDouContentV190.home(c);};
    c.library=function(){return HuangDouContentV190.library(c);};
    c.search=function(){return HuangDouContentV190.search(c);};
    c.searchPage=c.search;
    c.mine=function(){return HuangDouContentV190.mine(c);};
    c.topics=function(){return HuangDouContentV190.topics(c);};
    c.topicPage=function(){return HuangDouDetailV190.topic(c);};
    c.detail=function(){return HuangDouDetailV190.detail(c,p);};
    c.settings=function(){return HuangDouDetailV190.settings(c,p);};
    c.play=function(id,ep){return p.play(c,id,ep);};
    instance=c;return instance;
  }
  return{build:'1.9.0-test.3',version:'1.9.0-test.3',module:module};
})();
