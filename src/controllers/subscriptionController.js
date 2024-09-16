const Subscription = require('../models/Subscription');

// Create a new subscription
const createSubscription = async (req, res) => {
  const { carType, planType, startDate, timeSlot } = req.body;

  // Initialize the schedule array
  const schedule = [];
  let currentDate = new Date(startDate);

  // Helper function to add a schedule entry if it doesn't already exist
  const addScheduleEntry = (date, type) => {
    const existingEntry = schedule.find(entry => entry.date.toDateString() === date.toDateString());
    if (!existingEntry) {
      schedule.push({ date: new Date(date), type });
    }
  };

  let totalCleanings = 0; // To track the total number of cleanings
  let exteriorCount = 0; // Counter to track the number of Exterior Cleanings

  // Ensure the first date is always Interior Cleaning
  addScheduleEntry(currentDate, 'Interior Cleaning');
  totalCleanings++;
  currentDate.setDate(currentDate.getDate() + 1); // Move to next day

  if (planType === 'Daily') {
    // DAILY PLAN LOGIC
    let serviceDays = 1; // Start count from the next day after the first Interior Cleaning

    // Loop through 27 more days
    for (let i = 1; i < 28; i++) {
      if (serviceDays === 6) {
        addScheduleEntry(currentDate, 'Off Day');
        serviceDays = 0; // Reset after Off Day
      } else {
        if (totalCleanings % 12 === 0) {
          // Schedule Interior Cleaning after every 12 cleanings
          addScheduleEntry(currentDate, 'Interior Cleaning');
        } else {
          addScheduleEntry(currentDate, 'Exterior Cleaning');
        }
        totalCleanings++;
        serviceDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to next day
    }

  } else if (planType === 'Alternate') {
    // ALTERNATE PLAN LOGIC
    let cleaningCount = 0; // Counter to track the number of cleanings
    let nextInteriorCleaningDate = new Date(currentDate); // Track next Interior Cleaning date

    for (let i = 1; i < 28; i++) {
      if (i % 2 === 1) {
        // Every other day is an Off Day
        addScheduleEntry(currentDate, 'Off Day');
      } else {
        if (totalCleanings % 6 === 0 && totalCleanings !== 0) {
          // Ensure Interior Cleaning is scheduled after 6 cleanings
          // Add Off Day if needed before Interior Cleaning
          while (currentDate < nextInteriorCleaningDate) {
            addScheduleEntry(currentDate, 'Off Day');
            currentDate.setDate(currentDate.getDate() + 1); // Move to next day
          }
          addScheduleEntry(currentDate, 'Interior Cleaning');
          nextInteriorCleaningDate = new Date(currentDate);
          nextInteriorCleaningDate.setDate(nextInteriorCleaningDate.getDate() + 6); // Set next Interior Cleaning date
          totalCleanings++;
        } else {
          addScheduleEntry(currentDate, 'Exterior Cleaning');
          exteriorCount++; // Increment the Exterior Cleaning counter
          if (exteriorCount === 2) {
            // Add an extra Off Day after every 2 Exterior Cleanings
            currentDate.setDate(currentDate.getDate() + 1); // Move to next day for Off Day
            addScheduleEntry(currentDate, 'Off Day');
            exteriorCount = 0; // Reset the counter
          }
          totalCleanings++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to next day
    }
  }

  // Ensure that the schedule does not exceed 28 days
  if (schedule.length > 28) {
    schedule.length = 28;
  }

  // Save the subscription to the database
  const subscription = new Subscription({
    carType,
    planType,
    startDate,
    timeSlot,
    services: schedule
  });

  try {
    const savedSubscription = await subscription.save();
    res.status(201).json(savedSubscription); // Keep response pattern as is
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

    // Helper function to add a schedule entry if it doesn't already exist
    const addScheduleEntry = (date, type) => {
      const existingEntry = schedule.find(entry => entry.date.toDateString() === date.toDateString());
      if (!existingEntry) {
        schedule.push({ date: new Date(date), type });
      }
    };

    let totalCleanings = 0; // To track the total number of cleanings
    let exteriorCount = 0; // Counter to track the number of Exterior Cleanings

    // Ensure the first date is always Interior Cleaning
    addScheduleEntry(currentDate, 'Interior Cleaning');
    totalCleanings++;
    currentDate.setDate(currentDate.getDate() + 1); // Move to next day

    if (planType === 'Daily') {
      // DAILY PLAN LOGIC
      let serviceDays = 1; // Start count from the next day after the first Interior Cleaning

      // Loop through 27 more days
      for (let i = 1; i < 28; i++) {
        if (serviceDays === 6) {
          addScheduleEntry(currentDate, 'Off Day');
          serviceDays = 0; // Reset after Off Day
        } else {
          if (totalCleanings % 12 === 0 && totalCleanings !== 0) {
            // Schedule Interior Cleaning after every 12 cleanings
            addScheduleEntry(currentDate, 'Interior Cleaning');
          } else {
            addScheduleEntry(currentDate, 'Exterior Cleaning');
            exteriorCount++;
            if (exteriorCount === 12) {
              const interiorDate = new Date(currentDate);
              interiorDate.setDate(interiorDate.getDate() + 1);
              if (!schedule.some(e => e.date.toDateString() === interiorDate.toDateString() && e.type === 'Interior Cleaning')) {
                addScheduleEntry(interiorDate, 'Interior Cleaning');
              }
            }
          }
          totalCleanings++;
          serviceDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1); // Move to next day
      }

    } else if (planType === 'Alternate') {
      // ALTERNATE PLAN LOGIC
      let cleaningCount = 0; // Counter to track the number of cleanings
      let nextInteriorCleaningDate = new Date(currentDate); // Track next Interior Cleaning date

      for (let i = 1; i < 28; i++) {
        if (i % 2 === 1) {
          // Every other day is an Off Day
          addScheduleEntry(currentDate, 'Off Day');
        } else {
          if (totalCleanings % 6 === 0 && totalCleanings !== 0) {
            // Ensure Interior Cleaning is scheduled after 6 cleanings
            // Add Off Day if needed before Interior Cleaning
            while (currentDate < nextInteriorCleaningDate) {
              addScheduleEntry(currentDate, 'Off Day');
              currentDate.setDate(currentDate.getDate() + 1); // Move to next day
            }
            addScheduleEntry(currentDate, 'Interior Cleaning');
            nextInteriorCleaningDate = new Date(currentDate);
            nextInteriorCleaningDate.setDate(nextInteriorCleaningDate.getDate() + 6); // Set next Interior Cleaning date
            totalCleanings++;
          } else {
            addScheduleEntry(currentDate, 'Exterior Cleaning');
            exteriorCount++; // Increment the Exterior Cleaning counter
            if (exteriorCount === 2) {
              // Add an extra Off Day after every 2 Exterior Cleanings
              currentDate.setDate(currentDate.getDate() + 1); // Move to next day for Off Day
              addScheduleEntry(currentDate, 'Off Day');
              exteriorCount = 0; // Reset the counter
            }
            totalCleanings++;
          }
        }
        currentDate.setDate(currentDate.getDate() + 1); // Move to next day
      }

      // Schedule the second interior cleaning after 6 total services
      if (totalCleanings % 6 === 0) {
        const interiorDate = new Date(currentDate);
        interiorDate.setDate(interiorDate.getDate() + 1);
        if (!schedule.some(e => e.date.toDateString() === interiorDate.toDateString() && e.type === 'Interior Cleaning')) {
          addScheduleEntry(interiorDate, 'Interior Cleaning');
        }
      }
    }

    // Ensure that the schedule does not exceed 28 days
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
