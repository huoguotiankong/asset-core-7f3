/* PikPak Test27 Build10129 - compact recently-played entry without changing native file cards. */
(function(UI){
    var original=UI.homeHeader;
    UI.homeHeader=function(){
        var a=original(),at=-1;
        for(var i=0;i<a.length;i++)if(String(a[i]&&a[i].title||'')==='最近'){at=i;break;}
        var entry={title:'▶ 最近播放',col_type:'flex_button',url:UI.route('pikpakPlayHistory'),extra:{lineVisible:false}};
        if(at>=0)a.splice(at,0,entry);else a.push(entry);
        return a;
    };
})(PikPakUI);
