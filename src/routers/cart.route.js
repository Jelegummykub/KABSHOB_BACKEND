const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult, check } = require('express-validator');
const prisma = new PrismaClient()
const isLogin = require('../middleware/isLogin');
const router = express.Router();

//Create Cart

router.post('/:Cart', isLogin(),
    body('quantity').notEmpty().withMessage("กรุณากรอกจำนวน"),
    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg)
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            })
        }
        const { Cart } = req.params;
        const { quantity } = req.body;
        const itemId = parseInt(Cart);
        if (isNaN(itemId)) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "กรุณากรอกเป็นตัวเลข"
            })
        }

        const isCheck = await prisma.storeitem.findFirst({
            where: {
                id: itemId,
                isActive: true
            }
        })

        if (!isCheck) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "ไม่พบข้อมูลร้านนี้ในฐานข้อมูล"
            })
        }

        const cartData = {
            quantity: parseInt(quantity),
            storeitem: {
                connect: {
                    id: itemId
                }
            },
            user: {
                connect: {
                    id: req.users.id
                }
            }
        }
        const newCart = await prisma.Cart.create({ data: cartData })

        if (!newCart) {
            return res.status(500).json({
                result: false,
                status: "error",
                msg: "เกิดข้อผิดพลาดในการสร้างข้อมูล"
            })
        }
        return res.status(200).json({
            result: true,
            status: "success",
            msg: "เพิ่มข้อมูลสินค้าสำเร็จ"
        })
    }
)

//Update cart

router.put('/:cart/:id', isLogin(),
    body('quantity').notEmpty().withMessage("กรุณากรอกจำนวน"),
    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg)
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            })
        }
        const id = req.params.id;
        if(isNaN(id)){
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "กรุณากรอกเป็นตัวเลข"
            })
        }
        const isCheck = await prisma.Cart.findFirst({
            where: {
                id: parseInt(id)
            }
        })

        if (!isCheck) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "ไม่พบข้อมูลร้านนี้ในฐานข้อมูล"
            })
        }

        const { quantity } = req.body

        await prisma.Cart.update({
            where: {
                id: parseInt(id)
            },
            data: {
                quantity : parseInt(quantity),
            }
        })
        return res.status(200).json({
            result: true,
            status: "success",
            msg: "อัปเดตข้อมูลสินค้าสำเร็จ"
        })
    }
)


module.exports = router;
