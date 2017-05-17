const r = require("koa-router")()
const cheerio = require('cheerio')
const request = require('request-promise')
const j = request.jar()
const rp = request.defaults({jar: j});
const _ = require("lodash")

let cookieList = {};

const LOGIN_URL = "https://passport.weibo.cn/sso/login";
const HOME_URL = "http://weibo.cn/"
const SEARCH_URL = 'https://weibo.cn/search/';
const CHROME_HEADERS = 
{
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.9 Safari/536.5",
    "Referer": "http://weibo.cn/",
    "Origin": "http://weibo.cn",
    "X-Forwarded-For": "http://weibo.cn/"
}

r.get("/jsonp", async function(ctx) {
  let callback = ctx.request.query.callback;
  if(callback instanceof Array) callback = callback[0];
  ctx.body = callback + "({success:true})";
});

r.post("/login", async function(ctx) {
  clearJar();

  let q = ctx.request.body;
  delete q.login;
  // 登录时伪装成chrome浏览器，并需要fullresponse
  let options = 
  {
    method: 'POST',
    uri: LOGIN_URL,
    formData: q,
    // followRedirect: false,
    headers: CHROME_HEADERS,
    resolveWithFullResponse: true,
  };

  await rp(options)
  .then(res => {
    let cookies = res.headers["set-cookie"];
    updateCookieList(q.username, cookies);
  })
  .catch(err => {
    console.log(err);
  });
  ctx.body = await testCookie();
});

r.post("/creep", async function(ctx) {
  let q = ctx.request.body,
    keyword = q.keyword,
    cookie_name = q.cookie,
    options = {
      uri: SEARCH_URL,
      qs: {
        keyword: keyword,
        suser: "找人"
      },
      transform: b => cheerio.load(b)
    },
    wblist = [],
    fanslist = [],
    creepData = {totalPage: 1, rows: []};
  clearJar();
  j.setCookie(getCookie(cookie_name), HOME_URL); // 使用指定账号的cookie
console.log(j);


  await rp(options)
  .then($ => {
    let pagestr = $('#pagelist form div').text();
    if(pagestr){
      creepData.totalPage = +pagestr.substring(pagestr.indexOf('1/')+2, pagestr.length-1);
    }
    wblist = $("input[name=uidList]").val().split(",");
    for (let i = $("table").length-1; i >= 0; i--) {
      let item = $("table").eq(i).text();
      item = item.substring(item.indexOf("粉丝"));
      item = item.substring(0, item.indexOf("人"));
      fanslist.push(item);
    };
  })
  .catch(function (err) {
    ctx.body = {err: err};
  });

  if(wblist.length<=0) {
    let test = await testCookie();
    if(test.success) {
      ctx.body = creepData;
      return;
    } else {
      ctx.body = {cookiefail: true};
      return;
    }
  }

  // 详细资料
  for (let i = 0, l = wblist.length; i < l; i++) {
    let uri = HOME_URL + wblist[i] + "/info";
    await rp({
      uri: uri,
      transform: b => cheerio.load(b)
    })
    .then($ => {
      let headimgurl = $("img[alt=头像]").attr("src");
      let intro = $("div.c").eq(3).html().split("<br>");
      intro = _.map(intro, item => decodeHtml(item));
      intro.pop();
      intro.pop();

      creepData.rows.push({
        headimgurl: headimgurl,
        introlist: intro,
        fans: fanslist[i]
      });
    })
    .catch(err => {
      ctx.body = {err: err};
    });
  };
  
  ctx.body = creepData;
  
});

async function testCookie() {
  return await rp({
    uri: HOME_URL,
    headers: CHROME_HEADERS,
    transform: b => cheerio.load(b),
  })
  .then($ => {
    let test = $(".ut").text();
    if(test.indexOf("详细资料") >= 0) {
      return {success: true};
    } else {
      return {err: true};
    }
  })
  .catch(err => {
    return {err: err};
  });
}

// 更新cookie列表
let updateCookieList = (name, cookie) => {
  if(!cookie) return;
  // 只存储SUB项
  cookie.filter(e => {
    e.indexOf("SUB=") >= 0
  });
  if(!cookieList[name]) {
    cookieList[name] = {};
  }
  cookieList[name].cookie = cookie[0];
}

// 从cookie列表读取
let getCookie = (name) => {
  if(!cookieList[name]) {
    return "";
  }
  return request.cookie(cookieList[name].cookie);
}

// 清空cookie
let clearJar = () => {
  j.setCookie("SUB=", HOME_URL);
  j.setCookie("SUHB=", HOME_URL);
  j.setCookie("SCF=", HOME_URL);
  j.setCookie("SSOLoginState=", HOME_URL);
}

// 解码html
let decodeHtml = (str) => {
  if(!str) str = "";
  let s = str.replace(/&#x[\dA-F]{2,4};/g, hex => String.fromCharCode('0' + hex.slice(2, -1)) );
  return s;
}

module.exports = r
