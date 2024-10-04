const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();
const isLogin = require('../middleware/isLogin');
const router = express.Router();

// Create bill
router.post('/:bill', isLogin(),
    body('totalprice').notEmpty().withMessage("กรุณากรอกราคา").isFloat().withMessage("กรุณากรอกราคาที่ถูกต้อง"),
    body('itemdetail').isJSON().withMessage("กรุณากรอกรายละเอียดสินค้าเป็น JSON"),
    body('status').notEmpty().withMessage("กรุณากรอกสถานะ").isIn(['pending', 'completed']).withMessage("สถานะไม่ถูกต้อง"),
    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg);
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            });
        }

        const { bill } = req.params;
        const { totalprice, itemdetail, status } = req.body;

        try {
            const parsedItemDetail = JSON.parse(itemdetail);  // Parse itemdetail to a valid JSON object/array

            await prisma.bill.create({
                data: {
                    totalprice: parseFloat(totalprice),
                    itemdetail: parsedItemDetail,
                    status,
                    user: {
                        connect: {
                            id: req.users.id  // Ensure the user ID is available in req.users
                        }
                    }
                }
            });

            return res.status(200).json({
                result: true,
                status: "success",
                msg: "เพิ่มข้อมูลสำเร็จ"
            });
        } catch (error) {
            return res.status(500).json({
                result: false,
                status: "error",
                msg: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล",
                error: error.message
            });
        }
    }
);

// Update bill
router.put('/:bill/:id', isLogin(),
    body('totalprice').notEmpty().withMessage("กรุณากรอกราคา").isFloat().withMessage("กรุณากรอกราคาที่ถูกต้อง"),
    body('itemdetail').isJSON().withMessage("กรุณากรอกรายละเอียดสินค้าเป็น JSON"),
    body('status').notEmpty().withMessage("กรุณากรอกสถานะ").isIn(['pending', 'completed']).withMessage("สถานะไม่ถูกต้อง"),
    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg);
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            });
        }

        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "กรุณากรอกเป็นตัวเลข"
            });
        }

        const isCheck = await prisma.bill.findFirst({
            where: { id: parseInt(id) }
        });

        if (!isCheck) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "ไม่พบข้อมูลร้านนี้ในฐานข้อมูล"
            });
        }

        const { totalprice, itemdetail, status } = req.body;

        try {
            const parsedItemDetail = JSON.parse(itemdetail);  // Parse itemdetail to a valid JSON object/array

            await prisma.bill.update({
                where: { id: parseInt(id) },
                data: {
                    totalprice: parseFloat(totalprice),
                    itemdetail: parsedItemDetail,
                    status
                }
            });

            return res.status(200).json({
                result: true,
                status: "success",
                msg: "อัปเดตข้อมูลสำเร็จ"
            });
        } catch (error) {
            return res.status(500).json({
                result: false,
                status: "error",
                msg: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
                error: error.message
            });
        }
    }
);

module.exports = router;
