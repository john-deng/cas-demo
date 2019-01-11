var express = require('express');
var ConnectCas = require('connect-cas2');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MemoryStore = require('session-memory-store')(session);

var app = express();
const port = 5000;
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
      /\/ignore/
    ],
    match: [],
    servicePrefix: 'https://cas-nodejs-demo.herokuapp.com',
    serverPath: 'https://casserver.herokuapp.com',
    paths: {
      validate: '/cas/validate',
      serviceValidate: '/cas/serviceValidate',
      proxy: '/cas/proxy',
      login: '/cas/login',
      logout: '/cas/logout',
      proxyCallback: ''
    },
    redirect: false,
    gateway: false,
    renew: false,
    slo: true,
    cache: {
      enable: false,
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
  casClient.logout()(req, res, next);
});

app.get('/', (req, res) => res.send('Login Successful!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))