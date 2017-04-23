const r = require("koa-router")()
const cheerio = require('cheerio')
const request = require('request-promise')
const j = request.jar()
const rp = request.defaults({jar: j});
const _ = require("lodash")

let cookieList = {};

const LOGIN_URL = "https://weibo.cn/login/?rand=1850956659&backURL=http%3A%2F%2Fweibo.cn&backTitle=%E6%89%8B%E6%9C%BA%E6%96%B0%E6%B5%AA%E7%BD%91&vt=4";
const HOME_URL = "http://weibo.cn/"
const SEARCH_URL = 'https://weibo.cn/search/';
const CHROME_HEADERS = 
{
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.9 Safari/536.5",
    "Content-Type": "application/x-www-form-urlencoded",
    "Referer": "http://weibo.cn/",
    "Origin": "http://weibo.cn",
    "X-Forwarded-For": "http://weibo.cn/"
}

r.get("/test", async function(ctx) {
console.log(ctx);
  this.body = "";
});

r.get("/prelogin", async function(ctx) {
  let options = 
  {
    uri: LOGIN_URL,
    transform: b => cheerio.load(b),
    // resolveWithFullResponse: true
  };
  await rp(options)
  .then($ => {
// console.log($.req)
    let formdata = {};
    formdata.action = LOGIN_URL + $('form').attr('action');
    formdata.codeImg = $('form img').attr('src');
    $('input').each((i,e) => {
      let name = $(e).attr('name'),
        val = $(e).attr('value');
      if(name.indexOf('password')>=0) {
        formdata.pwname = name;
      } else {
        formdata[name] = val;
      }
    });
    ctx.body = formdata;
  })
  .catch(err => {
    ctx.body = {err: err};
  });
});

r.post("/login", async function(ctx) {
  j.setCookie("SUB=", HOME_URL); // 清空cookie

  let q = ctx.request.body;
  q[q.pwname] = q.password,
  URI = q.action;
  delete q.action;
  delete q.password;
  delete q.pwname;
  delete q.login;
  delete q.codeImg;
  // 登录时伪装成chrome浏览器，并需要fullresponse
  let options = 
  {
    uri: URI,
    qs: q,
    headers: CHROME_HEADERS,
    // resolveWithFullResponse: true,
    // transform: b => cheerio.load(b),
  };

  await rp(options)
  .then(res => {})
  .catch(err => {
    let $ = cheerio.load(err.response.body).text();
    if($.indexOf("您请求的页面不存在如果没有自动跳转,请点击这里") >= 0) {
      ctx.body = {success: true};
    } else {
      ctx.body = {err: true};
    }
  });

  // ctx.body = await testCookie();
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
  j.setCookie("SUB=", HOME_URL); // 清空cookie
  j.setCookie(getCookie(cookie_name), HOME_URL); // 使用指定账号的cookie

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
      let intro = $("div.c").eq(2).html().split("<br>");
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
    return {success: true}; // ------- todo ------
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

let updateCookieList = (name, cookie) => {
console.log(cookie);
  if(!cookieList[name]) {
    cookieList[name] = {};
  }
  cookieList[name].cookie = cookie;
}

let getCookie = (name) => {
  // if(!cookieList[name]) {
  //   return "";
  // }
  // let list = cookieList[name].cookie.split(";"),
  //   cookie;
  // list.forEach(e => {
  //   if(e.indexOf("SUB=") >= 0) {
  //     cookie = e;
  //   }
  // });
  // return request.cookie(cookie);
  return request.cookie("SUB=_2A251-DsODeRhGeNK41sT-C3LzzWIHXVXA0VGrDV6PUJbkdAKLW_ikW0H6zM3g1YTQIQY6ext7RAAvZWsjA.."); // ------- todo ------
}

let decodeHtml = (str) => {
  if(!str) str = "";
  let s = str.replace(/&#x[\dA-F]{2,4};/g, hex => String.fromCharCode('0' + hex.slice(2, -1)) );
  return s;
}

module.exports = r
