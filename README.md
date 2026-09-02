# ForgeNova Hardware（GitHub 网页上传精简版）

面向欧美采购商的英文五金外贸展示与询价网站，包含中文产品管理后台。

本版本已精简为少于 100 个源码文件，可在 GitHub 仓库页面选择 **Add file → Upload files** 后一次上传全部解压文件。

## 已完成功能

- 英文响应式首页、产品分类与产品展示
- 在线询价表单，询盘自动进入管理后台
- 中文后台：新增、删除、编辑产品及价格、MOQ、状态和描述
- 后台上传或更换产品图片（JPG、PNG、WebP，最大 5MB）
- 后台修改公司名称、邮箱、WhatsApp、微信及首页介绍
- 管理员密码登录与签名会话 Cookie
- GitHub + Render 部署配置

## 本地运行

需要 Node.js 22 或更高版本。

```bash
npm ci
cp .env.example .env.local
npm run dev
```

访问 `http://localhost:3000`，后台地址为 `http://localhost:3000/admin`。

未设置环境变量时，临时后台密码为 `admin123`。正式上线前必须设置安全密码。

## 部署到 Render

1. 将整个项目上传至 GitHub 仓库。
2. 在 Render 选择 **New → Blueprint**，连接此仓库。
3. Render 会读取 `render.yaml` 自动建立 Web Service。
4. 在 Render 环境变量中确认已经设置：
   - `ADMIN_PASSWORD`：后台密码
   - `SESSION_SECRET`：随机长字符串
- `DATA_DIR`：持久化数据目录

网站会通过 `npm ci && npm run build` 构建，通过 `npm start` 启动。

## 数据保存说明

产品与询盘默认写入 `DATA_DIR/store.json`。Render 免费实例的文件系统在重新部署后可能被重置；测试阶段可以使用，正式运营时建议挂载 Render Persistent Disk，或改接 PostgreSQL/Supabase。迁移到普通服务器时可直接把 `DATA_DIR` 指向服务器上的持久目录。

后台上传的产品图片保存在 `DATA_DIR/uploads`。免费实例重新部署或重启后可能清空这些上传图片，正式运营前建议使用持久磁盘或迁移服务器。

## 上线前需要替换

- `sales@example.com` 邮箱
- WhatsApp 号码
- 企业名称、Logo、真实产品与价格
- 关于我们、质检与交付信息
- 域名和 SEO 关键词
