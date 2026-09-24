/* PikPak Test16 Build10118 - drive management, recycle bin and My Pack destination */
(function(C,P){
    function q(obj){var a=[];for(var k in obj)if(obj[k]!==undefined&&obj[k]!==null&&String(obj[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(String(obj[k])));return a.join('&');}
    function ids(v){v=v instanceof Array?v:[v];var out=[];for(var i=0;i<v.length;i++)if(String(v[i]||''))out.push(String(v[i]));return out;}
    function ok(r){return !!r&&!r.error&&!r.error_code;}
    P.listTrash=function(pageToken,limit,order){
        var filters=JSON.stringify({trashed:{eq:true}}),qs=q({page_token:pageToken||'',with_audit:'true',thumbnail_size:'SIZE_LARGE',filters:filters,limit:limit||200,order:order||'MODIFY_TIME_DESC'});
        return C.requestDrive('GET','/drive/v1/files?'+qs,null,{});
    };
    P.untrash=function(v){return C.requestDrive('POST','/drive/v1/files:batchUntrash',{ids:ids(v)},{});};
    P.purge=function(v){return C.requestDrive('POST','/drive/v1/files:batchDelete',{ids:ids(v)},{});};
    P.emptyTrash=function(){return C.requestDrive('PATCH','/drive/v1/files/trash:empty',{},{});};
    P.move=function(v,parentId){return C.requestDrive('POST','/drive/v1/files:batchMove',{ids:ids(v),to:{parent_id:String(parentId||'')}},{});};
    P.copy=function(v,parentId){return C.requestDrive('POST','/drive/v1/files:batchCopy',{ids:ids(v),to:{parent_id:String(parentId||'')}},{});};
    P.isFolder=function(f){return String(f&&f.kind||'').indexOf('folder')>=0;};
    P.isVideo=function(f){var m=String(f&&f.mime_type||'').toLowerCase(),n=String(f&&(f.name||f.path)||'').toLowerCase();return m.indexOf('video')>=0||/\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v|ts|m2ts|rmvb|rm|3gp|mpeg|mpg)(\?|$)/i.test(n);};
    P.ensureMyPack=function(){
        var cached=C.item('my_pack_id',''),r=P.listFiles('', '',500,'NAME_ASC'),a=r&&r.files instanceof Array?r.files:[],i,f;
        if(ok(r))for(i=0;i<a.length;i++){f=a[i]||{};if(P.isFolder(f)&&String(f.name||'').toLowerCase()==='my pack'){C.set('my_pack_id',String(f.id||''));return {ok:true,id:String(f.id||''),file:f,created:false};}}
        if(cached&&ok(r)){C.clear('my_pack_id');cached='';}
        if(!ok(r))return r||{error:'MY_PACK_LIST_FAILED',error_description:'读取根目录失败'};
        r=P.createFolder('My Pack','');
        if(!ok(r))return r||{error:'MY_PACK_CREATE_FAILED',error_description:'创建 My Pack 失败'};
        f=r.file||r;var id=String(f.id||r.file_id||'');if(!id)return {error:'MY_PACK_ID_MISSING',error_description:'My Pack 已创建但未返回文件夹 ID'};
        C.set('my_pack_id',id);return {ok:true,id:id,file:f,created:true};
    };
})(PikPakCore,PikPakProvider);

