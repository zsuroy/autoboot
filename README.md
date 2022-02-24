AutoBoot
=============
> 基于 Autojs 实现的无root自动定时重启、关机的APP，同时支持远程监控在线、执行远程命令。   
> Suroy | https://Suroy.cn
>



## Why is it？  
### 🎈 **Story**  
淘了一个HTC One M8st 进行了一系列部署拟完成搭建为 Linux 服务器(已解锁Bootloader、root、TWRP)，但是HTC系统无定时重启功能。众所周知，安卓系统长时间运行会出现卡顿情况，故以其作服务器需要进行定期重启，于是开发了此项目。  

---
### 👨🏻‍💻 **支持功能**
1. 定时在3.20重启手机
2. 定时Ping-Pong心跳检测
3. 接收远程脚本任务(可以实现一系列自动化操作进行扩展)
4. 理论支持Android 5.0+（无需Root）
5. 测试机型：HTC ONE M8St(Android 6.0 [root可选])  / Vmos(Android 5.0)

---
### 🎉  **致谢**
开源项目万岁  
[Autojs](https://github.com/hyb1996/Auto.js/blob/master/Readme-cn.md) | [AutojsX](http://doc.autoxjs.com/)

## 目录结构
```s
.
|____LICENSE
|____project.json
|____web   {API接口}
| |____app.php
| |____app-router.php {路由}
| |____data {数据文件夹}
| | |____config.json {基本配置}
| | |____0.json {单用户远程配置}
|____README.md
|____main.js
|____main.js.bak
```

## START
1. 部署 API 到远程服务器
2. 不支持 HTTPS 时，可以通过部署路由中转
3. 下载 [Release](https://github.com/zsuroy/autoboot/releases) 或者autojs编译打包app
4. 给予 APP 相关权限  
    + 无障碍服务权限
    + 后台运行权限
    + 关闭电源优化
    + 给开机自启权限
    + 通过shell开机唤醒APP/或转为系统APP  


## V1.1.0 ｜ 2022.1.31
1. 完成APP开发调试
2. 完成远程API接口开发调试
3. 待完成  
---
**APP Version**
1. 定时在3.20重启手机
2. 定时Ping-Pong心跳检测
3. 接收远程脚本任务(可以实现一系列自动化操作进行扩展)

## V1.2.0 | 2022.2.8
1. 优化APP提示信息  
2. 更新接收远程委派重启时间（APP/WEB）  
    + 优先采纳接收到远程数据控制重启  
    + 本地时间周五允许重启 


## V1.2.2 | 2022.2.13
1. 优化android 7.0+ 配置  
    + 点击方法复写自动判断
    + 解决Android 10 IMEI获取不正常，使用AndroidId替代 


## V1.2.3 | 2022.2.24
1. 更新 WEB 端配置文件重启时间定义
    + 不存在配置字段则使用默认定义配置的重启时间
    + 重定义配置文件重启工作日格式（以 ｜ 分割，0-6对应周日至周六）
    + 客户端周五时无网络情况下有一定概率可能会进行重启