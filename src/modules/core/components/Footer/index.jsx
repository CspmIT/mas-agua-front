function Footer() {
	return (
		<footer
			className='absolute bottom-0 h-10 hidden sm:flex justify-center items-center w-full z-50 px-4'
			style={{
				background: 'linear-gradient(150deg, #2c6aa0 0%, #1f4e79 75%, #1f4e79 100%)',
			}}
		>
			<p className='text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/80 truncate'>
				Copyright © IT & Development - COOPMORTEROS {new Date().getFullYear()}
			</p>
		</footer>
	)
}

export default Footer
