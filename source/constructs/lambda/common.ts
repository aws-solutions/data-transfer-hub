import { AssertionError } from "assert";

interface Task {
  id: string,
  type: TaskType,
  description?: string,
  templateUrl: string,
  parameters?: Parameter[],
  createdAt?: string,
  stoppedAt?: string,
  progress?: TaskProgress,
  progressInfo?: CommonProgressInfo,
  stackId?: string,
  stackStatus?: string,
  stackStatusReason?: string
  executionArn?: string
}

interface CommonProgressInfo {
  total?: number,
  replicated: number
}


enum TaskProgress {
  STARTING = 'STARTING',
  STOPPING = 'STOPPING',
  ERROR = 'ERROR',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  STOPPED = 'STOPPED'
}

enum TaskType {
  S3 = 'S3EC2',
  ECR = 'ECR'
}

enum ScheduleType {
  ONE_TIME = 'ONE_TIME',
  FIXED_RATE = 'FIXED_RATE'
}

interface Parameter {
  ParameterKey: string,
  ParameterValue: string
}

interface CreateTaskInput {
  type: TaskType,
  description?: string,
  scheduleType: ScheduleType,
  parameters?: Parameter[]
}

interface UpdateTaskInput {
  description?: string,
  parameters?: Parameter[]
}

interface CommonTaskProgress {
  total?: number
  replicated: number
}

/**
 * Assert.
 * @param condition
 * @param msg Error message
 */
function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError({
      message: msg
    });
  }
}

/**
 * Pretty Print the JSON object
 * @param prefix The keyword before the object
 * @param object JSON object to print
 */
function pprint(prefix: string, object: any) {
  console.log(prefix + ": \n" + JSON.stringify(object, null, 2))
}

/**
 * Create a random string id using letters.
 * @param length
 */
function makeid(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export { Task, TaskType, ScheduleType, Parameter, CreateTaskInput, UpdateTaskInput, CommonTaskProgress, TaskProgress, assert, pprint, makeid }