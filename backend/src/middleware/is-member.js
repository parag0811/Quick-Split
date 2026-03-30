import Group from "../models/group";

const isGroupMember = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const group_id = req.params.groupId;

    const group = await Group.findById(group_id).select("members createdBy name");

    if (!group) {
      const error = new Error("Group not found.");
      error.statusCode = 404;
      throw error;
    }

    const isMember = group.members.some((m) => m.user.equals(user_id));

    if (!isMember) {
      const error = new Error("Not authorized.");
      error.statusCode = 403;
      throw error;
    }

    req.group = group;

    next();
  } catch (err) {
    next(err);
  }
};

export default isGroupMember;
