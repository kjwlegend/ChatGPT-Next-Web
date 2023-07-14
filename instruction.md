## 结构

/app // Next.js 13 应用目录
/layouts  
 /components
/pages
/templates

/styles // 全局样式文件

/hooks // 自定义 Hooks

/store // Redux 状态管理
store.js
reducers.js
actions.js

/public // 静态资源目录
favicon.ico

/utils // 工具函数目录

/services // 数据请求层目录

/constants // 常量目录

/types // Typescript 类型目录

next.config.js // Next 配置文件

package.json // 项目依赖信息

README.md // 项目说明文档

### 登录

1. 登录页面组件
   一个页面组件来包含登录表单,调用登录函数。
2. 用户认证服务
   一个服务模块,实现调用后端 API,进行用户认证和登录。
3. 用户信息存储
   需要一个统一的存储用户信息的地方,比如 Redux store。
4. 登录状态处理
   处理登录成功后跳转登录状态页面,并存储登录状态。
5. 权限校验组件
   共享组件对需要登录后访问的页面做拦截校验。
6. 退出登录功能
   清除登录状态,返回未登录状态。
   按这个思路,我们需要登录页面组件、认证服务、状态存储、登录流程处理、权限校验组件等模块来完成登录功能。如果您还有其他需要准备的模块,请告知我去补充。感谢您的指导,我们一步步来完成登录功能。
