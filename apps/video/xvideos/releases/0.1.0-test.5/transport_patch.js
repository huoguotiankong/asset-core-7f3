/* XVideos Test5 transport/performance finalizer */
(function(){
  if(typeof XVideosCore==='undefined')throw new Error('XVideosCore missing before Test5 transport patch');
  var C=XVideosCore,S=C._t5Storage||{},oldLocalized=C.localizedTagMap,oldTagListZh=C.tagListZh;
  C.bootstrap='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/xvideos/bootstrap_test_v5_b10105.js?v=10105';
  if(typeof oldLocalized==='function'){
    C.localizedTagMap=function(force){
      if(force)return oldLocalized(true);
      return S._zhMap||{};
    };
  }
  if(typeof oldTagListZh==='function'&&typeof oldLocalized==='function'){
    C.tagListZh=function(force){
      if(!S._categoryZhLoaded){
        S._categoryZhLoaded=true;
        try{oldLocalized(false);}catch(e){}
      }
      return oldTagListZh(force);
    };
  }
})();
