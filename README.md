# MAALang

### 开发安装指南

1. 安装nodejs
2. 执行 `npm install`安装依赖

### 开发指南

#### 生成json

1. 编辑 `res/pipeline`下的文件
2. 执行 `npm run build`构建实际的结果(到 `dist/`)

> 可以执行 `npm run build [DIST_DIR]`构建到 `DIST_DIR/`下

#### 解析json

1. 复制json到 `dist/pipeline.json`
2. 执行 `npm run parse`解析json(到 `res/pipeline.parse`)

> 可以执行 `npm run parse [RES_DIR] [DIST_DIR]`将 `DIST_DIR/`下的 `all.meta.json`解析输出到 `RES_DIR/`下
