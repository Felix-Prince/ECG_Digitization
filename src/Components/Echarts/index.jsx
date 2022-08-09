import React, { Component } from "react"
import * as echarts from "echarts"
import { apiUrl } from "../../globalData"
// eslint-disable-next-line
import store from "../Redux/store"
// eslint-disable-next-line
// import p from "../Test/data"
// eslint-disable-next-line
// import Img from "../Test/xxcut.jpeg"
import { Radio } from "antd"
import { Button } from "antd"
import axios from "axios"
import { saveData } from "../Redux/dataListActions"

const defaultOption = {
	xAxis: {
		type: "category",
		data: [],
	},
	yAxis: {
		type: "value",
	},
	series: [
		{
			data: [],
			type: "line",
		},
	],
	grid: {
		top: "10%",
		bottom: "10%",
		left: "5%",
		right: "5%",
	},
}
export default class Echarts extends Component {
	constructor(props) {
		super(props)
		this.state = { samplingRate: null, memberIndex: null, new_array: [], v_array: null }
	}
	componentDidMount() {
		window.myChart = echarts.init(document.getElementById("echarts"))
		window.myChart_g = echarts.init(document.getElementById("echarts_g"))
	}

	shouldComponentUpdate(nextProps, nextState) {
		// 预览图被修改说明可能切换了标签 允许修改
		if (nextState.previewUrl !== this.state.previewUrl) {
			return true
		}

		if (nextState.samplingRate === this.state.samplingRate && nextState.memberIndex === this.state.memberIndex && nextProps === this.props) {
			return false
		}

		if (nextState.samplingRate !== this.state.samplingRate) {
			window.myChart_g.clear()
		}
		return true
	}

	componentDidUpdate = () => {
		let { activeTabReducer } = store.getState()
		// 切换标签 清理数据
		let previewUrl = `${apiUrl}/index/preview/?t=${new Date().getTime()}&label=${activeTabReducer}`
		if (activeTabReducer !== this.state.activeTab) {
			this.setState({
				previewUrl,
				activeTab: activeTabReducer,
				samplingRate: null,
				memberIndex: null,
				new_array: [],
				v_array: null,
			})
		}

		this.dataProcess()
	}

	dataProcess = () => {
		console.log("dataProcess")

		let { dataListReducer, activeTabReducer } = store.getState()

		let { g_array, v_array, cropData } = dataListReducer[activeTabReducer]
		// let { g_array, v_array, cropData } = p
		let { samplingRate, memberIndex } = this.state
		let previewUrl = this.state.previewUrl
		let imageHeight = cropData.height
		let imageWidth = cropData.width
		if (this.state.v_array !== null) {
			v_array = this.state.v_array
		}
		if (g_array.length > 0 && v_array.length > 0) {
			if (this.state.new_array.length > 0) {
				// 创建新数组
				let { new_array } = this.state
				// 电压点数据
				let option = {
					title: {
						text: "电压数据",
						left: "center",
					},
					xAxis: {
						type: "category",
						data: [],
					},
					yAxis: {
						type: "value",
					},
					series: [
						{
							data: v_array,
							type: "line",
						},
					],
					grid: {
						top: "10%",
						bottom: "10%",
						left: "5%",
						right: "5%",
					},
				}
				// 像素点数据
				let option_g = {
					title: {
						text: "像素点数据",
						left: "center",
					},
					xAxis: {
						type: "category",
						data: [],
					},
					yAxis: {
						type: "value",
						max: parseInt(imageHeight),
					},
					series: [
						{
							data: new_array,
							type: "line",
							symbolSize: 20,
							itemStyle: {
								normal: {
									color: "#fff",
									lineStyle: {
										width: 2, //设置线条粗细
									},
								},
							},
						},
					],
					grid: {
						top: "10%",
						bottom: "10%",
						left: "5%",
						right: "5%",
					},
				}

				window.myChart.setOption(option)
				window.myChart_g.setOption(option_g)

				// 拖拽回调函数
				let onPointDragging = (dataIndex, pos) => {
					let newPixel = window.myChart_g.convertFromPixel("grid", pos)
					new_array[dataIndex] = [newPixel[0], newPixel[1]]

					// let left_2_x = new_array[dataIndex - 2][0]
					// let left_2_y = new_array[dataIndex - 2][1]
					// let left_1_x = (new_array[dataIndex][0] + left_2_x) / 2
					// let left_1_y = (new_array[dataIndex][1] + left_2_y) / 2
					// new_array[dataIndex - 1] = [left_1_x, left_1_y]

					// let right_2_x = new_array[dataIndex + 2][0]
					// let right_2_y = new_array[dataIndex + 2][1]
					// let right_1_x = (new_array[dataIndex][0] + right_2_x) / 2
					// let right_1_y = (new_array[dataIndex][1] + right_2_y) / 2
					// new_array[dataIndex - 1] = [left_1_x, left_1_y]
					// new_array[dataIndex + 1] = [right_1_x, right_1_y]
					window.myChart_g.setOption({
						series: [
							{
								data: new_array,
							},
						],
					})
					this.setState({
						new_array,
					})
				}

				// 绘制点点
				window.myChart_g.setOption({
					graphic: [
						{
							type: "image",
							$action: "replace",
							id: "preview",
							right: "center",
							bottom: "10%",
							z: 0,
							bounding: "raw",
							style: {
								image: previewUrl,
								// image: Img,
								width: 900,
								height: 240,
							},
						},
						...echarts.util.map(new_array, function (dataItem, dataIndex) {
							if (dataIndex % samplingRate === memberIndex) {
								return {
									// 'circle' 表示这个 graphic element 的类型是圆点。
									type: "circle",
									shape: {
										cx: 0,
										cy: 0,
										r: 3,
									},
									// 用 transform 的方式对圆点进行定位。position: [x, y] 表示将圆点平移到 [x, y] 位置。
									// 这里使用了 convertToPixel 这个 API 来得到每个圆点的位置，下面介绍。
									position: window.myChart_g.convertToPixel("grid", dataItem),

									// 这个属性让圆点不可见（但是不影响他响应鼠标事件）。
									invisible: false,
									// 这个属性让圆点可以被拖拽。
									draggable: true,
									// 把 z 值设得比较大，表示这个圆点在最上方，能覆盖住已有的折线图的圆点。
									z: 100,
									// 此圆点的拖拽的响应事件，在拖拽过程中会不断被触发。下面介绍详情。
									// 这里使用了 echarts.util.curry 这个帮助方法，意思是生成一个与 onPointDragging
									// 功能一样的新的函数，只不过第一个参数永远为此时传入的 dataIndex 的值。
									ondrag: function (dx, dy) {
										onPointDragging(dataIndex, [this.x, this.y])
									},
								}
							}
						}),
					],
				})
			} else {
				// 转为坐标点
				let new_array = g_array.map((item, index) => {
					return [index, imageHeight - item]
				})

				// 计算相差多少像素
				let diff = parseInt(imageWidth) - g_array.length
				if (diff !== 0) {
					// 补零
					let diffArray = new Array(diff).fill(40).map((item, index) => {
						return [index + g_array.length, 40]
					})
					new_array = [...new_array, ...diffArray]
				}

				// 到此为止得到能显示的数组 存入state
				this.setState({
					new_array,
					samplingRate: 6,
					memberIndex: 0,
				})
			}
		} else {
			let option = defaultOption
			let option_g = defaultOption
			window.myChart.setOption(option)
			window.myChart_g.setOption(option_g, {
				notMerge: true,
			})
		}
	}

