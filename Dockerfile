# Dockerfile
FROM node:18-alpine

# 创建工作目录
WORKDIR /app

# 复制 package.json
COPY package.json .

# 安装依赖（如果有的话）
RUN npm install

# 复制源代码
COPY proxy.js .

# 设置默认环境变量
ENV PORT=3000 \
    NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 使用非 root 用户运行
USER node

# 启动服务
CMD ["node", "proxy.js"]