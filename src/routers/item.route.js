const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();
const isLogin = require('../middleware/isLogin');
const router = express.Router();
const path = require('path');

router.use('/public', express.static(path.join(__dirname, 'public')));

router.post('/:cagetory_id', isLogin(),
    body('name').notEmpty().withMessage("กรุณากรอกชื่อสินค้า"),
    body('discription').notEmpty().withMessage("กรุณากรอกคำอธิบายสินค้า"),
    body('price').isNumeric().withMessage("กรุณากรอกราคาเป็นตัวเลข"),
    body('image').notEmpty().withMessage("กรุณากรอกรูปภาพ"),
    body('amount').isNumeric().withMessage("กรุณากรอกจำนวนเป็นตัวเลข"),
    body('isActive').isBoolean().withMessage("กรุณากรอกสถานะสินค้า (true/false)"),
    
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ result: false, status: "warning", msg: errors.array()[0].msg });
        }

        const { cagetory_id } = req.params;
        const { name, discription, price,amount, isActive } = req.body;
        const image = `/public/pigg/${req.body.image}`;
        // Log cagetoy_id for debugging
        console.log('Checking cagetory_id:', cagetory_id);

        // Check if the cagetoy_id exists
        const cagetoryExists = await prisma.Cagetory.findUnique({
            where: { id: parseInt(cagetory_id) }
        });

        if (!cagetoryExists) {
            return res.status(400).json({ result: false, status: "error", msg: "Cagetory not found" });
        }

        try {
            const newItem = await prisma.Storeitem.create({
                data: {
                    name,
                    discription,
                    price: parseInt(price),
                    image,
                    amount:parseInt(amount),
                    isActive: Boolean(isActive),
                    cagetory_id: parseInt(cagetory_id)
                }
            });
            return res.status(200).json({ result: true, status: "success", msg: "เพิ่มข้อมูลสินค้าสำเร็จ", data: newItem });
        } catch (error) {
            console.error('Error creating product:', error);
            return res.status(500).json({ result: false, status: "error", msg: "เกิดข้อผิดพลาดในการเพิ่มสินค้า" });
        }
    }
);




// Create Item
// router.post('/:cagetoy_id', isLogin(),
//     body('name').notEmpty().withMessage("กรุณากรอกชื่อสินค้า"),
//     body('discription').notEmpty().withMessage("กรุณากรอกคำอธิบายสินค้า"),
//     body('price').isNumeric().withMessage("กรุณากรอกราคาเป็นตัวเลข"),
//     body('image').notEmpty().withMessage("กรุณากรอกรูปภาพ"),
//     body('isActive').isBoolean().withMessage("กรุณากรอกสถานะสินค้า (true/false)"),
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ result: false, status: "warning", msg: errors.array()[0].msg });
//         }

//         const { cagetoy_id } = req.params;
//         const { name, discription, price, image, isActive } = req.body;

//         try {
//             const newItem = await prisma.Storeitem.create({
//                 data: {
//                     name,
//                     discription,
//                     price: parseInt(price),
//                     image,
//                     isActive: Boolean(isActive),
//                     cagetoy_id: parseInt(cagetoy_id) // Use cagetoy_id here
//                 }
//             });
//             return res.status(200).json({ result: true, status: "success", msg: "เพิ่มข้อมูลสินค้าสำเร็จ", data: newItem });
//         } catch (error) {
//             console.error('Error creating product:', error);
//             return res.status(500).json({ result: false, status: "error", msg: "เกิดข้อผิดพลาดในการเพิ่มสินค้า" });
//         }
//     }
// );


// Update Item
router.put('/:store_id/:id', isLogin(),
    body('name').notEmpty().withMessage("กรุณากรอกชื่อสินค้า"),
    body('discription').notEmpty().withMessage("กรุณากรอกคำอธิบายสินค้า"),
    body('price').isNumeric().withMessage("กรุณากรอกราคาเป็นตัวเลข"),
    body('image').notEmpty().withMessage("กรุณากรอกรูปภาพ"),
    body('amount').isNumeric().withMessage("กรุณากรอกราคาเป็นตัวเลข"),
    body('isActive').isBoolean().withMessage("กรุณากรอกสถานะสินค้า (true/false)"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ result: false, status: "warning", msg: errors.array()[0].msg });
        }

        const { id } = req.params;
        const { name, discription, price, image, amount ,isActive } = req.body;

        try {
            const updatedItem = await prisma.Storeitem.update({
                where: { id: parseInt(id) },
                data: { name, discription, price: parseInt(price), amount:parseInt(amount)  ,image, isActive: Boolean(isActive) }
            });
            return res.status(200).json({ result: true, status: "success", msg: "อัปเดตข้อมูลสินค้าสำเร็จ", data: updatedItem });
        } catch (error) {
            return res.status(500).json({ result: false, status: "error", msg: "เกิดข้อผิดพลาดในการอัปเดตสินค้า" });
        }
    }
);

