/* MDAI content pages 2.8.0-test.3 hotfix loader */
var MDAIContentPagesV280=(function(){
  var PIN='ac766b71cfaad37e14647aca5483f3d61276f142';
  var URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+PIN+'/apps/video/mdai/releases/2.8.0-test.1/pages_content.js';
  var src=String(fetch(URL,{timeout:10000,headers:{'Cache-Control':'no-cache'}})||'');
  if(!src)throw new Error('麻豆AI 2.8 ContentPages 基线加载为空');
  var bad="d.push(U.line());d.push(U.section(c,'内容结果',selected?catLabel(c,selected):(menuName(menu)+' · 全部'));";
  var good="d.push(U.line());d.push(U.section(c,'内容结果',selected?catLabel(c,selected):(menuName(menu)+' · 全部')));";
  if(src.indexOf(bad)<0)throw new Error('麻豆AI 2.8 ContentPages 热修复锚点不存在');
  src=src.replace(bad,good).replace("return{version:'2.8.0-test.1'","return{version:'2.8.0-test.3'");
  eval(src);
  if(typeof MDAIContentPagesV280!=='object')throw new Error('麻豆AI 2.8 ContentPages 热修复加载失败');
  return MDAIContentPagesV280;
})();
