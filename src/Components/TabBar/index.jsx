import React, { Component } from "react"
import { Button, message, notification } from "antd"
import store from "../Redux/store"
import { switchTab } from "../Redux/activeTabActions"
// import { CheckOutlined } from "@ant-design/icons"

export default class index extends Component {
	componentDidMount() {
		const { dataReducer } = store.getState()
		if (dataReducer.imageBase64 === "") {
			notification.open({
				message: "换用使用" + document.title,
				description: "请先上传图片或PDF",
				onClick: () => {
					console.log("Notification Clicked!")
				},
				duration: 2,
			})
		}
	}
	getlabel = num => {
		if (num === 0) {
			return "lead I"
		} else if (num === 1) {
			return "lead II"
		} else if (num === 2) {
			return "lead III"
		} else if (num === 3) {
			return "lead aVR"
		} else if (num === 4) {
			return "lead aVL"
		} else if (num === 5) {
			return "lead aVF"
		} else if (num === 6) {
			return "lead V1"
		} else if (num === 7) {
			return "lead V2"
		} else if (num === 8) {
			return "lead V3"
		} else if (num === 9) {
			return "lead V4"
		} else if (num === 10) {
			return "lead V5"
		} else if (num === 11) {
			return "lead V6"
		}
	}
	getlabelIndex = label => {
		if (label === "lead I") {
			return 0
		} else if (label === "lead II") {
			return 1
		} else if (label === "lead III") {
			return 2
		} else if (label === "lead aVR") {
			return 3
		} else if (label === "lead aVL") {
			return 4
		} else if (label === "lead aVF") {
			return 5
		} else if (label === "lead V1") {
			return 6
		} else if (label === "lead V2") {
			return 7
		} else if (label === "lead V3") {
			return 8
		} else if (label === "lead V4") {
			return 9
		} else if (label === "lead V5") {
			return 10
		} else if (label === "lead V6") {
			return 11
		}
	}

	switchTab = item => {
		message.destroy()
		message.success("当前选中标签为：" + this.getlabel(item))
		store.dispatch(switchTab(item))
	}

	render() {
		console.log("tabbar render")
		const { activeTabReducer, dataReducer, dataListReducer } = store.getState()
		let display = false
		dataReducer.imageBase64 !== "" ? (display = true) : (display = false)
		let buttonList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
		let buttonNode = []

		buttonList.map((item, index) => {
			if (item === activeTabReducer) {
				buttonNode.push(
					<Button
						type="primary"
						key={index}
						onClick={() => {
							this.switchTab(item)
						}}
						disabled={!display}
						// style={{
						// 	backgroundColor: "#E7FFEC",
						// 	color: "#43B77B",
						// 	borderColor: "rgb(67 183 123 / 50%)",
						// 	textShadow: " 0 0 transparent",
						// }}
					>
						{this.getlabel(index)}
					</Button>
				)
			} else {
				if (dataListReducer[item].g_array.length > 0) {
					buttonNode.push(
						<Button
							type="default"
							key={index}
							onClick={() => {
								this.switchTab(item)
							}}
							disabled={!display}
							style={{ borderColor: "#40a9ff" }}>
							{this.getlabel(index)}
						</Button>
					)
				} else {
					buttonNode.push(
						<Button
							type="dashed"
							key={index}
							onClick={() => {
								this.switchTab(item)
							}}
							disabled={!display}>
							{this.getlabel(index)}
						</Button>
					)
				}
			}
			return item
		})

		return (
			<div style={{ marginTop: "60px" }}>
				<div className="buttonList">{buttonNode}</div>
			</div>
		)
	}
}
