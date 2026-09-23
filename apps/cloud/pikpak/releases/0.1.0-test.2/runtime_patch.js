/* PikPak 0.1.0-test.2 Runtime identity patch */
(function(R){
    var baseModule=R.module;
    R.module=function(){
        var m=baseModule();
        m.version='0.1.0-test.2';
        m.build=10102;
        return m;
    };
    R.version='0.1.0-test.2';
    R.build=10102;
})(PikPakRemoteRuntime);