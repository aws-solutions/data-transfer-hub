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
  stackStatus?: string | null,
  stackStatusReason?: string | null,
  executionArn?: string | null,
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

export type ListTasksResponse = {
  __typename: "ListTasksResponse",
  items?:  Array<Task | null > | null,
  nextToken?: string | null,
};

export type Secret = {
  __typename: "Secret",
  name: string,
  description?: string | null,
};

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
    stackStatus?: string | null,
    stackStatusReason?: string | null,
    executionArn?: string | null,
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
    stackStatus?: string | null,
    stackStatusReason?: string | null,
    executionArn?: string | null,
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
      stackStatus?: string | null,
      stackStatusReason?: string | null,
      executionArn?: string | null,
    } | null > | null,
    nextToken?: string | null,
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
    stackStatus?: string | null,
    stackStatusReason?: string | null,
    executionArn?: string | null,
  } | null,
};

export type ListSecretsQuery = {
  listSecrets?:  Array< {
    __typename: "Secret",
    name: string,
    description?: string | null,
  } | null > | null,
};
