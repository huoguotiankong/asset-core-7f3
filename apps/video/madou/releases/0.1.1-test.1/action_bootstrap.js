/* 麻豆传媒 0.1.1-test.1 - local action bootstrap */
var MadouBoot={
  version:'0.1.1-test.1-local-action',
  loadOnly:function(){
    var name='__hclocal22_madou-test_b10201.json',p=null;
    try{p=JSON.parse(String(readFile(name,0)||'{}'));}catch(e){p=null;}
    if(!p||Number(p.build||0)!==10201||String(p.manager||'')!=='2.2.0'||String(p.execution||'')!=='native-require-file'||!Array.isArray(p.files)||!p.files.length)throw new Error('麻豆传媒本地 Action package 不可用');
    for(var i=0;i<p.files.length;i++){
      var f=p.files[i]||{};
      if(!f.file||!fileExist(String(f.file)))throw new Error('麻豆传媒本地 Action 模块缺失：'+String(f.name||i));
      require(getPath(String(f.file)));
    }
    if(typeof MadouRemoteRuntime==='undefined'||String(MadouRemoteRuntime.version)!=='0.1.1-test.1'||Number(MadouRemoteRuntime.build)!==10201)throw new Error('麻豆传媒本地 Action Runtime 校验失败');
    return{ok:true,release:{id:'madou-test',version:'0.1.1-test.1',build:10201},local:true};
  },
  module:function(){this.loadOnly();return MadouRemoteRuntime.module();}
};
