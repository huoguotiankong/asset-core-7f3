/* JavDB v3 3.9.42-test.4 actor mapping / UI polish */
(function(J){
  if(!J)throw new Error('JDB core unavailable');
  J.version='20260823-v3.9.42-test.4';
  var actor3=J.actorHub,settings3=J.settings;
  J.actorHub=function(d,page){
    var tab=getMyVar('jdb3_actor42_tab','recommend'),api=this.apiSafe,tmp=[];
    this.apiSafe=function(path,params){
      if(path==='/api/v1/actors'&&params&&String(params.type)===tab&&(tab==='2'||tab==='3')){
        var p={},k;for(k in params)if(params.hasOwnProperty(k))p[k]=params[k];p.type=tab==='2'?'3':'2';return api.call(this,path,p);
      }
      return api.call(this,path,params);
    };
    try{actor3.call(this,tmp,page);}finally{this.apiSafe=api;}
    for(var i=0;i<tmp.length;i++){
      var x=tmp[i]||{};
      if(String(x.title||'').replace(/<[^>]+>/g,'').indexOf('搜索演员')>=0||String(x.desc||'')==='按姓名搜索')continue;
      d.push(x);
    }
  };
  J.settings=function(d){var a=[],i,x;settings3.call(this,a);for(i=0;i<a.length;i++){x=a[i]||{};if(typeof x.title==='string')x.title=x.title.replace('JavDB v3.9.42-test.3','JavDB v3.9.42-test.4');if(typeof x.desc==='string')x.desc=x.desc.replace('运行作用域修复 · 共用 JAV Playback SDK','演员映射修正 · 共用 JAV Playback SDK test.3');d.push(x);}};
})(JDB);
