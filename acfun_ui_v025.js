// ACFun v0.2.5 DNS probe / custom DNS patch
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.2.5';

ac.__imageDnsChoices=[
    {name:'系统 DNS',value:''},
    {name:'阿里 DoH',value:'https://dns.alidns.com/dns-query'},
    {name:'腾讯 DoH',value:'https://doh.pub/dns-query'},
    {name:'Google DoH',value:'https://dns.google/dns-query'}
];

ac.__parseFetchStatus=function(s){
    try{var j=JSON.parse(String(s||''));return {status:Number(j.statusCode||0),headers:j.headers||{},body:j.body||''};}catch(e){return {status:0,headers:{},body:String(s||'')};}
};

ac.__probeImageDns=function(url){
    url=String(url||'').trim();
    var out=[];
    if(!url)return out;
    var hs=ac.__imageHeaders?ac.__imageHeaders():{Referer:'https://acapp.sexbar.site/'};
    ac.__imageDnsChoices.forEach(function(it){
        var opt={headers:hs,withStatusCode:true,onlyHeaders:true,timeout:5000,redirect:true};
        if(it.value)opt.dns=it.value;
        try{
            var raw=fetch(url,opt),r=ac.__parseFetchStatus(raw),ct='';
            try{var h=r.headers||{};ct=((h['Content-Type']||h['content-type']||[])[0]||'');}catch(e0){}
            out.push({name:it.name,dns:it.value,status:r.status,contentType:String(ct||''),error:''});
        }catch(e){out.push({name:it.name,dns:it.value,status:-1,contentType:'',error:String(e.message||e)});}
    });
    setItem('acfun_image_dns_probe',JSON.stringify(out));
    var good='';
    for(var i=0;i<out.length;i++){
        if(out[i].status>=200&&out[i].status<400){good=out[i].dns||'system';break;}
    }
    if(good)setItem('acfun_image_dns_good',good);
    return out;
};

ac.__formatDnsProbe=function(arr){
    arr=Array.isArray(arr)?arr:[];
    if(!arr.length)return '尚未运行 DNS 探测';
    return arr.map(function(x){return x.name+' -> HTTP '+x.status+(x.contentType?('  '+x.contentType):'')+(x.error?('  '+x.error):'');}).join('\n');
};

ac.__applySavedDns=function(){
    if(ac.__dnsApplied)return;
    if(getItem('acfun_image_dns_enabled','0')!=='1')return;
    var dns=String(getItem('acfun_image_dns','')||'');
    if(!dns||dns==='system')return;
    try{
        var m={};m['.asigoo.com']=dns;registerDNS(m);ac.__dnsApplied=true;
    }catch(e){setItem('acfun_image_dns_apply_error',String(e.message||e));}
};

// 在生成图片 URL 前应用已授权的全局 DNS。仅首次执行一次。
var __v025Image=ac.image;
ac.image=function(u){ac.__applySavedDns();return __v025Image.call(ac,u);};

// 设置页增加 DNS 状态与操作入口。
var __v025Settings=ac.settings;
ac.settings=function(){
    var oldSetResult=setResult,captured=null;
    try{setResult=function(x){captured=x;};__v025Settings.apply(ac,arguments);}finally{setResult=oldSetResult;}
    var d=Array.isArray(captured)?captured:[];
    var enabled=getItem('acfun_image_dns_enabled','0')==='1',dns=getItem('acfun_image_dns','');
    d.unshift({title:'图片 DNS：'+(enabled?(dns||'已启用'):'未启用'),desc:'随机 CDN 子域名可能无法被系统 DNS 正确解析。建议先到“接口诊断”运行 DNS 探测，再启用探测成功的 DoH。',col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'ACFun 图片/DNS诊断'}});
    oldSetResult(d);
};

ac.diag=function(){
    var d=[];setPageTitle('ACFun 图片 / DNS 诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=getItem('acfun_last_cover_plain','')||((ac.__imageBase&&raw)?ac.__imageBase(raw):''),final=getItem('acfun_last_cover_resolved','')||((ac.image&&raw)?ac.image(raw):'');
    var probe=[];try{probe=JSON.parse(getItem('acfun_image_dns_probe','[]'))||[];}catch(e){}
    var good=getItem('acfun_image_dns_good',''),enabled=getItem('acfun_image_dns_enabled','0')==='1',saved=getItem('acfun_image_dns','');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')+'\nDNS启用：'+(enabled?'YES':'NO')+'\n当前DNS：'+(saved||'系统')));
    d.push(ac.diagBlock('封面地址','CoverRaw='+raw+'\n\nPlain='+plain+'\n\nFinal='+final+'\n\nImgDomain='+getItem('acfun_img_domain','')));
    d.push(ac.diagBlock('DNS 探测结果',ac.__formatDnsProbe(probe)));
    d.push({title:'运行 DNS 探测',desc:'分别用系统 DNS、阿里 DoH、腾讯 DoH、Google DoH 请求当前封面，只取响应头，不下载整张图片。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('正在探测图片 DNS…');try{var s=getItem('acfun_core_src_v018','');if(s)eval(s);var raw=getItem('acfun_last_cover_raw',''),plain=getItem('acfun_last_cover_plain','')||(ac.__imageBase?ac.__imageBase(raw):'');var a=ac.__probeImageDns(plain);hideLoading();refreshPage(false);return 'toast://DNS 探测完成';}catch(e){hideLoading();return 'toast://探测失败：'+(e.message||e);}})});
    d.push({title:'启用探测成功的 DNS',desc:good?('当前推荐：'+good+'。首次 registerDNS 海阔可能弹出授权，请允许。'):'请先运行 DNS 探测，至少有一种方式 HTTP 成功后再启用。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var g=getItem('acfun_image_dns_good','');if(!g)return 'toast://请先运行 DNS 探测';if(g==='system'){setItem('acfun_image_dns_enabled','0');clearItem('acfun_image_dns');refreshPage(false);return 'toast://系统 DNS 已经可用，无需注册';}try{var m={};m['.asigoo.com']=g;registerDNS(m);setItem('acfun_image_dns',g);setItem('acfun_image_dns_enabled','1');clearItem('acfun_image_dns_apply_error');refreshPage(false);return 'toast://已注册图片 DNS，请返回首页刷新';}catch(e){return 'toast://注册失败：'+(e.message||e);}})});
    d.push({title:'关闭自定义 DNS',desc:'恢复海阔系统 DNS。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_image_dns_enabled','0');clearItem('acfun_image_dns');return 'toast://已关闭；若本次会话已注册，重启海阔后完全恢复系统DNS';})});
    var ae=getItem('acfun_image_dns_apply_error','');if(ae)d.push(ac.diagBlock('DNS应用异常',ae));
    d.push(ac.diagBlock('候选图片字段',getItem('acfun_last_cover_candidates','')||'尚未采集'));
    d.push({title:'复制 DNS 诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nCover='+getItem('acfun_last_cover_plain','')+'\nDNSProbe='+getItem('acfun_image_dns_probe','')+'\nDNSGood='+getItem('acfun_image_dns_good','')+'\nDNSEnabled='+getItem('acfun_image_dns_enabled','0')+'\nDNSApplyErr='+getItem('acfun_image_dns_apply_error','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};
})();