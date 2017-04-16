const port = process.env.PORT || '7888';
const path = require("path")
const koa = require("koa")
const convert = require("koa-convert")
const server = require("koa-static")
const views = require('koa-views');
const router = require("./router")
const bodyParser = require('koa-bodyparser')

const app = new koa();

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.use(convert(server(
  path.join(__dirname, "../dist")
)));

app.use(views(__dirname + '/views', {
    map: {
        html: 'swig'
    }
}));

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
