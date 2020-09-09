import { makeid } from "../../common/common";

test('makeid function', () => {
  const id = makeid(10)
  expect(id.search('([A-Z]|[a-z]){10}')).toEqual(0)
})