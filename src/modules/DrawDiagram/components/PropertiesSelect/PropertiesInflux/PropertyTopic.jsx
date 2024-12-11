import { Add, Close } from '@mui/icons-material'
import { Badge, Checkbox, IconButton, List, MenuItem, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import PropertyTextInflux from './PropertyTextInflux'
import TypeSensor from './TypeSensor/TypeSensor'
import ListField from './ListField'
import RangeConsult from './RangeConsult'

function PropertyTopic({ data, showValueInflux, AddText }) {
	const [info, setInfo] = useState(data || [])
	const [errorTopic, setErrorTopic] = useState(false)
	const [showValueTopic, setShowValueTopic] = useState(false)

	useEffect(() => {
		setInfo(data)
		setShowValueTopic(data.showValue)
	}, [data])

	const changeTopic = (string) => {
		data.setTopic(string)
		setInfo((prev) => ({ ...prev, topic: string }))
		if (string) {
			setErrorTopic(false)
		}
	}

	useEffect(() => {
		info?.field?.length > 0 && !info.topic ? setErrorTopic(true) : setErrorTopic(false)
	}, [])

	const showValue = async (status) => {
		setShowValueTopic(status)
		const newInfo = { ...info, showValue: status }
		setInfo(newInfo)
		data.setShowValue(status)
		showValueInflux(newInfo, status)
	}

	return (
		<div className='flex flex-col gap-4'>
			<TextField
				type='text'
				label='Topico'
				id='topic'
				name='topic'
				onBlur={() => {
					!info.topic ? setErrorTopic(true) : setErrorTopic(false)
				}}
				onChange={(e) => changeTopic(e.target.value)}
				className='w-full'
				error={errorTopic}
				value={info.topic || ''}
			/>

			{/* // FALTA EL LISTADO DEL FIELDS Y LOS DATE DE FECHA */}
			<RangeConsult data={data} />
			<ListField data={data} setShowValueTopic={setShowValueTopic} AddText={AddText} />
			<TypeSensor data={data} />
			<div className='flex justify-start items-center'>
				<Checkbox key={'topic'} checked={!!showValueTopic} onChange={(e) => showValue(e.target.checked)} />
				<p>Mostrar Valor</p>
			</div>
			{showValueTopic ? <PropertyTextInflux data={data} AddText={AddText} /> : null}
		</div>
	)
}

export default PropertyTopic
