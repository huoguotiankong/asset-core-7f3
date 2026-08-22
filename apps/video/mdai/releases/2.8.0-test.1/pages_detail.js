/* MDAI detail pages 2.8.0-test.1 */
var MDAIDetailPagesV280=(function(){
  var U=MDAIUIBaseV280,D=U.design;
  function detail(c,pb){
    var d=[],id=String(U.qp('id','')||''),type=String(U.qp('type','video')||'video'),fallback=String(U.qp('title','')||'');
    if(!id){setResult([U.empty('详情参数缺失','缺少内容 ID，请返回上一页重新打开')]);return;}
    try{
      if(type==='post'){
        var p=c.payload(c.request('/api/v1/posts/'+U.enc(id)))||{},pt=c.cleanText(p.title||fallback||'帖子详情');setPageTitle(c.shortTitle(pt,16));
        var pcv=U.cover(c,p),pm=[];if(p.categoryName)pm.push(c.cleanText(p.categoryName));if(p.viewCount!=null)pm.push('浏览 '+c.compactNum(p.viewCount));if(p.likeCount!=null)pm.push('喜欢 '+c.compactNum(p.likeCount));
        d.push({title:pt,desc:pm.join(' · '),img:pcv,pic_url:pcv,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
        var pi={id:id,type:'post',title:pt,cover:pcv,desc:pm.join(' · ')};c.saveHistory(pi);
        var body=c.cleanText(p.content||'');if(body){d.push(U.line());d.push(U.section(c,'正文',''));d.push({title:body,col_type:'long_text',extra:{textSize:17,lineVisible:false}});}
        var imgs=Array.isArray(p.images)?p.images:[];imgs.forEach(function(x){var iu=c.image(x);if(iu)d.push({img:iu,pic_url:iu,url:iu+'#.jpg#',col_type:'pic_1_full'});});
        var ps=U.seed(p);if(pb.collect(c,ps).length){d.push(U.line());d.push({title:'播放帖子视频',url:$('#noLoading#').lazyRule(function(s){return $.require('mdai').play(s);},ps),col_type:'text_center_1',extra:{backgroundColor:D.active,lineVisible:false}});}
        d.push(U.line());var pf=c.isFav(id,'post');d.push(U.chip(pf?'已收藏':'收藏',pf,$('#noLoading#').lazyRule(function(info){var on=$.require('mdai').toggleFav(info);refreshPage(false);return'toast://'+(on?'已加入收藏':'已取消收藏');},pi),'text_2'));d.push(U.chip('评论',false,U.page('mdaiComments',{target:'post',id:id,title:pt}),'text_2'));
        setResult(d);return;
      }
      var path=type==='drama'?'/api/v1/short-dramas/'+U.enc(id)+'?productId=1':'/api/v1/videos/'+U.enc(id),x=c.payload(c.request(path))||{},title=c.cleanText(x.title||fallback||'详情');setPageTitle(c.shortTitle(title,16));
      var isDrama=type==='drama'||Array.isArray(x.episodes),cv=U.cover(c,x),meta=U.meta(c,x,isDrama?'drama':'video'),info={id:id,type:isDrama?'drama':'video',title:title,cover:cv,desc:meta};c.saveHistory(info);
      d.push({title:title,desc:meta,img:cv,pic_url:cv,url:'hiker://empty',col_type:isDrama?'movie_1_vertical_pic_blur':'movie_1_left_pic',extra:{gradient:isDrama,lineVisible:false}});
      var eps=Array.isArray(x.episodes)?x.episodes.slice():[],lastKey='mdai_last_ep_no_'+id,lastNo=isDrama?parseInt(getItem(lastKey,'-1')):-1;
      if(isDrama&&eps.length){
        var target=eps[0];if(lastNo>0){for(var z=0;z<eps.length;z++){var nn=eps[z].episodeNo!=null?parseInt(eps[z].episodeNo):(z+1);if(nn===lastNo){target=eps[z];break;}}}
        var no=target.episodeNo!=null?target.episodeNo:1,ss=U.seed(target);
        d.push({title:lastNo>0?'继续第 '+no+' 集':'从第 1 集开始',url:$('#noLoading#').lazyRule(function(s,k,n){setItem(k,String(n));return $.require('mdai').play(s);},ss,lastKey,no),col_type:'text_center_1',extra:{backgroundColor:D.active,lineVisible:false}});
      }else{
        var vs=U.seed(x);if(pb.collect(c,vs).length)d.push({title:'立即播放',url:$('#noLoading#').lazyRule(function(s){return $.require('mdai').play(s);},vs),col_type:'text_center_1',extra:{backgroundColor:D.active,lineVisible:false}});
      }
      var intro=c.cleanText(x.description||x.intro||x.summary||'');if(intro){d.push(U.line());d.push(U.section(c,'剧情简介',''));d.push({title:intro,url:'hiker://empty',col_type:'long_text',extra:{textSize:17,lineVisible:false}});}
      d.push(U.line());d.push(U.section(c,'更多操作','收藏与互动'));
      var fav=c.isFav(id,isDrama?'drama':'video');
      d.push(U.chip(fav?'已收藏':'收藏',fav,$('#noLoading#').lazyRule(function(i){var on=$.require('mdai').toggleFav(i);refreshPage(false);return'toast://'+(on?'已加入收藏':'已取消收藏');},info),'text_2'));
      d.push(U.chip(isDrama?'短剧片库':'评论',false,isDrama?U.page('mdaiLibrary',{type:'drama'}):U.page('mdaiComments',{target:'video',id:id,title:title}),'text_2'));
      if(eps.length){
        d.push(U.line());
        var reverse=getItem('mdai_episode_reverse','0')==='1';if(reverse)eps.reverse();var total=eps.length,rs=parseInt(getItem('mdai_episode_range','40'))||40;if(rs<20)rs=20;if(rs>60)rs=60;
        var count=Math.ceil(total/rs),rk='mdai_ep_range_v280_'+id,sel=parseInt(getMyVar(rk,'0'))||0;if(sel<0||sel>=count)sel=0;
        d.push({title:'选集',desc:'共 '+total+' 集',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
        d.push({title:reverse?'倒序':'正序',desc:'点击切换',url:$('#noLoading#').lazyRule(function(){var n=getItem('mdai_episode_reverse','0')==='1'?'0':'1';setItem('mdai_episode_reverse',n);refreshPage(false);return'hiker://empty';}),col_type:'text_2',extra:{lineVisible:false}});
        if(count>1){for(var r=0;r<count;r++){var a=r*rs+1,b=Math.min((r+1)*rs,total),on=r===sel;d.push(U.chip(a+'-'+b,on,U.stateUrl(rk,String(r)),'flex_button'));}d.push(U.blank());}
        var begin=sel*rs,end=Math.min(begin+rs,total);for(var i=begin;i<end;i++){var e=eps[i]||{},real=e.episodeNo!=null?parseInt(e.episodeNo):(reverse?(total-i):(i+1)),watched=lastNo>0&&real===lastNo,es=U.seed(e);d.push({title:watched?'▶ '+real:String(real),url:$().lazyRule(function(s,k,n){setItem(k,String(n));return $.require('mdai').play(s);},es,lastKey,real),col_type:'text_4',extra:{backgroundColor:watched?D.active:'',lineVisible:false,id:'mdai-detail-ep-'+id+'-'+real}});}
      }
      if(getItem('mdai_related','1')==='1'){
        try{var rel=[];if(isDrama)rel=c.items(c.request('/api/v1/short-dramas?productId=1&sortBy=heat&page=1&size=9'));else if(x.categoryId!=null)rel=c.items(c.request('/api/v1/videos?categoryId='+U.enc(x.categoryId)+'&page=1&size=9'));rel=rel.filter(function(z){return String(U.id(z))!==String(id);}).slice(0,6);if(rel.length){d.push(U.line());d.push(U.section(c,'猜你喜欢','相关内容'));rel.forEach(function(z){d.push(U.card(c,z,isDrama?'drama':'video',isDrama?'movie_3':'movie_2'));});}}catch(e2){}
      }
    }catch(e){d.push(U.empty('详情加载失败',String(e.message||e)));d.push({title:'重试',url:$('#noLoading#').lazyRule(function(){refreshPage(false);return'hiker://empty';}),col_type:'text_center_1'});}
    setResult(d);
  }
  return{version:'2.8.0-test.1',detail:detail};
})();
