/* 汤头条 0.1.0-test.11 Pages Patch / paid-preview semantics */
var TangTouTiaoPagesV019=(function(){
  var B=TangTouTiaoPagesV017,P=TangTouTiaoProtocolV015,C=TangTouTiaoCoreV019,U=TangTouTiaoUIV015,O={};for(var k in B)if(B.hasOwnProperty(k))O[k]=B[k];
  function fallback(){return{id:C.param('id',''),title:C.param('title','视频详情'),coverRaw:C.param('coverRaw',''),author:C.param('author','')};}
  function historyPayload(it){return JSON.stringify(C.plainRecord(it));}
  function payload(it,sources,expected){return JSON.stringify({id:it.id,title:it.title,expectedDuration:expected==null?it.duration:expected,sources:sources||C.sources(it)});}
  function preferred(qsrc,all,id){var key='ttt_detail_quality_'+id,v=String(getMyVar(key,'240P')||'240P'),ok=false;for(var i=0;i<qsrc.length;i++)if(qsrc[i].name===v)ok=true;if(!ok){for(var j=qsrc.length-1;j>=0;j--)if(qsrc[j].name==='240P'){v='240P';ok=true;break;}if(!ok&&qsrc.length)v=qsrc[qsrc.length-1].name;if(!ok&&!qsrc.length&&all.length)v=all[0].name;}return{key:key,value:v};}
  function qualityButton(name,on,key){return{title:(on?'● ':'')+name,url:U.state(key,name),col_type:'text_4',extra:{lineVisible:false}};}
  function fullPlayUrl(it,q){return $('#noLoading#').lazyRule(function(p,n){try{return $.require('ttt').playBest(p,n);}catch(e){return'toast://播放解析失败：'+String(e.message||e);}},payload(it),q);}
  function previewPlayUrl(it){var s=it.preview?[{name:'预览',url:it.preview,fallback:true}]:[];return $('#noLoading#').lazyRule(function(h,p){try{return $.require('ttt').playPreview(h,p);}catch(e){return'toast://试看解析失败：'+String(e.message||e);}},historyPayload(it),payload(it,s,''));}
  function purchaseUrl(it){var js='$.require("ttt").purchaseAndPlay('+JSON.stringify(String(it.id))+','+JSON.stringify(String(it.title||''))+','+Number(it.coins||0)+','+JSON.stringify(String(it.duration||''))+')';return'confirm://确认使用 '+Number(it.coins||0)+' 汤币解锁完整版？.js:'+js;}
  function detail(){var d=[],fb=fallback(),id=fb.id;setPageTitle(fb.title||'视频详情');if(!id){d.push(U.empty('缺少视频 ID'));setResult(d);return;}try{var r=P.call('/api/MvDetail/detail',{id:id}),it=C.detailItem(r,fb),all=C.sources(it),qsrc=C.qualitySources(it),sel=preferred(qsrc,all,id),ac=C.accessState(it);setPageTitle(it.title||fb.title||'视频详情');C.addHistory(it);
    d.push({title:it.title,desc:[it.author,it.duration,it.plays].filter(Boolean).join('\n'),img:it.cover,pic_url:it.cover,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    if(ac.locked){
      d.push({title:'需 '+ac.coins+' 汤币解锁完整版',desc:it.previewTip||'当前接口返回的是试看/占位媒体，购买后由原 APP 解锁接口返回完整播放地址',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
      if(it.preview)d.push({title:'▶ 试看',desc:'使用 APP 下发的 preview_video，不把试看片误判为完整视频',url:previewPlayUrl(it),col_type:'text_1',extra:{lineVisible:false,inheritTitle:false}});
      d.push({title:'解锁完整版 · '+ac.coins+' 汤币',desc:'点击后会再次确认；确认后才调用原 APP 的汤币购买接口',url:purchaseUrl(it),col_type:'text_1',extra:{lineVisible:false,inheritTitle:false}});
    }else{
      var purl=all.length?fullPlayUrl(it,sel.value):'';
      d.push({title:all.length?'▶ 立即播放 · '+sel.value:'未解析到播放线路',desc:ac.purchased?'已购买｜自动选择完整线路':'免费无限看｜自动选择完整线路',url:purl||'toast://当前详情没有可用播放线路',col_type:'text_1',extra:{lineVisible:false,inheritTitle:false}});
    }
    d.push(U.chip(C.isFav(id)?'★ 已收藏':'☆ 收藏',C.isFav(id),$('#noLoading#').lazyRule(function(x){var on=$.require('ttt').toggleFavFromDetail(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},historyPayload(it)),'text_2'));
    if(!ac.locked&&qsrc.length){d.push(U.line());d.push(U.section('清晰度','选择优先画质，失效时自动切换'));for(var i=0;i<qsrc.length;i++)d.push(qualityButton(qsrc[i].name,sel.value===qsrc[i].name,sel.key));}
    if(it.desc){d.push(U.line());d.push(U.section('简介',''));d.push({title:it.desc,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});}
    try{setItem('ttt_last_access_state',JSON.stringify({time:Date.now(),id:id,kind:ac.kind,isFree:it.isFree,isPay:it.isPay,coins:it.coins,hasPreview:!!it.preview,previewTip:it.previewTip||''}));setItem('ttt_last_detail_exact',JSON.stringify({time:Date.now(),id:id,coverRawType:typeof(it.coverRaw),coverCandidate:String(C.imageCandidate(it.coverRaw)||'').substring(0,160),sources:all.map(function(x){return x.name;}),qualities:qsrc.map(function(x){return x.name;}),preferred:sel.value,duration:it.duration,access:ac.kind,coins:ac.coins,schema:P.schema(C.dataOf(r))}));}catch(e2){}
  }catch(e){d.push(U.error('详情加载失败',e,C.page('tttSettings')));}setResult(d);}
  O.detail=detail;O.version='0.1.0-test.11';return O;
})();
