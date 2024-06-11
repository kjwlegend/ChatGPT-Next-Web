// eslint.config.js
//TODO 
// 更新到 ESLINT 9.4
import eslintPluginPrettier from "eslint-plugin-prettier"

export default [
  {
    files: ["**/*.js"],
    plugins: {
      prettier: eslintPluginPrettier
    },
    rules: {

    },
    ignorepatterns: ["public/serviceWorker.js"]
  }
]