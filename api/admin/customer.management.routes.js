const express = require('express');
const router = express.Router();

const {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} = require('./customer.management.controller');

router.get('/', getAllCustomers);
router.post('/', createCustomer);

router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;