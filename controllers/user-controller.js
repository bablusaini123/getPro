const userRouter = require('express').Router()
const User = require('../model/user')
const Query = require('../model/query')
const Worksample = require('../model/worksample')
const Authors = require('../model/authors')
const Faqs = require('../model/faqs')
const Blog = require("../model/blog")
const Services = require("../model/services")
const AddCart = require("../model/addCard")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator')

module.exports.register = async (req, res) => {

    let username = req.body.username;
    let email = req.body.email;
    let Originalpassword = req.body.password
    try {
            let password= await bcrypt.hash(Originalpassword, 10)
            let existUsername = await User.findOne({ username: req.body.username })
            let existEmail = await User.findOne({ email: req.body.email })
            if (existUsername === null) {
                if (existEmail === null) {
                    if(req.body.password === req.body.confirmPassword){
                        const userData = new User({ username: username, email: email, password: password, status: "active" })
                        await userData.save()
                        res.status(201).json({
                            message: "successfully register"
                        })
                    }
                    else{
                        res.status(404).json({
                            message: 'please enter same password'
                        })
                    }
                } else {
                    res.status(404).json({
                        message: 'your email id is already exist'
                    })
                }
    
            } else {
                res.status(404).json({
                    message: 'your username is already exist'
                })
            }
    } catch (error) {
        res.json({
            error: error.message
        })
    }
}

module.exports.login = async (req, res) => {
    try {
        const usernameData = await User.findOne({ username: req.body.username })
        const emailData = await User.findOne({ email: req.body.username })

        if (usernameData == null && emailData == null) {
            res.status(404).json({
                error: "your account does not found"
            })
        }
        else if (usernameData !== null) {
            let bcryptMatchPassword = await bcrypt.compare(req.body.password, usernameData.password)
            if (bcryptMatchPassword === true) {
                let userId = usernameData._id
                var token = jwt.sign({ userId }, 'zxcvbnm');
                console.log("token")
                res.cookie('userLoginToken', token)
                res.status(200).json({
                    message: "successfully login"
                })
            } else {
                res.status(404).json({
                    message: "your password is incorrect"
                })
            }

        } else if (emailData !== null) {
            let bcryptMatchPassword2 = await bcrypt.compare(req.body.password, emailData.password)
            if (bcryptMatchPassword2 === true) {
                let userId = emailData._id
                var token = jwt.sign({ userId }, 'zxcvbnm');
                res.cookie('userLoginToken', token)
                console.log(token)
                console.log(userId)
                res.status(200).json({
                    message: "successfully login"
                })

            } else {
                res.status(404).json({
                    message: "your password is incorrect"
                })
            }
        }

    }
    catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}



module.exports.forgetPassword = async (req, res) => {

    //  let password = await bcrypt.hash(req.body.password, 10)
    try {
        let existEmail = await User.findOne({ email: req.body.email })
        let otp = otpGenerator.generate(10, { upperCaseAlphabets: false, specialChars: false });
        let password = await bcrypt.hash(otp, 10)
        if (existEmail !== null) {
            await User.findByIdAndUpdate(existEmail._id, { password: password })
            const mailTransporter = nodemailer.createTransport({
                host: `smtp.gmail.com`,
                port: 465,
                secure: true,
                auth: {
                    "user": "bablusaini90310@gmail.com",
                    "pass": "zeczopkmiqbvbffc"
                }
            })

            let mailDetails = {
                from: 'bablusaini90310@gmail.com',
                to: req.body.email,
                subject: 'Test mail',
                text: otp
            };

            mailTransporter.sendMail(mailDetails, function (err, data) {
                if (err) {
                    console.log(err)
                } else {

                    console.log(otp)

                    res.status(200).json({
                        message: "mail have sent successfully"
                    })
                }
            });
        } else {
            res.status(404).json({
                message: 'your email is not exist'
            })
        }

    } catch (error) {
        res.json({
            error: error.message
        })
    }
};

module.exports.getworkSample = async (req, res) => {
    try {
        const workSampleData = await Worksample.find()
        res.status(200).json({
            data: workSampleData
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

module.exports.getAuthor = async (req, res) => {
    try {
        const id= req.params.id
        const authorsData = await Authors.findById(id)
        res.status(200).json({
            data: authorsData
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


module.exports.getAuthors = async (req, res) => {
    try {
        const authorsData = await Authors.find()
        res.status(200).json({
            data: authorsData
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

module.exports.getFaqs = async (req, res) => {
    try {
        const faqsData = await Faqs.find()
        res.status(200).json({
            data: faqsData
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

module.exports.getBlog = async (req, res) => {
    try {
        const blogData = await Blog.find()
        res.status(200).json({
            data: blogData
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

module.exports.getServices = async (req, res) => {
    try {
        const ServicesData = await Services.find()
        res.status(200).json({
            data: ServicesData
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

module.exports.userLogout = async (req, res) => {
    res.clearCookie('userLoginToken');
    res.status(200).json({
        message: "successfully logout"
    })
}

module.exports.addCart = async (req, res) => {

    try {
        const productId = req.params.id
        const token = req.cookies.userLoginToken
        console.log(token)
        const verifyTokenId = jwt.verify(token, "zxcvbnm")
        const UserDetails=await User.findById(verifyTokenId.userId)
        let addCart = new AddCart({ custemerId: UserDetails.email, productId: productId })
       await addCart.save()
        res.status(200).json({
            message: "cart added"
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}

module.exports.viewCart = async (req, res) => {

    try {
        const token = req.cookies.userLoginToken
        const verifyTokenId = jwt.verify(token, "zxcvbnm")
        const UserDetails=await User.findById(verifyTokenId.userId)
        let CartData = await AddCart.find({custemerId:UserDetails.email}).populate("productId")
        console.log(verifyTokenId.userId)
        console.log(CartData)
        res.status(200).json({
            message: CartData
        })
    } 
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}