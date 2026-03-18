# IronForge 🛠️

[English](#english) | [简体中文](#中文)

<div id="english"></div>

# IronForge (English)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/)
[![Stars](https://img.shields.io/github/stars/Rikka06/IronForge.svg?style=social)](https://github.com/Rikka06/IronForge/stargazers)
[![Vela OS](https://img.shields.io/badge/OS-Xiaomi%20Vela-orange.svg)](https://iot.mi.com/vela)

## Overview

**IronForge** is a high-efficiency development and forging toolchain exclusively designed for the **Xiaomi Vela AIoT Operating System**. It bridges the gap between raw code and wearable-optimized applications, providing developers with a professional suite of tools to build, optimize, and deploy high-performance applications for smartwatches and IoT devices.

## Features

- 🚀 **Minimalist One-Click Initialization**: Bootstrap your project with production-ready templates in seconds.
- 🏗️ **Intelligent Build & Optimization**: Advanced compiler integration tailored for Vela OS's resource constraints.
- 📊 **Dependency & Size Analysis**: Granular insights into bundle size and dependency weight to keep your apps lean.
- 💻 **Enhanced Local Simulation**: High-fidelity smartwatch environment for rapid UI testing and logic debugging.
- 📦 **Firmware & OTA Packaging Pipeline**: Automated signing and packing workflow ready for over-the-air updates.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Rikka06/IronForge.git && cd IronForge

# Initialize the professional workspace
ironforge init --template smartwatch-default

# Compile and optimize for Vela OS
ironforge build --release

# Flash to the connected device / simulation
ironforge flash --target emulator
```

## Installation

```bash
# Install via npm
npm install -g @xian/ironforge-toolkit

# OR build from source
git clone https://github.com/Rikka06/IronForge.git
cd IronForge
npm install && npm link
```

## Directory Structure

```text
IronForge/
├── src/                # Application source code (UX/JS/CSS)
├── build/              # Build scripts and intermediate artifacts
├── dist/               # Compiled RPK and production assets
├── sign/               # Certificates and signing tools
├── .prettierrc.js      # Formatting standards
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

## Contributing

We welcome contributions from the Vela developer community! 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div id="中文"></div>

# IronForge (简体中文)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/)
[![Vela OS](https://img.shields.io/badge/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F-Xiaomi%20Vela-orange.svg)](https://iot.mi.com/vela)

## 项目概述

**IronForge (淬火工坊)** 是由 **弦 (Xian)** 组织开发的，专为 **小米 Vela AIoT 操作系统** 打造的高效开发与锻造工具链。它通过提供一整套专业的工程化套件，解决了穿戴设备开发中的构建效率低、体积优化难、调试流程冗长等痛点，助力开发者快速打造极致体验的手表应用。

## 核心功能

- 🚀 **极简一键初始化项目**: 秒级生成生产级开发模板，告别繁琐的手动配置。
- 🏗️ **针对 Vela 的智能构建与优化**: 深度适配 Vela 系统特性的编译器优化，榨干每一份硬件性能。
- 📊 **依赖与体积分析工具**: 像素级的包体积可视化分析，确保应用在轻量级设备上依然轻盈如燕。
- 💻 **增强型本地仿真调试**: 模拟真实手表的运行环境，支持高频点击、传感器模拟与逻辑断点调试。
- 📦 **固件 & OTA 打包流水线**: 全自动化的签名、打包与校验流程，无缝对接云端 OTA 发布系统。

## 快速上手

```bash
# 克隆仓库
git clone https://github.com/Rikka06/IronForge.git && cd IronForge

# 初始化专业工作空间
ironforge init --template smartwatch-default

# 为 Vela OS 编译并优化
ironforge build --release

# 烧录至连接的设备或模拟器
ironforge flash --target emulator
```

## 安装调试

```bash
# 通过 npm 全局安装
npm install -g @xian/ironforge-toolkit

# 或者从源码安装
git clone https://github.com/Rikka06/IronForge.git
cd IronForge
npm install && npm link
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
