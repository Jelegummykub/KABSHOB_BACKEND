const express = require('express');
const router = express.Router();
const { body,validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const isLogin = require('../middleware/isLogin');
const randomstring = require('randomstring');

router.post('/register',
    body('name').notEmpty().withMessage("กรุณากรอกชื่อ"),
    body('surname').notEmpty().withMessage("กรุณากรอกนามสกุล"),
    body('tel').notEmpty().withMessage("กรุณากรอกกหมายเลขโทรศัพท์"),
    body('email').notEmpty().withMessage('กรุณากรอกอีเมล'),
    body('address').notEmpty().withMessage("กรุณากรอกที่อยู่"),
    body('idline').notEmpty().withMessage("กรุณากรอกไอดีไลน์"),
    body('password').notEmpty().withMessage("กรุณากรอกรหัสผ่าน").isLength({min : 8}).withMessage("กรุณากรอก รหัสผ่านอย่างน้อย 8 ตัว"),
    body('cpassword').notEmpty().withMessage("กรุณากรอกยืนยันรหัสผ่าน").isLength({ min: 8 }).withMessage("กรุณากรอก ยืนยันรหัสผ่านอย่างน้อย 8 ตัว"),

    async(req , res) => {
        if(req.body.password){
            await body("cpassword")
            .equals(req.body.password)
            .withMessage("รหัสผ่านไม่ตรงกัน")
            .run(req);
        }
        const result = validationResult(req).formatWith(({ msg }) => {return msg ;});
        if(!result.isEmpty()){
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0],
            });
        }
        const {name , surname , tel , address , idline , email , password} = req.body;
        if(await prisma.users.count({where : {email}}) != 0)
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: "มีชื่อผู้ใช้คนนี้ใช้งานในระบบแล้ว",
        });
        const hash = await argon2.hash(password)
        const create = await prisma.users.create({
            data : {
                name,
                surname,
                tel,
                address,
                idline,
                email,
                password : hash,
            }
        })
        return res.status(200).json({
            result: true,
            status: "success",
            msg: "ทำการสมัครสำเร็จ",
        });
        
    }

)

router.post('/login',
    body('email').notEmpty().withMessage("กรูณากรอกอีเมล"),
    body('password').notEmpty().withMessage("กรุณากรอกรหัส"),

    async(req , res) => {
        const result = validationResult(req).formatWith(({msg}) => { return msg; });
        if(!result.isEmpty()){
            return res.status(400).json({
                result : false,
                status: "warning",
                msg: result.array()[0],
            })
        }

        const {email , password} = req.body
        const users = await prisma.users.findFirst({
            where : {
                email : email,
            }
        })
        if(users != null){
            if(await argon2.verify(users.password , password)){
                const token = jwt.sign({
                    id : users.id,
                    email : users.email,
                    name : users.name,
                    surname : users.surname,

                },process.env.JWT_SECERT , {expiresIn : '3h'})
                return res.status(200).json({
                    result : true,
                    token,
                    status : "success",
                    msg : "ทำการเข้าสู่ระบบสำเร็จ"
                })

            }else{
                return res.status(400).json({
                    result: false,
                    status: "warning",
                    msg: "รหัสผ่านผิดพลาด"
                })
            }
        }
        return res.status(400).json({
            result: false,
            status: "warning",
            msg: "ระบบเกิดข้อผิดพลาด"
        })
    }
)


router.get('/@me',
    isLogin(),
    (req , res) => {
        return res.status(200).json({
            result : true,
            status : "success",
            msg : "ข้อมูลผู้ใช้สำเร็จ",
            users : {
                id: req.users.id,
                email: req.users.email,
                name: req.users.name,
                surname: req.users.surname,

            }
        })
    }
)


module.exports = router;
