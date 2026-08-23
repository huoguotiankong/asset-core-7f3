/* XVideos Test3 generic route patch */
(function(){
  if(typeof XVideosCore==='undefined'||typeof XVideosRemoteRuntime==='undefined')throw new Error('XVideos route preflight failed');
  var C=XVideosCore,R=XVideosRemoteRuntime;
  C.page=function(path,params){
    var a=['rule='+encodeURIComponent(C.ruleTitle()),'simple=true','view='+encodeURIComponent(C.s(path||''))],k;params=params||{};
    for(k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&C.s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(C.s(params[k])));
    return'hiker://page/xvideosRoute?'+a.join('&');
  };
  R.route=function(){
    var v=C.param('view',''),m={
      xvideos:R.home,xvideosCatalog:R.catalog,xvideosCategories:R.categories,xvideosCategory:R.category,xvideosSearch:R.searchPage,
      xvideosDetail:R.detail,xvideosComments:R.comments,xvideosCreators:R.creators,xvideosProfile:R.profile,xvideosLogin:R.login,
      xvideosAccount:R.account,xvideosAccountList:R.accountList,xvideosFavorites:R.favorites,xvideosFavoriteDetail:R.favoriteDetail,
      xvideosLocalFavorites:R.localFavorites,xvideosLocalHistory:R.localHistory,xvideosSettings:R.settings
    };
    return (m[v]||R.home)();
  };
  R.module=function(){return R;};
})();
