var express = require('express');
var url = require('url');
var ConnectCas = require('connect-cas2');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MemoryStore = require('session-memory-store')(session);

var app = express();
var port = process.env.PORT || 8080;
app.use(cookieParser());
app.use(session({
  name: 'NSESSIONID',
  secret: 'Hello I am a long long long secret',
  resave:true,//添加这行
  saveUninitialized: true,//添加这行
  store: new MemoryStore()  // or other session store
}));

var casClient = new ConnectCas({
    ignore: [
      /\/login/
    ],
    match: [],
    servicePrefix:  process.env.SVC_PREFIX || 'http://localhost:3000',
    serverPath: process.env.SERVER_PATH || 'http://localhost:8080',
    paths: {
      validate: process.env.VALIDATE || '/cas/validate',
      serviceValidate: process.env.SVC_VALIDATE || '/cas/serviceValidate',
      proxy: process.env.PROXY || '/cas/proxy',
      login: process.env.LOGIN_PATH || '/cas/login',
      logout: process.env.LOGOUT_PATH || '/cas/logout',
      proxyCallback: ''
    },
    redirect: function(req, res) {
      // 在redirect中， 根据是否有特殊cookie来决定是否跳走
      console.log("redirect ...")
      if (req.cookies.logoutFrom) {
        // 返回您想要重定向的路径
        return url.parse(req.cookies.logoutFrom).pathname;
      }
    },
    gateway: false,
    renew: false,
    slo: true,
    cache: {
      enable: true,
      ttl: 5 * 60 * 1000,
      filter: []
    },
    fromAjax: {
      header: 'x-client-ajax',
      status: 418
    }
});

app.use(casClient.core());

// NOTICE: If you want to enable single sign logout, you must use casClient middleware before bodyParser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// or do some logic yourself
app.get('/logout', function(req, res, next) {
  // Do whatever you like here, then call the logout middleware
  console.log("logout ...")
  var fromWhere = req.get('Referer');
  var fromWhereUri = url.parse(fromWhere);

  // 根据来源判断是否是你不希望用户注销后登陆的页面，如果是的话，设置设置cookie
  if (fromWhereUri.pathname.match(/the page you dont want user to login after logout/)) {
    res.cookie('logoutFrom', fromWhereUri.pathname);
  }
  casClient.logout()(req, res);
});

app.get('/login', (req, res) => res.send('<a href="/">login</a>'))
app.get('/', function(req, res) {
    console.log('+++ req.sessionID: ' + req.sessionID);
    console.log('=== req.session: \n' + req.session);
    res.send('User ' + req.session.cas.user  +' Login Successful!  <a href="/logout">Logout</a>');
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))