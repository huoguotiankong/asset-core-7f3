/* Test19: use the fetched page as image referer; keep playback untouched. */
(function(K,R){
  if(!K||!R||R.version!=='0.1.0-test.18')throw Error('Test19 requires Test18');
  var s=K.s,C=K.C,oldCard=K.cardFromBlock,oldCover=K.coverFor,oldInfo=K.detailInfo,oldModel=K.modelMeta,oldReader=R.reader;
  var readerBase='';
  function origin(u){var m=s(u).match(/^https?:\/\/[^/]+/i);return m?m[0]:'';}
  function bare(u){return s(u).split('@headers=')[0];}
  function mode(){try{return getItem('xc_img_route_v1','source')||'source';}catch(e){return'source';}}
  function image(u,base,type){
    u=bare(u);if(!u)return'';
    var page=origin(base),host=origin(u),ref='';
    if(type!=='comic'&&(page===C.primary||page===C.fallback))page=K.getLastBase()||page;
    if(mode()==='none')return u;
    if(mode()==='host')ref=host;
    else ref=page||(type==='comic'?C.comic:C.primary);
    if(!ref)return u;
    var headers={'Referer':ref+'/','User-Agent':C.ua};
    // Cookies belong to the page's host, never to a third-party image CDN.
    if(host===page&&K.cookieFor){var cookie=K.cookieFor(u);if(cookie)headers.Cookie=cookie;}
    return u+'@headers='+JSON.stringify(headers);
  }
  K.coverFor=function(u,base,type){return type==='video'||type==='fiction'?oldCover(u,base,type):image(u,base,type);};
  K.cardFromBlock=function(block,base,type){var item=oldCard(block,base,type);if(item&&item.rawImg&&(type==='photo'||type==='amateur'||type==='comic'))item.img=image(item.rawImg,base,type);return item;};
  K.contentImage=function(u,type){return image(u,readerBase,type);};
  R.reader=function(){readerBase='';var originalFetch=K.fetchPage;try{
    K.fetchPage=function(url,type,options){var result=originalFetch(url,type,options);if(type==='photo'||type==='comic'||type==='amateur')readerBase=result.url;return result;};
    return oldReader();
  }finally{K.fetchPage=originalFetch;readerBase='';}};
  K.detailInfo=function(html,url,type){var result=oldInfo(html,url,type);
    if(type==='photo'||type==='amateur'||type==='comic'){
      result.img=image(result.cover,url,type);
      if(type==='photo'||type==='amateur'){
        // Site descriptions sometimes append unrelated promotional material and tag dumps.
        var intro=s(result.intro).split(/推广\s*[:：]|广告\s*[:：]/)[0].trim();
        if(intro.indexOf(result.title)===0)intro=intro.slice(result.title.length).trim();
        if(intro.length>180||/^(?:\d+\s*P\s*)?(?:[\u4e00-\u9fff]{1,12}\s*){8,}$/.test(intro))intro='';
        result.intro=intro;
      }
    }
    return result;
  };
  K.modelMeta=function(html,url){var result=oldModel(html,url),raw='',candidates=[
    '.model-avatar&&img&&data-original','.model-avatar&&img&&data-src',
    '.model-avatar&&img&&src','.model-info&&img&&data-original','.model-info&&img&&src'
  ];
    for(var i=0;i<candidates.length&&!raw;i++)try{raw=K.domUrl(html,candidates[i],url)||'';}catch(e){}
    if(!raw)raw=K.og(html,'og:image')||bare(result.cover);
    if(raw)result.cover=image(K.abs(raw,url),url,'model');
    return result;
  };
  R.version=K.version='0.1.0-test.19';R.build=K.build=10119;
})(XChinaTest9Core,XChinaRemoteRuntime);