// Delete Item
router.delete('/:store_id/:id', isLogin(), async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.Storeitem.update({
            where: { id: parseInt(id) },
            data: { deleted_at: new Date() }
        });
        return res.status(200).json({ result: true, status: "success", msg: "ลบข้อมูลสำเร็จ" });
    } catch (error) {
        return res.status(500).json({ result: false, status: "error", msg: "เกิดข้อผิดพลาดในการลบสินค้า" });
    }
});



// Read All Items
// API Route
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Request received for ID: ${id}`); // Log received ID

    // Check if the itemId is a valid number
    if (!id || isNaN(parseInt(id))) {
        console.error('Invalid ID: Must be a number');
        return res.status(400).json({
            result: false,
            status: "error",
            msg: "กรุณากรอกเป็นตัวเลข" // "Please enter a number"
        });
    }

    const itemId = parseInt(id); // Parse ID to integer
    console.log('Fetching item with ID:', itemId);
    console.log('Request params:', req.params);
    console.log('Parsed item ID:', itemId);

    try {
        const item = await prisma.Storeitem.findUnique({
            where: { id: itemId }
        });

        // Check if the item exists
        if (!item) {
            console.error('Item not found for ID:', itemId);
            return res.status(404).json({
                result: false,
                status: "error",
                msg: "ไม่พบผลิตภัณฑ์" // "Product not found"
            });
        }

        console.log('Item fetched from database:', item);
        return res.status(200).json({
            result: true,
            status: "success",
            data: item
        });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            result: false,
            status: "error",
            msg: "เกิดข้อผิดพลาดในการเข้าถึงฐานข้อมูล: " + error.message // More details
        });
    }
});











// Read Item by ID
router.get('/:cagetory_id/:id', isLogin(), async (req, res) => {
    const cagetory_id = parseInt(req.params.cagetory_id);
    const id = parseInt(req.params.id);

    if (isNaN(cagetory_id) || isNaN(id)) {
        return res.status(400).json({ result: false, status: "error", msg: "Invalid parameters" });
    }

    try {
        // Fetch the item from the database
        const item = await prisma.Storeitem.findFirst({
            where: {
                id: id,
                cagetory_id: cagetory_id,
            },
        });

        console.log('Fetched item:', item); // Log the fetched item

        // Check if no item was found
        if (!item) {
            return res.status(404).json({ result: false, status: "error", msg: "ไม่พบข้อมูลสินค้า" });
        }

        // Map the item to include the image path
        const itemWithImagePath = {
            ...item,
            image: `/static/pigg/${item.image}`, // Ensure the static path is correct
        };

        // Return the success response with the item data
        return res.status(200).json({ result: true, status: "success", data: itemWithImagePath });
    } catch (error) {
        console.log('Server error:', error); // Log the server error
        return res.status(500).json({ result: false, status: "error", msg: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า" });
    }
});






module.exports = router;



// router.post('/:store_id', isLogin(),
//     body('name').notEmpty().withMessage("กรุณากรอกชื่อสินค้า"),
//     body('discription').notEmpty().withMessage("กรุณากรอกคำอธิบายสินค้า"),
//     body('price').notEmpty().withMessage("กรุณากรอกราคา"),
//     body('image').notEmpty().withMessage("กรุณากรอกรูปภาพ"),
//     body('isActive').notEmpty().withMessage("sdffsf"),
//     async (req, res) => {
//         const errorsValidation = validationResult(req).formatWith(({ msg }) => msg);
//         if (!errorsValidation.isEmpty()) {
//             return res.status(400).json({
//                 result: false,
//                 status: "warning",
//                 msg: errorsValidation.array()[0]
//             })
//         }
//         const { Storeitem } = req.params
//         const { name, discription, price , image , isActive} = req.body
//         // const isCheck = await prisma.store_item.findFirst({
//         //     where: {
//         //         id: parseInt(store_id)
//         //     }
//         // })
//         // if (!isCheck) {
//         //     return res.status(400).json({
//         //         result: false,
//         //         status: "error",
//         //         msg: "ไม่พบข้อมูลร้านนี้ในฐานข้อมูล"
//         //     })
//         // }
//         await prisma.Storeitem.create({
//             data: {
//                 name,
//                 discription,
//                 price : parseInt(price),
//                 image,
//                 isActive : Boolean(isActive)
//             }
//         })
//         return res.status(200).json({
//             result: true,
//             status: "success",
//             msg: "เพิ่มข้อมูลสินค้าสำเร็จ"
//         })
//     })