/* MyAv 0.1.0-test.9 - complete tag/index fallback map */
(function(C){
if(!C)throw new Error('MyAvCore missing for Test9');
C.version='0.1.0-test.9';C.build=10109;
C.indexFallbacks={
  '有码片商':'https://javlist.me/cat.py?type=rpCNLOP1WDRnR2LjHsExtQ==',
  '有码女优':'https://javlist.me/cat.py?type=0TActtgu02YfLieZ7SleLw==',
  '男优':'https://javlist.me/cat.py?type=a3oteztILfkYtQWe89XV3w==',
  '有码TAG':'https://javlist.me/cat.py?type=6Wvt3eOMji5M_tHU6HuewA==',
  '欧美片商':'https://javlist.me/western_cat.java?type=WBvfQ1QROghlcRTERGmhww==',
  '欧美女优':'https://javlist.me/western_cat.java?type=0TActtgu02YfLieZ7SleLw==',
  '欧美TAG':'https://javlist.me/western_cat.java?type=6Wvt3eOMji5M_tHU6HuewA==',
  '国产女优':'https://javlist.me/domestic_cat.py?type=0TActtgu02YfLieZ7SleLw==',
  '国产TAG':'https://javlist.me/domestic_cat.py?type=6Wvt3eOMji5M_tHU6HuewA=='
};
C.indexFallbackUrl=function(label){return C.indexFallbacks[C.s(label)]||'';};
C._test9IndexUrlExact=C.indexUrlExact;
C.indexUrlExact=function(label){var u='';try{u=C._test9IndexUrlExact?C._test9IndexUrlExact(label):'';}catch(e){}return u||C.indexFallbackUrl(label);};
C.tagIndexDefs=function(){return[
  {label:'有码片商',sec:'normal',etype:'studio'},
  {label:'有码女优',sec:'normal',etype:'actress'},
  {label:'男优',sec:'normal',etype:'actor'},
  {label:'有码TAG',sec:'normal',etype:'tag'},
  {label:'欧美片商',sec:'western',etype:'studio'},
  {label:'欧美女优',sec:'western',etype:'actress'},
  {label:'欧美TAG',sec:'western',etype:'tag'},
  {label:'国产女优',sec:'domestic',etype:'actress'},
  {label:'国产TAG',sec:'domestic',etype:'tag'}
];};
})(MyAvCore);
