<?php
/**
 * 
 * router
 * @author @Suroy
 * @date 22.01.10
 * @lastedit 22.1.31
 * 
 */
error_reporting(0);
$mod = isset($_GET['mod']) ? $_GET['mod'] : null;
switch ($mod) {
    case null: //首页
        $mark = '访问成功';
        break;
    case 'nodeGet': // Airport | get
        $name = @$_GET['name'];
        $id = isset($_GET['id']) ? @$_GET['id'] : 1;
        $fname = './data/'.$name.'-'.$id.'.yml';
        $url = 'http://127.0.0.1/app.php?mod=get&name='.$name.'&id='.$id;
        $info = getSSLPage($url);
        exit($info);
        break;
	case 'ping': // Autoboot | ping
        $id = isset($_GET['id']) ? @$_GET['id'] : 1;
        $dev = isset($_GET['dev']) ? urldecode(@$_GET['dev']) : 'Android'; // 名字
        $bat = isset($_GET['bat']) ? @$_GET['bat'] : 0; // 电量
        $dev = str_replace(' ', '', $dev); // 空格报错
        $url = 'http://127.0.0.1/app.php?mod=ping&addr='.$_SERVER['REMOTE_ADDR'].'&dev='.$dev.'&id='.$id.'&bat='.$bat;
        $info = getSSLPage($url);
        exit($info);
		break;
	case 'remote': // Autoboot | remote
        $id = isset($_GET['id']) ? @$_GET['id'] : 1;
        $url = 'http://127.0.0.1/app.php?mod=remote&id='.$id;
        $info = getSSLPage($url);
        exit($info);
		break;
    default:
        exit('{"code":"-1","msg":"Access denied"}');
        break;
}

function getSSLPage($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_URL, $url);
    // curl_setopt($ch, CURLOPT_SSLVERSION,3); 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);// 这个是主要参数
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
	
}