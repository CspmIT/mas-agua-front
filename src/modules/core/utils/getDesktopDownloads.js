export const getDesktopDownloads = async () => {
	const res = await fetch('https://api.github.com/repos/CspmIT/mas-agua-front/releases/latest')

	if (!res.ok) {
		throw new Error('No se pudo obtener el último release')
	}

	const data = await res.json()
	const findAsset = (ext) => data.assets.find((asset) => asset.name.toLowerCase().endsWith(ext))

	return {
		version: data.tag_name,
		windows: findAsset('.msi'),
		appImage: findAsset('.appimage'),
		deb: findAsset('.deb'),
	}
}
