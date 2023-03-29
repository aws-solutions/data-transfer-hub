// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeid } from "../lambda/common";

test('makeid function', () => {
  const id = makeid(10)
  expect(id.search('([A-Z]|[a-z]){10}')).toEqual(0)
})