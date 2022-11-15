export.isLoggedIn = (req, res, next) => { // 로그인 했는지 판단하는 미들웨어
    if(req.isAuthenticated()){ // 로그인상태면 true
        next();
    } else{
        res.status(403).send('로그인 필요');
    }
};

export.isNotLoggedIn = (req, res, next) => { // 로그인 안했는지 판단하는 미들웨어
    if(!req.isAuthenticated()){
        next();
    } else{
        const message = encodeURIComponent('로그인한 상태입니다');
        res.redirect(`/?error=${message}');
    }
};