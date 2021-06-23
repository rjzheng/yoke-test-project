// External
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

/**
 * ORM function that gets the document data with collection and document id
 * @param {*} collection collection name of the storage
 * @param {*} docId document id of the storage
 * @returns parsed data
 */
const getDocumentById = async (collection, docId) => {
  const docPath = `${collection}/${docId}`;
  const document = firestore.doc(docPath);
  let item;
  try {
    item = await document.get();
  } catch (err) {
    throw new Error(`Error retrieving document`);
  }

  if (!item.exists) {
    throw new Error(`Document does not exist`);
  }

  try {
    const itemData = item.data();
    return itemData;
  } catch (err) {
    throw new Error('Error digesting data');
  }
};

/**
 * Parses and formats the complete order details
 * @param {*} orders list of order document refs
 * @returns list of parsed order data
 */
const getOrderDetails = async (orders) => {
  const result = [];
  for (order of orders) {
    const orderSnap = await order.get();
    const orderData = orderSnap.data();
    orderData.purchasedTime = orderData.purchasedTime.toDate();
    for (item of orderData.items) {
      const itemSnap = await item.get();
      const itemData = itemSnap.data();
      // Remove quantity as it's not needed in order details
      delete itemData.quantityInStock;
      result.push({
        ...orderData,
        items: itemData,
      });
    }
  }
  return result;
};

/**
 * Determine what time of status code to send back to errors
 * @param {*} msg erorr message
 * @returns 404 - Not Found || 500 Unknown
 */
const getErrorStatusCode = (msg) => {
  if (msg.includes('does not exist')) {
    return 404;
  }
  return 500;
};

/**
 * Helper function to handle errors
 * @param {*} res express response object
 * @param {*} err error
 */
const handleError = (res, err) => {
  const errorMessage = err.message;
  const statusCode = getErrorStatusCode(errorMessage);
  res.status(statusCode).send({ message: errorMessage });
};

module.exports = {
  getDocumentById,
  getOrderDetails,
  handleError,
};
