# RSS Proxy

一个简单的代理服务器，用于转发 RSS 请求并添加认证信息。主要用于解决一些 RSS 订阅源需要登录认证的问题，可以配合 RSS 阅读器（如 Inoreader）使用。

## 功能特点

- 支持多域名的 Cookie 配置
- 自动为不同域名请求添加对应的 Cookie
- 支持 HTTP 和 HTTPS
- 支持自定义 User-Agent
- 轻量级，无外部依赖
- 提供 Docker 支持

## 快速开始

### 方式一：直接运行

1. 确保已安装 Node.js 18 或更高版本
2. 克隆项目并安装依赖：

```bash
git clone [repository-url]
cd rss-proxy
npm install
```

3. 设置环境变量：

```bash
# 设置用户代理（可选，有默认值）
export USER_AGENT="Mozilla/5.0 ..."

# 设置 Cookie（可以设置多个）
export PROXYCOOKIE1="linux.do@your-cookie-string"
export PROXYCOOKIE2="example.org@another-cookie-string"

# 设置端口（可选，默认 3000）
export PORT=3000
```

4. 运行服务：

```bash
node proxy.js
```

### 方式二：使用 Docker

1. 构建镜像：

```bash
docker build -t rss-proxy .
```

2. 运行容器：

```bash
docker run -d \
  --name rss-proxy \
  -p 3000:3000 \
  -e PROXYCOOKIE1="linux.do@your-cookie-string" \
  -e PROXYCOOKIE2="example.org@another-cookie-string" \
  rss-proxy
```

## 使用方法

服务启动后，可以通过以下格式访问：

```
http://localhost:3000/https://target-site.com/feed.xml
```

例如，在 Inoreader 中订阅需要认证的 RSS 源：

1. 原始订阅地址：`https://linux.do/top.rss`
2. 通过代理订阅：`http://localhost:3000/https://linux.do/top.rss`

## 环境变量说明

| 环境变量     | 说明                                   | 是否必需 | 默认值          |
| ------------ | -------------------------------------- | -------- | --------------- |
| PORT         | 服务器监听端口                         | 否       | 3000            |
| USER_AGENT   | 自定义 User-Agent                      | 否       | Mozilla/5.0 ... |
| PROXYCOOKIEn | Cookie 配置，格式：`域名@cookie字符串` | 是       | -               |

注意：

- `PROXYCOOKIEn` 中的 n 可以是任意数字，如 PROXYCOOKIE1, PROXYCOOKIE2 等
- 可以设置任意数量的 PROXYCOOKIE 环境变量
- Cookie 字符串通常可以从浏览器开发者工具中获取

## 获取 Cookie

1. 在浏览器中登录目标网站
2. 打开开发者工具（Chrome/Edge 中按 F12）
3. 切换到 Network 标签页
4. 刷新页面
5. 在请求列表中找到任意请求
6. 在请求头中找到 Cookie 字段的值

## 安全建议

1. 不要将 Cookie 信息提交到版本控制系统
2. 建议在内网或受信任的环境中使用
3. 定期更新 Cookie 以确保其有效性
4. 如需在公网使用，建议添加访问控制

## 常见问题

1. Q: Cookie 中包含 @ 符号怎么办？  
   A: 建议将 Cookie 进行 URL 编码。

2. Q: 如何判断服务是否正常运行？  
   A: 访问 `http://localhost:3000/https://example.com` 应该会看到代理请求的日志。

3. Q: Cookie 失效了怎么办？  
   A: 重新获取 Cookie 并更新环境变量，然后重启服务。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT License](LICENSE)
