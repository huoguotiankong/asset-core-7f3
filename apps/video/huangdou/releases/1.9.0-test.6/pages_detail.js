/* HuangDou detail 1.9.0-test.6 paid-lock compatibility loader */
var HuangDouDetailV190=(function(){
  var PIN='ac766b71cfaad37e14647aca5483f3d61276f142';
  var URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+PIN+'/apps/video/huangdou/releases/1.9.0-test.5/pages_detail.js';
  var src=String(fetch(URL,{timeout:10000,headers:{'Cache-Control':'no-cache'}})||'');
  if(!src)throw new Error('黄豆短剧 Test5 Detail 基线加载为空');
  var pairs=[
    ["('🔒 第 '+target+' 集 · 付费/解锁')","('【锁】第 '+target+' 集 · 付费/解锁')"],
    ["'（点击切换） · 🔒 为官网付费/需授权内容'","'（点击切换） · 【锁】为官网付费/需授权内容'"],
    ["var current=last===ep.no,label='第'+ep.no+'集'+(ep.locked?' 🔒':'');","var current=last===ep.no,label=ep.locked?('【锁】第'+ep.no+'集'):('第'+ep.no+'集');"],
    ["return{version:'1.9.0-test.5'","return{version:'1.9.0-test.6'"]
  ];
  for(var i=0;i<pairs.length;i++){
    if(src.indexOf(pairs[i][0])<0)throw new Error('黄豆短剧锁标识热修复锚点 '+(i+1)+' 不存在');
    src=src.replace(pairs[i][0],pairs[i][1]);
  }
  eval(src);
  if(typeof HuangDouDetailV190!=='object')throw new Error('黄豆短剧锁标识热修复加载失败');
  return HuangDouDetailV190;
})();
