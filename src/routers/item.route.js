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
    body('image').notEmpty().withMessage("กรุณากรอกรูปภาพ"),
    body('isActive').notEmpty().withMessage("sdffsf"),
    async (req, res) => {
        const errorsValidation = validationResult(req).formatWith(({ msg }) => msg);
        if (!errorsValidation.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: errorsValidation.array()[0]
            })
        }
        const { Storeitem } = req.params
        const { name, discription, price , image , isActive} = req.body
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
        await prisma.Storeitem.create({
            data: {
                name,
                discription,
                price : parseInt(price),
                image,
                isActive : Boolean(isActive)
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
    body('image').notEmpty().withMessage("กรุณากรอกรูปภาพ"),
    body('isActive').notEmpty().withMessage("sdffsf"),
    async (req, res) => {
        const errorsValidation = validationResult(req).formatWith(({ msg }) => msg);
        if (!errorsValidation.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: errorsValidation.array()[0]
            })
        }
        const id = req.params.id;
        if (isNaN(id)){
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "กรุณากรอกเป็นตัวเลข"
            })
        }
        const isCheck = await prisma.Storeitem.findFirst({
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
        const { name, discription, price , image , isActive } = req.body
        await prisma.Storeitem.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name,
                discription,
                price : parseInt(price),
                image,
                isActive : Boolean(isActive)
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
    const isCheck_item = await prisma.Storeitem.findFirst({
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
    await prisma.Storeitem.update({
        where: {
            id: parsedItemId
        },
        data: {
            deleted_at: new Date()
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
    
    const item = await prisma.Storeitem.findMany({
       
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
    const item = await prisma.Storeitem.findFirst({
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