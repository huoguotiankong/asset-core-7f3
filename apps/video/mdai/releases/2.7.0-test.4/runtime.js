/* 麻豆AI 2.7.0-test.4 composed runtime */
var MDAIRemoteRuntime=(function(){
  var instance=null;
  function module(){
    if(instance)return instance;
    if(typeof MDAICoreV263!=='object'||typeof MDAIPlaybackV270!=='object'||typeof MDAIUIBaseV270!=='object'||typeof MDAIContentPagesV270!=='object'||typeof MDAIDetailPagesV270!=='object'||typeof MDAISettingsV270!=='object')throw new Error('麻豆AI 2.7 模块未完整加载');
    var c=MDAICoreV263.module(),p=MDAIPlaybackV270;
    c.version='20260823-v2.7.0-test.4-icon-html';
    c.home=function(){return MDAIContentPagesV270.home(c);};
    c.library=function(){return MDAIContentPagesV270.library(c);};
    c.search=function(){return MDAIContentPagesV270.search(c);};
    c.mine=function(){return MDAIContentPagesV270.mine(c);};
    c.comments=function(){return MDAIContentPagesV270.comments(c);};
    c.detail=function(){return MDAIDetailPagesV270.detail(c,p);};
    c.settings=function(){return MDAISettingsV270.settings(c,p);};
    c.play=function(seed){return p.play(c,seed);};
    instance=c;return instance;
  }
  return{build:'2.7.0-test.4',version:'2.7.0-test.4',module:module};
})();
