const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();
const isLogin = require('../middleware/isLogin');
const router = express.Router();

// Create a new Cagetoy
router.post('/cagetoryy', isLogin(),
    body('name').notEmpty().withMessage("กรุณากรอกชื่อประเภทของสินค้า"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ result: false, status: "warning", msg: errors.array()[0].msg });
        }

        const { name } = req.body;

        try {
            const newCagetory = await prisma.Cagetory.create({
                data: { name }
            });
            return res.status(200).json({ result: true, status: "success", msg: "เพิ่มประเภทสินค้าสำเร็จ", data: newCagetory });
        } catch (error) {
            console.error('Error creating cagetory:', error);
            return res.status(500).json({ result: false, status: "error", msg: "เกิดข้อผิดพลาดในการเพิ่มประเภทสินค้า" });
        }
    }
);

// Get all cagetoys
router.get('/', async (req, res) => {
    try {
        const cagetorys = await prisma.Cagetory.findMany();
        return res.status(200).json({ result: true, status: "success", data: cagetorys });
    } catch (error) {
        console.error('Error fetching cagetorys:', error);
        return res.status(500).json({ result: false, status: "error", msg: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า" });
    }
});

// Get Store Items by Cagetoy ID
router.get('/:cagetoryid', async (req, res) => {
    const { cagetoryid } = req.params;

    try {
        // ตรวจสอบว่า Cagetoy มีอยู่หรือไม่
        const cagetory = await prisma.Cagetory.findUnique({
            where: { id: parseInt(cagetoryid) },
        });

        if (!cagetory) {
            return res.status(404).json({ result: false, status: "error", msg: "ไม่พบประเภทสินค้านี้" });
        }

        // ดึงข้อมูล Storeitem ที่มี cagetoy_id ตรงตามที่ระบุ และเลือกเฉพาะฟิลด์ที่ต้องการ
        const storeItems = await prisma.Storeitem.findMany({
            where: { cagetory_id: cagetory.id }, // ใช้ cagetoy_id
            select: {
                id: true,          // รวม id ของ Storeitem ด้วย
                name: true,
                discription: true,
                price: true,
                image: true,
                amount: true
            },
        });

        console.log(storeItems); // แสดงผล storeItems ใน console เพื่อตรวจสอบ

        if (!storeItems.length) {
            return res.status(404).json({ result: false, status: "error", msg: "ไม่พบสินค้าที่เกี่ยวข้องกับประเภทสินค้านี้" });
        }

        return res.status(200).json({ result: true, status: "success", data: storeItems });
    } catch (error) {
        console.error('Error fetching store items:', error);
        return res.status(500).json({ result: false, status: "error", msg: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า" });
    }
});

// Uncomment if needed for deleting cagetoys
// router.delete('/:cagetoryid/:id', isLogin(), async (req, res) => {
//     const { id } = req.params;

//     try {
//         await prisma.Cagetoy.delete({ where: { id: parseInt(id) } });
//         return res.status(200).json({ result: true, status: "success", msg: "ลบประเภทสินค้าสำเร็จ" });
//     } catch (error) {
//         console.error('Error deleting cagetoy:', error);
//         return res.status(500).json({ result: false, status: "error", msg: "เกิดข้อผิดพลาดในการลบประเภทสินค้า" });
//     }
// });

module.exports = router;
