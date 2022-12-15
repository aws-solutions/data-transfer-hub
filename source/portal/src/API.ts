/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateTaskInput = {
  type: TaskType,
  description?: string | null,
  parameters?: Array< TaskParameterInput | null > | null,
};

export enum TaskType {
  S3EC2 = "S3EC2",
  ECR = "ECR",
}


export type TaskParameterInput = {
  ParameterKey?: string | null,
  ParameterValue?: string | null,
};

export type Task = {
  __typename: "Task",
  id: string,
  description?: string | null,
  type?: TaskType | null,
  templateUrl?: string | null,
  parameters?:  Array<TaskParameter | null > | null,
  createdAt?: string | null,
  stoppedAt?: string | null,
  progress?: TaskProgress | null,
  progressInfo?: CommonProgressInfo | null,
  stackId?: string | null,
  stackName?: string | null,
  stackOutputs?:  Array<StackOutputs | null > | null,
  stackStatus?: string | null,
  stackStatusReason?: string | null,
  executionArn?: string | null,
  scheduleType?: ScheduleType | null,
};

export type TaskParameter = {
  __typename: "TaskParameter",
  ParameterKey?: string | null,
  ParameterValue?: string | null,
};

export enum TaskProgress {
  STARTING = "STARTING",
  STOPPING = "STOPPING",
  ERROR = "ERROR",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  STOPPED = "STOPPED",
}


export type CommonProgressInfo = {
  __typename: "CommonProgressInfo",
  total?: number | null,
  replicated?: number | null,
};

export type StackOutputs = {
  __typename: "StackOutputs",
  Description?: string | null,
  OutputKey?: string | null,
  OutputValue?: string | null,
};

export enum ScheduleType {
  ONE_TIME = "ONE_TIME",
  FIXED_RATE = "FIXED_RATE",
}


export type ListTasksResponse = {
  __typename: "ListTasksResponse",
  items?:  Array<Task | null > | null,
  nextToken?: string | null,
};

export type ListTasksResponseV2 = {
  __typename: "ListTasksResponseV2",
  items?:  Array<Task | null > | null,
  total?: number | null,
};

export type Secret = {
  __typename: "Secret",
  name: string,
  description?: string | null,
};

export type ListLogStreamsResponse = {
  __typename: "ListLogStreamsResponse",
  logStreams?:  Array<LogStream | null > | null,
  total?: number | null,
};

export type LogStream = {
  __typename: "LogStream",
  logStreamName?: string | null,
  creationTime?: string | null,
  firstEventTimestamp?: string | null,
  lastEventTimestamp?: string | null,
  lastIngestionTime?: string | null,
  uploadSequenceToken?: string | null,
  arn?: string | null,
  storedBytes?: number | null,
};

export type GetLogEventsResponse = {
  __typename: "GetLogEventsResponse",
  logEvents?:  Array<LogEvent | null > | null,
  nextForwardToken?: string | null,
  nextBackwardToken?: string | null,
};

export type LogEvent = {
  __typename: "LogEvent",
  timestamp?: string | null,
  message?: string | null,
  ingestionTime?: string | null,
};

export enum GraphName {
  Network = "Network",
  TransferredFailedObjects = "TransferredFailedObjects",
  RunningWaitingJobHistory = "RunningWaitingJobHistory",
  DesiredInServiceInstances = "DesiredInServiceInstances",
}


export type GetMetricHistoryDataResponse = {
  __typename: "GetMetricHistoryDataResponse",
  series?:  Array<DataSerie | null > | null,
  xaxis?: GraphXaxis | null,
};

export type DataSerie = {
  __typename: "DataSerie",
  name?: string | null,
  data?: Array< number | null > | null,
};

export type GraphXaxis = {
  __typename: "GraphXaxis",
  categories?: Array< number | null > | null,
};

export type GetErrorMessageResponse = {
  __typename: "GetErrorMessageResponse",
  errMessage?: string | null,
  errCode?: TaskErrorCode | null,
};

