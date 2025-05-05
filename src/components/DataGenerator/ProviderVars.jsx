import { createContext, useContext, useReducer } from 'react'

const VarsContext = createContext()

export const useVars = () => {
	return useContext(VarsContext)
}

const initialState = {
	calcVars: [],
	equation: '',
}

const reducer = (state, action) => {
	switch (action.type) {
		case 'ADD_CALC_VAR':
			return {
				...state,
				calcVars: [...state.calcVars, action.payload],
			}
		case 'SET_CALC_VAR':
			return {
				...state,
				calcVars: action.payload,
			}
		case 'REMOVE_CALC_VAR':
			return {
				...state,
				calcVars: state.calcVars.filter((variable) => variable.calc_name_var !== action.payload),
			}
		case 'SET_EQUATION':
			return {
				...state,
				equation: action.payload,
			}
		default:
			return state
	}
}

const VarsProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState)

	return <VarsContext.Provider value={[state, dispatch]}>{children}</VarsContext.Provider>
}

export default VarsProvider
