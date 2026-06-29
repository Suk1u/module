// check-points.js - 检查轻小说网站积分变化

// 读取保存的cookie
let cookie = $persistentStore.read('linovelib_cookie');
if (!cookie) {
  console.log("未找到登录cookie，请先登录轻小说网站");
  $notification.post("轻小说监测", "签到失败", "未找到有效的登录cookie");
  $done();
  return;
}

// 获取用户信息
$httpClient.get({
  url: "https://m.bilinovel.com/user.php",
  headers: {
    "Cookie": cookie,
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
  }
}, function(error, response, data) {
  if (error) {
    console.log("获取用户信息失败: " + error);
    $notification.post("轻小说监测", "签到失败", "网络请求失败");
    $done();
    return;
  }

  try {
    // 解析HTML响应
    let match = data.match(/<span class="user-name">([^<]+)<\/span>/);
    let nickname = match ? match[1] : "未知用户";

    match = data.match(/<span class="user-title">([^<]+)<\/span>/);
    let title = match ? match[1] : "普通用户";

    match = data.match(/<span class="user-exp">([^<]+)<\/span>/);
    let exp = match ? match[1] : "0";

    match = data.match(/<span class="user-points">([^<]+)<\/span>/);
    let points = match ? match[1] : "0";

    match = data.match(/<span class="user-coin">([^<]+)<\/span>/);
    let coins = match ? match[1] : "0";

    // 读取之前的积分数据
    let previousData = $persistentStore.read('linovelib_points_data');
    let hasChanged = false;

    if (previousData) {
      let previous = JSON.parse(previousData);
      if (previous.points !== points || previous.coins !== coins) {
        hasChanged = true;
      }
    }

    // 保存当前数据
    let currentData = {
      nickname: nickname,
      title: title,
      exp: exp,
      points: points,
      coins: coins,
      timestamp: new Date().toISOString()
    };
    $persistentStore.write(JSON.stringify(currentData), 'linovelib_points_data');

    // 发送通知
    if (hasChanged) {
      let message = `积分变化:\n昵称: ${nickname}\n头衔: ${title}\n会员经验: ${exp}\n现有积分: ${points}\n轻哔哩币: ${coins}`;
      $notification.post("轻小说监测 - 定时任务", "积分已更新", message);
    } else {
      $notification.post("轻小说监测 - 定时任务", "签到失败", "积分未发生变化");
    }

  } catch (e) {
    console.log("解析用户信息失败: " + e);
    $notification.post("轻小说监测", "签到失败", "解析数据失败");
  }

  $done();
});