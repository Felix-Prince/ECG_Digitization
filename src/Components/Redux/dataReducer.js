const initState =
{
  type: '',
  rawFile: '',
  imageBase64: ''
}

export default function dataReducer(state = initState, action) {
  const { type, data } = action
  switch (type) {
    case 'saveRawData':
      return data
    case 'clearRawData':
      return initState
    default:
      return state
  }
}