import * as fabric from 'fabric'

export const handlechangeBackground = (imageSrc, canvas) => {
	const imgNode = new Image()
	imgNode.src = imageSrc
	imgNode.onload = () => {
		const canvasWidth = canvas.width
		const canvasHeight = canvas.height

		const left = (canvasWidth - imgNode.width) / 2
		const top = (canvasHeight - imgNode.height) / 2
		canvas.backgroundImage = new fabric.FabricImage(imgNode, {
			width: canvas.width,
			left: left,
			top: top,
		})
		canvas.backgroundImage._originalElement.metasrc = imageSrc
		canvas.renderAll()
	}
}
