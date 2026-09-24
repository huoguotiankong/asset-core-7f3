/* PikPak Test20 Build10122 - native whole-drive filename search */
(function(C,P){
    function q(obj){var a=[];for(var k in obj)if(obj[k]!==undefined&&obj[k]!==null&&String(obj[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(String(obj[k])));return a.join('&');}
    P.searchFiles=function(keyword,pageToken,limit){
        keyword=String(keyword||'').trim();if(!keyword)return {files:[],next_page_token:''};
        var filters={name:{contains:keyword},trashed:{eq:false},phase:{eq:'PHASE_TYPE_COMPLETE'}},qs=q({page_token:pageToken||'',with_audit:'true',thumbnail_size:'SIZE_LARGE',filters:JSON.stringify(filters),limit:limit||200,order:'MODIFY_TIME_DESC'});
        return C.requestDrive('GET','/drive/v1/files?'+qs,null,{});
    };
})(PikPakCore,PikPakProvider);
