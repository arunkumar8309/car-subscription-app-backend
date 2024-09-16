const Subscription = require('../models/Subscription');

// Create a new subscription
const createSubscription = async (req, res) => {
  const { carType, planType, startDate, timeSlot } = req.body;

  // Initialize the schedule array
  const schedule = [];
  let currentDate = new Date(startDate);

  // Helper function to add a schedule entry
  const addScheduleEntry = (date, type) => {
    schedule.push({ date: new Date(date), type });
  };

  if (planType === 'Daily') {
    let serviceDays = 0;
    let exteriorCount = 0;
    let interiorCount = 0;

    for (let i = 0; i < 28; i++) {
      if (serviceDays === 6) {
        addScheduleEntry(currentDate, 'Off Day');
        serviceDays = 0;
      } else {
        if (interiorCount === 0) {
          addScheduleEntry(currentDate, 'Interior Cleaning');
          interiorCount++;
        } else {
          addScheduleEntry(currentDate, 'Exterior Cleaning');
          exteriorCount++;
        }
        serviceDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Schedule the second interior cleaning after 12 exterior services
    let exteriorServiceCount = 0;
    schedule.forEach((entry) => {
      if (entry.type === 'Exterior Cleaning') {
        exteriorServiceCount++;
        if (exteriorServiceCount === 12) {
          const interiorDate = new Date(entry.date);
          interiorDate.setDate(interiorDate.getDate() + 1);
          if (schedule.length < 28) {  // Ensure we don't exceed 28 days
            addScheduleEntry(interiorDate, 'Interior Cleaning');
          }
        }
      }
    });

  } else if (planType === 'Alternate') {
    let serviceDays = 0;
    let exteriorCount = 0;
    let interiorCount = 0;
    let offDays = 0;
    let totalServiceCount = 0;

    for (let i = 0; i < 28; i++) {
      if (serviceDays === 1 || (totalServiceCount % 3 === 0 && offDays === 0)) {
        addScheduleEntry(currentDate, 'Off Day');
        offDays++;
        serviceDays = 0;
        if (offDays === 2) {
          offDays = 0;
        }
      } else {
        if (interiorCount === 0) {
          addScheduleEntry(currentDate, 'Interior Cleaning');
          interiorCount++;
        } else {
          addScheduleEntry(currentDate, 'Exterior Cleaning');
          exteriorCount++;
        }
        totalServiceCount++;
        serviceDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Schedule the second interior cleaning after 6 services
    let serviceCount = 0;
    schedule.forEach((entry) => {
      if (entry.type === 'Exterior Cleaning' || entry.type === 'Interior Cleaning') {
        serviceCount++;
        if (serviceCount === 6 && interiorCount === 1) {
          const interiorDate = new Date(entry.date);
          interiorDate.setDate(interiorDate.getDate() + 1);
          if (schedule.length < 28) {  // Ensure we don't exceed 28 days
            addScheduleEntry(interiorDate, 'Interior Cleaning');
          }
        }
      }
    });
  }

  // Limit the schedule to exactly 28 days
  if (schedule.length > 28) {
    schedule.length = 28;
  }

  // Save subscription to DB
  const subscription = new Subscription({
    carType,
    planType,
    startDate,
    timeSlot,
    services: schedule
  });

  try {
    const savedSubscription = await subscription.save();
    res.status(201).json(savedSubscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a subscription by ID
const getSubscriptionById = async (req, res) => {
  const { id } = req.params;

  try {
    const subscription = await Subscription.findById(id);
    if (subscription) {
      res.status(200).json(subscription);
    } else {
      res.status(404).json({ message: 'Subscription not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a subscription by ID
// Update a subscription by ID
const updateSubscriptionById = async (req, res) => {
  const { id } = req.params;
  const { carType, planType, startDate, timeSlot } = req.body;

  try {
    // Retrieve the existing subscription
    const existingSubscription = await Subscription.findById(id);
    if (!existingSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Initialize the new schedule array
    const schedule = [];
    let currentDate = new Date(startDate);

    // Helper function to add a schedule entry
    const addScheduleEntry = (date, type) => {
      schedule.push({ date: new Date(date), type });
    };

    if (planType === 'Daily') {
      let serviceDays = 0;
      let exteriorCount = 0;
      let interiorCount = 0;

      for (let i = 0; i < 28; i++) {
        if (serviceDays === 6) {
          addScheduleEntry(currentDate, 'Off Day');
          serviceDays = 0;
        } else {
          if (interiorCount === 0) {
            addScheduleEntry(currentDate, 'Interior Cleaning');
            interiorCount++;
          } else {
            addScheduleEntry(currentDate, 'Exterior Cleaning');
            exteriorCount++;
          }
          serviceDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Schedule the second interior cleaning after 12 exterior services
      let exteriorServiceCount = 0;
      schedule.forEach((entry) => {
        if (entry.type === 'Exterior Cleaning') {
          exteriorServiceCount++;
          if (exteriorServiceCount === 12) {
            const interiorDate = new Date(entry.date);
            interiorDate.setDate(interiorDate.getDate() + 1);
            if (schedule.length < 28) {  // Ensure we don't exceed 28 days
              addScheduleEntry(interiorDate, 'Interior Cleaning');
            }
          }
        }
      });

    } else if (planType === 'Alternate') {
      let serviceDays = 0;
      let exteriorCount = 0;
      let interiorCount = 0;
      let offDays = 0;
      let totalServiceCount = 0;

      for (let i = 0; i < 28; i++) {
        if (serviceDays === 1 || (totalServiceCount % 3 === 0 && offDays === 0)) {
          addScheduleEntry(currentDate, 'Off Day');
          offDays++;
          serviceDays = 0;
          if (offDays === 2) {
            offDays = 0;
          }
        } else {
          if (interiorCount === 0) {
            addScheduleEntry(currentDate, 'Interior Cleaning');
            interiorCount++;
          } else {
            addScheduleEntry(currentDate, 'Exterior Cleaning');
            exteriorCount++;
          }
          totalServiceCount++;
          serviceDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Schedule the second interior cleaning after 6 services
      let serviceCount = 0;
      schedule.forEach((entry) => {
        if (entry.type === 'Exterior Cleaning' || entry.type === 'Interior Cleaning') {
          serviceCount++;
          if (serviceCount === 6 && interiorCount === 1) {
            const interiorDate = new Date(entry.date);
            interiorDate.setDate(interiorDate.getDate() + 1);
            if (schedule.length < 28) {  // Ensure we don't exceed 28 days
              addScheduleEntry(interiorDate, 'Interior Cleaning');
            }
          }
        }
      });
    }

    // Limit the schedule to exactly 28 days
    if (schedule.length > 28) {
      schedule.length = 28;
    }

    // Update subscription with new details
    existingSubscription.carType = carType;
    existingSubscription.planType = planType;
    existingSubscription.startDate = startDate;
    existingSubscription.timeSlot = timeSlot;
    existingSubscription.services = schedule;

    // Save the updated subscription to DB
    const updatedSubscription = await existingSubscription.save();
    res.status(200).json(updatedSubscription);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Delete a subscription by ID
const deleteSubscriptionById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubscription = await Subscription.findByIdAndDelete(id);
    if (deletedSubscription) {
      res.status(200).json({ message: 'Subscription deleted' });
    } else {
      res.status(404).json({ message: 'Subscription not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fetch daily count view

const getDailyCount = async (req, res) => {
  try {
    const subscriptions = await Subscription.aggregate([
      { $unwind: "$services" }, // Unwind the services array to process each service
      {
        $group: {
          _id: "$services.date",
          exteriorCount: {
            $sum: {
              $cond: [{ $eq: ["$services.type", "Exterior Cleaning"] }, 1, 0]
            }
          },
          interiorCount: {
            $sum: {
              $cond: [{ $eq: ["$services.type", "Interior Cleaning"] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 } // Sort the results by date
      }
    ]);

    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionById,
  deleteSubscriptionById,
  getDailyCount,

};
