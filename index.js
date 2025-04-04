const { User, Users } = require('./entities/Users');
const { Company } = require('./entities/Company');

const arthur = new Users("1", "Arthur", "arthur@email.com", "1234");
const empresaX = new Company("10", "Empresa X", arthur);

empresaX.addUser(arthur);

console.log(empresaX.getUsers());