import Event from "../models/event.model.js";

// Helper function to find an event by ID
const findEventById = async (eventId) => {
  try {
    const event = await Event.findById(eventId).lean();
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all events (for customers)
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}).lean(); // Using lean for performance
    res.json({ events });
  } catch (error) {
    console.log("Error in getAllEvents controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get featured events (for customers)
export const getFeaturedEvents = async (req, res) => {
  try {
    const featuredEvents = await Event.find({ isFeatured: true }).lean();
    if (!featuredEvents.length) {
      return res.status(404).json({ message: "No featured events found" });
    }
    res.json(featuredEvents);
  } catch (error) {
    console.log("Error in getFeaturedEvents controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get recommended events (for customers)
export const getRecommendedEvents = async (req, res) => {
  try {
    const events = await Event.aggregate([
      { $sample: { size: 4 } }, // Random sample of 4 events
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    res.json(events);
  } catch (error) {
    console.log("Error in getRecommendedEvents controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get events by category (for customers)
export const getEventsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const events = await Event.find({ category }).lean();
    res.json({ events });
  } catch (error) {
    console.log("Error in getEventsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin only: Create event
export const createEvent = async (req, res) => {
  try {
    const { name, description, price, category, date } = req.body;
    const event = await Event.create({
      name,
      description,
      price,
      image: "", // No image handling now
      category,
      date,
    });
    res.status(201).json(event);
  } catch (error) {
    console.log("Error in createEvent controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin only: Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await findEventById(req.params.id); // Reuse helper function
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.log("Error in deleteEvent controller", error.message);
    res.status(404).json({ message: error.message });
  }
};

// Admin only: Toggle event featured status
export const toggleFeaturedEvent = async (req, res) => {
  try {
    const event = await findEventById(req.params.id); // Reuse helper function
    event.isFeatured = !event.isFeatured;
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    console.log("Error in toggleFeaturedEvent controller", error.message);
    res.status(404).json({ message: error.message });
  }
};

// Get event by ID (for customers)
export const getEventById = async (req, res) => {
  const { eventId } = req.params;
  console.log('Request received for event ID:', eventId);  // Debugging log
  try {
    const event = await Event.findById(eventId); // Find event by ID
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.log("Error in getEventById controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
