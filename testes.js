const { Users } = require('./entities/Users');
const { createUser } = require('./services/UserService');


(async()=>{
    try{
        const user = new Users(112, 'arthur', 'artgfasdfa', 'password')
        createUser(user)
    }catch(error){
        console.log('deu bigode', error)
    }
})();