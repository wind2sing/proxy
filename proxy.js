// proxy.js
import http from "http";
import https from "https";
import { URL } from "url";

// 配置信息
const CONFIG = {
  port: process.env.PORT || 3000,
  userAgent:
    process.env.USER_AGENT ||
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
};

// 从环境变量中获取所有 cookie 配置
const cookieMap = new Map(
  Object.entries(process.env)
    .filter(([key]) => key.startsWith("PROXYCOOKIE"))
    .map(([_, value]) => {
      const [domain, ...cookieParts] = value.split("@");
      return [domain.trim(), cookieParts.join("@").trim()]; // 重新组合可能包含 @ 的 cookie 值
    })
);

// 调试输出配置的域名
console.log("Configured domains:", Array.from(cookieMap.keys()));

// 获取指定域名的 cookie
function getCookieForDomain(hostname) {
  return cookieMap.get(hostname) || "";
}

// 创建代理服务器
const server = http.createServer((req, res) => {
  try {
    // 从请求 URL 中获取目标 URL
    const targetUrlStr = req.url.slice(1); // 移除开头的 /
    if (!targetUrlStr) {
      res.writeHead(400);
      res.end("Missing target URL");
      return;
    }

    // 解码 URL 并验证
    let targetUrl;
    try {
      targetUrl = new URL(decodeURIComponent(targetUrlStr));
    } catch (e) {
      res.writeHead(400);
      res.end("Invalid target URL");
      return;
    }

    // 记录请求日志
    console.log(
      `${new Date().toISOString()} - Proxying request to: ${targetUrl.href}`
    );

    // 获取该域名的 cookie
    const cookie = getCookieForDomain(targetUrl.hostname);

    // 构造请求选项
    const options = {
      hostname: targetUrl.hostname,
      path: targetUrl.pathname + targetUrl.search,
      method: "GET",
      headers: {
        "User-Agent": CONFIG.userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9,zh;q=0.8,zh-TW;q=0.7",
        "Cache-Control": "max-age=0",
        Priority: "u=0, i",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
    };

    // 如果有 cookie，添加到请求头
    if (cookie) {
      options.headers["Cookie"] = cookie;
    }

    // 根据目标 URL 协议选择 http 或 https 模块
    const protocol = targetUrl.protocol === "https:" ? https : http;

    // 发送请求到目标服务器
    const proxyReq = protocol.request(options, (proxyRes) => {
      // 设置响应头
      res.writeHead(proxyRes.statusCode, proxyRes.headers);

      // 流式传输响应数据
      proxyRes.pipe(res);

      // 处理错误
      proxyRes.on("error", (error) => {
        console.error("Response error:", error);
        if (!res.headersSent) {
          res.writeHead(502);
          res.end("Bad Gateway");
        }
      });
    });

    // 处理请求错误
    proxyReq.on("error", (error) => {
      console.error("Request error:", error);
      if (!res.headersSent) {
        res.writeHead(502);
        res.end("Bad Gateway");
      }
    });

    // 结束请求
    proxyReq.end();
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  }
});

// 启动服务器
server.listen(CONFIG.port, () => {
  console.log(`Proxy server running at http://localhost:${CONFIG.port}`);
});

// 错误处理
server.on("error", (error) => {
  console.error("Server error:", error);
});

// 优雅关闭
process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("Received SIGINT. Closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
