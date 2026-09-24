/* PikPak Test21 Build10123 - expose Web Session recovery pages */
(function(Pages,R){
    var base=R.module;
    R.module=function(){var m=base();m.home=Pages.home;m.drive=Pages.drive;m.webLogin=Pages.webLogin;m.webDone=Pages.webDone;return m;};
})(PikPakPages,PikPakRemoteRuntime);
