# SinaSpider
使用vue、koa2实现的新浪微博爬虫

## 源代码
源代码地址：🔗 [GitHub](https://github.com/renwuming/SinaSpider) 
欢迎大家 star和fork😄

##预览地址
🔗 [SinaSpider](http://54.149.135.77:7888/) 

## 技术栈
* **Vue2.0**：前端页面展示。
* **axios**：一个基于 `Promise` 的 HTTP 库，向后端发起请求。
* **Express**、**Koa2**：express作为开发阶段的webpack dev server来使用，但是无论开发环境还是生产环境的后台server都是使用的**Koa2**。
* **request**、**request-promise**：没有用Node.js原生的`http/https`模块是因为不喜欢回调函数式的异步，可读性和可维护性很差。所以选择了**request**+**request-promise**，让异步更为优雅一点。
* **cheerio**：服务器特别定制的，快速、灵活、实施的jQuery核心实现，抓取页面内容很方便。
* **ES6**、**ES7**：采用ES6语法，这是以后的趋势。自己上线的生产环境后端增加了`Async/await`，使异步更加优雅。
* **Webpack**：vue-cli自带webpack，但是很多配置项其实用不到，于是自己写了一套简洁的webpack配置，包括dev和prod的config文件，以及dev-server.js。此外，由于用到了VUX，也需要修改相应的webpack配置。
* **VUX**：基于WeUI和Vue(2.x)开发的移动端UI组件库，使用过程中也有助于对Vue的理解。

## About
GitHub：🔗[renwuming](https://github.com/renwuming)

## Build Setup

``` bash
# install dependencies, use "cnpm install" will cause some mistakes for VUX
npm install

# the front-end serve with hot reload at localhost:7878, and the back-end serve at localost:7888
npm run dev
npm run start

# build for production with minification
npm run build

# after build, run the production page at localhost:7888
npm run start

```

