const { createUser } = require('./services/UserService');


(async()=>{
    try{
        const result = await createUser({
            id:1,
            name:'arthur',
            email:'arthur@gmail.com',
            password:'teste123'
        });
        console.log('beleza')
    }catch(error){
        console.log('deu bigode', error)
    }
})();