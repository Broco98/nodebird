const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user ? req.user.Followers.length : 0;
    res.locals.followingCount = req.user ? req.user.Followings.length : 0;
    res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
    next();
});

router.get('/profile', (req, res) => {
    res.render('profile', {title: '내정보 - NodeBird'});
});

router.get('/join', (req, res) => {
    res.render('join', {title: '회원가입 - NodeBird'});
});

router.get('/', async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick'],
            },
            order: [['createdAt', 'DESC']],
        });
        res.render('main', {
            title: 'NodeBirds',
            twits: posts,
        });
    } catch(err){
        console.log(err);
        next(err);
    }
});

//Get / hashtag?hashtag=노드 ... 실무적일땐, url에 한글이 들어가는 경우 인코드uri컴포넌트를 해주자, html에서 보내줄떄, 인코드, 서버에서 디코드
router.get('/hashtag', async (req,res,next) => {
    const query = req.query.hashtag; // ex)  = decodeURIComponent(req.query.hashtag); 이런식으로
    if(!query){
        return res.redirect('/');
    }
    try{
        const hashtag = await Hashtag.findOne({ where: { title: query} });
        let posts = [];
        if(hashtag){
            posts = await hashtag.getPosts({ include: [{ model: User, attributes: ['id', 'nick'] }]}); // include는 테이블 join과 관련이 있음 즉, 작성자까지 가져옴
            // User값들중, id와 nick만 가져온다. 설정 안하면 모두 가져오니까 해킹의 위험이 있음
            // 헤시태그에 딸려있는 post를 가져옴
        }
        return res.render('main', {
            title: `#${query}검색 결과 | NodeBirds`, // 타이틀을 바꿔줬음 ㅋㅋ
            twits: posts,
        });
    } catch(error){
        console.error(error);
        return next(error);
    }
});

module.exports = router;

