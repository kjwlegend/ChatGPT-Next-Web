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

### Azure配置

#### `AZURE_URL` (可选)

> 示例: https://{azure-resource-url}/openai/deployments/{deploy-name}

#### `AZURE_API_KEY` (可选)

Azure API密钥。

#### `AZURE_API_VERSION` (可选)

Azure API版本。

### 功能控制

#### `HIDE_USER_API_KEY` (可选)

设置为1时禁用用户自行填入API Key。

#### `DISABLE_GPT4` (可选)

设置为1时禁用GPT-4模型。

#### `ENABLE_BALANCE_QUERY` (可选)

设置为1时允许余额查询。

#### `DISABLE_FAST_LINK` (可选)

设置为1时禁用URL参数解析。

#### `CUSTOM_MODELS` (可选)

> 示例: `+llama,+claude-2,-gpt-3.5-turbo`
> 自定义模型控制，使用+添加模型，使用-隐藏模型。

### 存储配置

#### `R2_ACCESS_KEY_ID` (可选)

Cloudflare R2访问密钥ID。

#### `R2_SECRET_ACCESS_KEY` (可选)

Cloudflare R2密钥。

#### `R2_BUCKET` (可选)

Cloudflare R2 Bucket名称。

</div>
