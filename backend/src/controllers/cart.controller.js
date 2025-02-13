import Event from '../models/event.model.js';
import User from '../models/user.model.js';
import Ticket from '../models/ticket.model.js';

export const participateInEvent = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user._id;

        const event = await Event.findById(eventId);
        const user = await User.findById(userId);

        if (!event || !user) {
            return res.status(404).json({ message: 'Event or User not found' });
        }

        if (!event.participants.includes(userId)) {
            event.participants.push(userId);
            user.events.push(eventId);

            const ticket = new Ticket({ user: userId, event: eventId });
            await ticket.save();

            await event.save();
            await user.save();
        }

        res.status(200).json({ message: 'Participation and ticket generated successfully' });
    } catch (error) {
        console.error('Error recording participation:', error);
        res.status(500).json({ message: 'Server error recording participation' });
    }
};

export const getUserEvents = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'events',
            populate: { path: 'participants' }
        }).populate('tickets');

        res.status(200).json({ events: user.events, tickets: user.tickets });
    } catch (error) {
        console.error('Error fetching user events:', error);
        res.status(500).json({ message: 'Server error fetching user events' });
    }
};
