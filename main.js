/**
 * Android 重启小助手
 * @author Suroy
 * @date 2022.1.30
 * @lastedit 2022.2.13
 * @url https://suroy.cn
 * @other
 * shell: am start -p org.autojs.autojs # 启动autojs(root)
 * 
 */

 "auto";  // 自动打开无障碍服务


 const WIDTH = Math.min(device.width, device.height);
 const HEIGHT = Math.max(device.width, device.height);
 const DEBUG_SUROY = false; // 开发调试模式
 
 // config
 const OPTS = {
     "CLICK_METHOD": device.sdkInt < 24 ? 1 : 0, // 点击方式（Android7.0+: 0, 7.0-: 1）
     "TIME_HOUR": 3, // 定时
     "TIME_MIN": 25,
     "PHONE": device.model,
     "IMEI": device.getIMEI() ? device.getIMEI() : device.getAndroidId(), // 解决Android10的获取不到Imei问题
     "BAT": device.getBattery()
 }
 

 if(!OPTS["CLICK_METHOD"] && device.sdkInt < 24)
 { // 重定义点击方法适配低于Android7方使用
     // redefine to adapt to the android 5.0+
     this.click = function (x, y) {
         return (shell("input tap " + x + " " + y, true).code === 0);
     };
 }
 
 
 setup(OPTS); // start
 // exit();
 
 
 /**
  * setup
  * @param {*} opt 
  */
 function setup(opt)
 {
     device.wakeUp();
     toast('Hello, This is Suroy!');
     console.log(device.model, device.getBattery()+"%");
    //  console.log(opt);
     var remTimes = 0;
     threads.start(function(){
         // new thread
         setInterval(function(){
             // console.log("Heart Detect");
             var myDate = new Date();
             if(myDate.getHours() == opt["TIME_HOUR"] && myDate.getMinutes() == opt["TIME_MIN"]){
                 var configs = defConfig(opt["IMEI"], opt["PHONE"]);
                 if(configs==1 || (configs == 2 && myDate.getDay() == 5) )
                     power("re", opt["CLICK_METHOD"]); // restart
                 else
                     console.info("Reboot: sleep");
             }
             // heart
             ping(opt["IMEI"], opt["PHONE"], opt["BAT"]);
             // remote
             if(remTimes++ > 5)
             {
                 remote(opt["IMEI"], opt["PHONE"]);
                 remTimes = 0;
             }
         }, 25000);
     });
 
 }
 
 
 /**
 *
 * power
 * @author Suroy
 * @description restart or shutdown
 *
 */
 function power(action, opt) {
     powerDialog();
     sleep(3000);
     if (action == "re") {
         clickMapTxt("重新启动", opt);   
         // clickMapTxt("Restart", opt);  // Meizu   
     } else if (action == "shut") {
         clickMapTxt("关机", opt);
         // clickMapTxt("Power Off", opt); // Meizu 17P
     }
 }
 
 /**
 *
 * Click the position of text
 * @author Suroy
 * @param {txt} string 欲点击文本
 * @param {types} 点击功能类型
 * 
 */
 function clickMapTxt(txt, types)
 {   
     if(types == 0)
     { // normal x-y axis | Android 7.0+ 无障碍 | Android 5.0+ Root
 
         c_x = text(txt).findOne().bounds().centerX();
         c_y = text(txt).findOne().bounds().centerY();
         console.info("Position:", c_x, c_y);
         sleep(500);
         click(c_x, c_y);
         sleep(500);
     }
     else if(types == 1)
     { // 无障碍点击 | Android 5.0+ Noroot | T: HTC One E8 Android6.0 Noroot
         var clickRes = text(txt).findOne().parent().click(); // 由父节点查询控件进行点击 | longClick
         console.info("Position:", clickRes);
         sleep(500);
     }
     return 1;
 }
 
 /**
  * 心跳检测
  * @param {int} id imei
  * @param {string} dev 设备名
  * @param {int} bat 电量
  */
 function ping(id, dev, bat){
     if(DEBUG_SUROY) console.show();
     var host = DEBUG_SUROY ? "http://192.168.123.41/debug/autoboot/" : "https://suroy.cn/";
     var api = host + "app.php?mod=ping&id=" + id + "&dev=" + dev + "&bat=" + bat;
     api = encodeURI(api);
     try {
         var r = http.get(api, {
             headers: {
                 'Accept-Language': 'zh-cn,zh;q=0.5',
                 'User-Agent': 'Mozilla/5.0 (Linux; U; Android; zh-CN; ' + dev + ' Build/PKQ1.190616.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.108 AutoBoot/13.7.4.1155 Mobile Safari/537.36            '
             }
         });
         log("ping: " + r.body.json().msg);
     } catch (e) {
         // 捕捉所有异常
         console.error(e);
     }
 
 }
 
 /**
  * 接收远程控制
  * @param {int}} id 
  * @param {string} dev 
  */
 function remote(id, dev){
     var host = DEBUG_SUROY ? "http://192.168.123.41/debug/autoboot/" : "https://suroy.cn/";
     var api = host + "app.php?mod=remote&id=" + id;
     
     try {
         var r = http.get(api, {
             headers: {
                 'Accept-Language': 'zh-cn,zh;q=0.5',
                 'User-Agent': 'Mozilla/5.0 (Linux; U; Android; zh-CN; ' + dev + ' Build/PKQ1.190616.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.108 AutoBoot/13.7.4.1155 Mobile Safari/537.36            '
             }
         });
         var cmd = r.body.json();
         if(cmd.code == 0)
         {
             switch(cmd.data.action)
             {
                 case 1:
                     power("re", OPTS["CLICK_METHOD"]); // restart
                     break;
                 case 2:
                     power("shut", OPTS["CLICK_METHOD"]); // shut
                     break;
                 case 3:
                     getRes(cmd.data.source);
                     break;
                 case 0:
                     console.info("remote command from Suroy.cn");
                     break;
             }
             log("remote:", cmd.data.description);
         }
         else{
             toastLog(cmd.msg);
         }
         // log("remote: " + JSON.stringify(cmd));
     } catch (e) {
         // 捕捉所有异常
         console.error(e);
     }
 }
 
 /**
  * 执行远程脚本
  * @param {string} url 
  */
 function getRes(url){
     // toast(engines.myEngine().cwd());
     var sfile = "/sdcard/.remote";
     try {
         var res = http.get(url);
         //判断状态码
         if(res.statusCode >= 200 && res.statusCode < 300){
             console.log("remote: start to fetch.");
             //获取文件并保存
             files.writeBytes(sfile,res.body.bytes());
             //打开文件
             // app.viewFile(sfile);
             engines.execScriptFile(sfile); // 执行脚本
             console.info('remote: run task.')
         }else if(res.statusCode == 404){
             toast("页面没找到哦...");
         }else{
             toast("未知错误");
         }
     } catch (e) {
         console.error(e)
     }    
 }
 
 
 /**
  * 默认重启时间设置监测
  * @param {int} id 
  * @param {string} dev 
  * @returns {int} 0,关；1，开；2，开(默认APP周五)；
  */
 function defConfig(id, dev){
     var host = DEBUG_SUROY ? "http://192.168.123.41/debug/autoboot/" : "https://suroy.cn/";
     var api = host + "app.php?mod=remote&id=" + id;
     
     try {
         var r = http.get(api, {
             headers: {
                 'Accept-Language': 'zh-cn,zh;q=0.5',
                 'User-Agent': 'Mozilla/5.0 (Linux; U; Android; zh-CN; ' + dev + ' Build/PKQ1.190616.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.108 AutoBoot/13.7.4.1155 Mobile Safari/537.36            '
             }
         });
         var cmd = r.body.json();
         if(cmd.code == 0)
         {
             
             if(cmd.data.config)
             {
                 console.warn("config: default");
                 return 1; // 维持默认设置
             }
         }
         else{
             toastLog(cmd.msg);
         }
         // log("remote: " + JSON.stringify(cmd));
     } catch (e) {
         // 捕捉所有异常
         console.error(e);
         return 2; // 网络错误，维持本地设置
     }
     return 0;
 }
 