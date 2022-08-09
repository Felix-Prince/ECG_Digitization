const initState = [
  {
    cropData: {},
    v_array: [],
    g_array: []
  },
  {
    cropData: {},
    v_array: [],
    g_array: []
  }, {
    cropData: {},
    v_array: [],
    g_array: []
  }, {
    cropData: {},
    v_array: [],
    g_array: []
  }, {
    cropData: {},
    v_array: [],
    g_array: []
  }, {
    cropData: {},
    v_array: [],
    g_array: []
  }, {
    cropData: {},
    v_array: [],
    g_array: []
  }, {
    cropData: {},
    v_array: [],
    g_array: []
  }, {
    cropData: {},
    v_array: [],
    g_array: []
  }, {
    cropData: {},
    v_array: [],
    g_array: []
  }, {
    cropData: {},
    v_array: [],
    g_array: []
  }, {
    cropData: {},
    v_array: [],
    g_array: []
  },
]
//data下存俩 一个是data 一个是index
export default function dataReducer(state = initState, action) {
  const { type, data } = action
  switch (type) {
    case 'saveData':
      let newState = state.map((item, index) => {
        if (index === data.index) {
          return data.data
        } else {
          return item
        }
      })
      return newState
    case 'clearData':
      return initState
    default:
      return state
  }
}