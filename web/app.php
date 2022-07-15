<?php
/**
 * 安卓重启工具API
 * @author @Suroy
 * @date 22.01.31
 * @lastdate 22.7.13
 */
error_reporting(0);
$mod = isset($_GET['mod']) ? $_GET['mod'] : null;
date_default_timezone_set("PRC");

switch ($mod) {
    case 'ping': // ping
        $imei = isset($_GET['id']) ? @$_GET['id'] : 1;
        $dev = isset($_GET['dev']) ? @$_GET['dev'] : 'Android'; // 名字
        $bat = isset($_GET['bat']) ? @$_GET['bat'] : 0; // 电量
        // IP获取
        $ipadd = isset($_GET['addr']) ? @$_GET['addr'] : real_ip(); // get来源地址，反代使用
        $ntime = date('Y-m-d H:i:s');
        $fname = './data/config.json';
        if(is_file($fname))
        {
            $info = file_get_contents($fname);
            $info_db = json_decode($info, true);
            $info_db[$imei] = array(
                "device" => $dev,
                "battery" => $bat,
                "ip" => $ipadd,
                "time" => $ntime
            );
            // var_dump($info_db);
            file_put_contents($fname, json_encode($info_db), LOCK_EX);
            $info = '{"code":"0","msg":"pong!"}';

        }
        else
            $info = '{"code":"-2","msg":"File not exist"}';
        exit($info);
        break;
    case 'update': //对设备进行信息设置
        $content = file_get_contents('php://input');
        $param = @$_GET['param']; //b64_encode
        $id = isset($_GET['id']) ? @$_GET['id'] : 1;
        // $info = (array)json_decode($content, true);
        // var_dump($info);
        $fname = './data/'.$id.'.json';
        file_put_contents($fname, base64_decode($param));
        exit('{"code":"1","msg":"Update Success!"}');
        break;
    case 'remote': // 远程控制
        $id = isset($_GET['id']) ? @$_GET['id'] : 1;
        $fname = './data/'.$id.'.json';
        if(is_file($fname))
        {
            $info = file_get_contents($fname);
            // {“config”:0,"action":0,"description":"restart","remarks":"Action: 0-close; 1-rebootNow; 2-shutdown; 3-remoteScript; 4-wakeApp; 5-startServer","source":"https://suroy.cn/logo.png","time":"2022-01-31 04:05:14"}
            $info_db = json_decode($info, true);
            $info_db["config"] = isset($info_db["config"]) ? defWeekCfg($info_db["config"]) : defWeekCfg(null); // 字段重定义为了判断是否维持原重启时间设置
            exit('{"code":0, "data": '.json_encode($info_db).'}');
        }
        exit('{"code":1, "msg": "Wait for Suroy\'s adding a settings."}');
        break;
    case 'show': // 显示信息
        break;
    case 'put': // 上载
        $appid = @$_POST['appid'];
        $dest = "./files/".$appid."_".$_FILES["file"]["name"];
        // 防恶意上传，限定类型
        $destin = in_array(substr($dest,-3,), array('png','jpg','txt','ini')) ? $dest : $dest.".trash";
        $result = move_uploaded_file($_FILES["file"]["tmp_name"] , $destin) ? "Success" : "Failure";
        // file_put_contents("log.txt", json_encode($_FILES,false)); //log
        exit("Shot: Submit ".$result);
        break;
    default:
        exit('{"code":"-1","msg":"Access denied"}');
        break;
}



function real_ip()
{
    $ip = $_SERVER['REMOTE_ADDR'];
    if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && preg_match_all('#\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}#s', $_SERVER['HTTP_X_FORWARDED_FOR'], $matches)) {
        foreach ($matches[0] as $xip) {
            if (!preg_match('#^(10|172\.16|192\.168)\.#', $xip)) {
                $ip = $xip;
                break;
            }
        }
    } elseif (isset($_SERVER['HTTP_CLIENT_IP']) && preg_match('/^([0-9]{1,3}\.){3}[0-9]{1,3}$/', $_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (isset($_SERVER['HTTP_CF_CONNECTING_IP']) && preg_match('/^([0-9]{1,3}\.){3}[0-9]{1,3}$/', $_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $ip = $_SERVER['HTTP_CF_CONNECTING_IP'];
    } elseif (isset($_SERVER['HTTP_X_REAL_IP']) && preg_match('/^([0-9]{1,3}\.){3}[0-9]{1,3}$/', $_SERVER['HTTP_X_REAL_IP'])) {
        $ip = $_SERVER['HTTP_X_REAL_IP'];
    }
    return $ip;
}

/**
 * 定义维持默认原设置时间
 * @note 于重定义维持原重启时间设置
 * @param string $cfg 配置文本（有效时启用配置，无效则默认）
 * @return bool 0,关(即不重启)；1，开
 */
function defWeekCfg($cfg, $sw=1)
{
    $arr_demo = array(0); // 模版重启时间 0-6 => Sun - Sat
    // 配置文件设置的时间 （有效：0|1|2 .... 6） （额外：7，永不重启）
    $arr = strlen($cfg) ? explode('|', $cfg) : $arr_demo;
    $weekday = date('w');
    if(in_array($weekday, $arr) && $sw)
        return 1;
    else
        return 0;
}

?>