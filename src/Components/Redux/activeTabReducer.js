// 在这里设置活动标签 [0,11]
const initState = 0
export default function activeTabReducer(state = initState, action) {
  const { type, data } = action

  switch (type) {
    case 'switchTab':
      return data
    default:
      return state
  }
}
