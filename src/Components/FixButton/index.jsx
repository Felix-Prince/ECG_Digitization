import React, { Component } from "react"
import { Button } from "antd"
import store from "../Redux/store"
import { clearData } from "../Redux/dataListActions"
import { clearRawData } from "../Redux/dataActions"
import { switchTab } from "../Redux/activeTabActions"
export default class index extends Component {
	render() {
		const { dataReducer } = store.getState()
		const { imageBase64 } = dataReducer
		if (imageBase64 === "") {
			return <div className="fixButton" style={{ display: "none" }}></div>
		} else {
			return (
				<div className="fixButton">
					<Button
						shape="round"
						onClick={() => {
							store.dispatch(clearData())
							store.dispatch(clearRawData())
							store.dispatch(switchTab(0))
						}}>
						重新上传图片
					</Button>
				</div>
			)
		}
	}
}
