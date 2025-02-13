import Ticket from "../models/ticket.model.js";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();

    const salesData = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "₹quantity" },  // total tickets sold
          totalRevenue: { $sum: "₹totalAmount" }, // total revenue from ticket sales
        },
      },
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
      users: totalUsers,
      events: totalEvents,
      totalSales,
      totalRevenue,
    };
  } catch (error) {
    throw new Error("Error fetching analytics data", error);
  }
};

export const getDailySalesData = async (startDate, endDate) => {
	try {
	  const dailySalesData = await Ticket.aggregate([
		{
		  $match: {
			createdAt: {
			  $gte: new Date(startDate),  // ensures the date filter is correctly applied
			  $lte: new Date(endDate),
			},
		  },
		},
		{
		  $group: {
			_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // format the date to "YYYY-MM-DD"
			sales: { $sum: "$quantity" }, // sum up ticket quantity
			revenue: { $sum: "$totalAmount" }, // sum up the total revenue
		  },
		},
		{ $sort: { _id: 1 } }, // sorting by date
	  ]);
  
	  // Get the date range for filling in missing days
	  const dateArray = getDatesInRange(new Date(startDate), new Date(endDate));
  
	  return dateArray.map((date) => {
		const foundData = dailySalesData.find((item) => item._id === date);
  
		return {
		  date,
		  sales: foundData?.sales || 0,  // if no data, default to 0
		  revenue: foundData?.revenue || 0,  // if no data, default to 0
		};
	  });
	} catch (error) {
	  throw new Error("Error fetching daily sales data", error);
	}
  };
  
  function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);
  
	while (currentDate <= endDate) {
	  dates.push(currentDate.toISOString().split("T")[0]); // converts date to "YYYY-MM-DD" format
	  currentDate.setDate(currentDate.getDate() + 1);
	}
  
	return dates;
  }
  