const express = require("express");
const {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionById,
  deleteSubscriptionById,
  getDailyCount,
} = require("../controllers/subscriptionController");
const router = express.Router();

router.get("/daily-count", getDailyCount); // daily-count endpoint

router.post("/", createSubscription);
router.get("/", getAllSubscriptions);
router.get("/:id", getSubscriptionById);  // Define dynamic :id route after specific ones
router.put("/:id", updateSubscriptionById);
router.delete("/:id", deleteSubscriptionById);

module.exports = router;
