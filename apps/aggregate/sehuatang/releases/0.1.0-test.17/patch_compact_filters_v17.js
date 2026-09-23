/* 色花堂 0.1.0-test.17 / Build 10117 */
var SeHuaTangPatchTest17=(function(){
var BASE=SeHuaTangRemoteRuntime;
function module(){var m=BASE.module(),oldForum=m.forum;m.version='0.1.0-test.17';m.build=10117;m.forum=function(){if(SeHuaTangV16Core.pageParam('sht_auto',''))return oldForum();return SeHuaTangV17Forum.forum(m)};m.settings=(function(old){return function(){var d=[];setPageTitle('色花堂设置');d.push(SeHuaTangV16Core.section('Test17 紧凑卡片与子板块筛选','缩小普通帖子卡片底部留白；动态读取每个子板块手机端的独立分类与排序，并在当前页原地刷新切换。'));d.push({title:'打开旧设置',desc:'访问状态 / Cookie / 最近诊断',url:SeHuaTangV16Core.route('shtSettingsLegacy'),col_type:'text_1'});setResult(d)}})(m.settings);m._debug=m._debug||{};m._debug.filtersV17=SeHuaTangV17Forum.filters;return m}
var P={version:'0.1.0-test.17',build:10117,module:module};SeHuaTangRemoteRuntime=P;return P;
})();