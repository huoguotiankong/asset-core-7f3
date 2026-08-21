/* hiker-cloud Diagnostics v1.0.0
 * 只采集本地状态/调用方提供的信息；默认不主动联网，避免诊断本身制造新故障。
 */
var HikerDiagnostics=(function(){
  var VERSION='1.0.0';
  function str(v){return v===undefined||v===null?'':String(v);}
  function safe(fn,fallback){try{return fn();}catch(e){return fallback;}}
  function now(){return new Date().getTime();}
  function clone(x){try{return JSON.parse(JSON.stringify(x));}catch(e){return x;}}
  function errorText(e){if(!e)return'';return str(e.message||e);}

  function collect(opts){
    opts=opts||{};
    var out={
      diagnosticsVersion:VERSION,
      time:now(),
      appId:str(opts.appId),
      stage:str(opts.stage),
      shellVersion:str(opts.shellVersion),
      coreVersion:str(opts.coreVersion),
      coreBuild:opts.coreBuild===undefined?'':opts.coreBuild,
      managerVersion:'',
      activeVersion:'',
      activeBuild:'',
      previousVersion:'',
      previousBuild:'',
      cache:clone(opts.cache||{}),
      network:clone(opts.network||{}),
      extra:clone(opts.extra||{}),
      error:errorText(opts.error)
    };
    var manager=opts.manager;
    var remoteConfig=opts.remoteConfig;
    if(manager&&typeof manager.info==='function'&&remoteConfig){
      var info=safe(function(){return manager.info(remoteConfig);},null);
      if(info){
        out.managerVersion=str(info.managerVersion||manager.version);
        if(info.current){out.activeVersion=str(info.current.version);out.activeBuild=info.current.build;}
        if(info.previous){out.previousVersion=str(info.previous.version);out.previousBuild=info.previous.build;}
        if(info.lastFallbackError)out.extra.lastFallbackError=str(info.lastFallbackError);
      }
    }else if(manager){
      out.managerVersion=str(manager.version||opts.managerVersion);
    }else{
      out.managerVersion=str(opts.managerVersion);
    }
    return out;
  }

  function lines(report){
    report=report||{};
    var a=[];
    function add(k,v){if(v!==''&&v!==undefined&&v!==null)a.push(k+': '+v);}
    add('App',report.appId);add('Stage',report.stage);add('Shell',report.shellVersion);
    add('Core',report.coreVersion);add('Core build',report.coreBuild);add('Manager',report.managerVersion);
    add('Active',report.activeVersion+(report.activeBuild!==''?' / '+report.activeBuild:''));
    add('Previous',report.previousVersion+(report.previousBuild!==''?' / '+report.previousBuild:''));
    add('Error',report.error);
    if(report.cache&&typeof report.cache==='object')Object.keys(report.cache).forEach(function(k){add('Cache.'+k,report.cache[k]);});
    if(report.network&&typeof report.network==='object')Object.keys(report.network).forEach(function(k){add('Net.'+k,report.network[k]);});
    if(report.extra&&typeof report.extra==='object')Object.keys(report.extra).forEach(function(k){add('Extra.'+k,report.extra[k]);});
    return a;
  }

  function text(report){return lines(report).join('\n');}

  function errorItems(title,report){
    var out=[];
    out.push({title:title||'运行异常',desc:'以下信息可直接截图用于定位，不包含密码、Cookie、Token。',col_type:'text_1',url:'hiker://empty'});
    lines(report).forEach(function(x){out.push({title:x,col_type:'text_1',url:'hiker://empty'});});
    return out;
  }

  function capture(stage,error,opts){opts=opts||{};opts.stage=stage;opts.error=error;return collect(opts);}

  return{version:VERSION,collect:collect,capture:capture,lines:lines,text:text,errorItems:errorItems};
})();
