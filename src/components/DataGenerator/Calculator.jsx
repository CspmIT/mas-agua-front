import { useEffect, useRef, useState } from 'react'
import { Button, Card, IconButton, Modal, Paper, Typography } from '@mui/material'
import { useVars } from './ProviderVars'
import ChipCustom from '../ChipCustom/ChipCustom'
import CalculatorVars from './ClculatorVars'
import { Close } from '@mui/icons-material'
import Swal from 'sweetalert2'

const Calculadora = ({ display, setDisplay, showNumbers }) => {
	const [state, dispatch] = useVars()
	const [modalInfo, setModalInfo] = useState(false)
	const [dataVariable, setDataVariable] = useState({})
	const calculatorRef = useRef(null)
	const inputRef = useRef(null)

	const [newDisplay, setNewDisplay] = useState(display)

	const handleDeleteVar = (variable) => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: 'No podras revertir esta acción',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Si, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				dispatch({ type: 'REMOVE_CALC_VAR', payload: variable })
				const newValue = newDisplay.filter((item) => item != `{{${variable}}}`)
				setNewDisplay(newValue)
				setDisplay(newValue)
			}
		})
	}
	const handleInfo = (variable) => {
		setModalInfo(true)
		setDataVariable(variable)
	}
	const handleClear = () => {
		setNewDisplay([])
		setDisplay([])
	}

	const handleClearLast = () => {
		if (newDisplay.length) {
			const updatedArray = [...newDisplay]
			updatedArray.pop()
			setNewDisplay(updatedArray)
			setDisplay(updatedArray)
		}
	}

	const handleClick = (value) => {
		const lastItem = newDisplay[newDisplay.length - 1]
	  
		if (!isNaN(Number(value)) && !isNaN(Number(lastItem))) {
		  const updated = [...newDisplay]
		  updated[updated.length - 1] = `${lastItem}${value}`
		  setNewDisplay(updated)
		  setDisplay(updated)
		} else {
		  const newValue = [...newDisplay, value]
		  setNewDisplay(newValue)
		  setDisplay(newValue)
		}
	  }
	  

	const handleKeyDown = (e) => {
		const validKeys = '0123456789/*-+()'.split('')
		if (validKeys.includes(e.key) && showNumbers) {
			const activeElement = document.activeElement
			if (calculatorRef.current.contains(activeElement) || activeElement === document.body) {
				handleClick(e.key)
			}
		}
	}

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	const buttons = [
		...(showNumbers
			? [
					{ value: '1', icon: '1' },
					{ value: '2', icon: '2' },
					{ value: '3', icon: '3' },
					{ value: '4', icon: '4' },
					{ value: '5', icon: '5' },
					{ value: '6', icon: '6' },
					{ value: '7', icon: '7' },
					{ value: '8', icon: '8' },
					{ value: '9', icon: '9' },
					{ value: '0', icon: '0' },
			  ]
			: []),
		{ value: '/', icon: '/' },
		{ value: '*', icon: '*' },
		{ value: '-', icon: '-' },
		{ value: '+', icon: '+' },
		{ value: '==', icon: '==' },
		{ value: '!=', icon: '!=' },
		{ value: '(', icon: '(' },
		{ value: ')', icon: ')' },
		{ value: '<', icon: '<' },
		{ value: '>', icon: '>' },
		{ value: '<=', icon: '<=' },
		{ value: '>=', icon: '>=' },
		{ value: '&&', icon: 'AND' },
		{ value: '||', icon: 'OR' },
		{ value: '!', icon: 'NOT' },
		{ value: 'C', icon: 'C' },
		{ value: 'DEL', icon: '⌫' },
	]

	const handleFocus = () => {
		inputRef.current.focus()
	}
	useEffect(() => {
		const eq = state?.equation;
		if (Array.isArray(eq) && eq.length > 0) {
		  setDisplay(eq);
		  setNewDisplay(eq);
		}
	  }, [state.equation]);
	useEffect(() => {
		dispatch({ type: 'SET_EQUATION', payload: newDisplay })
	}, [newDisplay])

	return (
		<Paper elevation={0} ref={calculatorRef} onClick={handleFocus} className='!bg-slate-50 border-2 border-slate-100 p-3 !rounded-lg shadow-md w-[85%]'>
			<Typography variant='h6' className='!mb-2' align='center'>
				Calculadora de variables
			</Typography>

			<div className='flex justify-center w-full gap-3 max-md:flex-wrap'>
				<div className='w-1/3 flex justify-center'>
					<div className='flex gap-1 mb-1 flex-wrap justify-center'>
						{buttons.map(({ value, icon }) => (
							<Button
								key={value}
								variant='contained'
								onClick={() => {
									if (value === 'C') handleClear()
									else if (value === 'DEL') handleClearLast()
									else handleClick(value)
								}}
							>
								{icon}
							</Button>
						))}
					</div>
				</div>

				<div className='w-2/3 flex flex-col gap-3'>
					{state.calcVars.length >= 1 && (
						<div className='flex gap-1 w-full flex-wrap'>
							{state.calcVars.map((variable, index) => (
								<ChipCustom
									key={index}
									onClick={() => handleClick(`{{${variable.calc_name_var}}}`)}
									onDelete={() => handleDeleteVar(variable.calc_name_var)}
									color={'success'}
									onInfo={() => handleInfo(variable)}
									label={variable.calc_name_var}
								/>
							))}
						</div>
					)}
					<div className='flex h-full p-2 relative border-dashed border-[1px] border-gray-400 bg-white rounded-md'>
						<input ref={inputRef} className='absolute top-0 left-0 w-full h-full opacity-0 cursor-text' />
						{newDisplay
							? newDisplay.map((item, index) => {
									const isCurrentNumeric = !isNaN(Number(item))
									const isPreviousNumeric = !isNaN(Number(newDisplay?.[index - 1]))

									return (
										<span
											key={index}
											style={{
												color: item.startsWith('{{') && item.endsWith('}}') ? 'blue' : 'black',
												marginLeft:
													isCurrentNumeric || (!isPreviousNumeric && !isCurrentNumeric)
														? 0
														: 4,
												marginRight: isCurrentNumeric ? 0 : 4,
											}}
										>
											{item}
										</span>
									)
							  })
							: null}
					</div>
				</div>
			</div>
			
			<CalculatorVars data={dataVariable} />
			
		</Paper>
	)
}

export default Calculadora
