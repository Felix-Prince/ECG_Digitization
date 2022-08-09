import React, { Component } from "react"
import { Button, message, Image } from "antd"
import axios from "axios"
import store from "../Redux/store"
import { saveData } from "../Redux/dataListActions"
import { apiUrl } from "../../globalData"

export default class ImageCutting extends Component {
	constructor(props) {
		const { dataReducer } = store.getState()
		const { imageBase64 } = dataReducer
		super(props)
		this.state = {
			showPreview: false,
			imageBase64,
		}
	}

	componentDidMount() {
		const { Cropper } = window
		const image = document.getElementById("imageitem")
		window.cropperitem = new Cropper(image, {
			aspectRatio: NaN,
			zoomable: false,
			viewMode: 1,
		})
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
	handleCutting = () => {
		const { activeTabReducer, dataReducer } = store.getState()
		message.destroy()
		message.loading("处理中...", 0)
		const { cropperitem } = window
		const data = cropperitem.getData()

		const body = [
			{
				x: data.x,
				y: data.y,
				height: data.height,
				width: data.width,
				startTime: 0.0,
				label: activeTabReducer,
			},
		]

		let formData = new FormData()

		formData.append("file", dataReducer.rawFile)
		formData.append("params", JSON.stringify(body))
		formData.append("type", dataReducer.type)
		console.log("要发请求了")
		let p = axios({
			method: "post",
			url: `${apiUrl}/index/`,
			headers: {
				"Content-Type": "multipart/form-data",
			},
			data: formData,
			timeout: 10000,
		})

		axios.interceptors.response.use(
			function (response) {
				if (response.status === 200) {
					return response
				} else {
					return Promise.reject(response)
				}
			},
			function (error) {
				return Promise.reject(error)
			}
		)

		p.then(res => {
			let _data = res.data.data[0]
			let dataList_item = {
				cropData: data,
				v_array: _data.v_array,
				g_array: _data.g_array,
			}
			store.dispatch(
				saveData({
					data: dataList_item,
					index: activeTabReducer,
				})
			)
			message.destroy()
			message.success("裁剪成功 记得切换标签哦")

			// setTimeout(() => {
			// 	store.dispatch(switchTab(activeTabReducer + 1))
			// 	message.destroy()
			// 	message.success("当前选中标签为：" + this.getlabel(activeTabReducer + 1))
			// }, 1000)
		}).catch(err => {
			message.error(JSON.stringify(err.message))
		})
	}

	componentWillUnmount() {
		console.log("卸载了")
	}

	render() {
		const { dataListReducer, activeTabReducer } = store.getState()
		let haveData = false
		let previewUrl = `${apiUrl}/index/preview/?label=${activeTabReducer}`
		if (dataListReducer[activeTabReducer].g_array.length > 0) {
			console.log("裁剪数据已经获取")
			console.log(dataListReducer, activeTabReducer)
			window.cropperitem.setData(dataListReducer[activeTabReducer].cropData)
			haveData = true
		}

		return (
			<div>
				<div className="imageBox">
					<img src={this.state.imageBase64} id="imageitem" alt="avatar" style={{ height: "90%" }} />
				</div>
				<div style={{ height: "20px" }}></div>
				<Button type="primary" shape="round" size={"large"} style={{ marginRight: "10px" }} onClick={this.handleCutting}>
					{haveData ? "重新裁剪" : "裁剪"}
				</Button>

				{haveData ? (
					<Button
						type="primary"
						shape="round"
						size={"large"}
						onClick={() => {
							this.setState({ showPreview: true })
						}}>
						查看预览图
					</Button>
				) : null}
				{this.state.showPreview ? (
					<Image
						width={200}
						style={{ display: "none" }}
						src={previewUrl}
						preview={{
							visible: this.state.showPreview,
							src: previewUrl,
							onVisibleChange: value => {
								this.setState({
									showPreview: false,
								})
							},
						}}
					/>
				) : (
					<></>
				)}
			</div>
		)
	}
}
