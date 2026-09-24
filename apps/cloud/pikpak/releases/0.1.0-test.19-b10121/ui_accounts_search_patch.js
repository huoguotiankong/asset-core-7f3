/* PikPak Test19 Build10121 - search/account dashboard entry points */
(function(C,UI){
    var base=UI.homeHeader;
    UI.homeHeader=function(){var d=base(),logged=C.loggedIn(),i;if(logged)d.splice(1,0,{title:'🔍 云盘搜索',url:UI.route('pikpakSearch'),col_type:'scroll_button'});for(i=0;i<d.length;i++)if(String(d[i].title||'').indexOf('👤 账号')===0)d[i].title='👥 账号';return d;};
})(PikPakCore,PikPakUI);
