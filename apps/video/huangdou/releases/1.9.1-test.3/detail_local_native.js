/* 黄豆短剧 1.9.1-test.3 - Local-First native Detail bridge */
var HuangDouDetailV190=(function(){
  var ASSET='hiker://files/rules/asset-core-local/huangdou-test/assets/detail_test5.js';
  var src=String(fetch(ASSET)||'');
  if(src.indexOf('var HuangDouDetailV190')<0)throw new Error('黄豆本地 Detail 基线格式错误');
  var pairs=[
    ["('🔒 第 '+target+' 集 · 付费/解锁')","('【锁】第 '+target+' 集 · 付费/解锁')"],
    ["'（点击切换） · 🔒 为官网付费/需授权内容'","'（点击切换） · 【锁】为官网付费/需授权内容'"],
    ["var current=last===ep.no,label='第'+ep.no+'集'+(ep.locked?' 🔒':'');","var current=last===ep.no,label=ep.locked?('【锁】第'+ep.no+'集'):('第'+ep.no+'集');"],
    ["return{version:'1.9.0-test.5'","return{version:'1.9.1-test.3'"],
    ["d.push({title:'版本 1.9.0-test.5'","d.push({title:'版本 1.9.1-test.3'"]
  ];
  for(var i=0;i<pairs.length;i++){if(src.indexOf(pairs[i][0])<0)throw new Error('黄豆本地 Detail 热修复锚点 '+(i+1)+' 不存在');src=src.replace(pairs[i][0],pairs[i][1]);}
  eval(src);
  if(typeof HuangDouDetailV190!=='object')throw new Error('黄豆本地 Detail 模块加载失败');
  return HuangDouDetailV190;
})();
