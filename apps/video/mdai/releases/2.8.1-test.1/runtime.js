/* 麻豆AI 2.8.1-test.1 - Local-First composed runtime */
var MDAIRemoteRuntime=(function(){
  var instance=null;
  function module(){
    if(instance)return instance;
    if(typeof MDAICoreV263!=='object'||typeof MDAIPlaybackV270!=='object'||typeof MDAIUIBaseV280!=='object'||typeof MDAIContentPagesV280!=='object'||typeof MDAIDetailPagesV280!=='object'||typeof MDAISettingsV280!=='object')throw new Error('麻豆AI Local-First 模块未完整加载');
    var c=MDAICoreV263.module(),p=MDAIPlaybackV270;
    c.version='20260825-v2.8.1-test.1-local-first-native';
    c.home=function(){return MDAIContentPagesV280.home(c);};
    c.library=function(){try{var t=String(getParam('type')||'');if(t==='video'||t==='drama')putMyVar('mdai_library_type_v280',t);}catch(e){}return MDAIContentPagesV280.library(c);};
    c.search=function(){return MDAIContentPagesV280.search(c);};
    c.mine=function(){try{var m=String(getParam('mode')||'');if(m==='favorites'||m==='history')putMyVar('mdai_mine_tab_v280',m);}catch(e){}return MDAIContentPagesV280.mine(c);};
    c.comments=function(){return MDAIContentPagesV280.comments(c);};
    c.detail=function(){return MDAIDetailPagesV280.detail(c,p);};
    c.settings=function(){return MDAISettingsV280.settings(c,p);};
    c.play=function(seed){return p.play(c,seed);};
    instance=c;return instance;
  }
  return{build:'2.8.1-test.1',version:'2.8.1-test.1',delivery:'local-first-native',module:module};
})();
