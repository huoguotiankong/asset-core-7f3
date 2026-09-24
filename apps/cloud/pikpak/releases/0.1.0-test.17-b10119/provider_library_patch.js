/* PikPak Test17 Build10119 - trash root fix, starred files and global library queries */
(function(C,P){
    function q(obj){var a=[];for(var k in obj)if(obj[k]!==undefined&&obj[k]!==null)a.push(encodeURIComponent(k)+'='+encodeURIComponent(String(obj[k])));return a.join('&');}
    function norm(v){v=v instanceof Array?v:[v];var out=[];for(var i=0;i<v.length;i++)if(String(v[i]||''))out.push(String(v[i]));return out;}
    function listByFilter(filters,pageToken,limit,order){
        var qs=q({parent_id:'*',page_token:pageToken||'',with_audit:'true',thumbnail_size:'SIZE_LARGE',filters:JSON.stringify(filters||{}),limit:limit||200,order:order||'MODIFY_TIME_DESC'});
        return C.requestDrive('GET','/drive/v1/files?'+qs,null,{});
    }
    /* PikPak requires the special parent_id=* scope for cross-folder trash results. */
    P.listTrash=function(pageToken,limit,order){return listByFilter({trashed:{eq:true}},pageToken,limit,order||'MODIFY_TIME_DESC');};
    P.listAll=function(pageToken,limit,order){return listByFilter({phase:{eq:'PHASE_TYPE_COMPLETE'},trashed:{eq:false}},pageToken,limit,order||'MODIFY_TIME_DESC');};
    P.listStarred=function(pageToken,limit,order){return listByFilter({phase:{eq:'PHASE_TYPE_COMPLETE'},trashed:{eq:false},system_tag:{in:'STAR'}},pageToken,limit,order||'MODIFY_TIME_DESC');};
    P.star=function(v){return C.requestDrive('POST','/drive/v1/files:star',{ids:norm(v)},{});};
    P.unstar=function(v){return C.requestDrive('POST','/drive/v1/files:unstar',{ids:norm(v)},{});};
    P.isStarred=function(f){if(!f)return false;if(f.starred===true)return true;var x=f.system_tag||f.system_tags||f.tags||[];if(typeof x==='string')return /(^|[,\s])STAR($|[,\s])/i.test(x);if(x instanceof Array)for(var i=0;i<x.length;i++)if(String(x[i]).toUpperCase()==='STAR')return true;return false;};
})(PikPakCore,PikPakProvider);

