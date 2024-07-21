const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult, check } = require('express-validator');
const prisma = new PrismaClient()
const isLogin = require('../middleware/isLogin');
const router = express.Router();

//Create Item
router.post('/:store_id', isLogin(),
    body('name').notEmpty().withMessage("กรุณากรอกชื่อสินค้า"),
    body('discription').notEmpty().withMessage("กรุณากรอกคำอธิบายสินค้า"),
    body('price').notEmpty().withMessage("กรุณากรอกราคา"),
    body('amount').notEmpty().withMessage("กรุณากรอกจำนวน"), async (req, res) => {
        const errorsValidation = validationResult(req).formatWith(({ msg }) => msg);
        if (!errorsValidation.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: errorsValidation.array()[0]
            })
        }
        const { store_id } = req.params
        const { name, discription, price, amount } = req.body
        // const isCheck = await prisma.store_item.findFirst({
        //     where: {
        //         id: parseInt(store_id)
        //     }
        // })
        // if (!isCheck) {
        //     return res.status(400).json({
        //         result: false,
        //         status: "error",
        //         msg: "ไม่พบข้อมูลร้านนี้ในฐานข้อมูล"
        //     })
        // }
        await prisma.store_item.create({
            data: {
                name,
                discription,
                price : parseInt(price),
                amount : parseInt(amount),
            }
        })
        return res.status(200).json({
            result: true,
            status: "success",
            msg: "เพิ่มข้อมูลสินค้าสำเร็จ"
        })
    })

//Update Item
router.put('/:store_id/:id', isLogin(),
    body('name').notEmpty().withMessage("กรุณากรอกชื่อสินค้า"),
    body('discription').notEmpty().withMessage("กรุณากรอกคำอธิบายสินค้า"),
    body('price').notEmpty().withMessage("กรุณากรอกราคา"),
    body('amount').notEmpty().withMessage("กรุณากรอกจำนวน"), async (req, res) => {
        const errorsValidation = validationResult(req).formatWith(({ msg }) => msg);
        if (!errorsValidation.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: errorsValidation.array()[0]
            })
        }
        const item_id = req.params.id
        const { name, discription, price, amount } = req.body
        await prisma.store_item.update({
            where: {
                id: parseInt(item_id)
            },
            data: {
                name,
                discription,
                price : parseInt(price),
                amount : parseInt(amount),
            }
        })
        return res.status(200).json({
            result: true,
            status: "success",
            msg: "อัปเดตข้อมูลสินค้าสำเร็จ"
        })

    })

//Delete item
router.delete('/:item_id/:id', isLogin(), async (req, res) => {
    const { item_id,id } = req.params
    if (isNaN(parseInt(item_id)) || isNaN(parseInt(id))) {
        return res.status(400).json({
            result: false,
            status: "error",
            msg: "กรุณากรอกเป็นตัวเลข"
        })
    }
    const parsedItemId = parseInt(item_id);
    const isCheck_item = await prisma.store_item.findFirst({
        where: {
            id: parsedItemId,
        }
    })

    if (!isCheck_item) {
        return res.status(400).json({
            result: false,
            status: "error",
            msg: "ไม่พบข้อมูลสินค้า"
        })
    }
    await prisma.store_item.delete({
        where: {
            id: parsedItemId
        }
    })
    return res.status(200).json({
        result: true,
        status: "success",
        msg: "ลบข้อมูลสำเร็จ"
    })
})

//Read ALL
router.get('/:store_id', isLogin(), async (req, res) => {
    const item_id = req.params.item_id
    if (!isNaN(item_id)) {
        return res.status(400).json({
            result: false,
            status: "error",
            msg: "กรุณากรอกเป็นตัวเลข"
        })
    }
    
    const item = await prisma.store_item.findMany({
       
    })
    return res.status(200).json({
        result: true,
        status: "success",
        data: item
    })
})

//Read ID
router.get('/:item_id/:id', isLogin(), async (req, res) => {
    const { item_id, id } = req.params
    if (isNaN(parseInt(item_id)) || isNaN(parseInt(id))) {
        return res.status(400).json({
            result: false,
            status: "error",
            msg: "กรุณากรอกเป็นตัวเลข"
        })
    }
    const parsedItemId = parseInt(item_id);
    const item = await prisma.store_item.findFirst({
        where: {
            id: parsedItemId,
        }
    })
    if (!item) {
        return res.status(400).json({
            result: false,
            status: "error",
            msg: "ไม่พบข้อมูลสินค้า"
        })
    }
    return res.status(200).json({
        result: true,
        status: "success",
        data: item
    })
})


module.exports = router;