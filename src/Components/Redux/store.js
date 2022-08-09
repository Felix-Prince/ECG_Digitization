import { createStore, combineReducers } from "redux";
import activeTabReducer from "./activeTabReducer";
import dataReducer from "./dataReducer";
import dataListReducer from "./dataListReducer";

// eslint-disable-next-line
import { composeWithDevTools } from 'redux-devtools-extension'

const rootReducer = combineReducers({
  activeTabReducer,
  dataReducer,
  dataListReducer
})

// 引入开发者工具
// export default createStore(rootReducer, composeWithDevTools())
export default createStore(rootReducer)