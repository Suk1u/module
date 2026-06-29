// manual-check.js - 手动执行积分检查

console.log("开始手动检查轻小说积分...");

// 读取保存的cookie
let cookie = $persistentStore.read('linovelib_cookie');
if (!cookie) {
  console.log("未找到登录cookie，请先登录轻小说网站");
  $notification.post("轻小说监测", "手动检查失败", "未找到有效的登录cookie，请先登录轻小说网站");
  $done();
  return;
}

console.log("使用cookie: " + cookie);

// 获取用户信息
$httpClient.get({
  url: "https://m.bilinovel.com/user.php",
  headers: {
    "Cookie": cookie,
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
    "Referer": "https://www.linovelib.com/"
  }
}, function(error, response, data) {
  if (error) {
    console.log("获取用户信息失败: " + error);
    $notification.post("轻小说监测", "手动检查失败", "网络请求失败: " + error);
    $done();
    return;
  }

  console.log("响应状态码: " + response.status);
  console.log("响应数据: " + data.substring(0, 500) + "..."); // 只显示前500字符

  try {
    // 解析HTML响应
    let nickname = "未知用户";
    let title = "普通用户";
    let exp = "0";
    let points = "0";
    let coins = "0";

    // 使用更健壮的正则表达式匹配
    let nicknameMatch = data.match(/<span[^>]*class=["']user-name["'][^>]*>([^<]+)<\/span>/);
    if (nicknameMatch) nickname = nicknameMatch[1].trim();

    let titleMatch = data.match(/<span[^>]*class=["']user-title["'][^>]*>([^<]+)<\/span>/);
    if (titleMatch) title = titleMatch[1].trim();

    let expMatch = data.match(/<span[^>]*class=["']user-exp["'][^>]*>([^<]+)<\/span>/);
    if (expMatch) exp = expMatch[1].trim();

    let pointsMatch = data.match(/<span[^>]*class=["']user-points["'][^>]*>([^<]+)<\/span>/);
    if (pointsMatch) points = pointsMatch[1].trim();

    let coinsMatch = data.match(/<span[^>]*class=["']user-coin["'][^>]*>([^<]+)<\/span>/);
    if (coinsMatch) coins = coinsMatch[1].trim();

    console.log("获取的用户信息 - 昵称: " + nickname + ", 头衔: " + title + ", 经验: " + exp + ", 积分: " + points + ", 币: " + coins);

    // 读取之前的积分数据
    let previousData = $persistentStore.read('linovelib_points_data');
    let hasChanged = false;

    if (previousData) {
      let previous = JSON.parse(previousData);
      console.log("之前的数据 - 积分: " + previous.points + ", 币: " + previous.coins);

      // 比较积分变化
      if (previous.points !== points || previous.coins !== coins) {
        hasChanged = true;
        console.log("积分发生变化: " + previous.points + " -> " + points + ", " + previous.coins + " -> " + coins);
      } else {
        console.log("积分未发生变化");
      }
    } else {
      console.log("首次获取积分数据");
      hasChanged = true; // 首次获取视为变化
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
      $notification.post("轻小说监测 - 手动检查", "积分已更新", message);
    } else {
      $notification.post("轻小说监测 - 手动检查", "积分未变化", `当前积分: ${points}`);
    }

  } catch (e) {
    console.log("解析用户信息失败: " + e);
    $notification.post("轻小说监测", "手动检查失败", "解析数据失败: " + e);
  }

  $done();
});