import Group from "../models/group";

const updateGroupActivity = async (groupId) => {
  await Group.findByIdAndUpdate(groupId, {
    lastActivityAt: new Date(),
  });
};

export default updateGroupActivity