/**
 * 远程控制客户端
 * 适用于手机触屏坏了，用一个手机控制另一个手机，相当于手机接otg鼠标效果
 * 在控制端填入被控端ip地址即可控制，需要两个手机在同一局域网内
 * @author Suroy
 * @date 22.7.13
 * 
 */

var 远程控制 = storages.create("远程控制");
ip = 远程控制.get("ip")
var 服务端ip = rawInput("请输入服务端ip地址", ip);
远程控制.put("ip", 服务端ip);
var capture_type = rawInput("请输入截图模式(Base: 1-g50; 2-c50; 3-c100; Up: 4-c100; 5-g50; 9-None", 4);
坐标 = [0, 0]
上部坐标 = [200, 300]
myUi()
setInterval(() => {}, 1000);
ss = 0
y2 = 0
x2 = 0



function myUi() {
    w = floaty.rawWindow(
        <frame id="背景1"  w="200" h="260" margin="0" gravity="center"  bg="#8833ff00">
         <vertical gravity="center">
           <linear gravity="center">
             <button id="最小化" margin="0" gravity="center" text="最小化+移动"  w="60" h="30" textSize="8sp" />
              <button id="滑动" margin="0" gravity="center" text="鼠标按住滑动"  w="60" h="40" textSize="8sp" />
             <button id="退出" margin="0" gravity="center" text="退出"  w="60" h="30" textSize="8sp" />
          </linear>
           <button id="移动0" margin="-3" gravity="center" text="支持滑动-单击-长按"  w="200" h="140" textSize="15sp" />
            <linear margin="-2" gravity="center">
                 <button id="菜单" margin="0" gravity="center" text="任务"  w="40" h="40" textSize="8sp" />
                 <button id="主页" margin="0" gravity="center" text="主页"  w="40" h="40" textSize="8sp" />
                 <button id="返回" margin="0" gravity="center" text="返回"  w="40" h="40" textSize="8sp" />
                 <button id="capture" margin="0" gravity="center" text="抓图"  w="40" h="40" textSize="8sp" />
                 <button id="exit" margin="0" gravity="center" text="关闭"  w="40" h="40" textSize="8sp" />
            </linear>
            <button id="copyright" margin="-3" gravity="center" w="200" h="40" textSize="10sp" textColor="white" text="@Suroy.cn"/>
         
          </vertical>
        </frame>
    );
    //setInterval(()=>{}, 1000);
    var x = 0
    var y = 0
    w.setPosition(300, 900)
    // w.setAdjustEnabled(true);
    //   w.setSize(900, 600)
    w.退出.click(() => {
        toast("退出");
        //w.close();
        exit()
    });

    w.capture.click(()=>{ //截图
        // images.fromBase64(base64);
        // console.log(capture_local(1)); // 本地截图
        console.show();
        w.capture.setClickable(false);
        let fs = ["capture", Number(capture_type)]
        console.info(fs);
        toastLog("截图")
        threads.start(function() {
            tcp发送(fs.join("♥"))
            ss = 0
        })
        w.capture.setClickable(true); //允许点击
    });

    w.copyright.click(() => {
        toast("Hi, This is Suroy.");
        app.openUrl("https://suroy.cn");
    });

    w.exit.click(() => {
        w.exit.setClickable(false);
        let fs = ["exit"]
        console.info(fs);
        toastLog("关闭远程服务器")
        threads.start(function() {
            tcp发送(fs.join("♥"))
            ss = 0
        })
        w.exit.setClickable(true); //允许点击
    });

    w.返回.click(() => {
        let fs = ["返回"]
        toastLog("返回")
        threads.start(function() {
            tcp发送(fs.join("♥"))
            ss = 0
        })
    });
    w.主页.click(() => {
        let fs = ["主页"]
        toastLog("主页")
        threads.start(function() {
            tcp发送(fs.join("♥"))
            ss = 0
        })
    });

    w.菜单.click(() => {
        let fs = ["任务"]
        toastLog("最近任务")
        threads.start(function() {
            tcp发送(fs.join("♥"))
            ss = 0
        })
    });
    w.最小化.setOnTouchListener(function(view, event) {
        switch (event.getAction()) {
            case event.ACTION_DOWN:
                x = event.getRawX();
                y = event.getRawY();
                windowX = w.getX();
                windowY = w.getY();

                return true;
            case event.ACTION_MOVE:
                //移动手指时调整悬浮窗位置
                w.setPosition(windowX + (event.getRawX() - x),
                    windowY + (event.getRawY() - y));

                return true;
            case event.ACTION_UP:
                //手指弹起时如果偏移很小则判断为点击
                if (Math.abs(event.getRawY() - y) < 5 && Math.abs(event.getRawX() - x) < 5) {
                    if (w.最小化.text() == "最小化+移动") {
                        w.最小化.setText("最大化     ++++++");
                        w.setSize(202, 120);
                    } else {
                        w.最小化.setText("最小化+移动");
                        w.setSize(900, 720);
                    }
                }
                return true;
        }
        return true;
    });
    w.滑动.setOnTouchListener(function(view, event) {
        switch (event.getAction()) {
            case event.ACTION_DOWN:
                按下时间 = new Date().getTime()
                x = event.getRawX();
                y = event.getRawY();
                return true;
            case event.ACTION_MOVE:
                return true;
            case event.ACTION_UP:
                sss = new Date().getTime() - 按下时间
                x1 = parseInt(event.getRawX() - x) * 2
                y1 = parseInt(event.getRawY() - y) * 2
                let fs = ["滑动", x1, y1, sss]
                //log(fs)
                threads.start(function() {
                    tcp发送(fs.join("♥"))
                })
                return true;
        }
        return true;
    });
    w.移动0.setOnTouchListener(function(view, event) {
        switch (event.getAction()) {
            case event.ACTION_DOWN:
                按住 = 1
                x = event.getRawX()
                y = event.getRawY()
                aw = w.getWidth();
                ah = w.getHeight();
                windowX = w.getX();
                windowY = w.getY();
                downTime = new Date().getTime();
                return true;
            case event.ACTION_MOVE:
                //移动手指时调整悬浮窗位置
                if (Math.abs(event.getRawX() - x) > 20 || Math.abs(event.getRawY() - y) > 20) 按住 = 0
                x1 = parseInt(event.getRawX() - x) * 4
                y1 = parseInt(event.getRawY() - y) * 4
                //log(x1, y1)
                let fs = ["鼠标移动", x1, y1]
                if (ss == 0 && (Math.abs(y2 - y1) > 10 || Math.abs(x2 - x1) > 10)) {
                    ss = 1
                    x2 = x1
                    y2 = y1
                    threads.start(function() {
                        tcp发送(fs.join("♥"))
                        x = event.getRawX()
                        y = event.getRawY()
                        ss = 0
                    })
                }
                return true;
            case event.ACTION_UP:
                按下时间 = new Date().getTime() - downTime
                if (new Date().getTime() - downTime > 500 && 按住 == 1) {
                    let fs = ["鼠标长按", 按下时间]
                    toastLog("长按")
                    threads.start(function() {
                        tcp发送(fs.join("♥"))
                        ss = 0
                    })
                } else if (new Date().getTime() - downTime < 200 && Math.abs(event.getRawX() - x) < 20 && Math.abs(event.getRawY() - y) < 20) {
                    let fs = ["鼠标点击", x1, y1]
                    toastLog("点击")
                    threads.start(function() {
                        tcp发送(fs.join("♥"))
                        ss = 0
                    })
                }
                return true;
        }
        return true;
    })
}

