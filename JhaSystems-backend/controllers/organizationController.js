import Organization from "../models/Organization.js";

/* =====================================
   UPDATE ORGANIZATION PROFILE
   PUT /api/organization/profile
===================================== */
export const updateOrganizationProfile = async (req, res) => {
  try {
    const orgId = req.user.orgId; // comes from JWT

    const { companyName, address, contactNumber, gstin } = req.body;

    const org = await Organization.findByIdAndUpdate(
      orgId,
      {
        companyName,
        address,
        contactNumber,
        gstin,
      },
      { new: true }
    );

    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({
      message: "Organization profile updated successfully",
      organization: org,
    });
  } catch (error) {
    console.error("Update Organization Error:", error);
    res.status(500).json({ message: "Failed to update organization profile" });
  }
};
