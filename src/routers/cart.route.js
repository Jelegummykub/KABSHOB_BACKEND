const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult, check } = require('express-validator');
const prisma = new PrismaClient()
const isLogin = require('../middleware/isLogin');
const router = express.Router();

//Create Cart

router.post('/:itemId', isLogin(),
    body('quantity').notEmpty().withMessage("กรุณากรอกจำนวน"),
    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg);
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            });
        }

        const { itemId } = req.params; // Use 'itemId' for clarity
        const { quantity } = req.body;
        const parsedItemId = parseInt(itemId);

        if (isNaN(parsedItemId)) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "กรุณากรอกเป็นตัวเลข"
            });
        }

        const storeItem = await prisma.Storeitem.findFirst({
            where: {
                id: parsedItemId,
                isActive: true // Ensure the item is active
            }
        });

        if (!storeItem) {
            return res.status(404).json({
                result: false,
                status: "error",
                msg: "ไม่พบข้อมูลสินค้านี้ในฐานข้อมูล"
            });
        }

        const cartData = {
            quantity: parseInt(quantity),
            storeitem: {
                connect: {
                    id: parsedItemId
                }
            },
            user: {
                connect: {
                    id: req.users.id // Ensure 'req.users.id' is correctly assigned in your auth middleware
                }
            }
        };

        try {
            const newCartItem = await prisma.Cart.create({ data: cartData });
            return res.status(200).json({
                result: true,
                status: "success",
                msg: "เพิ่มข้อมูลสินค้าสำเร็จ",
                data: newCartItem
            });
        } catch (error) {
            return res.status(500).json({
                result: false,
                status: "error",
                msg: "เกิดข้อผิดพลาดในการสร้างข้อมูล"
            });
        }
    }
);


//Update cart

router.put('/:id', isLogin(),
    body('quantity').notEmpty().withMessage("กรุณากรอกจำนวน"),
    async (req, res) => {
        const result = validationResult(req).formatWith(({ msg }) => msg)
        if (!result.isEmpty()) {
            return res.status(400).json({
                result: false,
                status: "warning",
                msg: result.array()[0]
            })
        }
        const id = req.params.id;
        if (isNaN(id)) {
            return res.status(400).json({
                result: false,
                status: "error",
                msg: "กรุณากรอกเป็นตัวเลข"
            })
        }
        const isCheck = await prisma.Cart.findFirst({
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

        const { quantity } = req.body

        await prisma.Cart.update({
            where: {
                id: parseInt(id)
            },
            data: {
                quantity: parseInt(quantity),
            }
        })
        return res.status(200).json({
            result: true,
            status: "success",
            msg: "อัปเดตข้อมูลสินค้าสำเร็จ"
        })
    }
)


router.get('/', isLogin(), async (req, res) => {
    try {
        // Retrieve user ID from the decoded token
        const userId = req.users.id;

        // Fetch cart items for the logged-in user
        const cartItems = await prisma.Cart.findMany({
            where: { users_id: userId },
            include: {
                storeitem: true // Include related Storeitem data
            }
        });

        if (cartItems.length === 0) {
            return res.status(200).json({
                result: true,
                status: "success",
                data: [] // Return empty array if no items found
            });
        }

        res.status(200).json({
            result: true,
            status: "success",
            data: cartItems // Return the fetched cart items
        });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({
            result: false,
            status: "error",
            msg: "An error occurred while fetching cart items."
        });
    }
});


router.delete('/:id', isLogin(), async (req, res) => {
    const { id } = req.params; // Extract the item ID from URL parameters

    try {
        // Find and delete the item in the user's cart using userId and storeItemId
        const result = await prisma.Cart.update({
            where : {id : parseInt(id)},
            data: { updated_at: new Date() }
        });

        if (!result) {
            return res.status(404).json({ msg: "Item not found in cart" });
        }

        res.status(200).json({ msg: "Item removed from cart", data: result });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
});



module.exports = router;
