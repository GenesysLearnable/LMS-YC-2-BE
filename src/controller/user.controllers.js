const checkValidId  = require('../utils/validateID')
const { MESSAGES } = require('../config/constant.config')
const usersServices = require('../services/user.services')
const bcrypt = require('bcrypt')

const {
    createUser,
    getAUserById,
    deleteUser,
    updateUser,
    getAllUsers,
    getAUserByEmail
} = usersServices
const rounds = parseInt(process.env.ROUNDS)


class userControllers {
    async signUp(req, res) {
        try {
            const { password, email } = req.body;
            const findUserEmail = await getAUserByEmail({ email: email });
            if (findUserEmail || !email) {
                return res.status(400).send({ success: false, message: MESSAGES.USER.DUPLICATE_EMAIL });
            }
            if (!password) {
                return res.status(400).send({ success: false, message: MESSAGES.USER.INCORRECT_DETAILS });

            }

            const salt = await bcrypt.genSalt(rounds);
            const hidden_Password = await bcrypt.hash(password, salt);
            const user = await createUser({
                ...req.body,
                password: hidden_Password,
            });
            return res.status(200).send({
                success: true,
                message: MESSAGES.USER.CREATED,
                data: user
            });

        }
        catch (err) {
            return {
                success: false,
                message: MESSAGES.USER.ERROR + err.message
            };
        }
    }

    //loginIn user
    async login(req, res) {
        try {
            const { email, password } = req.body

            const user = await getAUserByEmail({
                email: email
            })

            if (!user) {
                return res.status(404).send({ message: 'Please register your details before logging in' || err.message, success: false })
            }

            if (!password) {
                return res.status(404).send({ message: 'Please input your password to continue' })
            }
            const check = await bcrypt.compare(req.body.password, user.password)
            if (check) {
                return res.status(200).send({
                    message: 'Login Successful',
                    success: true,
                })
            } else {
                return res.status(409).send({
                    message: 'Incorrect password',
                    status: false
                })
            }
        } catch (err) {
            return {
                success: false,
                message: MESSAGES.USER.ERROR + err.message
            };
        }
    }

    //delete user
    async removeUser(req, res) {
        try {
            const { id } = req.params
            console.log(req.params);
            //check if the user exists
            const check = checkValidId(id)
            console.log(check);
            if (check) {
                const findUser = await getAUserById(id)
                console.log(findUser);
                if (findUser) {
                    const deleted = await deleteUser(id)
                    if (deleted) {
                        return res.status(200).send({
                            success: true,
                            message: MESSAGES.USER.ACCOUNT_DELETED
                        })
                    } else {
                        return res.status(409).send({
                            success: false,
                            message: MESSAGES.USER.NOT_ACCOUNT_DELETED
                        })
                    }
                } else {
                    return res.status(200).send({
                        success: false,
                        message: MESSAGES.USER.ACCOUNT_NOT_REGISTERED
                    })
                }
            } else {
                return res.status(409).send({
                    success: false,
                    message: MESSAGES.USER.INVALID_ID
                })
            }
        } catch (err) {
            return {
                message: MESSAGES.USER.ERROR + err.message,
                success: false,
            };
        }
    }

    //update a user 
    async updateAUser(req, res) {
        try {
            const { id } = req.params
            //check  if valid id
            const check = checkValidId(id)
            if (check) {
                const findUser = await getAUserById(id)
                console.log(findUser);
                if (findUser) {
                    const updated = await updateUser(id, req.body)
                    if (updated) {
                        return res.status(200).send({
                            success: true,
                            message: MESSAGES.USER.ACCOUNT_UPDATED
                        })
                    } else {
                        return res.status(409).send({
                            success: false,
                            message: MESSAGES.USER.NOT_UPDATED
                        })
                    }
                } else {
                    return res.status(400).send({
                        success: false,
                        message: MESSAGES.USER.ACCOUNT_NOT_REGISTERED
                    })
                }
            } else {
                return res.status(400).send({
                    success: false,
                    message: MESSAGES.USER.INCORRECT_DETAILS
                })
            }
        } catch (error) {
            return {
                message: MESSAGES.USER.ERROR + err.message,
                success: false,
            };
        }
    }


    //get a user
    async findAUser(req, res) {
        try {
            const { id } = req.params
            //check  if valid id
            const check = checkValidId(id)
            if (check) {
                const findUser = await getAUserById(id)
                if (findUser) {
                    return res.status(200).send({
                        success: true,
                        message: MESSAGES.USER.USER_FOUND,
                        data: findUser
                    })
                }
                return res.status(400).send({
                    success: false,
                    message: MESSAGES.USER.USER_NOT_FOUND
                })
            }
        } catch (error) {
            return {
                message: MESSAGES.USER.ERROR + err.message,
                success: false,
            };
        }
    }


    //get all users
    async fetchAllUsers(req, res) {
        try {
            const getUsers = await getAllUsers()
            if (getUsers) {
                return res.status(200).send({
                    success: true,
                    message: MESSAGES.USER.USER_FOUND,
                    data: getUsers
                })
            }
            return res.status(400).send({
                success: false,
                message: MESSAGES.USER.USER_NOT_FOUND
            })
        }
        catch (error) {
            return {
                message: MESSAGES.USER.ERROR + err.message,
                success: false,
            };
        }
    }
}
module.exports = new userControllers()