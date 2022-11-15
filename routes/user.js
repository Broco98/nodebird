const express = require('express');

const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
    try{
        const user = await User.findOne({ where: {id: req.user.id }}); // 내가 누군지 찾고
        if(user){
            await user.addFollowing(parseInt(req.params.id, 10)); // 내가 params.id 를 팔로윙한다. (db의 as)
            //setFollwings 를 사용하면 수정가능, but 모두 삭제후 수정이라 조심할것 (기존 팔로워들이 다 날아감)
            //removeFollwings 삭제
            //[parseInt(req.params.id,10),2,3,4] 이것처럼 복수게 등록 가능
            res.send('success');
        } else{
            res.status(404).send('no user');
        }
    } catch(err){
        console.error(err);
        next(err)
    }
});

module.exports = router;