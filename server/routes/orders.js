const router = require('express').Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { items, addons, packagePlan, pickupDate, pickupSlot, note, totalAmount } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Please select at least one meal.' });
    if (!pickupDate || !pickupSlot) return res.status(400).json({ message: 'Please select pickup date and time.' });

    const order = await Order.create({
      user: req.user.id,
      items,
      addons: addons || [],
      packagePlan,
      pickupDate,
      pickupSlot,
      note,
      totalAmount
    });

    res.status(201).json({ message: 'Order submitted successfully.', order });
  } catch (err) {
    res.status(500).json({ message: 'Could not submit order.', error: err.message });
  }
});

router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Could not load orders.' });
  }
});

module.exports = router;
