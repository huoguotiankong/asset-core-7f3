/* PikPak 0.1.0-test.5 Provider Patch - temporary playback files move to recycle bin */
(function(C,P){
    P.cleanupTemps=function(force){
        if(!C.loggedIn())return {moved:0,kept:0,error:'请先登录 PikPak'};
        var a=C.readJsonItem('temp_files',[]);
        if(!(a instanceof Array)||!a.length)return {moved:0,kept:0};
        var now=new Date().getTime(),del=[],keep=[],i;
        for(i=0;i<a.length;i++){
            if(del.length<10&&(force||now-Number(a[i].ts||0)>900000))del.push(String(a[i].id));
            else keep.push(a[i]);
        }
        if(del.length){
            var r=P.trash(del);
            if(r&&(r.error||r.error_code)){
                for(i=0;i<a.length;i++)if(del.indexOf(String(a[i].id))>=0)keep.push(a[i]);
                C.writeJsonItem('temp_files',keep);
                return {moved:0,kept:keep.length,error:C.errorText(r)};
            }
        }
        C.writeJsonItem('temp_files',keep);
        return {moved:del.length,kept:keep.length};
    };
})(PikPakCore,PikPakProvider);
