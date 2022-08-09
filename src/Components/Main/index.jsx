import React, { Component } from "react"
import ImageUpload from "../ImageUpload"
import Echarts from "../Echarts"
import TabBar from "../TabBar"
import FixButton from "../FixButton"
export default class Main extends Component {
	render() {
		return (
			<div id="main">
				<TabBar display={true} />
				<ImageUpload />
				<Echarts />
				<FixButton />
			</div>
		)
	}
}
