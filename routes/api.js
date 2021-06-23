// External
const express = require('express');
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

// Internal
const {
  getDocumentById,
  handleError,
  getOrderDetails,
} = require('../src/utils');

/**
 * POST endpoint to purchase a selected product given the user and product ids
 */
router.post('/purchase', async (req, res) => {
  const { userId, productId } = req.body;

  let user;
  let product;
  // Check if product is in stock
  try {
    user = await getDocumentById('users', userId);
    product = await getDocumentById('products', productId);
    if (product.quantityInStock === 0) {
      return res.status(404).send({ message: 'Product is sold out' });
    }
  } catch (err) {
    return handleError(res, err);
  }

  // Check if user can afford the product
  if (user.accountBalance - product.price < 0) {
    return res.status(500).send({ message: 'User cannot afford this product' });
  }

  // Create a transaction so if there's an error from any actions,
  // we don't want to commit any of the changes and return an error
  try {
    firestore.runTransaction(async (transaction) => {
      const userRef = await firestore.doc(`users/${userId}`);
      const productRef = await firestore.doc(`products/${productId}`);
      const orderRef = await firestore.collection('orders').doc();
      // Create new order
      await transaction.create(orderRef, {
        items: [productRef],
        purchasedTime: new Date(),
        total: product.price,
      });

      // Deduct product price from user account balance
      // and add product to order history (receipt)
      await transaction.update(userRef, {
        accountBalance: user.accountBalance - product.price,
        orders: user.orders ? [...user.orders, orderRef] : [orderRef],
      });

      // Balance product inventory
      await transaction.update(productRef, {
        quantityInStock: product.quantityInStock - 1,
      });
    });
  } catch (err) {
    return handleError(res, err);
  }

  return res.send({ message: `Purchased ${product.productName} successfully` });
});

/**
 * GET endpoint to get the selected product information
 */
router.get('/product/:productId', async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await getDocumentById('products', productId);
    return res.send(product);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * GET endpoint to get the selected user information
 */
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await getDocumentById('users', userId);
    const orders = await getOrderDetails(user.orders);
    return res.send({ ...user, orders });
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
