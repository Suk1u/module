// login.js - 捕获轻小说网站登录cookie并保存

console.log("开始捕获轻小说登录cookie...");

$httpClient.get({
  url: "https://m.bilinovel.com/user.php",
  headers: {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
    "Referer": "https://www.linovelib.com/"
  }
}, function(error, response, data) {
  if (error) {
    console.log("获取用户信息失败: " + error);
    $notification.post("轻小说监测", "Cookie捕获失败", "网络请求失败: " + error);
    $done();
    return;
  }

  console.log("响应状态码: " + response.status);
  console.log("响应头: " + JSON.stringify(response.headers));

  // 从响应头中提取cookie
  let cookies = response.headers['Set-Cookie'];
  if (!cookies) {
    console.log("未找到cookie头");
    $notification.post("轻小说监测", "Cookie捕获失败", "响应中未包含cookie头");
    $done();
    return;
  }

  console.log("找到cookie: " + cookies);

  // 提取有效的cookie
  let cookieArray = cookies.split(',');
  let validCookies = [];

  for (let cookie of cookieArray) {
    let trimmedCookie = cookie.trim();
    console.log("处理cookie: " + trimmedCookie);

    if (trimmedCookie.includes('uid') || trimmedCookie.includes('pass') || trimmedCookie.includes('auth') ||
        trimmedCookie.includes('PHPSESSID') || trimmedCookie.includes('login')) {
      validCookies.push(trimmedCookie);
      console.log("添加有效cookie: " + trimmedCookie);
    }
  }

  if (validCookies.length === 0) {
    console.log("未找到有效的登录cookie");
    $notification.post("轻小说监测", "Cookie捕获失败", "未找到有效的登录cookie");
    $done();
    return;
  }

  // 保存cookie到持久存储
  let cookieString = validCookies.join('; ');
  $persistentStore.write(cookieString, 'linovelib_cookie');

  console.log("成功保存轻小说登录cookie: " + cookieString);
  $notification.post("轻小说监测", "Cookie捕获成功", "已成功捕获并保存登录cookie");
  $done();
});