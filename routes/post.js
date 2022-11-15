const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { inLoggedIn, isLoggedIn} = require('./middlewares');

const router = express.Router();

try{
    fs.readdirSync('uploads');
} catch(error){
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb){
            cb(null, 'uploads/');
        },
        filename(req, file, cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now()+ ext); // 이름뒤에 날짜 붙이기
        },
    }),
    limits: {fileSize: 5*1024*1024}, // 파일 용량 제한
});

//single()의 키가 일치해야한다?
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    res.json({url: `/img/${req.file.filename}`}); // 요청과 실제 파일 루트가 다르다! 실제 파일은 uploads폴더에 존재 -> express.static이 가능하게 함
    // url을 프론트에 보내서, 이미지와 게시글이 묶여있게끔 함
});

// 이미지 따로, 게시글 따로 업로드!
// 그 이유는, 어떤 사람이 용량이 큰 이미지를 올릴떄, 압축하는데 시간이 오래 걸려서, 업로드 하는데 오래 걸림, but 따로따로 하면, 이미지 압축하고, 게시글 치는 시간에 업로드하고 있음! -> 사용자 경험이 좋아진다.
const upload2 = multer(); // 이미지는 이미 업로드 돼있으므로
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try{
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            UserId: req.user.id,
        });
        const hashtags = req.body.content.match(/#[^s#]*/g); // hashtag 정규표현식을 사용해서, hashtag인식 #으로시작해서 띄어쓰기랑 #이 아닌 애들 모두를 골라라!
        if(hashtags){
            const result = await Promise.all( // 모든 시퀄라이즈는 async이므로, promise임. 모든 시퀄라이즈 처리를 위한 all
                hashtags.map(tag => { // [#노드, #익스프레스] 등의 hashtags 배열을 -> [노드, 익스프레스]로 바꿔서, findOrCreate로, hashtag 설정
                    return Hashtag.findOrCreate({ // 중복저장 방지
                        where: { title: tag.slice(1).toLowerCase()}, // #때고, lowercase로 생성
                    })
                }),
            );
            await post.addHashtags(result.map(r => r[0])); // 복수형으로 사용 belongsToMany니까
            // result가 [[헤시태그, true],[헤시태그, true]...] 이런식의 2차원 배열로 나오므로, 헤시테그만 처리
            // post는 create의 결과물!
            // id를 넣어도 되고, 이것처럼 객체를 넣어줘도 상관없다 ex) addHashtage([1,2,3,4,])
        }
        res.redirect('/');
    } catch(error){
        console.error(error);
        next(error);
    }
});

module.exports = router;