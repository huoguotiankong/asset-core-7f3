/* 麻豆AI Settings + Official Icon Detector 2.7.0-test.3 */
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
    var cachedIcon=getItem('mdai_official_icon_detected','');
    d.push({
      title:'官网图标检测',
      desc:cachedIcon?cachedIcon:'从当前官网首页解析 rel=icon / apple-touch-icon，并复制真实地址',
      url:$('#noLoading#').lazyRule(function(){
        try{
          var m=$.require('mdai'),host=String(m.host()||'').replace(/\/+$/,''),html=String(m.request('/',8000)||'');
          var tags=html.match(/<link\b[^>]*>/gi)||[],best='',bestScore=-1;
          function attr(tag,name){var r=new RegExp('(?:^|\\s)'+name+'\\s*=\\s*["\\\']([^"\\\']+)["\\\']','i'),x=String(tag||'').match(r);return x?String(x[1]||''):'';}
          function absolute(href){href=String(href||'').replace(/&amp;/g,'&').trim();if(!href||/^data:/i.test(href))return'';if(/^https?:\/\//i.test(href))return href;if(/^\/\//.test(href))return (host.indexOf('https://')===0?'https:':'http:')+href;if(href.charAt(0)==='/')return host+href;return host+'/'+href.replace(/^\.\//,'');}
          for(var i=0;i<tags.length;i++){
            var rel=attr(tags[i],'rel'),href=attr(tags[i],'href');if(!/icon/i.test(rel)||!href)continue;
            var score=10;if(/apple-touch-icon/i.test(rel))score+=20;if(/shortcut/i.test(rel))score+=5;
            var sz=attr(tags[i],'sizes'),mm=sz.match(/(\d+)x(\d+)/i);if(mm)score+=Math.min(40,Math.floor((parseInt(mm[1])||0)/16));
            var abs=absolute(href);if(abs&&score>bestScore){best=abs;bestScore=score;}
          }
          if(!best)return'toast://官网首页没有声明可用的 icon 链接';
          setItem('mdai_official_icon_detected',best);refreshPage(false);return'copy://'+best;
        }catch(e){return'toast://图标检测失败：'+String(e.message||e);}
      }),
      col_type:'text_1'
    });
    if(cachedIcon)d.push({title:'复制已检测图标地址',desc:'手动填写程序图标时使用',url:'copy://'+cachedIcon,col_type:'text_1'});
    d.push({title:'刷新动态分类',desc:'重新获取视频 / 帖子分类',url:$('#noLoading#').lazyRule(function(){clearItem('mdai_categories_cache_video');clearItem('mdai_categories_cache_video_time');clearItem('mdai_categories_cache_post');clearItem('mdai_categories_cache_post_time');refreshPage(false);return'toast://分类缓存已刷新';}),col_type:'text_1'});
    d.push({title:'测试接口',desc:'验证当前 Host',url:$('#noLoading#').lazyRule(function(){try{var m=$.require('mdai'),o=m.request('/api/v1/videos?categoryId=27&page=1&size=1',5000),a=m.items(o);return'toast://接口正常，返回 '+a.length+' 条';}catch(e){return'toast://接口异常：'+String(e.message||e);}}),col_type:'text_1'});
    d.push(U.line());
    d.push({title:'麻豆AI 2.7.0-test.3',desc:'片库 Test2 基线 + 官网 icon 实机检测/复制；Stable 2.6.3 不变',url:'hiker://empty',col_type:'long_text'});
    setResult(d);
  }
  return{version:'2.7.0-test.3',settings:settings};
})();
