/* 色花堂 0.1.0-test.16 / Build 10116 */
var SeHuaTangPatchTest16=(function(){
var BASE=SeHuaTangRemoteRuntime;
function module(){var m=BASE.module(),oldForum=m.forum;m.version='0.1.0-test.16';m.build=10116;m.forum=function(){if(SeHuaTangV16Core.pageParam('sht_auto',''))return oldForum();return SeHuaTangV16Forum.forum(m)};m.thread=function(){return SeHuaTangV16Thread.thread(m)};m.comments=function(){return SeHuaTangV16Thread.comments(m)};m.settings=(function(old){return function(){var d=[];setPageTitle('色花堂设置');d.push(SeHuaTangV16Core.section('Test16 评论分离与信息美化','色花图片正文图提前到评论前；复制链接改评论页；作者独立行；评论数/观看量移动到卡片底部弱化显示。'));d.push({title:'打开旧设置',desc:'分类缓存 / 访问状态 / Cookie / 最近诊断',url:SeHuaTangV16Core.route('shtSettingsLegacy'),col_type:'text_1'});setResult(d)}})(m.settings);return m}
var P={version:'0.1.0-test.16',build:10116,module:module};SeHuaTangRemoteRuntime=P;return P;
})();