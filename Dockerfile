FROM node:16-alpine

WORKDIR /app

# 复制项目文件
COPY package*.json ./
COPY src ./src
COPY public ./public
COPY config ./config

# 安装依赖
RUN npm install --production

# 安装客户端依赖并构建
RUN cd src/client && npm install && npm run build

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]