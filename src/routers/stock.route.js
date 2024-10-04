const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();
const isLogin = require('../middleware/isLogin');
const router = express.Router();

//Create stock

router.post('/stock1', isLogin(),

    body('billId').isInt().withMessage('กรุณากรอกเป็นตัวเลข'),
    body('storeItemId').isInt().withMessage('กรุณากรอกเป็นตัวเลข'),
    body('quantity').isInt().withMessage('กรุณากรอกจำนวนที่ถูกต้อง'),

    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg);
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            })
        }

        const { billId, storeItemId, quantity } = req.body;

        // Check if the bill exists
        const isCheck = await prisma.bill.findFirst({
            where: {
                id: parseInt(billId),
            }
        });

        if (!isCheck) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "ไม่พบข้อมูลร้านนี้ในฐานข้อมูล"
            });
        }

        // Check the stock of the item
        const storeItem = await prisma.storeitem.findFirst({
            where: {
                id: parseInt(storeItemId),
            }
        });

        // Check if stock is sufficient for the requested quantity
        if (!storeItem || storeItem.amount < quantity) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "จำนวนสินค้าที่เลือกมีไม่เพียงพอในสต็อก"
            });
        }

        // Deduct stock by the specified quantity
        await prisma.storeitem.update({
            where: {
                id: parseInt(storeItemId)
            },
            data: {
                amount: storeItem.amount - quantity // Deduct the requested quantity from stock
            }
        });

        // Create stock entry
        await prisma.stock.create({
            data: {
                billId: parseInt(billId),
                storeItemId: parseInt(storeItemId),
                quantity: quantity // Record the quantity added to the cart
            }
        });

        return res.status(200).json({
            result: true,
            status: "success",
            msg: "เพิ่มข้อมูลสินค้าสำเร็จ"
        });
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
