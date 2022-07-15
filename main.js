/**
 * Android 重启小助手
 * @author Suroy
 * @date 2022.1.30
 * @lastedit 2022.7.13
 * @url https://suroy.cn
 * @other
 * shell: am start -p org.autojs.autojs # 启动autojs(root)
 * 
 */

 "auto";  // 自动打开无障碍服务
 bootloader(); //开机自启动
    
 const WIDTH = Math.min(device.width, device.height);
 const HEIGHT = Math.max(device.width, device.height);
 const DEBUG_SUROY = false; // 开发调试模式
 var myServer = require('server.js'); //导入服务器模块
 var times_running = 0; //记录脚本运行状态

 // config
 const OPTS = {
     "CLICK_METHOD": device.sdkInt < 24 ? 1 : 0, // 点击方式（Android7.0+: 0, 7.0-: 1）
     "TIME_HOUR": 3, // 定时
     "TIME_MIN": 25,
     "PHONE": device.model,
     "IMEI": device.release < 10 ? device.getIMEI() : device.getAndroidId(), // 解决Android10的获取不到Imei问题
     "BAT": device.getBattery()
 }

 if(!OPTS["CLICK_METHOD"] && device.sdkInt < 24)
 { // 重定义点击方法适配低于Android7方使用
     // redefine to adapt to the android 5.0+
     this.click = function (x, y) {
         return (shell("input tap " + x + " " + y, true).code === 0);
     };
 }
 

 // 按键屏蔽 ｜ 防止意外重载
events.setKeyInterceptionEnabled("back", true);
events.observeKey();
events.onKeyDown("back", function(event){ //返回键
    log("[key_down]: back");
});



 loadAssist(); //自动启动辅助功能
 if(!checkRunState())
 {
    myServer.run(true); //todo("publishing delete")
    setup(OPTS); // start
    // exit();
 }
 
 
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
         }, 1000); //todo("25000")
     });
 
 }
 
 /**
  * 重复运行监测（有bug）
  * 重复运行则返回true
  * @returns bool
  */
 function checkRunState() {
    my_path = engines.myEngine().getSource();
    engines.all().forEach(e => {
        path = e.getSource();
        if(path == my_path) times_running++; //递增重复运行标志
    });
    console.info("[running]: ", times_running);
    if(times_running > 1) return true;
    else return false;
 }

 /**
  * 无Root通过ADB永久自动开起无障碍
  * @returns 
  */
 function loadAssist() {
    importClass(android.content.Context);
    importClass(android.provider.Settings);
    try {
        var enabledServices = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        log('当前已启用的辅助服务\n', enabledServices);
        //应用包名cn.suroy.autoboot
        var Services = enabledServices + ":cn.suroy.autoboot/com.stardust.autojs.core.accessibility.AccessibilityService";
        Settings.Secure.putString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES, Services);
        Settings.Secure.putString(context.getContentResolver(), Settings.Secure.ACCESSIBILITY_ENABLED, '1');
        toastLog("成功开启Autoboot的辅助服务");
    } catch (error) {
        //授权方法：开启usb调试并使用adb工具连接手机，执行 adb shell pm grant org.autojs.autojspro android.permission.WRITE_SECURE_SETTING
        toastLog("\n请确保已给予 WRITE_SECURE_SETTINGS 权限\n\n授权代码已复制，请使用adb工具连接手机执行(重启不失效)\n\n", error);
        setClip("adb shell pm grant org.autojs.autojspro android.permission.WRITE_SECURE_SETTINGS");
    }
    return true;
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
     var host = getApi(DEBUG_SUROY); //改为自己的接口地址
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
     var host = getApi(DEBUG_SUROY);
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
                 case 4: //唤醒进程
                     try {
                        appName = cmd.data.appname;
                     } catch (error) {
                        appName = "com.termux";
                     }
                     wakeApp(appName);
                     break;
                 case 5: //启动服务器
                    myServer.run(true);
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
     var host = getApi(DEBUG_SUROY);
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


 /**
  * API接口定义
  * @param {bool} mode
  * @note 通常模式True为调试模式
  * @return string
  */
 function getApi(mode){
    const api=[
        'http://192.168.123.41/debug/autoboot/',
        'https://suroy.cn/'
    ];
    return mode ? api[0] : api[1];
 }
 
 /**
  * 监听APP启动
  * @param {string} appName
  * @return {bool} 
  */
 function wakeApp(appName){
    if(!launch(appName))
    {
        if(launchApp(appName)) return true; 
    }
    return false;
 }


 /**
  * 定时轮训任务
  * @param {string} fpath 文件路径
  * @param {int} hour 
  * @param {int} min
  */
 function loopTasker(fpath, hou, min)
 {
    console.log($timers.addDailyTask({
        path: fpath,
        time: new Date(0, 0, 0, hou, min, 0),
        delay: 0,
        loopTimes: 1,
        interval: 0,
    }));
 }

 /**
  * 设置开机自启
  */
function bootloader(){
    timers.addIntentTask({
        path: 'main.js',
        action: 'android.intent.action.BOOT_COMPLETED'
    });
    return true;
}