const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const {sequelize} = require('./models');

const app = express();
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views',{
    express: app,
    watch: true
});
sequelize.sync({force: false}) // sequelize가 db모델 변경된경우 지우고 다시 만들어줌 true일 경우, 실서비스때는 사용X!! 주의
    .then(()=>{
        console.log('데이터베이스 연결성공');
    })
    .catch((err)=>{
        console.log(err);
    });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
})); // 세션을 저장해두니까
 
// express session 밑에, 라우터 위에 위치해야함
// 세션을 받아서 처리해야 하므로
// 로그인 후 팔로우등 작업을할때 필요, 사용.
app.use(passport.initialize());
app.use(passport.session()); // 세션쿠키를 받아서, id를 알아냄 (해석) -> deserializeUser에 id보냄 -> id로 유저를 찾아서 유저 전체정보 복구해줌
// req.user로 접근 가능

app.use('/', pageRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    next(error);
});
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
    // res.status(err.status || 500).render('error') 체이닝도 가능하다!
})

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기중');
})