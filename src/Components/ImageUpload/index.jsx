import React, { Component } from "react"
import { Upload, message } from "antd"
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons"
import ImageCutting from "../ImageCutting"
import axios from "axios"
import store from "../Redux/store"
import { saveRawData } from "../Redux/dataActions"
import { apiUrl } from "../../globalData"
// 图片转base64
function getBase64(img, callback) {
	const reader = new FileReader()
	reader.addEventListener("load", () => callback(reader.result))
	reader.readAsDataURL(img)
}

//#regin
// function beforeUpload(file) {
// 	const isJpgOrPngOrPDF = file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf"
// 	if (!isJpgOrPngOrPDF) {
// 		message.error("只能上传以下文件类型 PNG JPG PDF")
// 	}
// 	if (file.type === "image/jpeg" || file.type === "image/png") {
// 		this.setState({
// 			type: "jpg",
// 		})
// 	}
// 	if (file.type === "application/pdf") {
// 		this.setState({
// 			type: "pdf",
// 		})
// 	}
// 	return isJpgOrPngOrPDF
// }
//#endregion

export default class ImageUpload extends Component {
	state = {
		loading: false,
		isUpload: false,
	}

	handleChange = info => {
		console.log(info)
		let rawFile = info.file.originFileObj
		if (info.file.type === "application/pdf") {
			// 如果是PDF
			this.setState({
				loading: true,
			})
			let formData = new FormData()
			formData.append("pdfFile", rawFile)
			let p = axios({
				method: "POST",
				url: `${apiUrl}/index/pdfUpload/`,
				headers: {
					"Content-Type": "multipart/form-data",
				},
				responseType: "arraybuffer",
				data: formData,
				timeout: 10000,
			})
			p.then(res => {
				// 得到PDF的图片的base64
				let img_base64 = "data:image/png;base64," + btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), ""))
				this.setState({
					loading: false,
				})
				store.dispatch(
					saveRawData({
						imageBase64: img_base64,
						rawFile,
						type: "pdf",
					})
				)
			}).catch(err => {
				message.error("出错了 请稍后再试", err)
				this.reset()
			})
		} else {
			//如果是图片
			getBase64(info.file.originFileObj, imageBase64 => {
				this.setState({
					loading: false,
				})
				store.dispatch(
					saveRawData({
						imageBase64: imageBase64,
						rawFile,
						type: "jpg",
					})
				)
			})
		}
	}

	reset = () => {
		this.setState({
			imageUrl: null,
			loading: false,
		})
		window.cropperitem = null
	}

	render() {
		// 正常图片形式
		const { loading } = this.state
		const { dataReducer } = store.getState()
		const { imageBase64 } = dataReducer

		const uploader = (
			<Upload
				name="avatar"
				listType="picture-card"
				className="avatar-uploader"
				showUploadList={false}
				customRequest={() => {}}
				// beforeUpload={beforeUpload}
				onChange={this.handleChange}>
				<div>
					{loading ? <LoadingOutlined /> : <PlusOutlined />}
					<div style={{ marginTop: 8 }}>上传文件</div>
				</div>
			</Upload>
		)

		return (
			<div className="imageHandleBox">
				{/* <Button type="primary" shape="round" size={"large"} onClick={this.reset}>
					重新上传
				</Button> */}
				<div style={{ height: "20px" }}></div>
				{imageBase64 !== "" ? <ImageCutting /> : uploader}
			</div>
		)
	}
}
