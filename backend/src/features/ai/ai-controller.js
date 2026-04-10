import { suggestSplitService } from "./ai-service.js";

export const suggestSplit = async (req, res) => {
  try {
    const result = await suggestSplitService(req.body);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
