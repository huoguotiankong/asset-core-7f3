/* 黄豆短剧 Detail / Topic / Settings 1.9.0-test.4 */
var HuangDouDetailV190=(function(){
  var U=HuangDouUIV190,D=U.design;
  function navParam(name,def){
    try{if(typeof MY_PARAMS==='object'&&MY_PARAMS&&MY_PARAMS[name]!=null&&String(MY_PARAMS[name])!=='')return String(MY_PARAMS[name]);}catch(e){}
    return String(U.qp(name,def==null?'':def)||'');
  }
  function safeHttp(c,raw){raw=String(raw||'').trim();if(!raw)return '';if(/^https?:\/\//i.test(raw))return raw;if(raw.charAt(0)==='/')return c.abs(raw);return '';}
  function groupSize(){var n=parseInt(getItem('hddj_ep_group_v190','30')||'30');if(n<20)n=20;if(n>60)n=60;return n;}
  function detail(c,p){
    var d=[],raw=navParam('hddj_url',''),url=safeHttp(c,raw),hint=navParam('hddj_title','');
    if(!url){setPageTitle(hint||'详情加载失败');setResult([U.empty('详情地址无效','请返回列表重新进入')]);return;}
    try{
      var html=c.req(url),x=c.parseDetail(html,url);setPageTitle(x.title);c.saveHistory({title:x.title,img:x.img,url:x.url,heat:x.heat,ep:x.meta,tags:[]});
      var poster=c.imgUrl(x.img),meta=[];if(x.meta)meta.push(x.meta);if(x.heat)meta.push('热度 '+c.compactHeat(x.heat));
      d.push({title:x.title,desc:meta.join(' · '),img:poster,pic_url:poster,url:poster||'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{gradient:true,lineVisible:false}});
      var last=parseInt(getItem('hddj_last_'+x.id,'0')||'0'),target=last>0?last:(x.eps.length?x.eps[0].no:0),fav=c.isFav(x.url),targetEp=null;
      for(var ti=0;ti<x.eps.length;ti++){if(x.eps[ti].no===target){targetEp=x.eps[ti];break;}}
      if(target)d.push({title:last>0?'继续第 '+last+' 集':'立即播放',url:$('#noLoading#').lazyRule(function(id,ep,locked){return $.require('hddj').play(id,ep,locked);},x.id,target,!!(targetEp&&targetEp.locked)),col_type:'text_center_1',extra:{backgroundColor:D.active,lineVisible:false}});
      if(x.desc){d.push(U.line());d.push(U.section(c,'剧情简介',''));d.push({title:x.desc,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});}
      if(x.eps.length){
        d.push(U.line());
        var reverse=getItem('hddj_reverse_v190','0')==='1',eps=x.eps.slice();if(reverse)eps.reverse();
        d.push({title:'选集',desc:'共 '+x.eps.length+' 集 · '+(reverse?'倒序':'正序')+'（点击切换）',url:$('#noLoading#').lazyRule(function(){setItem('hddj_reverse_v190',getItem('hddj_reverse_v190','0')==='1'?'0':'1');refreshPage(false);return'hiker://empty';}),col_type:'text_1',extra:{lineVisible:false}});
        var gs=groupSize(),groups=Math.ceil(eps.length/gs),gk='hddj_ep_group_v190_'+x.id,gi=parseInt(getMyVar(gk,'0')||'0');if(gi<0||gi>=groups)gi=0;
        if(groups>1){for(var g=0;g<groups;g++){var st=g*gs+1,ed=Math.min((g+1)*gs,eps.length);d.push(U.chip(st+'-'+ed,g===gi,U.stateUrl(gk,String(g)),'flex_button'));}d.push(U.blank());}
        var show=groups>1?eps.slice(gi*gs,Math.min((gi+1)*gs,eps.length)):eps;
        show.forEach(function(ep){
          var current=last===ep.no,label='第'+ep.no+'集'+(ep.locked?' · 锁':'');
          d.push({title:label,url:$('#noLoading#').lazyRule(function(id,no,locked){return $.require('hddj').play(id,no,locked);},x.id,ep.no,!!ep.locked),col_type:'text_4',extra:{backgroundColor:current?D.active:'',lineVisible:false}});
        });
      }
      var rel=c.parseCards(html).filter(function(v){return v&&v.url!==x.url;}).slice(0,6);if(rel.length){d.push(U.line());d.push(U.section(c,'猜你喜欢','相关短剧'));rel.forEach(function(v){d.push(U.card(c,v,'movie_3'));});}
      d.push(U.line());
      d.push({title:fav?'取消本地收藏':'加入本地收藏',url:$('#noLoading#').lazyRule(function(obj){var on=$.require('hddj').toggleFav(obj);refreshPage(false);return'toast://'+(on?'已加入本地收藏':'已取消本地收藏');},{title:x.title,img:x.img,url:x.url,heat:x.heat,ep:x.meta,tags:[]}),col_type:'text_center_1',extra:{lineVisible:false}});
      d.push({title:'官网 / 登录解锁',url:url,col_type:'text_center_1',extra:{lineVisible:false}});
    }catch(e){setPageTitle(hint||'详情加载失败');d.push(U.empty('详情加载失败',String(e.message||e)));}
    setResult(d);
  }
  function topic(c){
    if(U.qp('index','')==='1')return HuangDouContentV190.topics(c);
    var d=[],raw=navParam('hddj_topic_url',''),url=safeHttp(c,raw),title=navParam('hddj_title','专题');if(!url){setPageTitle('专题合集');return HuangDouContentV190.topics(c);}try{var html=c.req(url),list=c.parseCards(html)||[],head=title,hm=html.match(/<h1\b[^>]*class=["'][^"']*dm-topic-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);if(hm)head=c.maskText(hm[1]);setPageTitle(head);var intro='',im=html.match(/<div\b[^>]*class=["'][^"']*dm-topic-desc[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)||html.match(/<p\b[^>]*class=["'][^"']*dm-topic-desc[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);if(im)intro=c.maskText(im[1]);if(intro){d.push(U.section(c,'专题简介',''));d.push({title:intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});d.push(U.line());}d.push(U.section(c,'专题短剧',list.length+' 部'));list.forEach(function(x){d.push(U.card(c,x,'movie_3'));});if(!list.length)d.push(U.empty('当前专题暂无短剧'));}catch(e){setPageTitle(title||'专题');d.push(U.empty('专题加载失败',String(e.message||e)));}setResult(d);
  }
  function settings(c,p){
    var d=[];setPageTitle('设置');d.push(U.section(c,'体验','界面与选集'));
    d.push({title:'片库布局',desc:getItem('hddj_col_v190','movie_3')==='movie_3'?'三列海报':'双列卡片',url:$('#noLoading#').lazyRule(function(){var ops=['三列海报','双列卡片'];return'select://'+JSON.stringify({title:'片库布局',options:ops,selectedIndex:getItem('hddj_col_v190','movie_3')==='movie_3'?0:1,col:2,js:$.toString(function(){setItem('hddj_col_v190',input==='三列海报'?'movie_3':'movie_2');refreshPage(false);})});}),col_type:'text_1'});
    d.push({title:'选集分组',desc:groupSize()+' 集 / 组',url:$('#noLoading#').lazyRule(function(){var ops=['20','30','40','50','60'];return'select://'+JSON.stringify({title:'每组选集数量',options:ops,selectedIndex:Math.max(0,ops.indexOf(getItem('hddj_ep_group_v190','30'))),col:3,js:$.toString(function(){setItem('hddj_ep_group_v190',input);refreshPage(false);})});}),col_type:'text_1'});
    d.push(U.line());d.push(U.section(c,'播放','会话保持与 HLS 预检'));
    var st=p.strategy(),name=st==='web'?'网页兼容':'会话直连（推荐）';
    d.push({title:'播放策略',desc:name,url:$('#noLoading#').lazyRule(function(){var ops=['会话直连（推荐）','网页兼容'];var now=getItem('hddj_play_strategy_v4','direct'),idx=now==='web'?1:0;return'select://'+JSON.stringify({title:'播放策略',options:ops,selectedIndex:idx,col:1,js:$.toString(function(){setItem('hddj_play_strategy_v4',input==='网页兼容'?'web':'direct');refreshPage(false);})});}),col_type:'text_1'});
    var dg=p.diag(),summary=dg&&dg.stage?(String(dg.stage)+' · '+String(dg.route||'')+(dg.ep?' · 第'+dg.ep+'集':'')):'暂无播放记录';d.push({title:'最近播放诊断',desc:summary,url:'toast://'+('stage='+(dg.stage||'NONE')+' route='+(dg.route||'')+(dg.ep?' ep='+dg.ep:'')+(dg.locked?' locked=1':'')+(dg.cookie?' cookie=1':'')+(dg.error?' error='+dg.error:'')),col_type:'text_1'});
    d.push({title:'账号 / 会员会话',desc:(function(){try{return getCookie(c.host())?'已检测到站点 Cookie · 点击打开官网':'未检测到登录会话 · 点击打开官网';}catch(e){return'点击打开官网登录/会员页面';}})(),url:'web://'+c.host()+'/',col_type:'text_1'});
    d.push(U.line());d.push(U.section(c,'网络','站点线路'));
    d.push({title:'当前域名',desc:c.host(),url:$('#noLoading#').lazyRule(function(){var ops=['https://hddj.tv','https://hdmgdj.tv','https://huangdoudj.com'];return'select://'+JSON.stringify({title:'站点域名',options:ops,selectedIndex:Math.max(0,ops.indexOf($.require('hddj').host())),col:1,js:$.toString(function(){setItem('hddj_host',input);refreshPage(false);})});}),col_type:'text_1'});
    d.push({title:'自动选择可用线路',desc:'仅点击时探测，不阻塞启动',url:$('#noLoading#').lazyRule(function(hosts,ua){for(var i=0;i<hosts.length;i++){try{var s=request(hosts[i]+'/',{timeout:5000,headers:{'User-Agent':ua}});if(String(s||'').indexOf('dm-card')>=0||String(s||'').indexOf('黄豆')>=0){setItem('hddj_host',hosts[i]);refreshPage(false);return'toast://已切换到 '+hosts[i];}}catch(e){}}return'toast://暂未找到可用线路';},['https://hddj.tv','https://hdmgdj.tv','https://huangdoudj.com'],c.ua),col_type:'text_1'});
    d.push(U.line());d.push(U.section(c,'本地数据','清理与恢复'));
    d.push({title:'清空观看历史',url:$('#noLoading#').lazyRule(function(){setItem('hddj_history','[]');return'toast://观看历史已清空';}),col_type:'text_1'});
    d.push({title:'清空搜索历史',url:$('#noLoading#').lazyRule(function(){setItem('hddj_search_history','[]');return'toast://搜索历史已清空';}),col_type:'text_1'});
    d.push({title:'恢复 1.9 默认设置',url:$('#noLoading#').lazyRule(function(){clearItem('hddj_col_v190');clearItem('hddj_ep_group_v190');clearItem('hddj_reverse_v190');clearItem('hddj_play_strategy_v2');clearItem('hddj_play_strategy_v3');clearItem('hddj_play_strategy_v4');clearMyVar('hddj_home_tab_v190');clearMyVar('hddj_library_cat_v190');clearMyVar('hddj_mine_tab_v190');refreshPage(false);return'toast://已恢复默认设置';}),col_type:'text_center_1'});
    d.push({title:'版本 1.9.0-test.4',desc:'保留登录会话 → Token → HLS 预检 → 带 Cookie/Referer 直连；锁定集按真实会话授权处理，不绕过官网权限',url:'hiker://empty',col_type:'long_text'});setResult(d);
  }
  return{version:'1.9.0-test.4',detail:detail,topic:topic,settings:settings};
})();
