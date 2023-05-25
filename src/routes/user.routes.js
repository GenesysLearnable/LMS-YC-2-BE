const {Router} = require('express')
const {validateUserInputs} = require('../utils/validation')

const userRouter = Router()

const  {
    signUp,
    login,
    findAUser,
    fetchAllUsers,
    updateAUser,
    removeUser,
    

} = userController = require('../controller/user.controllers')

userRouter .post('/user/register', validateUserInputs, signUp)
userRouter .post('/user/login' ,validateUserInputs, login)
userRouter .get('/users', fetchAllUsers)
userRouter .get('/user/:id', findAUser)
userRouter .patch('/user/:id', updateAUser)
userRouter .delete('/user/:id', removeUser)


module.exports = userRouter