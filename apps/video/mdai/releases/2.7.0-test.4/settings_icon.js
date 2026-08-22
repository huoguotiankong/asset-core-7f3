/* 麻豆AI Settings + Official Icon Detector 2.7.0-test.4 */
var MDAISettingsV270=(function(){
  var U=MDAIUIBaseV270;
  function settings(c,pb){
    var d=[];setPageTitle('设置');
    d.push(U.section(c,'体验','界面与浏览'));
    d.push({title:'每页数量',desc:String(c.pageSize())+' 条',url:'select://'+JSON.stringify({title:'每页数量',options:['20','30','40','50','60'],col:3,js:$.toString(function(){setItem('mdai_page_size',input);refreshPage(false);toast('已保存');})}),col_type:'text_1'});
    d.push({title:'相关推荐',desc:getItem('mdai_related','1')==='1'?'开启':'关闭',url:$('#noLoading#').lazyRule(function(){var n=getItem('mdai_related','1')==='1'?'0':'1';setItem('mdai_related',n);refreshPage(false);return'toast://已切换';}),col_type:'text_1'});
    d.push({title:'选集排序',desc:getItem('mdai_episode_reverse','0')==='1'?'倒序':'正序',url:$('#noLoading#').lazyRule(function(){var n=getItem('mdai_episode_reverse','0')==='1'?'0':'1';setItem('mdai_episode_reverse',n);refreshPage(false);return'toast://已切换';}),col_type:'text_1'});
    d.push({title:'每组选集',desc:getItem('mdai_episode_range','40')+' 集',url:'select://'+JSON.stringify({title:'每组选集',options:['20','30','40','50','60'],col:3,js:$.toString(function(){setItem('mdai_episode_range',input);refreshPage(false);toast('已保存');})}),col_type:'text_1'});
    d.push(U.line());d.push(U.section(c,'播放','PlaybackAdapter 2.7'));
    var s=pb.strategy(),map={smart:'智能双线路（推荐）',direct:'原始直连优先',proxy:'稳定代理',compat:'兼容缓存'};
    d.push({title:'播放策略',desc:map[s]||map.smart,url:'select://'+JSON.stringify({title:'选择播放策略',options:['智能双线路（推荐）','原始直连优先','稳定代理','兼容缓存'],col:2,js:$.toString(function(){var m={'智能双线路（推荐）':'smart','原始直连优先':'direct','稳定代理':'proxy','兼容缓存':'compat'};setItem('mdai_play_strategy_v2',m[input]||'smart');refreshPage(false);toast('播放策略已更新');})}),col_type:'text_1'});
    var diag=pb.diag();d.push({title:'最近播放诊断',desc:diag?'点击查看':'暂无记录',url:diag?'toast://'+diag:'toast://暂无播放记录',col_type:'text_1'});
    d.push(U.line());d.push(U.section(c,'网络','接口、分类与官网资源'));
    d.push({title:'接口域名',desc:c.host(),url:'input://'+JSON.stringify({value:c.host(),hint:'输入接口域名',js:$.toString(function(){var v=String(input||'').trim().replace(/\/+$/,'');if(!/^https?:\/\//i.test(v))return'toast://域名必须以 http:// 或 https:// 开头';setItem('mdai_host',v);refreshPage(false);return'toast://已保存';})}),col_type:'text_1'});
    var cachedIcon=getItem('mdai_official_icon_detected',''),cachedSource=getItem('mdai_official_icon_source','');
    var ua=String(c.ua||'');if(ua.length<20)ua='Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    d.push({
      title:'官网图标检测',
      desc:cachedIcon?((cachedSource?cachedSource+' · ':'')+cachedIcon):'原始请求官网 HTML；解析 icon / apple-touch-icon / manifest，不经过 JSON API Client',
      url:$('#noLoading#').lazyRule(function(host,ua){
        try{
          host=String(host||'').replace(/\/+$/,'');
          var html=String(request(host+'/',{timeout:10000,headers:{'User-Agent':ua,'Accept':'text/html,application/xhtml+xml,*/*;q=0.8','Cache-Control':'no-cache'}})||'');
          if(!html||html.length<20)return'toast://官网首页返回为空';
          var cand=[];
          function attr(tag,name){var r=new RegExp('(?:^|\\s)'+name+'\\s*=\\s*["\\\']([^"\\\']+)["\\\']','i'),x=String(tag||'').match(r);return x?String(x[1]||''):'';}
          function abs(href){href=String(href||'').replace(/&amp;/g,'&').trim();if(!href||/^data:/i.test(href))return'';if(/^https?:\/\//i.test(href))return href;if(/^\/\//.test(href))return (host.indexOf('https://')===0?'https:':'http:')+href;if(href.charAt(0)==='/')return host+href;return host+'/'+href.replace(/^\.\//,'');}
          function add(url,score,source){url=abs(url);if(url)cand.push({url:url,score:score,source:source});}
          var tags=html.match(/<link\b[^>]*>/gi)||[];
          for(var i=0;i<tags.length;i++){
            var rel=attr(tags[i],'rel'),href=attr(tags[i],'href'),sz=attr(tags[i],'sizes'),score=0;
            if(/apple-touch-icon/i.test(rel))score=50;else if(/\bicon\b/i.test(rel))score=35;else continue;
            var mm=sz.match(/(\d+)x(\d+)/i);if(mm)score+=Math.min(40,Math.floor((parseInt(mm[1])||0)/8));
            add(href,score,/apple-touch-icon/i.test(rel)?'apple-touch-icon':'rel=icon');
          }
          var metas=html.match(/<meta\b[^>]*>/gi)||[];
          for(var j=0;j<metas.length;j++){
            var n=attr(metas[j],'name'),ct=attr(metas[j],'content');
            if(/msapplication-TileImage/i.test(n))add(ct,30,'msapplication-TileImage');
          }
          var manifest='';
          for(var k=0;k<tags.length;k++){if(/\bmanifest\b/i.test(attr(tags[k],'rel'))){manifest=abs(attr(tags[k],'href'));break;}}
          if(manifest){
            try{
              var mt=String(request(manifest,{timeout:8000,headers:{'User-Agent':ua,'Accept':'application/manifest+json,application/json,*/*'}})||''),mo=JSON.parse(mt||'{}'),icons=Array.isArray(mo.icons)?mo.icons:[];
              for(var q=0;q<icons.length;q++){var ic=icons[q]||{},sc=45,ms=String(ic.sizes||'').match(/(\d+)x(\d+)/i);if(ms)sc+=Math.min(50,Math.floor((parseInt(ms[1])||0)/8));add(ic.src,sc,'manifest');}
            }catch(ignore){}
          }
          if(!cand.length)return'toast://官网 HTML / manifest 没有声明可用图标，未使用猜测地址';
          cand.sort(function(a,b){return b.score-a.score;});var best=cand[0];
          setItem('mdai_official_icon_detected',best.url);setItem('mdai_official_icon_source',best.source);refreshPage(false);return'copy://'+best.url;
        }catch(e){return'toast://图标检测失败：'+String(e.message||e);}
      },c.host(),ua),
      col_type:'text_1'
    });
    if(cachedIcon)d.push({title:'复制已检测图标地址',desc:(cachedSource?cachedSource+' · ':'')+cachedIcon,url:'copy://'+cachedIcon,col_type:'text_1'});
    d.push({title:'刷新动态分类',desc:'重新获取视频 / 帖子分类',url:$('#noLoading#').lazyRule(function(){clearItem('mdai_categories_cache_video');clearItem('mdai_categories_cache_video_time');clearItem('mdai_categories_cache_post');clearItem('mdai_categories_cache_post_time');refreshPage(false);return'toast://分类缓存已刷新';}),col_type:'text_1'});
    d.push({title:'测试接口',desc:'验证当前 Host',url:$('#noLoading#').lazyRule(function(){try{var m=$.require('mdai'),o=m.request('/api/v1/videos?categoryId=27&page=1&size=1',5000),a=m.items(o);return'toast://接口正常，返回 '+a.length+' 条';}catch(e){return'toast://接口异常：'+String(e.message||e);}}),col_type:'text_1'});
    d.push(U.line());
    d.push({title:'麻豆AI 2.7.0-test.4',desc:'修复图标检测误走 JSON API Client；改为原始 HTML + manifest 解析。Stable 2.6.3 不变。',url:'hiker://empty',col_type:'long_text'});
    setResult(d);
  }
  return{version:'2.7.0-test.4',settings:settings};
})();
