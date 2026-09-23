/* 色花堂 0.1.0-test.19 / Build 10119 */
var SeHuaTangPatchTest19=(function(){
var BASE=SeHuaTangRemoteRuntime;
function module(){var m=BASE.module(),oldForum=m.forum,oldHome=m.home;m.version='0.1.0-test.19';m.build=10119;m.home=function(){var pg=1;try{pg=Math.max(1,Number(typeof MY_PAGE==='undefined'?1:MY_PAGE||1))}catch(e){}if(pg>1){setResult([]);return}return oldHome()};m.forum=function(){if(SeHuaTangV16Core.pageParam('sht_auto',''))return oldForum();return SeHuaTangV19Forum.forum(m)};m.settings=(function(old){return function(){var d=[];setPageTitle('色花堂设置');d.push(SeHuaTangV16Core.section('Test19 首页分页与筛选交互修正','首页仅渲染第1页，杜绝滚到底部后再次追加搜索/话题/论坛分类；子板块分类与排序改成两个独立选择器，排序项不再混入分类。'));d.push({title:'打开旧设置',desc:'访问状态 / Cookie / 最近诊断',url:SeHuaTangV16Core.route('shtSettingsLegacy'),col_type:'text_1'});setResult(d)}})(m.settings);m._debug=m._debug||{};m._debug.filtersV19=SeHuaTangV19Forum.filters;return m}
var P={version:'0.1.0-test.19',build:10119,module:module};SeHuaTangRemoteRuntime=P;return P;
})();
