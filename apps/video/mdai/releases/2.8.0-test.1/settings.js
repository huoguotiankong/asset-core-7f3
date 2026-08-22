/* MDAI settings 2.8.0-test.1 */
var MDAISettingsV280=(function(){
  var U=MDAIUIBaseV280;
  function settings(c,pb){
    var d=[];setPageTitle('设置');
    d.push(U.section(c,'浏览体验','页面密度与相关推荐'));
    d.push({title:'每页数量',desc:String(c.pageSize())+' 条',url:'select://'+JSON.stringify({title:'每页数量',options:['20','30','40','50','60'],col:3,js:$.toString(function(){setItem('mdai_page_size',input);refreshPage(false);toast('已保存');})}),col_type:'text_1'});
    d.push({title:'相关推荐',desc:getItem('mdai_related','1')==='1'?'开启':'关闭',url:$('#noLoading#').lazyRule(function(){var n=getItem('mdai_related','1')==='1'?'0':'1';setItem('mdai_related',n);refreshPage(false);return'toast://已切换';}),col_type:'text_1'});
    d.push({title:'每组选集',desc:getItem('mdai_episode_range','40')+' 集',url:'select://'+JSON.stringify({title:'每组选集',options:['20','30','40','50','60'],col:3,js:$.toString(function(){setItem('mdai_episode_range',input);refreshPage(false);toast('已保存');})}),col_type:'text_1'});
    d.push(U.line());
    d.push(U.section(c,'播放','默认保持智能线路'));
    var s=pb.strategy(),map={smart:'智能双线路（推荐）',direct:'原始直连优先',proxy:'稳定代理',compat:'兼容缓存'};
    d.push({title:'播放策略',desc:map[s]||map.smart,url:'select://'+JSON.stringify({title:'选择播放策略',options:['智能双线路（推荐）','原始直连优先','稳定代理','兼容缓存'],col:2,js:$.toString(function(){var m={'智能双线路（推荐）':'smart','原始直连优先':'direct','稳定代理':'proxy','兼容缓存':'compat'};setItem('mdai_play_strategy_v2',m[input]||'smart');refreshPage(false);toast('播放策略已更新');})}),col_type:'text_1'});
    d.push(U.line());
    d.push(U.section(c,'网络','当前站点与分类缓存'));
    d.push({title:'接口域名',desc:c.host(),url:'input://'+JSON.stringify({value:c.host(),hint:'输入接口域名',js:$.toString(function(){var v=String(input||'').trim().replace(/\/+$/,'');if(!/^https?:\/\//i.test(v))return'toast://域名必须以 http:// 或 https:// 开头';setItem('mdai_host',v);refreshPage(false);return'toast://已保存';})}),col_type:'text_1'});
    d.push({title:'刷新动态分类',desc:'重新获取视频 / 帖子分类',url:$('#noLoading#').lazyRule(function(){clearItem('mdai_categories_cache_video');clearItem('mdai_categories_cache_video_time');clearItem('mdai_categories_cache_post');clearItem('mdai_categories_cache_post_time');refreshPage(false);return'toast://分类缓存已刷新';}),col_type:'text_1'});
    d.push({title:'测试接口',desc:'验证当前 Host',url:$('#noLoading#').lazyRule(function(){try{var m=$.require('mdai'),o=m.request('/api/v1/videos?categoryId=27&page=1&size=1',5000),a=m.items(o);return'toast://接口正常，返回 '+a.length+' 条';}catch(e){return'toast://接口异常：'+String(e.message||e);}}),col_type:'text_1'});
    d.push(U.line());
    d.push(U.section(c,'本地数据','历史、搜索与诊断'));
    d.push({title:'清空观看历史',url:$('#noLoading#').lazyRule(function(){setItem('mdai_watch_history_v1','[]');refreshPage(false);return'toast://观看历史已清空';}),col_type:'text_1'});
    d.push({title:'清空搜索历史',url:$('#noLoading#').lazyRule(function(){setItem('mdai_search_history_v1','[]');clearMyVar('keyword');refreshPage(false);return'toast://搜索历史已清空';}),col_type:'text_1'});
    var diag=pb.diag();d.push({title:'最近播放诊断',desc:diag?'点击查看':'暂无记录',url:diag?'toast://'+diag:'toast://暂无播放记录',col_type:'text_1'});
    d.push(U.line());
    d.push({title:'官方图标',desc:'已固化为仓库正式图标资产',img:U.design.icon,url:U.design.icon,col_type:'avatar',extra:{lineVisible:false}});
    d.push({title:'麻豆AI 2.8.0-test.1',desc:'全页 UI 重构 · 折叠片库筛选 · 原页搜索/我的切换 · 正式图标资产；Stable 2.6.3 业务基线不变。',url:'hiker://empty',col_type:'long_text'});
    setResult(d);
  }
  return{version:'2.8.0-test.1',settings:settings};
})();
