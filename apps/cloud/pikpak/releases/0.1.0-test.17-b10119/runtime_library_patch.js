/* PikPak Test17 Build10119 - favorites, recent, details and global search */
(function(C,P,UI,Pages,R){
    var baseModule=R.module;
    function fail(r,msg){return 'toast://'+(C.errorText(r)||msg||'操作失败');}
    function fileUrl(f){if(P.isFolder(f))return UI.route('pikpakDrive',{parent_id:f.id||'',name:f.name||'文件夹'});return $("#noLoading#").lazyRule(function(x){return $.require('pikpak').playPersonal(x.id,x.mime,false);},{id:String(f.id||''),mime:String(f.mime_type||'')});}
    R.module=function(){
        var m=baseModule();
        m.starred=Pages.starred;m.recent=Pages.recent;m.fileDetail=Pages.fileDetail;
        m.openMyPack=function(){showLoading('正在定位 My Pack…');var r=P.ensureMyPack();hideLoading();if(!r||r.error||r.error_code)return fail(r,'无法定位 My Pack');return UI.route('pikpakDrive',{parent_id:r.id||'',name:'My Pack'});};
        m.openFileDetail=function(id,name){return UI.route('pikpakFileDetail',{id:String(id||''),name:String(name||'文件详情')});};
        m.starAction=function(id){var r=P.star([id]);if(!r||r.error||r.error_code)return fail(r,'加入星标失败');toast('已加入星标');refreshPage();return 'hiker://empty';};
        m.unstarAction=function(id){var r=P.unstar([id]);if(!r||r.error||r.error_code)return fail(r,'取消星标失败');toast('已取消星标');refreshPage();return 'hiker://empty';};
        m.setDriveFilterAction=function(v){var x={'全部':'all','仅视频':'video','仅文件夹':'folder'};C.set('drive_filter',x[String(v)]||'all');toast('目录筛选已更新');refreshPage();return 'hiker://empty';};
        m.setSortAction=function(v){var x={'名称':'name_asc','名称正序':'name_asc','名称倒序':'name_desc','最近修改':'time_desc','文件大小':'size_desc'};C.set('sort',x[String(v)]||'name_asc');toast('文件排序已更新');refreshPage();return 'hiker://empty';};
        m.search=function(){var kw=String(getParam('kw','')||'').trim(),d=[];if(!kw){setResult([UI.empty('请输入搜索关键词')]);return;}var sh=P.parseShareInput(kw),mag=/magnet:\?xt=urn:btih:/i.test(kw);if(sh||mag||/^https?:\/\//i.test(kw)){d.push({title:'打开输入内容',desc:kw,url:m.openInput(kw),col_type:'text_1'});setResult(d);return;}if(!C.loggedIn()){setResult([UI.error('搜索个人网盘前请先登录 PikPak')]);return;}var r=P.listAll('',500,'MODIFY_TIME_DESC');if(!r||r.error||r.error_code){setResult([UI.error(C.errorText(r))]);return;}var a=r.files instanceof Array?r.files:[],needle=kw.toLowerCase();for(var i=0;i<a.length;i++){var f=a[i];if(String(f.name||'').toLowerCase().indexOf(needle)<0)continue;d.push(UI.fileCard(f,fileUrl(f)));}if(!d.length)d.push(UI.empty('全盘前 500 个项目中没有匹配“'+kw+'”的内容'));setResult(d);};
        return m;
    };
})(PikPakCore,PikPakProvider,PikPakUI,PikPakPages,PikPakRemoteRuntime);

