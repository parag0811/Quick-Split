import Group from "../models/group.js";

const updateGroupActivity = async (groupId) => {
  await Group.findByIdAndUpdate(groupId, {
    lastActivityAt: new Date(),
  });
};

export default updateGroupActivity