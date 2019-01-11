var express = require('express');
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
    servicePrefix:  process.env.SVC_PREFIX || 'https://cas-nodejs-demo.herokuapp.com',
    serverPath: process.env.SERVER_PATH || 'https://casserver.herokuapp.com',
    paths: {
      validate: process.env.VALIDATE || '/cas/validate',
      serviceValidate: process.env.SVC_VALIDATE || '/cas/serviceValidate',
      proxy: process.env.PROXY || '/cas/proxy',
      login: process.env.LOGIN_PATH || '/cas/login',
      logout: process.env.LOGOUT_PATH || '/cas/logout',
      proxyCallback: ''
    },
    redirect: false,
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
  casClient.logout()(req, res, next);
});

app.get('/login', (req, res) => res.send('<a href="/">login</a>'))
app.get('/', function(req, res) {
    console.log('++++++++++++++++++++++ req.sessionID ');
    console.log(req.sessionID);

    console.log('++++++++++++++++++++++ req.session.json ');
    console.log(req.session.cookie.toJSON());
    
    console.log('================ req.session ');
    

    console.log(req.session);
    console.log(req.session.lastUrl);
    console.log(req.session.cas.user);

    console.log('######################## ');
    
    res.send('Login Successful! \nWelcome ' + req.session.cas.user );
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))