export enum TaskErrorCode {
  CFN_ERROR = "CFN_ERROR",
  FINDER_ERROR = "FINDER_ERROR",
  COMPLETE_CHECK_ERROR = "COMPLETE_CHECK_ERROR",
  UN_KNOWN = "UN_KNOWN",
}


export type CreateTaskMutationVariables = {
  input: CreateTaskInput,
};

export type CreateTaskMutation = {
  createTask?:  {
    __typename: "Task",
    id: string,
    description?: string | null,
    type?: TaskType | null,
    templateUrl?: string | null,
    parameters?:  Array< {
      __typename: "TaskParameter",
      ParameterKey?: string | null,
      ParameterValue?: string | null,
    } | null > | null,
    createdAt?: string | null,
    stoppedAt?: string | null,
    progress?: TaskProgress | null,
    progressInfo?:  {
      __typename: "CommonProgressInfo",
      total?: number | null,
      replicated?: number | null,
    } | null,
    stackId?: string | null,
    stackName?: string | null,
    stackOutputs?:  Array< {
      __typename: "StackOutputs",
      Description?: string | null,
      OutputKey?: string | null,
      OutputValue?: string | null,
    } | null > | null,
    stackStatus?: string | null,
    stackStatusReason?: string | null,
    executionArn?: string | null,
    scheduleType?: ScheduleType | null,
  } | null,
};

export type StopTaskMutationVariables = {
  id?: string | null,
};

export type StopTaskMutation = {
  stopTask?:  {
    __typename: "Task",
    id: string,
    description?: string | null,
    type?: TaskType | null,
    templateUrl?: string | null,
    parameters?:  Array< {
      __typename: "TaskParameter",
      ParameterKey?: string | null,
      ParameterValue?: string | null,
    } | null > | null,
    createdAt?: string | null,
    stoppedAt?: string | null,
    progress?: TaskProgress | null,
    progressInfo?:  {
      __typename: "CommonProgressInfo",
      total?: number | null,
      replicated?: number | null,
    } | null,
    stackId?: string | null,
    stackName?: string | null,
    stackOutputs?:  Array< {
      __typename: "StackOutputs",
      Description?: string | null,
      OutputKey?: string | null,
      OutputValue?: string | null,
    } | null > | null,
    stackStatus?: string | null,
    stackStatusReason?: string | null,
    executionArn?: string | null,
    scheduleType?: ScheduleType | null,
  } | null,
};

