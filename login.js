// login.js - 捕获轻小说网站登录cookie并保存

$httpClient.get({
  url: "https://www.linovelib.com/user.php",
  headers: {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
  }
}, function(error, response, data) {
  if (error) {
    console.log("获取用户信息失败: " + error);
    $notification.post("轻小说监测", "cookie获取失败", "网络请求失败");
    $done();
    return;
  }

  // 从响应头中提取cookie
  let cookies = response.headers['Set-Cookie'];
  if (!cookies) {
    console.log("未找到cookie");
    $notification.post("轻小说监测", "cookie获取失败", "响应中未包含cookie");
    $done();
    return;
  }

  // 提取有效的cookie
  let cookieArray = cookies.split(',');
  let validCookies = [];

  for (let cookie of cookieArray) {
    if (cookie.includes('uid') || cookie.includes('pass') || cookie.includes('auth')) {
      validCookies.push(cookie.trim());
    }
  }

  if (validCookies.length === 0) {
    console.log("未找到有效的登录cookie");
    $notification.post("轻小说监测", "cookie获取失败", "未找到有效的登录cookie");
    $done();
    return;
  }

  // 保存cookie到持久存储
  let cookieString = validCookies.join('; ');
  $persistentStore.write(cookieString, 'linovelib_cookie');

  console.log("成功保存轻小说登录cookie");
  $notification.post("轻小说监测", "cookie获取成功", "已成功捕获并保存登录cookie");
  $done();
});