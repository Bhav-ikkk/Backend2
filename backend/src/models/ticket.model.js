import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		tickets: [
			{
				event: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Event", // Changed from Product to Event
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1, // At least one ticket must be purchased
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
				eventDate: { type: Date, required: false }, // Can be removed if derived from the Event model.
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		stripeSessionId: {
			type: String,
			unique: true,
		},
		paymentStatus: {
			type: String,
			enum: ["Pending", "Completed", "Failed"],
			default: "Pending", // Default status is "Pending" until payment is processed
		},
	},
	{ timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
