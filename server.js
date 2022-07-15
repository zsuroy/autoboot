/**
 * 远程控制服务器端
 * 适用于手机触屏坏了，用一个手机控制另一个手机，相当于手机接otg鼠标效果
 * 在控制端填入被控端ip地址即可控制，需要两个手机在同一局域网内
 * @author Suroy
 * @date 22.7.13
 */

var myServer = {};


/**
 * 直接运行主程序
 * @param {int} mode 模式(0关闭，1启动)
 * @note 此处采用模块导出的方式以便于外部调用
 * @return null
 */
myServer.run = function (mode) {

    if(!mode)
    { //关闭
        log("[End] 主动退出");
        closeServer();
        return false;
    }

    w0 = floaty.rawWindow(
        <frame id="移动11" gravity="center"> 
        <vertical>
            <text w="15" h="15" textColor="red" bg="#00000000">↖</text> 
            </vertical>
        </frame>
    );
    w0.setTouchable(false);
    w0.setPosition(100, 300)
    sleep(10)
    importClass('java.net.Inet4Address');
    importClass('java.net.InetAddress');
    importClass('java.net.NetworkInterface');
    importClass('java.util.Enumeration');
    importClass('java.net.Inet6Address');
    var hostIp = null;
    try {
        var nis = NetworkInterface.getNetworkInterfaces();
        var ia = null;
        while (nis.hasMoreElements()) {
            var ni = nis.nextElement();
            var ias = ni.getInetAddresses();
            while (ias.hasMoreElements()) {
                ia = ias.nextElement();
                if (ia instanceof Inet6Address) {
                    continue;
                }
                var ip = ia.getHostAddress();
                if (!"127.0.0.1".equals(ip)) {
                    hostIp = ia.getHostAddress();
                    break;
                }
            }
        }
    } catch (e) {
        log(e);
    }
    toastLog("[Start Server]:" + hostIp);
    toastLog("[Start Server]:" + hostIp);
    // toastLog("本机ip:" + hostIp);
    importClass('java.io.BufferedReader');
    importClass('java.io.IOException');
    importClass('java.io.InputStream');
    importClass('java.io.InputStreamReader');
    importClass('java.io.OutputStream');
    importClass('java.io.PrintWriter');
    importClass('java.net.Socket');
    importClass('java.net.ServerSocket');
    closeServer(1); //监听关闭按键
    try {
        var 服务器接口 = new ServerSocket(6666);
        // 服务器接口.setReuseAddress(true); //重用｜可能异常
        // 服务器接口.bind(new InetSocketAddress(6666));
    } catch (error) {
        //按时间生成端口号
        var date = new Date();
        var hour = date.getHours(); // 时
        var minutes = date.getMinutes(); // 分
        my_port = 59527-hour*100-minutes;
        var 服务器接口 = new ServerSocket(my_port);
        console.info("Port: ", my_port);
    }
    a = 0
    var thread = threads.start(function() {
        while (true) {
            //log(a)
            a++
            try {
                操作(收到回复("收到" + a))
            } catch (error) { }
            if(a.toString().length>16)a=0;
        }
    });

    setInterval(() => {
        sleep(200);
    }, 1000);

    function 收到回复(text) {
        var socket = 服务器接口.accept();
    //   log("客户端已链接")
        var 输入流 = socket.getInputStream();
        var 输入流读出器 = new InputStreamReader(输入流);
        var 缓冲读出器 = new BufferedReader(输入流读出器);
        var temp = 缓冲读出器.readLine();
    //  log("收到客户端信息：\n" + temp + "\n\n当前客户端ip为：\n" + socket.getInetAddress().getHostAddress());
        var 输出流 = socket.getOutputStream();
        var printWriter = new PrintWriter(输出流);
        printWriter.print(text);
        printWriter.flush();
        socket.shutdownOutput(); //关闭输出流
        return temp
        printWriter.close();
        输出流.close();
        缓冲读出器.close();
        输入流.close();
    }


    function 操作(ml) {
        ml = ml.split("♥")
        var x = w0.getX()
        var y = w0.getY()
        if (ml[0] == "鼠标移动") {
            x = x - (-ml[1]);
            y = y - (-ml[2]);
            let fx = context.getResources().getConfiguration().orientation;
            let w = device.width;
            let h = device.height;
            if (fx == 1) {
                if (x < 1) x = 0
                if (x > w - 1) x = w - 1
                if (y < 1) y = 0
                if (y > h - 1) y = h
            } else {
                if (x < 1) x = 0
                if (x > h - 1) x = h
                if (y < 1) y = 0
                if (y > w - 1) y = w - 1
            }
        // log(x, y);
            ui.run(function() {
                w0.setPosition(x, y)
            });
        } else if (ml[0] == "鼠标点击") {
            click(x, y)
        } else if (ml[0] == "鼠标长按") {
            press(x, y, ml[1])
        } else if (ml[0] == "滑动") {
            x1 = x - (-ml[1]);
            y1 = y - (-ml[2]);
        // log(x, y, x1, y1, ml[3])
            try {
                swipe(x, y, x1, y1, ml[3])
            } catch (e) {}
        } else if (ml[0] == "返回") {
            back()
        } else if (ml[0] == "主页") {
            home()
        } else if (ml[0] == "任务") {
            recents()
        } else if (ml[0] == "capture") { //截图
            console.info("Cap_ml:", ml);
            try {
                device.wakeUp(); //唤醒屏幕
                mode = Number(ml[1]);
            } catch (e) {
                mode=5;
            }
            收到回复(capture(mode));
        } else if (ml[0] == "exit") { //关闭服务
            console.info("[End] 远程已关闭此服务器");
            closeServer();
        } 
    }

    /**
     * 截图
     * @param {int} mode 返回模式
     * @author Suroy
     * @date 22.7.13
     * @return {string}
     */
    function capture(mode)
    {
        let img = null;
        if (device.sdkInt >= 30) {
            // 安卓11用无障碍截图
            toast("[Android 11] 无障碍截图");
            try {
                img = $automator.takeScreenshot();
            } catch (error) { }
        } else {
            threads.start(function () {
                let r = text("立即开始").findOne(3000);
                r && r.click();
            });
            try {
                images.requestScreenCapture();
            } catch (error) { }
            img = images.captureScreen();
        }
        var sj = new Date().getTime();
        dir = "/sdcard/Suroy/shot/";
        if (!$files.exists(dir)) {
            // 文件夹不存在 创建文件夹 
            $files.create(dir); 
        }
        fname = dir+ sj + ".png";
        images.save(img, fname); //原图

        fname_g = dir+ sj + "_Grey.png";
        img_grey = images.grayscale(img);
        images.save(img_grey, fname_g, "png", 50); //灰度图

        switch(mode)
        {
            case 1: //灰度50 ｜仅返回Base64
                img_object = images.toBase64(img_grey, "png", 50);
                break;
            case 2: //50彩
                img_object = images.toBase64(img, "png", 50);
                break;
            case 3: //全真彩
                img_object = images.toBase64(img, "png", 100);
                break;
            case 4: //全真彩 ｜ 上传
                img_object = upload(fname);
                break;
            case 5: //灰度 ｜ 上传
                img_object = upload(fname_g); // 返回文件名|Client:会进行替换掉
                break;
            case 9:
                img_object = fname; // 返回文件名
                break;
            default:
                img_object = null;
        }
        img.recycle(); //回收内存预防泄漏
        img_grey.recycle(); //回收内存预防泄漏

        return "[capture:"+img_object+"]";
    }

};

/**
 * 上传文件
 * @param {string} fname 
 * @return {string} url
 */
function upload(fname){
    try {
        var url = "https://suroy.cn/?mod=put";
        var res = http.postMultipart(url, {
            appid: device.getAndroidId(),
            file: open(fname)
        });
        log(res.body.string());
        return (device.getAndroidId()+"_"+fname).replace("/sdcard/Suroy/shot/",""); //服务器上文件名
    } catch (error) {
        toastLog("Upload error!");
    }
    return false;
}


/**
 * 结束运行
 * @param {*} mode 
 */
function closeServer(mode){
    if(mode==1)
    {
        events.on("exit", function() {
            log("按键结束运行");
            floaty.closeAll(); //关闭所有悬浮窗
            服务器接口.close();
            thread.interrupt();
            log("结束")
        });
    }else {
        try {
            服务器接口.close();
            thread.interrupt();
        } catch (error) {
            console.warn("[End]", error);
            floaty.closeAll(); //关闭所有悬浮窗
        }
        floaty.closeAll(); //关闭所有悬浮窗
    }
}

//导出模块以便于外部调用
module.exports = myServer;
