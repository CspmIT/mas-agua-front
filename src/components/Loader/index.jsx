import cooptech from '../../../src/assets/img/Logo_Cooptech.png'
const LoaderComponent = ({ image = true }) => {
	return (
		<div className='flex flex-col items-center justify-center w-full min-h-full '>
			<div className={`transition-opacity duration-1000 opacity-100`}>
				{image && <img src={cooptech} alt='COOPTECH Logo' className='w-72 h-auto mb-4' />}
				<div className='flex justify-center items-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
				</div>
			</div>
		</div>
	)
}
export default LoaderComponent
