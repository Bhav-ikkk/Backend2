import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			min: 0,
			required: true,
		},
		category: {
			type: String,
			required: true,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		date: {
			type: Date,
			required: true, // Add the date of the event
		},
		tags: {
			type: [String],  // Array of tags to categorize events (optional)
			default: [],
		  },
		  organizer: {
			type: String,  // Organizer name (optional)
			default: '',
		  },
		location: {
			type: String,
			required: true, // The location of the event
		},
	},
	{ timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
