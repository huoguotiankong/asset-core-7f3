/* ACFun 0.5.0-test.2 private-storage rescue preflight */
(function(){
var DROP=[
'acfun_frontend_discovery','acfun_remote_config','acfun_last_success_body','acfun_last_attempts','acfun_last_probe_error',
'hc_acfun_last_check','hc_acfun_last_result','acfun_core_src_v018','acfun_core_src_v019','acfun_remote_bundle_src'
];
for(var i=0;i<DROP.length;i++)try{clearItem(DROP[i]);}catch(e){}
function compact(key,maxItems,maxBytes){
  var s='';try{s=String(getItem(key,'')||'');}catch(e0){return;}
  if(!s||s.length<220000)return;
  try{writeFile('hiker://files/rules/asset-core-local/acfun-user/legacy_'+key+'_backup.json',s);}catch(e1){}
  var a=null;try{a=JSON.parse(s);}catch(e2){}
  if(!Array.isArray(a))return;
  var out=[];
  for(var j=0;j<a.length&&out.length<maxItems;j++){
    var x=a[j]||{},o={
      id:String(x.id||''),title:String(x.title||'').slice(0,180),img:String(x.img||'').slice(0,1200),
      uri:String(x.uri||'').slice(0,1600),time:Number(x.time||0)
    };
    var d=x.data;
    if(d!==undefined&&d!==null){d=typeof d==='string'?d:JSON.stringify(d);if(d.length<=12000)o.data=d;}
    out.push(o);
  }
  var txt=JSON.stringify(out);
  while(txt.length>maxBytes&&out.length>1){out.pop();txt=JSON.stringify(out);}
  try{clearItem(key);}catch(e3){}
  try{setItem(key,txt);}catch(e4){try{writeFile('hiker://files/rules/asset-core-local/acfun-user/'+key+'.json',txt);}catch(e5){}}
}
compact('acfun_favs',120,140000);
compact('acfun_hist',80,100000);
})();
