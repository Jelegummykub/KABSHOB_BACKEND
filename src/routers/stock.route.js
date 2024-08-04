const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();
const isLogin = require('../middleware/isLogin');
const router = express.Router();

//Create stock

router.post('/stock', isLogin(),

    body('billId').isInt().withMessage('กรุณากรอกเป็นตัวเลข'),
    body('storeItemId').isInt().withMessage('กรุณากรอกเป็นตัวเลข'),

    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg);
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            })
        }

        const { billId, storeItemId } = req.body;

        const isCheck = await prisma.bill.findFirst({
            where: {
                id: parseInt(billId),
            }
        })

        if (!isCheck) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "ไม่พบข้อมูลร้านนี้ในฐานข้อมูล"
            })
        }

        await prisma.stock.create({
            data: {
                billId: parseInt(billId),
                storeItemId: parseInt(storeItemId),
            }
        })

        return res.status(200).json({
            result: true,
            status: "success",
            msg: "เพิ่มข้อมูลสินค้าสำเร็จ"
        })
    }
)

//Update stock

router.put('/stock/:id', isLogin(),
    body('billId').isInt().withMessage('กรุณากรอกเป็นตัวเลข'),
    body('storeItemId').isInt().withMessage('กรุณากรอกเป็นตัวเลขs'),
    async (req , res) => {
        const result = validationResult(req).formatWith(({msg}) => msg)
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            })
        }
        const { id } = req.params
        const { billId, storeItemId } = req.body
        if(isNaN(id)){
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "กรุณากรอกเป็นตัวเลข"
            })
        }
        const isCheck = await prisma.stock.findFirst({
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

        await prisma.stock.update({
            where : {
                id : parseInt(id),
            },
            data : {
                billId: billId ? parseInt(billId) : isCheck.billId,
                storeItemId: storeItemId ? parseInt(storeItemId) : isCheck.storeItemId,
            }
        })
        return res.status(200).json({
            result: true,
            status: "success",
            msg: "อัปเดตข้อมูลสินค้าสำเร็จ",
        })
    }
)

module.exports = router;
