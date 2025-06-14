// routes/donation.route.js
const express = require("express");
const router  = express.Router();
const Donation = require("../models/Donation");
const verifyToken = require("../middleware/auth");

const validRoles      = ["donor", "ngo", "biogas"];
const validFoodTypes  = ["packed", "fresh", "organic"];

/* ------------------------------------------------------------------
 * 1.  Submit a donation
 * ------------------------------------------------------------------ */
router.post("/donate", verifyToken, async (req, res) => {
  const { foodType, quantity, address } = req.body;
  const donorName  = req.user.name  || "Anonymous Donor";
  const donorEmail = req.user.email || "anonymous@donor.com";
  const role       = req.user.role;

  if (!validRoles.includes(role))
    return res.status(403).json({ message: "Unauthorized: Invalid user role" });

  if (!foodType || !quantity || !address)
    return res.status(400).json({ message: "All fields are required" });

  const normalizedFoodType = foodType.toLowerCase();
  if (!validFoodTypes.includes(normalizedFoodType))
    return res.status(400).json({ message: "Invalid food type" });

  try {
    const donation = new Donation({
      donorName,
      donorEmail,                // ✅ now stored for secure look‑up
      foodType: normalizedFoodType,
      quantity,
      address,
      role: normalizedFoodType === "organic" ? "biogas" : "ngo",
      status: "Pending",
    });

    await donation.save();
    res.status(201).json({ message: "Donation submitted", donation });
  } catch (err) {
    console.error("Donation submit error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------
 * 2.  Get PENDING donations filtered by role (NGO / BIOGAS dashboard)
 * ------------------------------------------------------------------ */
router.get("/pending/:role", verifyToken, async (req, res) => {
  try {
    const roleParam = req.params.role.toLowerCase();
    const userRole  = req.user.role?.toLowerCase();

    console.log("👉 Role Param:", roleParam);
    console.log("👉 JWT Role:", userRole);

    if (!validRoles.includes(roleParam))
      return res.status(400).json({ message: "Invalid role in URL" });

    if (userRole !== roleParam)
      return res.status(403).json({ message: "Forbidden: view your role only" });

    const donations = await Donation.find({ role: roleParam, status: "Pending" });
    res.json(donations);
  } catch (err) {
    console.error("Fetch pending donations error:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ------------------------------------------------------------------
 * 3.  Mark donation COLLECTED  (NGO / BIOGAS action button)
 * ------------------------------------------------------------------ */
router.put("/collect/:id", verifyToken, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation)  return res.status(404).json({ message: "Donation not found" });
    if (donation.status === "Collected")
      return res.status(400).json({ message: "Already collected" });
    if (donation.role !== req.user.role)
      return res.status(403).json({ message: "You cannot collect this donation" });

    const now        = new Date();
    const agentRole  = req.user.role;
    const agentName  = req.user.name  || (agentRole === "ngo"    ? "NGO Agent"    : "Biogas Agent");
    const agentPhone = req.user.phone || (agentRole === "ngo"    ? "+91‑9999999999"
                                                                  : "+91‑8888888888");

    const notification = `Your food will be collected by ${agentName} (Contact: ${agentPhone}) at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    donation.status          = "Collected";
    donation.collectedAt     = now;
    donation.estimatedArrival= new Date(now.getTime() + 30 * 60_000); // +30 min
    donation.agentName       = agentName;
    donation.agentPhone      = agentPhone;
    donation.notification    = notification;                           // ✅ sent to donor

    await donation.save();
    res.json({ message: "Donation marked as collected", donation });
  } catch (err) {
    console.error("Mark collect error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------
 * 4.  Dashboard statistics  (shared global stats endpoint)
 * ------------------------------------------------------------------ */
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const [pendingNGO, pendingBio, total, collected] = await Promise.all([
      Donation.countDocuments({ role: "ngo",    status: "Pending" }),
      Donation.countDocuments({ role: "biogas", status: "Pending" }),
      Donation.countDocuments(),
      Donation.countDocuments({ status: "Collected" }),
    ]);

    res.json({
      pendingNGODonations : pendingNGO,
      pendingBiogasPickups: pendingBio,
      totalDonations      : total,
      collectedDonations  : collected,
    });
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------
 * 5.  Real‑time “pending” notifications for NGO / BIOGAS sidebars
 * ------------------------------------------------------------------ */
router.get("/notifications/pending", verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const foodFilter = userRole === "ngo"    ? ["fresh", "packed"]
                     : userRole === "biogas" ? ["organic"]
                     :                        [];

    if (!foodFilter.length)
      return res.status(403).json({ message: "Only NGO or Biogas can receive notifications" });

    const pendingDonations = await Donation.find({
      foodType: { $in: foodFilter },
      status  : "Pending",
    });

    res.json({ count: pendingDonations.length, donations: pendingDonations });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/* ------------------------------------------------------------------
 * 6.  Donor’s own donations (email‑based, secure)
 * ------------------------------------------------------------------ */
router.get("/my-donations/:donorId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "donor")
      return res.status(403).json({ message: "Only donors can view their donations" });

    const donorEmail = decodeURIComponent(req.params.donorId);
    if (donorEmail !== req.user.email)
      return res.status(403).json({ message: "You can only access your own donations" });

    const donations = await Donation.find({ donorEmail }).sort({ timestamp: -1 });
    res.json(donations);
  } catch (err) {
    console.error("Error fetching donor donations:", err);
    res.status(500).json({ error: "Failed to fetch your donations" });
  }
});

module.exports = router;
