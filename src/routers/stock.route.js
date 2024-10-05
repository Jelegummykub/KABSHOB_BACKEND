const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();
const isLogin = require('../middleware/isLogin');
const router = express.Router();




router.post('/stock1', isLogin(),
    body('storeItemId').isInt().withMessage('กรุณากรอกเป็นตัวเลข'),
    body('quantity').isInt().withMessage('กรุณากรอกจำนวนที่ถูกต้อง'),

    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg);
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            });
        }

        const { storeItemId } = req.body; // ไม่ต้องส่ง quantity มา เพราะเราจะดึงจาก Cart

        try {
            // ตรวจสอบว่า Storeitem มีอยู่ในฐานข้อมูล
            const storeItem = await prisma.storeitem.findFirst({
                where: { id: parseInt(storeItemId) }
            });

            if (!storeItem) {
                return res.status(400).json({
                    result: false,
                    status: "error",
                    msg: "ไม่พบสินค้าในฐานข้อมูล"
                });
            }

            // ค้นหาข้อมูลใน Cart
            const cartItem = await prisma.cart.findFirst({
                where: {
                    storeItemId: parseInt(storeItemId),
                    // สามารถเพิ่มเงื่อนไขอื่น ๆ เช่น user ID ได้ที่นี่ถ้าต้องการ
                }
            });

            if (!cartItem) {
                return res.status(400).json({
                    result: false,
                    status: "error",
                    msg: "ไม่พบสินค้านี้ในตะกร้า"
                });
            }

            const quantity = cartItem.quantity; // ดึงจำนวนจาก Cart

            // ตรวจสอบว่ามีจำนวนเพียงพอ
            if (storeItem.amount < quantity) {
                return res.status(400).json({
                    result: false,
                    status: "error",
                    msg: "จำนวนสินค้าที่เลือกมีไม่เพียงพอในสต็อก"
                });
            }

            // ลดจำนวนสินค้าตามจำนวนที่ต้องการ
            await prisma.storeitem.update({
                where: { id: parseInt(storeItemId) },
                data: { amount: storeItem.amount - quantity } // ลดจำนวน
            });

            // สร้างข้อมูลใน stock
            await prisma.stock.create({
                data: {
                    storeItemId: parseInt(storeItemId), // อัพเดท storeItemId ลงใน stock
                    quantity: quantity // บันทึกจำนวนที่ถูกลด
                }
            });

            // ลบหรือปรับปรุงข้อมูลใน Cart (ขึ้นอยู่กับว่าต้องการให้มันอยู่ใน Cart หรือไม่)
            await prisma.cart.delete({
                where: {
                    id: cartItem.id // ลบ Cart item
                }
            });

            return res.status(200).json({
                result: true,
                status: "success",
                msg: "เพิ่มข้อมูลสินค้าสำเร็จและลบจากตะกร้า"
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                result: false,
                status: "error",
                msg: "เกิดข้อผิดพลาดในการดำเนินการ"
            });
        }
    }
);




//Update stock

router.put('/stock/:id', isLogin(),
    body('billId').isInt().withMessage('กรุณากรอกเป็นตัวเลข'),
    body('storeItemId').isInt().withMessage('กรุณากรอกเป็นตัวเลข'),
    body('quantity').optional().isInt().withMessage('กรุณากรอกจำนวนที่ถูกต้อง'),
    
    async (req, res) => {
        const result = validationResult(req).formatWith(({msg}) => msg)
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            })
        }
        const { id } = req.params
        const { billId, storeItemId, quantity } = req.body
        if(isNaN(id)){
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "กรุณากรอกเป็นตัวเลข"
            })
        }

        // Check if the stock record exists
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

        // Update stock amount based on the new quantity
        const storeItem = await prisma.storeitem.findFirst({
            where: {
                id: parseInt(storeItemId),
            }
        });

        if (!storeItem || (quantity && storeItem.amount < quantity)) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "สินค้าหมดสต็อกหรือมีไม่เพียงพอ"
            });
        }

        await prisma.storeitem.update({
            where: { id: parseInt(storeItemId) },
            data: {
                amount: quantity ? storeItem.amount - quantity : storeItem.amount // Deduct the specified quantity
            }
        });

        // Update stock entry
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
