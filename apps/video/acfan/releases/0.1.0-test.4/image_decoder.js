/* ACFAN Test4 isolated image decoder - proven XOR contract */
var ACFANImageDecoderT4={
  image:function(cacheAbsPath){
    var FileUtil=com.example.hikerview.utils.FileUtil,data=FileUtil.toBytes(input);
    if(!data||data.length<4)return FileUtil.toInputStream(data);
    function u(i){return data[i]&255;}
    function known(){
      if(data.length>2&&u(0)===255&&u(1)===216&&u(2)===255)return true;
      if(data.length>7&&u(0)===137&&u(1)===80&&u(2)===78&&u(3)===71&&u(4)===13&&u(5)===10&&u(6)===26&&u(7)===10)return true;
      if(data.length>2&&u(0)===71&&u(1)===73&&u(2)===70)return true;
      if(data.length>11&&u(0)===82&&u(1)===73&&u(2)===70&&u(3)===70&&u(8)===87&&u(9)===69&&u(10)===66&&u(11)===80)return true;
      return false;
    }
    var valid=known();
    if(!valid){var key='2020-zq3-888'.split('').map(function(c){return c.charCodeAt(0);}),limit=Math.min(100,data.length);for(var i=0;i<limit;i++)data[i]=data[i]^key[i%key.length];valid=known();}
    if(valid&&cacheAbsPath){try{var p=String(cacheAbsPath);if(p.indexOf('file://')===0)p=p.replace(/^file:\/\/+/,'/');var f=new java.io.File(p),parent=f.getParentFile();if(parent&&!parent.exists())parent.mkdirs();var tmp=new java.io.File(p+'.tmp.'+java.lang.Thread.currentThread().getId()),out=new java.io.FileOutputStream(tmp);out.write(data);out.flush();out.close();if(!f.exists())tmp.renameTo(f);if(tmp.exists())tmp.delete();}catch(e){}}
    return FileUtil.toInputStream(data);
  }
};
$.exports=ACFANImageDecoderT4;
