# 五子棋在线对战游戏

一个基于 React + Node.js + Socket.io 的实时五子棋对战平台，支持用户注册登录、在线匹配、实时对战、战绩统计和好友系统。

## 🚀 一分钟快速开始

```bash
# 1. 克隆项目
git clone <repository-url>
cd gomoku-game

# 2. 启动后端服务
cd server
npm install
npm run dev
# 服务器运行在 http://localhost:4000

# 3. 启动前端应用（新终端）
cd ../client
npm install
npm start
# 应用运行在 http://localhost:3000

# 4. 打开浏览器访问 http://localhost:3000
```

> 📝 **先决条件**：确保已安装 [Node.js](https://nodejs.org/) (v16+) 和 [MongoDB](https://www.mongodb.com/)。

详细配置请参阅下方的 [完整安装指南](#📋-完整安装指南)。

## ✨ 功能特性

- **用户系统**
  - 注册/登录（JWT 认证）
  - 个人信息管理
  - 在线状态显示
- **游戏大厅**
  - 实时在线玩家列表
  - 玩家战绩展示（胜/负/平/胜率）
  - 一键匹配对手
- **实时对战**
  - 15×15 标准五子棋棋盘
  - 实时落子同步（Socket.io）
  - 自动胜负判定（五子连珠）
  - 轮次提示与最后落子高亮
  - 对手离开自动判胜
  - 平局判定（棋盘下满）
- **社交功能**
  - 添加游戏对手为好友
  - 好友关系持久化存储
- **数据统计**
  - 个人胜/负/平场次记录
  - 实时胜率计算
  - 游戏历史统计

## 🛠️ 技术栈

### 前端 (Client)
- **React 18** - 用户界面框架
- **React Router DOM** - 页面路由
- **Axios** - HTTP 客户端
- **Socket.io-client** - 实时通信
- **CSS3** - 样式设计（无 UI 框架）

### 后端 (Server)
- **Node.js** - 运行时环境
- **Express** - Web 框架
- **MongoDB + Mongoose** - 数据库与 ODM
- **Socket.io** - WebSocket 通信
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **dotenv** - 环境变量管理

## 📁 项目结构

```
gomoku-game/
├── client/                    # 前端 React 应用
│   ├── public/
│   │   └── index.html        # 主页面
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   │   ├── Board.js     # 棋盘组件
│   │   │   ├── PlayerInfo.js # 玩家信息组件
│   │   │   └── OnlinePlayerList.js # 在线玩家列表
│   │   ├── pages/           # 页面组件
│   │   │   ├── LoginPage.js # 登录页
│   │   │   ├── RegisterPage.js # 注册页
│   │   │   ├── RoomPage.js  # 游戏大厅页
│   │   │   └── GamePage.js  # 游戏对战页
│   │   ├── context/         # React Context
│   │   │   └── AuthContext.js # 认证上下文
│   │   ├── utils/           # 工具函数
│   │   │   ├── api.js       # API 封装
│   │   │   └── socket.js    # Socket 管理
│   │   ├── index.js         # 应用入口
│   │   ├── App.js           # 主应用组件
│   │   └── index.css        # 全局样式
│   └── package.json
├── server/                   # 后端 Node.js 应用
│   ├── src/
│   │   ├── models/          # 数据模型
│   │   │   ├── User.js      # 用户模型
│   │   │   └── Friendship.js # 好友关系模型
│   │   ├── middleware/      # 中间件
│   │   │   └── auth.js      # JWT 认证中间件
│   │   ├── routes/          # API 路由
│   │   │   ├── auth.js      # 认证路由
│   │   │   ├── user.js      # 用户路由
│   │   │   └── friend.js    # 好友路由
│   │   ├── socket/          # Socket 处理
│   │   │   └── gameSocket.js # 游戏 Socket 逻辑
│   │   └── app.js           # 应用入口
│   └── package.json
└── README.md                # 项目说明文档
```

## 📋 完整安装指南

### 环境要求
- Node.js (v16+)
- MongoDB (本地运行或云数据库)
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <repository-url>
cd gomoku-game
```

### 2. 后端配置
```bash
# 进入 server 目录
cd server

# 安装依赖
npm install

# 配置环境变量
# 复制 .env.example 为 .env 并修改相应配置
# 默认配置已包含在 .env 中，如需修改请编辑

# 启动 MongoDB 服务（确保 MongoDB 正在运行）
# 默认连接 mongodb://localhost:27017/gomoku

# 启动开发服务器
npm run dev
# 服务器将在 http://localhost:4000 运行
```

### 3. 前端配置
```bash
# 进入 client 目录（新终端）
cd client

# 安装依赖
npm install

# 启动开发服务器
npm start
# 应用将在 http://localhost:3000 运行
```

### 4. 访问应用
打开浏览器访问 http://localhost:3000

## ⚙️ 环境变量配置

### 后端 (.env 文件)
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/gomoku
JWT_SECRET=your_jwt_secret_key_here
```

### 前端代理配置
前端 `package.json` 中已配置代理：
```json
"proxy": "http://localhost:4000"
```

## 📡 API 接口文档

### 认证相关
| 方法 | 端点 | 描述 | 请求体 |
|------|------|------|--------|
| POST | `/api/auth/register` | 用户注册 | `{username, password}` |
| POST | `/api/auth/login` | 用户登录 | `{username, password}` |

### 用户相关
| 方法 | 端点 | 描述 | 认证头 |
|------|------|------|--------|
| GET | `/api/user/me` | 获取当前用户信息 | `Bearer <token>` |
| GET | `/api/user/online` | 获取在线用户列表 | `Bearer <token>` |

### 好友相关
| 方法 | 端点 | 描述 | 认证头 |
|------|------|------|--------|
| GET | `/api/friend/list` | 获取好友列表 | `Bearer <token>` |
| POST | `/api/friend/add` | 添加好友 | `Bearer <token>` |
| GET | `/api/friend/check/:friendId` | 检查是否为好友 | `Bearer <token>` |

## 🎮 Socket.io 事件

### 客户端发送事件
| 事件名 | 数据 | 描述 |
|--------|------|------|
| `startMatching` | - | 开始匹配对手 |
| `cancelMatching` | - | 取消匹配 |
| `makeMove` | `{gameId, row, col}` | 落子 |
| `leaveGame` | - | 离开游戏 |
| `returnToRoom` | - | 返回大厅 |

### 服务器发送事件
| 事件名 | 数据 | 描述 |
|--------|------|------|
| `onlineUsers` | `User[]` | 在线用户列表更新 |
| `waiting` | `{message}` | 等待匹配中 |
| `gameStart` | `{gameId, color, opponent, myInfo}` | 游戏开始 |
| `moveMade` | `{row, col, piece, currentTurn}` | 对手落子 |
| `gameOver` | `{winner, winnerName}` | 游戏结束 |

## 🧩 游戏规则实现

### 棋盘
- 15×15 标准五子棋棋盘
- 黑子先行，白子后行
- 交替落子

### 胜负判定
- 横、竖、斜（左上-右下、右上-左下）任意方向五子连珠
- 对手离开游戏自动判胜
- 棋盘下满（225步）判定平局

### 特殊处理
- 最后落子高亮显示
- 非己方回合无法落子
- 已有棋子位置无法重复落子

## 🗃️ 数据库设计

### User 集合
```javascript
{
  username: String,      // 用户名（唯一）
  password: String,      // 加密密码
  wins: Number,          // 胜场
  losses: Number,        // 负场
  draws: Number,         // 平局
  status: String,        // 状态：idle/playing/away
  createdAt: Date
}
```

### Friendship 集合
```javascript
{
  user1: ObjectId,       // 用户1 ID
  user2: ObjectId,       // 用户2 ID
  createdAt: Date
}
```

## 🔧 开发说明

### 代码规范
- 前端使用 ES6+ 语法
- 后端使用 CommonJS 模块
- 组件/函数使用驼峰命名法
- 文件使用 PascalCase (组件) / camelCase (工具函数)

### 项目依赖管理
- 前端：React 生态相关依赖
- 后端：Express、MongoDB、Socket.io 相关依赖

## 📈 未来计划

- [ ] 游戏回放功能
- [ ] 聊天系统（游戏内、大厅）
- [ ] 观战模式
- [ ] 排行榜系统
- [ ] 多种游戏模式（人机对战、限时赛）
- [ ] 移动端适配
- [ ] 国际化支持
- [ ] 游戏音效

## 🐛 问题反馈

如遇问题，请检查：
1. MongoDB 服务是否正常运行
2. 环境变量配置是否正确
3. 端口是否被占用（3000, 4000）
4. 浏览器控制台有无错误信息

## 📄 许可证

本项目为个人学习项目，遵循 MIT 许可证。

---

**快乐下棋，享受游戏！** 🎮♟️