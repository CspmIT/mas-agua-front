const buildMenuTree = (data) => {
	const map = {}
	const roots = []

	// clonar y mapear
	data.forEach((item) => {
		map[item.id] = { ...item, children: [] }
	})

	data.forEach((item) => {
		if (item.sub_menu) {
			// es submenú
			if (map[item.sub_menu]) {
				map[item.sub_menu].children.push(map[item.id])
			}
		} else {
			// es menú raíz
			roots.push(map[item.id])
		}
	})

	// ordenar por order en cada nivel
	const sortTree = (nodes) => {
		nodes.sort((a, b) => a.order - b.order)
		nodes.forEach((n) => sortTree(n.children))
	}

	sortTree(roots)

	return roots
}
