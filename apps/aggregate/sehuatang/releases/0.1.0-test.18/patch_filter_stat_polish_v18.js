/* 色花堂 0.1.0-test.18 / Build 10118 */
var SeHuaTangPatchTest18=(function(){
var BASE=SeHuaTangRemoteRuntime;
function module(){var m=BASE.module(),oldForum=m.forum;m.version='0.1.0-test.18';m.build=10118;m.forum=function(){if(SeHuaTangV16Core.pageParam('sht_auto',''))return oldForum();return SeHuaTangV18Forum.forum(m)};m.settings=(function(old){return function(){var d=[];setPageTitle('色花堂设置');d.push(SeHuaTangV16Core.section('Test18 筛选与统计排版修正','修正分类/排序混排、多重选中、箭头占位和统计HTML泄漏；保留手机端卡片、搜索、页内刷新翻页。'));d.push({title:'打开旧设置',desc:'访问状态 / Cookie / 最近诊断',url:SeHuaTangV16Core.route('shtSettingsLegacy'),col_type:'text_1'});setResult(d)}})(m.settings);m._debug=m._debug||{};m._debug.filtersV18=SeHuaTangV18Forum.filters;return m}
var P={version:'0.1.0-test.18',build:10118,module:module};SeHuaTangRemoteRuntime=P;return P;
})();
