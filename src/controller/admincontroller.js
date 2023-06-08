const adminService = require('../services/admin.services')
const checkValidId = require('../utils/validateID')
const { MESSAGES } = require('../config/constant.config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const rounds = +process.env.ROUNDS

class AdminController {
    //create an user     
    async registerAdmin(req, res) {
        const { email, password } = req.body
        try {
            // check if admin exist 
            const existingAdmin = await adminService.getAdmin({
                email: email
            })

            if (existingAdmin) {
                return res.status(404).send({
                    message: 'Admin already exist',
                    success: false
                })
            }

            if (!email || !password)
                return res.status(400).send({
                    message: 'Email address and password are required',
                    success: false
                });

            const salt = await bcrypt.genSalt(rounds);
            const hidden_Password = await bcrypt.hash(password, salt);
            const admin = await adminService.createAdmin({
                ...req.body,
                password: hidden_Password,
            })

            return admin
                ? res.status(201).send({
                    message: 'Admin created successfully',
                    success: true,
                    admin
                })
                : res.status(400).send({
                    message: 'Admin not created',
                    success: false
                });

        } catch (error) {
            return res.status(500).send({
                message: 'An Error: ' + error.message,
                success: false
            })
        }
    }

    //loginIn user

    async loginUser(req, res, next) {
        try {

            let user = await adminService.getAdmin({ email: req.body.email })
            if (!user) {
                return res.status(404).send({
                    message: MESSAGES.USER.INCORRECT_DETAILS,
                    success: false
                });
            }

            if (!(await bcrypt.compare(req.body.password, user.password))) {
                return res.status(403).send({
                    message: MESSAGES.USER.INCORRECT_DETAILS,
                    success: false
                });
            }
            const token = jwt.sign(user.id, process.env.SECRET_KEY)
            let { password, ...data } = await user
            return res.status(200).send({
                message: 'Login Successful',
                success: true,
                data,
                token
            });
        } catch (err) {
            return res.status(500).send({
                message: 'Internal Server Error' + err,
                success: false
            });
        }
    };


    //logout user
    async loggedout(req, res, next) {
        // req.logout(function (err) {
        //     if (err) {
        //         return next(err);
        //     }
        //     return res.status(200).send({
        //         message: 'Loggedout Successful',
        //         success: true
        //     });
        // });
    };



    // get all admin
    async getAdmins(req, res) {
        try {
            const admins = await adminService.getAllAdmin({})
            if (!admins) {
                return res.status(404).send({
                    message: 'Admins not found' || err.message,
                    success: false
                })
            } else {
                return res.status(200).send({
                    message: 'Admins found successfully',
                    data: admins
                })
            }

        } catch (error) {
            return res.status(500).send({
                message: 'Error: ' + error.message,
                success: false
            })
        }

    }
    // get a single admin
    async getOneAdmin(req, res) {

        // check if the admin exists
        try {
            const { id } = req.params
            const check = checkValidId(id)
            if (check) {
                const existingAdmin = await adminService.getAdmin({
                    _id: id
                })
                if (!existingAdmin) {
                    return res.status(404).send({
                        message: 'Admin does not exist',
                        success: false
                    })
                } else {
                    // returns true if the admin exist
                    return res.status(200).send({
                        message: 'Admin fetched successfully',
                        success: true,
                        data: existingAdmin
                    });
                }
            } else {
                //if inputted id is invalid
                return res.status(400).send({
                    message: 'Invalid id',
                    success: false
                })
            }
        } catch (error) {
            return res.status(500).send({
                message: 'Error: ' + error.message,
                success: false
            })
        }

    }

    // edit an admin
    async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const check = checkValidId(id);
            if (check) {
                const existingAdmin = await adminService.getAdmin({ _id: id });
                if (!existingAdmin) {
                    return res.status(404).send({
                        message: 'Admin does not exist',
                        success: false
                    });
                }

                // Update the admin's password
                const salt = await bcrypt.genSalt(rounds);
                const hashedPassword = await bcrypt.hash(req.body.password, salt);

                // Update the admin's password
                const updated = await adminService.editAdminById(id, { password: hashedPassword });
                return res.status(200).send({
                    message: 'Admin updated successfully',
                    admin: updated,
                    success: true
                });
            } else {
                return res.status(400).send({
                    message: 'Invalid id',
                    success: false
                });
            }
        } catch (error) {
            return res.status(500).send({
                message: 'Error: ' + error.message,
                success: false
            });
        }
    }


    // delete an admin
    async deleteOne(req, res) {

        // check if an admin exist before deleting
        try {
            const { id } = req.params
            const check = checkValidId(id)
            if (check) {
                const existingAdmin = await adminService.getAdmin({
                    _Id: id
                })
                if (!existingAdmin) {
                    return res.status(404).send({
                        message: 'Invalid Admin',
                        success: false
                    })
                }
                // delete user if the admin was found
                await adminService.deleteAdminById(id)
                return res.status(200).send({
                    message: 'Admin deleted',
                    success: true,
                })
            } else {
                //if inputted id is invalid
                return res.status(400).send({
                    message: 'Invalid id',
                    success: false
                })
            }
        } catch (error) {
            return res.status(500).send({
                message: 'Error: ' + error.message,
                success: false
            })
        }
    }

}
module.exports = new AdminController()