function 窗口移动(a, x, y) {
    w1.setPosition(x, y)
    坐标[0] = w1.getX()
    坐标[1] = w1.getY()
    ui.run(function() {
        w.坐标.setText("点击坐标:" + 坐标[0] + "X" + 坐标[1]);
    });
}




importClass('java.io.BufferedReader');
importClass('java.io.IOException');
importClass('java.io.InputStream');
importClass('java.io.InputStreamReader');
importClass('java.io.OutputStream');
importClass('java.io.PrintWriter');
importClass('java.net.Socket');
importClass('java.net.UnknownHostException');
events.on("exit", function() {
    log("客户端结束运行");
    try {
        socket.close()
    } catch (error) {
        console.warn("socket error");
    }
});
tcp发送("Hi, Suroy!")

function tcp发送(text) {
    //创建Socket对象
    try {
        addr = getServerAddr(服务端ip, 6666);
        var socket = new Socket(addr[0], addr[1]); //ip,port
    } catch (e) {
        toastLog("被控端没有运行,请运行后在尝试")
        exit()
    }
    //根据输入输出流和服务端连接
    if(text)
    { //存在输入方传输
        var 输出流 = socket.getOutputStream(); //获取一个输出流，向服务端发送信息
        var printWriter = new PrintWriter(输出流); //将输出流包装成打印流
        printWriter.print(text); //发送
        printWriter.flush();
        socket.shutdownOutput(); //关闭输出流
    }
    var 输入流 = socket.getInputStream(); //获取一个输入流，接收服务端的信息
    var 输入流读出器 = new InputStreamReader(输入流); //包装成字符流，提高效率
    var 缓冲读出器 = new BufferedReader(输入流读出器); //缓冲区
    var temp = 缓冲读出器.readLine();
    log("收到服务端信息：\n" + temp + "\n\n当前服务端ip为：\n" + socket.getInetAddress().getHostAddress());
    listenCall(temp);//监听事件
    return temp
    //关闭相对应的资源
    缓冲读出器.close();
    输入流.close();
    printWriter.close();
    输出流.close();
    socket.close()
}

 /**
     * 截图
     * @param {int} mode 返回模式
     * @author Suroy
     * @date 22.7.13
     * @return {string}
     */
  function capture_local(mode)
  {
      let img = null;
      if (device.sdkInt >= 30) {
          // 安卓11用无障碍截图
          toast("[Android 11] 无障碍截图");
          img = $automator.takeScreenshot();
      } else {
          threads.start(function () {
              let r = text("立即开始").findOne(3000);
              r && r.click();
          });
          images.requestScreenCapture();
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

      fname = dir+ sj + "_Grey.png";
      img_grey = images.grayscale(img);
      images.save(img_grey, fname, "png", 50); //灰度图

      switch(mode)
      {
          case 1: //灰度50
              img_object = images.toBase64(img_grey, "png", 50);
              break;
          case 2: //50彩
              img_object = images.toBase64(img, "png", 50);
              break;
          case 3: //全真彩
              img_object = images.toBase64(img, "png", 100);
              break;
          default:
              img_object = null;
      }
      img.recycle(); //回收内存预防泄漏
      img_grey.recycle(); //回收内存预防泄漏

      return img_object;
  }


// 监听回传通讯信息
function listenCall(str){
    if(str.indexOf("[")!=-1&&str.indexOf("]")!=-1&&str.indexOf(":")!=-1)
    {//[xxx:xxx]方判断
        var thread = threads.start(function() {
            // while (true) { //直接监听tcp会导致冲突，故仅仅监听收到数据内容
                myAction(str)
            // }
        });
    }
}

/**
 * 解析操作
 * @param {string} rcv 收到的信息
 */
  function myAction(rcv)
  {
    rcv = rcv.replace("[","")
    rcv = rcv.replace("]","")
    param = rcv.split(":")
    console.info(param);
    if (param[0] == "capture") {
        //截图回传
        url = "https://suroy.cn/" + param[1];
        var sj = new Date().getTime();
        dest = "/sdcard/Suroy/Shot/" + sj + ".png";
        console.info("Down: ",url);
        down(url, dest);
    }

  }

  /**
   * 下载并预览文件
   * @param {string} url 
   * @param {string} path 保存路径
   */
  function down(url, path) {
    var url = url;
    var res = http.get(url);
    if (res.statusCode != 200) {
        toast("Request failure!");
    }
    files.writeBytes(path, res.body.bytes());
    toast("Download Success.");
    app.viewFile(path);
  }

/**
 * 获取服务器地址
 * @param {string} ip 
 * @param {int} port 
 * @returns 
 */
  function getServerAddr(ip, port){
    addr = [ip, port];
    if(ip.indexOf(":")){
        param = ip.split(":")
        addr[0] = param[0];
        addr[1] = param[1];
        console.info("Remote: ",addr);
    }
    return addr;
  }