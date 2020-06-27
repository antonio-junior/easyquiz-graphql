import {
  Alternative,
  Answer,
  Invite,
  Poll,
  PollSet,
  User
} from '../src/models';
import config from './config-sequelize';

config();

const truncateAll = async (): Promise<void> => {
  await Answer.destroy({ truncate: true, force: true });
  await Alternative.destroy({ truncate: true, force: true });
  await Invite.destroy({ truncate: true, force: true });
  await Poll.destroy({ truncate: true, force: true });
  await PollSet.destroy({ truncate: true, force: true });
  await User.destroy({ truncate: true, force: true });
};

export default truncateAll;
