# IronForge 🛠️

[简体中文](./README.md)

# IronForge (English)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/)
[![Stars](https://img.shields.io/github/stars/Rikka06/IronForge.svg?style=social)](https://github.com/Rikka06/IronForge/stargazers)
[![Vela OS](https://img.shields.io/badge/OS-Xiaomi%20Vela-orange.svg)](https://iot.mi.com/vela)

## Overview

**IronForge** is a high-efficiency development and forging toolchain exclusively designed for the **Xiaomi Vela AIoT Operating System**. It bridges the gap between raw code and wearable-optimized applications, providing developers with a professional suite of tools to build, optimize, and deploy high-performance applications for smartwatches and IoT devices.

## Features

- 🚀 **Minimalist One-Click Initialization**: Bootstrap your project with production-ready templates.
- 🏗️ **Official AIoT IDE Integration**: Seamlessly compile and debug using the official **Xiaomi AIoT IDE**.
- 📊 **Dependency & Size Analysis**: Granular insights into bundle size and dependency weight to keep your apps lean.
- 💻 **Enhanced Local Simulation**: High-fidelity smartwatch environment for rapid UI testing.
- 📦 **Firmware & OTA Packaging Pipeline**: Automated signing and packing workflow for over-the-air updates.

## Quick Start (via AIoT IDE)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Rikka06/IronForge.git
   ```
2. **Open with AIoT IDE**:
   - Launch the **Xiaomi AIoT IDE**.
   - Select `Open Project` and point to the `IronForge` directory.
3. **Build & Flash**:
   - Use the built-in `Build` button to compile for Vela OS.
   - Click `Run` or `Flash` to deploy to your connected device or emulator.

## Manual Installation

```bash
# Install toolchain via npm (optional)
npm install -g @xian/ironforge-toolkit

# Setup dependencies
cd IronForge
npm install
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
