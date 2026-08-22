/* JavDB v3 3.9.42-test.3 runtime scope hotfix identity patch */
(function(J){
  if(!J) throw new Error('JDB core unavailable');
  J.version='20260823-v3.9.42-test.3';
  var settings2=J.settings;
  J.settings=function(d){
    var a=[];
    settings2.call(this,a);
    for(var i=0;i<a.length;i++){
      var x=a[i]||{};
      if(typeof x.title==='string')x.title=x.title.replace('JavDB v3.9.42-test.2','JavDB v3.9.42-test.3');
      if(typeof x.desc==='string')x.desc=x.desc.replace('远程测试版 · 共用 JAV Playback SDK','远程测试版 · 运行作用域修复 · 共用 JAV Playback SDK');
      d.push(x);
    }
  };
})(JDB);