	onChange = e => {
		this.setState({
			samplingRate: e.target.value,
			memberIndex: 0,
		})
	}

	saveAndUpdateData = () => {
		const { activeTabReducer, dataReducer, dataListReducer } = store.getState()

		let { cropData } = dataListReducer[activeTabReducer]

		const body = [
			{
				x: cropData.x,
				y: cropData.y,
				height: cropData.height,
				width: cropData.width,
				startTime: 0.0,
				label: activeTabReducer,
			},
		]

		let formData = new FormData()

		formData.append("file", dataReducer.rawFile)
		formData.append("type", "jpg")
		formData.append("x", cropData.x)
		formData.append("y", cropData.y)
		formData.append("width", cropData.width)
		formData.append("height", cropData.height)
		formData.append("label", activeTabReducer)

		let g_array = this.state.new_array.map(item => {
			return cropData.height - item[1]
		})
		formData.append("g_array", JSON.stringify(g_array))
		let p = axios({
			method: "post",
			url: `${apiUrl}/index/newUpload/`,
			headers: {
				"Content-Type": "multipart/form-data",
			},
			data: formData,
			// timeout: 10000,
		})
		p.then(res => {
			if (res.data.msg === 200) {
				let previewUrl = `${apiUrl}/index/preview/?t=${new Date().getTime()}&label=${activeTabReducer}`
				dataListReducer[activeTabReducer].v_array = res.data.data[0]
				store.dispatch(saveData(dataListReducer))
				this.setState({
					previewUrl,
					v_array: res.data.data[0],
				})
			} else {
				throw new Error(res.data.msg)
			}
		})
	}

	saveAsJson = (filename, text) => {
		var element = document.createElement("a")
		element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text))
		element.setAttribute("download", filename)

		element.style.display = "none"
		document.body.appendChild(element)

		element.click()

		document.body.removeChild(element)
	}
	export = () => {
		let { dataListReducer, activeTabReducer, dataReducer } = store.getState()

		let file = dataReducer.rawFile

		// let { v_array } = dataListReducer[activeTabReducer]
		// if (this.state.v_array !== null) {
		// 	v_array = this.state.v_array
		// }

		let jsonList = dataListReducer.map((item, index) => {
			return {
				label: index + 1,
				v_array: item.v_array,
			}
		})

		let data = {
			[file.name]: jsonList,
		}
		this.saveAsJson("data.json", JSON.stringify(data))
	}
	render() {
		let buttonList = Array.from(new Array(this.state.samplingRate).keys())
		let { samplingRate, memberIndex } = this.state

		return (
			<div>
				<div id="echarts"></div>
				<Button type="dashed" onClick={this.export}>
					导出数据
				</Button>
				<div id="echarts_g"></div>
				{samplingRate === null ? null : (
					<div style={{ marginLeft: "5%" }}>
						<div>
							当前采样率为{samplingRate},选中组中第{memberIndex + 1}项
						</div>
						<div>请输入采样率</div>
						<Radio.Group onChange={this.onChange} value={this.state.samplingRate}>
							<Radio value={3}>3</Radio>
							<Radio value={4}>4</Radio>
							<Radio value={5}>5</Radio>
							<Radio value={6}>6</Radio>
						</Radio.Group>
						<div>
							{buttonList.map(item => {
								return (
									<Button
										style={{ marginRight: "5px" }}
										type="dashed"
										onClick={e => {
											this.setState({
												memberIndex: item,
											})
										}}
										key={item}>{`每组中第${item + 1}项`}</Button>
								)
							})}
						</div>
						<div>
							<Button type="primary" onClick={this.saveAndUpdateData}>
								保存
							</Button>
						</div>
					</div>
				)}
			</div>
		)
	}
}