export type ListTasksQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTasksQuery = {
  listTasks?:  {
    __typename: "ListTasksResponse",
    items?:  Array< {
      __typename: "Task",
      id: string,
      description?: string | null,
      type?: TaskType | null,
      templateUrl?: string | null,
      parameters?:  Array< {
        __typename: "TaskParameter",
        ParameterKey?: string | null,
        ParameterValue?: string | null,
      } | null > | null,
      createdAt?: string | null,
      stoppedAt?: string | null,
      progress?: TaskProgress | null,
      progressInfo?:  {
        __typename: "CommonProgressInfo",
        total?: number | null,
        replicated?: number | null,
      } | null,
      stackId?: string | null,
      stackName?: string | null,
      stackOutputs?:  Array< {
        __typename: "StackOutputs",
        Description?: string | null,
        OutputKey?: string | null,
        OutputValue?: string | null,
      } | null > | null,
      stackStatus?: string | null,
      stackStatusReason?: string | null,
      executionArn?: string | null,
      scheduleType?: ScheduleType | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type ListTasksV2QueryVariables = {
  page?: number | null,
  count?: number | null,
};

export type ListTasksV2Query = {
  listTasksV2?:  {
    __typename: "ListTasksResponseV2",
    items?:  Array< {
      __typename: "Task",
      id: string,
      description?: string | null,
      type?: TaskType | null,
      templateUrl?: string | null,
      parameters?:  Array< {
        __typename: "TaskParameter",
        ParameterKey?: string | null,
        ParameterValue?: string | null,
      } | null > | null,
      createdAt?: string | null,
      stoppedAt?: string | null,
      progress?: TaskProgress | null,
      progressInfo?:  {
        __typename: "CommonProgressInfo",
        total?: number | null,
        replicated?: number | null,
      } | null,
      stackId?: string | null,
      stackName?: string | null,
      stackOutputs?:  Array< {
        __typename: "StackOutputs",
        Description?: string | null,
        OutputKey?: string | null,
        OutputValue?: string | null,
      } | null > | null,
      stackStatus?: string | null,
      stackStatusReason?: string | null,
      executionArn?: string | null,
      scheduleType?: ScheduleType | null,
    } | null > | null,
    total?: number | null,
  } | null,
};

export type GetTaskQueryVariables = {
  id: string,
};

export type GetTaskQuery = {
  getTask?:  {
    __typename: "Task",
    id: string,
    description?: string | null,
    type?: TaskType | null,
    templateUrl?: string | null,
    parameters?:  Array< {
      __typename: "TaskParameter",
      ParameterKey?: string | null,
      ParameterValue?: string | null,
    } | null > | null,
    createdAt?: string | null,
    stoppedAt?: string | null,
    progress?: TaskProgress | null,
    progressInfo?:  {
      __typename: "CommonProgressInfo",
      total?: number | null,
      replicated?: number | null,
    } | null,
    stackId?: string | null,
    stackName?: string | null,
    stackOutputs?:  Array< {
      __typename: "StackOutputs",
      Description?: string | null,
      OutputKey?: string | null,
      OutputValue?: string | null,
    } | null > | null,
    stackStatus?: string | null,
    stackStatusReason?: string | null,
    executionArn?: string | null,
    scheduleType?: ScheduleType | null,
  } | null,
};

export type ListSecretsQuery = {
  listSecrets?:  Array< {
    __typename: "Secret",
    name: string,
    description?: string | null,
  } | null > | null,
};

export type ListLogStreamsQueryVariables = {
  logGroupName?: string | null,
  logStreamNamePrefix?: string | null,
  page?: number | null,
  count?: number | null,
};

export type ListLogStreamsQuery = {
  listLogStreams?:  {
    __typename: "ListLogStreamsResponse",
    logStreams?:  Array< {
      __typename: "LogStream",
      logStreamName?: string | null,
      creationTime?: string | null,
      firstEventTimestamp?: string | null,
      lastEventTimestamp?: string | null,
      lastIngestionTime?: string | null,
      uploadSequenceToken?: string | null,
      arn?: string | null,
      storedBytes?: number | null,
    } | null > | null,
    total?: number | null,
  } | null,
};

export type GetLogEventsQueryVariables = {
  limit?: number | null,
  logGroupName?: string | null,
  logStreamName?: string | null,
  nextToken?: string | null,
};

export type GetLogEventsQuery = {
  getLogEvents?:  {
    __typename: "GetLogEventsResponse",
    logEvents?:  Array< {
      __typename: "LogEvent",
      timestamp?: string | null,
      message?: string | null,
      ingestionTime?: string | null,
    } | null > | null,
    nextForwardToken?: string | null,
    nextBackwardToken?: string | null,
  } | null,
};

export type GetMetricHistoryDataQueryVariables = {
  id: string,
  graphName: GraphName,
  startTime?: string | null,
  endTime?: string | null,
  period?: number | null,
};

export type GetMetricHistoryDataQuery = {
  getMetricHistoryData?:  {
    __typename: "GetMetricHistoryDataResponse",
    series?:  Array< {
      __typename: "DataSerie",
      name?: string | null,
      data?: Array< number | null > | null,
    } | null > | null,
    xaxis?:  {
      __typename: "GraphXaxis",
      categories?: Array< number | null > | null,
    } | null,
  } | null,
};

export type GetErrorMessageQueryVariables = {
  id: string,
};

export type GetErrorMessageQuery = {
  getErrorMessage?:  {
    __typename: "GetErrorMessageResponse",
    errMessage?: string | null,
    errCode?: TaskErrorCode | null,
  } | null,
};
