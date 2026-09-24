/* 磁力君.简 Test7 - PikPak Hiker mini-app handoff compatibility patch */
(function(){
    var oldRouteMagnet=mjRouteMagnet;
    function mjCallPikPakV7(magnet){
        var candidates=["PikPak","PikPakM","PIKPAK"],found=[];
        for(var i=0;i<candidates.length;i++){
            var name=candidates[i];
            if(!mjRuleExists(name))continue;
            found.push(name);
            if(mjHasPage(name,"fxlj")){
                return "hiker://page/fxlj?rule="+encodeURIComponent(name)+"&page=fypage&realurl="+encodeURIComponent(magnet);
            }
            if(mjHasPage(name,"diaoyong")){
                return "hiker://page/diaoyong?rule="+encodeURIComponent(name)+"&page=fypage#"+magnet;
            }
        }
        if(found.length)return "toast://已检测到【"+found.join(" / ")+"】，但未发现兼容外部调用页 fxlj / diaoyong";
        return "toast://未检测到【PikPak】海阔小程序，请先安装";
    }
    mjRouteMagnet=function(magnet,mode){
        magnet=String(magnet||"").trim();mode=mode||"海阔视界";
        if(mode==="PikPak"){
            if(!magnet)return "toast://磁力链接为空";
            return mjCallPikPakV7(magnet);
        }
        return oldRouteMagnet(magnet,mode);
    };
    if($.exports)$.exports.routeMagnet=mjRouteMagnet;
})();
