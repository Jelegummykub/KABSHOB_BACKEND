const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult, check } = require('express-validator');
const prisma = new PrismaClient()
const isLogin = require('../middleware/isLogin');
const router = express.Router();

//Create bill
router.post('/:bill', isLogin(),
    body('totalprice').notEmpty().withMessage("กรุณากรอกราคา"),
    body('itemdetail'),
    body('status').notEmpty().withMessage("กรุณากรอกสถานะ"),
    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg)
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            })
        }
        const { bill } = req.params
        const { totalprice, itemdetail, status } = req.body

        await prisma.bill.create({
            data: {
                totalprice: parseFloat(totalprice),
                itemdetail: JSON,
                status,
                user: {
                    connect: {
                        id: req.users.id
                    }
                }
            }
        })
        return res.status(200).json({
            result: true,
            status: "success",
            msg: "เพิ่มข้อมูลสำเร็จ"
        })
    }
)

//Update bill

router.put('/:bill/:id', isLogin(),
        body('totalprice').notEmpty().withMessage("กรุณากรอกราคา"),
        body('itemdetail'),
        body('status').notEmpty().withMessage("กรุณากรอกสถานะ"),
    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg)
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            })
        }

        const id = req.params.id
        if (isNaN(id)) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "กรุณากรอกเป็นตัวเลข"
            })
        }

        const isCheck = await prisma.bill.findFirst({
            where: {
                id: parseInt(id)
            }
        });

        if (!isCheck) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "ไม่พบข้อมูลร้านนี้ในฐานข้อมูล"
            })
        }

        const { totalprice, itemdetail, status } = req.body

        await prisma.bill.update({
            where: {
                id: parseInt(id)
            },
            data: {
                totalprice: parseFloat(totalprice),
                itemdetail: JSON,
                status
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
