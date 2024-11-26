<div align="center">
<img src="./docs/images/icon.svg" alt="icon"/>

<h1 align="center">小光AI - 您的智能助手</h1>

小光AI是一个强大的AI助手平台，提供多样化的智能对话服务。从2023年5月首次发布以来，我们不断进化和成长，现已发展成为一个全方位的AI助手平台。

## 核心特点

- 🤖 **多样化智能体**: 拥有300+个专业智能体，覆盖各行各业
- 🔄 **无限制AI模式**: 突破传统对话限制，激发更多创意可能
- 📊 **智能工作流**: 高效的任务处理和自动化流程
- 🎨 **AI创意工具**: 支持图像识别、文档分析等多种创新功能
- 🌐 **插件生态**: 丰富的插件系统，支持搜索、计算、网页浏览等功能

## 插件能力

小光AI 集成了多种强大的插件功能，让AI助手更加智能和实用：

### 搜索与信息获取

- 🔍 **实时搜索**: 支持Google、Bing、DuckDuckGo等多个搜索引擎
- 📚 **维基百科**: 快速访问和总结维基百科内容
- 🌐 **网页浏览**: 能够访问和解析网页内容，提供信息总结

### AI创意工具

- 🎨 **DALL-E 3绘图**: 支持最新的DALL-E 3模型，生成高质量图像
- 🖼 **Stable Diffusion**: 提供自定义图像生成能力
- 📝 **文档分析**: 支持多种格式的文档解析和分析

### 实用工具

- 🧮 **计算器**: 处理数学计算和公式推导
- 📄 **文件处理**: 支持多种文档格式的处理和分析
- 🔬 **Arxiv**: 访问和解析学术论文

## 使用额度

- 🆓 **免费用户**: 每日签到可获得200次对话机会（普通模型）
- 👑 **会员用户**: 每天享有1000次对话额度（普通模型）

## 环境变量配置

### 必需配置

#### `OPENAI_API_KEY` (必填)

OpenAI API密钥，用于访问OpenAI服务。

#### `CODE` (可选)

访问密码，多个密码用英文逗号分隔。

### 搜索功能配置

#### `SERPAPI_API_KEY` (可选)

[SerpApi: Google Search API](https://serpapi.com/) 的API密钥。

#### `BING_SEARCH_API_KEY` (可选)

[Bing Web Search API](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api) 的API密钥。

#### `CHOOSE_SEARCH_ENGINE` (可选)

直连搜索引擎选项，可选值：

- google
- baidu

### OpenAI服务配置

#### `BASE_URL` (可选)

> 默认值: `https://api.openai.com`
> 示例: `http://your-openai-proxy.com`

#### `OPENAI_ORG_ID` (可选)

OpenAI组织ID。

小光AI 只支持 OpenAI 接口模式

### OneAPI代理配置

#### `BASE_URL` (可选)

如果您使用其他API服务商提供的接口，可以通过 [OneAPI](https://github.com/songquanpeng/one-api) 进行代理转发。设置 `BASE_URL` 为您的 OneAPI 服务地址即可。

> 示例: `https://your-oneapi-service.com/v1`

OneAPI 支持多种模型服务商:

- OpenAI
- Azure OpenAI
- Claude (Anthropic)
- PaLM2 (Google)
- 智谱 AI
- 百度文心
- 讯飞星火
- 等等

通过 OneAPI 代理，您可以使用统一的接口格式访问不同厂商的模型服务。

### 存储配置

#### `ALIYUN_OSS_REGION` (可选)

阿里云OSS区域。

> 示例: `oss-cn-hangzhou`

#### `ALIYUN_OSS_BUCKET` (可选)

阿里云OSS存储桶名称。

#### `ALIYUN_OSS_ACCESS_KEY_ID` (可选)

阿里云OSS访问密钥ID。

#### `ALIYUN_OSS_ACCESS_KEY_SECRET` (可选)

阿里云OSS访问密钥密码。

#### `ALIYUN_OSS_ENDPOINT` (可选)

阿里云OSS访问域名。

> 示例: `oss-cn-hangzhou.aliyuncs.com`

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

</div>
