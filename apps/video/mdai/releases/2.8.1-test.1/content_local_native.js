/* 麻豆AI 2.8.1-test.1 - Local-First ContentPages bridge */
var MDAIContentPagesV280=(function(){
  var ASSET='hiker://files/rules/asset-core-local/mdai-test/assets/content_test1.js';
  var src=String(fetch(ASSET)||'');
  if(src.indexOf('var MDAIContentPagesV280')<0)throw new Error('麻豆AI本地 ContentPages 基线格式错误');
  var bad="d.push(U.line());d.push(U.section(c,'内容结果',selected?catLabel(c,selected):(menuName(menu)+' · 全部'));";
  var good="d.push(U.line());d.push(U.section(c,'内容结果',selected?catLabel(c,selected):(menuName(menu)+' · 全部')));";
  if(src.indexOf(bad)<0)throw new Error('麻豆AI本地 ContentPages 热修复锚点不存在');
  src=src.replace(bad,good).replace("return{version:'2.8.0-test.1'","return{version:'2.8.1-test.1'");
  eval(src);
  if(typeof MDAIContentPagesV280!=='object')throw new Error('麻豆AI本地 ContentPages 加载失败');
  return MDAIContentPagesV280;
})();
