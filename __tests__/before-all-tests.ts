import {
  Alternative,
  Answer,
  Invite,
  Question,
  Quiz,
  User,
  Result
} from '../src/models';
import config from './config-sequelize';

config();

const truncateAll = async (): Promise<void> => {
  await Answer.destroy({ truncate: true, force: true });
  await Result.destroy({ truncate: true, force: true });
  await Alternative.destroy({ truncate: true, force: true });
  await Invite.destroy({ truncate: true, force: true });
  await Question.destroy({ truncate: true, force: true });
  await Quiz.destroy({ truncate: true, force: true });
  await User.destroy({ truncate: true, force: true });
};

export default truncateAll;
