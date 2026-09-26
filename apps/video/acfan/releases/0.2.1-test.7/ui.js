/* ACFAN 0.2.1-test.7 native design system */
var ACFAN7UI=(function(){
  var C=ACFAN7Core,I=ACFAN7Image,ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfan/assets/v2/';
  var D={brand:'#FF6B45',brandSoft:'#FFF0EB',accent:'#8A63E8',text:'#202124',muted:'#7A7F87',icons:{home:ROOT+'home.svg',rank:ROOT+'rank.svg',discover:ROOT+'discover.svg',library:ROOT+'library.svg',settings:ROOT+'settings.svg',web:ROOT+'web.svg',diag:ROOT+'diag.svg'},root:ROOT};
  function line(){return{col_type:'line_blank'};}
  function section(title,desc,url){return{title:C.clean(title),desc:C.clean(desc||''),url:url||'hiker://empty',col_type:'text_icon',extra:{lineVisible:false}};}
  function chip(title,on,url,col){return{title:C.clean(title),url:url,col_type:col||'scroll_button',extra:{backgroundColor:on?D.brandSoft:'',lineVisible:false}};}
  function state(key,val,clearKeys){return $('#noLoading#').lazyRule(function(k,v,cs){putMyVar(k,String(v));var a=String(cs||'').split('|');for(var i=0;i<a.length;i++)if(a[i])clearMyVar(a[i]);refreshPage(false);return'hiker://empty';},key,String(val),clearKeys||'');}
  function clearState(key){return $('#noLoading#').lazyRule(function(k){clearMyVar(k);refreshPage(false);return'hiker://empty';},key);}
  function empty(title,desc,url){return{title:title||'暂无内容',desc:desc||'',url:url||'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function quick(title,img,url){return{title:title,img:img,url:url,col_type:'icon_5',extra:{lineVisible:false}};}
  function channelIcon(cfg){return ROOT+(cfg&&cfg.icon?cfg.icon:'featured.svg');}
  function detailUrl(e){return C.page('acfanT7Detail',{acf_kind:e.kind||'video',acf_id:e.id||'',acf_title:e.title||'',acf_img:e.img||'',acf_img_domain:e.imgDomain||'',acf_author:e.author||'',acf_desc:e.desc||''});}
  function metadata(e){e=e||{};var s=e.stats||{},m=[];if(e.kind==='video'||e.kind==='short'){if(s.watch)m.push('播放 '+C.fmtNum(s.watch));if(s.duration)m.push(C.s(s.duration));if(!m.length&&e.author)m.push(e.author);}else if(e.kind==='comic'||e.kind==='fiction'||e.kind==='audio'){if(s.chapter)m.push('共 '+s.chapter+(e.kind==='comic'?' 话':' 章'));if(e.author)m.push(e.author);if(!m.length&&e.desc)m.push(e.desc);}else if(e.kind==='community'||e.kind==='ai'){if(e.author)m.push(e.author);if(s.like)m.push('赞 '+C.fmtNum(s.like));if(s.comment)m.push('评 '+C.fmtNum(s.comment));}if(e.badge)m.unshift(e.badge);return C.clean(m.join(' · '));}
  function card(e,opt){e=e||{};opt=opt||{};var img=I.url(e.img||'',e.imgDomain||''),kind=e.kind||'video',col=opt.col||((kind==='video'||kind==='short')?'movie_2':((kind==='community'||kind==='ai')?(img?'movie_1_left_pic':'text_1'):'movie_3'));return{title:C.clean(e.title||'未命名'),desc:metadata(e),img:img,pic_url:img,url:detailUrl(e),col_type:col,extra:{lineVisible:false,acf_kind:kind,acf_id:e.id||''}};}
  function hero(e){e=e||{};var img=I.url(e.img||'',e.imgDomain||'');return{title:C.clean(e.title||'未命名'),desc:[e.author,metadata(e),e.desc].filter(Boolean).join(' · '),img:img,pic_url:img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}};}
  function action(title,desc,img,url,primary){return{title:C.clean(title),desc:C.clean(desc||''),img:img||'',url:url,col_type:primary?'text_icon':'text_3',extra:{lineVisible:false,backgroundColor:primary?D.brandSoft:''}};}
  function comment(x){x=x||{};var name=C.clean(C.deep(x,['nickname','nickName','name','userName','authorName'],0)||'用户'),text=C.clean(C.deep(x,['content','commentContent','text','message'],0)),time=C.clean(C.deep(x,['createTime','createdAt','time'],0));return{title:name,desc:[text,time].filter(Boolean).join('\n'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  return{design:D,line:line,section:section,chip:chip,state:state,clearState:clearState,empty:empty,quick:quick,channelIcon:channelIcon,detailUrl:detailUrl,metadata:metadata,card:card,hero:hero,action:action,comment:comment};
})();
