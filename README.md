# IronForge 🛠️

[English](./README_EN.md)

# IronForge (简体中文)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/)
[![Vela OS](https://img.shields.io/badge/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F-Xiaomi%20Vela-orange.svg)](https://iot.mi.com/vela)

## 项目概述

**IronForge (淬火工坊)** 是由 **弦 (Xian)** 组织开发的，专为 **小米 Vela AIoT 操作系统** 打造的高效开发与锻造工具链。它通过提供一整套专业的工程化套件，解决了穿戴设备开发中的构建效率低、体积优化难、调试流程冗长等痛点，助力开发者快速打造极致体验的手表应用。

## 核心功能

- 🚀 **极简一键初始化项目**: 秒级生成生产级开发模板，告别繁琐的手动配置。
- 🏗️ **小米官方 AIoT IDE 支持**: 深度集成 **小米 AIoT IDE**，支持一键编译、调试与发布。
- 📊 **依赖与体积分析工具**: 像素级的包体积可视化分析，确保应用在轻量级设备上依然轻盈如燕。
- 💻 **增强型本地仿真调试**: 模拟真实手表的运行环境，支持传感器模拟与逻辑断点调试。
- 📦 **固件 & OTA 打包流水线**: 全自动化的签名、打包与校验流程，无缝对接云端 OTA 发布系统。

## 快速上手 (使用 AIoT IDE)

1. **克隆项目**:
   ```bash
   git clone https://github.com/Rikka06/IronForge.git
   ```
2. **使用 IDE 打开**:
   - 启动 **小米 AIoT IDE**。
   - 点击 `打开项目`，选择 `IronForge` 文件夹。
3. **编译与烧录**:
   - 点击界面上的 `编译` 按钮开始构建。
   - 使用 `运行` 或 `烧录` 功能部署到真实手表或模拟器。

## 手动安装调试

```bash
# 通过 npm 全局安装工具链 (可选)
npm install -g @xian/ironforge-toolkit

# 安装项目依赖
cd IronForge
npm install
```

## 目录结构

```text
IronForge/
├── src/                # 源码目录 (UX/JavaScript/CSS)
├── build/              # 构建脚本与中间产物
├── dist/               # 编译生成的 RPK 与发布包
├── sign/               # 签名证书与工具
├── .prettierrc.js      # 代码美化规范
├── package.json        # 依赖与脚本配置
└── README.md           # 项目文档
```

## 如何贡献

我们非常欢迎来自 Vela 开发者社区的贡献！
1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送至分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 协议

本项目基于 MIT 协议开源。详情请参阅 `LICENSE` 文件。
