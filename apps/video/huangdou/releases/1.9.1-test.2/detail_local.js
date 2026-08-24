/* 黄豆短剧 1.9.1-test.2 - flattened local Detail loader */
var HuangDouDetailV190=(function(){
  function packageData(){var s=JSON.parse(String(readFile('__hclocal_huangdou-test_state.json',0)||'{}')),c=s.current||{};if(!c.packageFile)throw new Error('黄豆本地运行包状态缺失');var p=JSON.parse(String(readFile(String(c.packageFile),0)||'{}'));if(!p||!Array.isArray(p.files))throw new Error('黄豆本地运行包描述缺失');return p;}
  function asset(name){var p=packageData();for(var i=0;i<p.files.length;i++)if(String(p.files[i].name||'')===String(name)){var t=String(readFile(String(p.files[i].file),0)||'');if(!t)throw new Error('黄豆本地资产为空: '+name);return t;}throw new Error('黄豆本地资产不存在: '+name);}
  var src=asset('detail-base');
  var pairs=[
    ["('🔒 第 '+target+' 集 · 付费/解锁')","('【锁】第 '+target+' 集 · 付费/解锁')"],
    ["'（点击切换） · 🔒 为官网付费/需授权内容'","'（点击切换） · 【锁】为官网付费/需授权内容'"],
    ["var current=last===ep.no,label='第'+ep.no+'集'+(ep.locked?' 🔒':'');","var current=last===ep.no,label=ep.locked?('【锁】第'+ep.no+'集'):('第'+ep.no+'集');"],
    ["return{version:'1.9.0-test.5'","return{version:'1.9.1-test.2'"]
  ];
  for(var i=0;i<pairs.length;i++){if(src.indexOf(pairs[i][0])<0)throw new Error('黄豆本地详情热修复锚点 '+(i+1)+' 不存在');src=src.replace(pairs[i][0],pairs[i][1]);}
  eval(src);
  if(typeof HuangDouDetailV190!=='object')throw new Error('黄豆本地详情模块加载失败');
  return HuangDouDetailV190;
})();
