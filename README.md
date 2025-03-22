# ddwenjaun - 阿勒泰旅游目的地形象塑造调查问卷

这是一个关于阿勒泰旅游目的地形象塑造的在线调查问卷网站。

## 功能特点

- 响应式设计，适配不同设备
- 带有背景图片的美观界面
- 具有动态交互效果的表单
- 实时进度条显示完成情况
- 基于条件的表单逻辑（部分问题根据用户回答动态显示/隐藏）
- 表单验证功能

## 技术栈

- HTML5
- CSS3 (动画、渐变、响应式设计)
- JavaScript (原生JS, 无框架)
- Node.js (服务器端)

## 安装与运行

### 前提条件

- 安装Node.js（建议12.0.0或更高版本）

### 安装步骤

1. 克隆或下载本项目代码
2. 打开命令行，进入项目目录
3. 安装依赖

```bash
npm install
```

4. 启动服务器

```bash
npm start
```

5. 在浏览器中访问 [http://localhost:3000](http://localhost:3000)

### 开发模式

如果需要在开发过程中自动重启服务器（修改代码后自动生效），可以使用：

```bash
npm run dev
```

## 文件结构

- `index.html` - 问卷表单HTML文件
- `styles.css` - 样式表文件
- `script.js` - 前端JavaScript逻辑
- `server.js` - Node.js服务器文件
- `package.json` - 项目配置文件

## 后续开发建议

- 添加数据库支持，存储提交的问卷数据
- 实现管理员面板，查看和导出问卷数据
- 添加用户验证机制，防止重复提交
- 实现多语言支持

## 许可证

ISC 
