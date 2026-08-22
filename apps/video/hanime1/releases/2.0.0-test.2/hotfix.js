/* Hanime1 Remote Test 2.0.0-test.2 - Device hotfix: challenge + home rows */
var HanimePatch=(function(C,P){
  var BUILD='2.0.0-test.2';
  var old={request:C.request,get:C.get,post:C.post,video:C.video,comic:C.comic,challenge:C.challenge};
  function headerText(h){try{return JSON.stringify(h||{});}catch(e){return String(h||'');}}
  function isChallenge(resp){
    resp=resp||{};var body=String(resp.body||''),hs=headerText(resp.headers),code=Number(resp.statusCode||0),all=body+'\n'+hs;
    var marker=/cf-chl-|challenge-form|Just a moment|Attention Required|Checking your browser|Verify you are human|請稍等|请稍等|驗證您是人類|验证您是人类/i.test(all);
    var header=/cf-mitigated[\s\S]{0,200}challenge/i.test(hs);
    var weak=/challenges\.cloudflare\.com|cf-turnstile|turnstile|cloudflare|challenge/i.test(all);
    return header||marker||((code===403||code===429||code===503)&&weak);
  }
  function guarded(call,url){
    var r=call();var target=(r&&r.url)||url||'';
    if(isChallenge(r)){
      if(r)r.challenge=true;
      try{var v=C.autoVerify(target);if(v&&v.ok)r=call();}catch(e){}
    }
    if(r)r.challenge=isChallenge(r);return r;
  }
  C.challenge=isChallenge;
  C.request=function(url,opt){return guarded(function(){return old.request(url,opt);},url);};
  C.get=function(url,opt){return guarded(function(){return old.get(url,opt);},url);};
  C.post=function(url,data,opt){return guarded(function(){return old.post(url,data,opt);},url);};
  C.video=function(path,opt){return guarded(function(){return old.video(path,opt);},'');};
  C.comic=function(path){return guarded(function(){return old.comic(path);},'');};
  C.build=BUILD;

  function nodes(html,sel){try{return pdfa(String(html||''),sel)||[];}catch(e){return [];}}
  function text(node,sel){try{return C.clean(pdfh(node,sel)||'');}catch(e){return '';}}
  function attr(node,sel){try{return String(pdfh(node,sel)||'').replace(/&amp;/g,'&').trim();}catch(e){return '';}}
  function firstText(node,sels){for(var i=0;i<sels.length;i++){var v=text(node,sels[i]);if(v)return v;}return '';}
  function firstAttr(node,sels){for(var i=0;i<sels.length;i++){var v=attr(node,sels[i]);if(v)return v;}return '';}
  function uniq(list){var out=[],seen={};for(var i=0;i<list.length;i++){var x=list[i],k=String(x&&x.id||'');if(!k||seen[k])continue;seen[k]=1;out.push(x);}return out;}
  function assertHome(r){
    if(r&&isChallenge(r)){var e=new Error('NEED_VERIFY|'+String(r.url||C.resolveHost(false))+'|首页');e.code='NEED_VERIFY';e.url=r.url;throw e;}
    if(!r||Number(r.statusCode||0)>=400||!String(r.body||''))throw new Error('首页请求失败：HTTP '+Number((r&&r.statusCode)||0));
    return r;
  }
  P.home=function(){
    var r=assertHome(C.video('/')),base=r.base||C.resolveHost(false),html=r.body,sections=[],featured=null;
    var banner=nodes(html,'#home-banner-wrapper');
    if(banner.length){
      var b=banner[0],img=firstAttr(html,['div[style*=aspect-ratio] img&&src','#home-banner-wrapper img&&src']),title=firstText(b,['h1&&Text','.title&&Text']),meta=firstText(b,['h4&&Text']);
      var m=String(img||'').match(/thumbnail\/(\d+)/);if(title)featured={id:m?m[1]:'',title:title,img:C.abs(base,img),meta:meta};
    }
    var titles=nodes(html,'#home-rows-wrapper > a.horizontal-row-title');
    var rows=nodes(html,'#home-rows-wrapper .home-rows-videos-wrapper.horizontal-row');
    if(!rows.length)rows=nodes(html,'.home-rows-videos-wrapper.horizontal-row');
    for(var i=0;i<rows.length;i++){
      var cs=nodes(rows[i],'div.horizontal-card'),list=[];
      for(var j=0;j<cs.length;j++){var c=P.card(cs[j],base);if(c&&c.id)list.push(c);}
      list=uniq(list);if(!list.length)continue;
      var ta=titles[i]||'',t=ta?firstText(ta,['h3&&Text','Text']):('推荐 '+(i+1)),href=ta?firstAttr(ta,['href','a&&href']):'';
      sections.push({title:t||('推荐 '+(i+1)),more:C.abs(base,href),items:list});
    }
    if(!sections.length){
      var allNodes=nodes(html,'#home-rows-wrapper div.horizontal-card');if(!allNodes.length)allNodes=nodes(html,'div.horizontal-card');var all=[];
      for(var k=0;k<allNodes.length;k++){var x=P.card(allNodes[k],base);if(x&&x.id)all.push(x);}all=uniq(all);
      if(all.length)sections.push({title:'推荐',more:'',items:all});
    }
    if(!sections.length)throw new Error('首页已通过网络访问，但未解析到视频列表；请反馈当前页面截图。');
    return {base:base,featured:featured,sections:sections};
  };
  P.build=BUILD;
  return {build:BUILD,challenge:isChallenge};
})(HanimeCore,HanimeProvider);
