// User sequelize 모델 -> db의 테이블 즉, 테이블 그 자체라고 생각. 데이터가 담겨있음
const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({ // id PK생략
                email: {
                    type: Sequelize.STRING(40),
                    allowNull: true,
                    unique: true,
                },
                nick: {
                    type: Sequelize.STRING(15),
                    allowNull: false,
                },
                password: {
                    type: Sequelize.STRING(100), //hash화 되면 길이가 늘어나니까 넉넉하게
                    allowNull: true, // SNS로 로그인하면 없을 수 있다.
                },
                provider: { // 로그인 제공자 local ex) 네이버, 애플, 구글 등등
                    type: Sequelize.STRING(10),
                    allowNull: false,
                    defaultValue: 'local',
                },
                snsId: {
                    type: Sequelize.STRING(30),
                    allowNull: true,
                },
            },
            {
                sequelize,
                timestamps: true, // 생성일, 수정일 자동생성
                underscored: false, 
                modelName: 'User',
                tableName: 'users',
                paranoid: true, // 삭제한 척 하는것 / 삭제일 자동생성
                charset: 'utf8', // 한글 입력을 위해서!
                collate: 'utf8_general_ci',
            });
    }
    static associate(db){
        db.User.hasMany(db.Post);
        db.User.belongsToMany(db.User, {
            foreignKey: 'followingId', // 외래키 이름
            as: 'Followers', // followingId랑 반대로 적어야함 ex, 연예인의 팔로워를 가져오려면, followingId를 알아야함.
            through: 'Follow',
        });
        db.User.belongsToMany(db.User, {
            foreignKey: 'followerId',
            as: 'Followings', // 내가 팔로윙한 사람을 가져오려면, 내 id, 즉 followerId가 필요
            through: 'Follow',
        });
    }
}
