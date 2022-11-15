// 아이디, 비밀번호로 로그인 하는 경우
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try{
            const exUser = await User.findOne({ where: { email } });
            if(exUser){
                const result = await bcrypt.compare(password, exUser.password);
                if(result){
                    done(null, exUser); // 서버에러, 로그인 성공했을때 유저객체, 로그인 실패
                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다' }); // 로그인이 실패한 경우
                }
            } else{
                done(null, false, { message: '가입되지 않은 회원입니다' }); // 로그인이 실패한 경우
            }
        } catch(error) {
            console.error(error);
            done(error); // 서버 에러인 경우
        }
    }));
};