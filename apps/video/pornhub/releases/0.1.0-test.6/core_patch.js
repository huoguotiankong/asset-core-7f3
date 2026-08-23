/* Pornhub Remote Core Patch 0.1.0-test.6 */
(function(){
  if(typeof PornhubCore!=='object')throw new Error('PornhubCore missing for Test6 core patch');
  var C=PornhubCore;
  C.version='0.1.0-test.6';
  C.build=10106;
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/bootstrap_test_v6_b10106.js?v=10106';

  var decode5=C.decode;
  C.decode=function(v){
    var s=decode5?decode5(v):C.s(v);
    s=C.s(s).replace(/&#0*(\d+);?/g,function(all,n){
      var x=parseInt(n,10);return x>0&&x<=1114111?String.fromCharCode(x):all;
    }).replace(/&#x0*([0-9a-f]+);?/ig,function(all,n){
      var x=parseInt(n,16);return x>0&&x<=1114111?String.fromCharCode(x):all;
    });
    return s;
  };

  var cleanCat5=C.cleanCategoryLabel;
  C.cleanCategoryLabel=function(v){
    var s=cleanCat5?cleanCat5(v):C.clean(v);
    s=C.clean(s)
      .replace(/[\d,.]+\s*视频/ig,'')
      .replace(/[\d,.]+\s*(?:videos?|影片)/ig,'')
      .replace(/\s+/g,' ');
    return C.trim(s);
  };

  C.publicFeed=function(mode,page){
    var b=C.base(),u=b+'/video',name='最新';
    mode=mode||'recent';
    if(mode==='recent'){u+='?o=mr';name='最新';}
    else if(mode==='viewed'){u+='?o=mv';name='热门';}
    else if(mode==='rated'){u+='?o=tr';name='高分';}
    else{name='公开视频';}
    u=C.queryPage(u,page||1);
    var h=C.fetchText(u,{ttl:3*60*1000}),cards=C.parseVideoCards(h,u);
    return{url:u,cards:cards,name:name,source:'public'};
  };

  C.homeFeed=function(mode,page){
    mode=mode||((C.accountReady&&C.accountReady())?'recommended':'recent');
    if((mode==='recommended'||mode==='feed')&&C.accountReady&&C.accountReady()){
      var r=C.accountVideos(mode,page||1);
      if(r&&r.cards&&r.cards.length)return{url:r.url,cards:r.cards,name:mode==='recommended'?'为你推荐':'Feed',source:'account'};
      var fb=C.publicFeed('recent',page||1);
      fb.name=mode==='recommended'?'为你推荐':'Feed';
      fb.source='fallback';
      fb.error=r&&r.error?r.error:'';
      return fb;
    }
    return C.publicFeed(mode,page||1);
  };

  C.shortList=function(page){
    var u=C.queryPage(C.base()+'/shorties',page||1),h=C.fetchText(u,{ttl:3*60*1000}),cards=C.parseShortCards(h,u),route='short';
    if(!cards.length){cards=C.parseVideoCards(h,u);route=cards.length?'video-card':'empty';}
    return{url:u,cards:cards,route:route};
  };
})();