const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();
const isLogin = require('../middleware/isLogin');
const router = express.Router();

// Create bill
router.post('/', isLogin(),
    body('status').notEmpty().withMessage("กรุณากรอกสถานะ").isIn(['WAITING', 'SUCCESS', 'FAILED']).withMessage("สถานะไม่ถูกต้อง"),
    body('totalprice').isFloat().withMessage("กรุณากรอกจำนวนเงินทั้งหมดให้ถูกต้อง"),
    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg);
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            });
        }

        const { status, totalprice } = req.body; // รับ totalprice จาก body
        let calculatedTotalPrice = 0;

        try {
            const cartItems = await prisma.cart.findMany({
                where: {
                    userId: req.users.id,
                },
                include: {
                    storeitem: true,
                },
            });

            for (const item of cartItems) {
                const storeItem = await prisma.storeitem.findUnique({
                    where: {
                        id: item.storeItemId
                    }
                });

                if (!storeItem || storeItem.amount < item.quantity) {
                    return res.status(400).json({
                        result: false,
                        status: "error",
                        msg: `จำนวนสินค้าที่เลือก (${storeItem?.name || 'สินค้าไม่พบ'}) มีไม่เพียงพอในสต็อก`
                    });
                }

                calculatedTotalPrice += storeItem.price * item.quantity; // คำนวณราคาสุทธิ
            }

            // ตรวจสอบว่าราคาที่คำนวณได้ตรงกับราคาที่ส่งมาใน body หรือไม่
            if (calculatedTotalPrice !== totalprice) {
                return res.status(400).json({
                    result: false,
                    status: "error",
                    msg: "จำนวนเงินทั้งหมดไม่ตรงกัน"
                });
            }

            // สร้างบิลด้วยสถานะที่เหมาะสม
            await prisma.bill.create({
                data: {
                    totalprice: calculatedTotalPrice,
                    status: status,
                    itemdetail: JSON.stringify(cartItems),
                    users_id: req.users.id,
                }
            });

            // ลดจำนวนสินค้าในสต็อก
            for (const item of cartItems) {
                await prisma.storeitem.update({
                    where: { id: item.storeItemId },
                    data: { amount: { decrement: item.quantity } }
                });
            }

            return res.status(200).json({
                result: true,
                status: "success",
                msg: "เพิ่มข้อมูลสำเร็จ"
            });
        } catch (error) {
            console.error(error);
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
