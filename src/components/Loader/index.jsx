import cooptech from '../../../src/assets/img/Logo_Cooptech.png'
import styles from './Loader.module.css'

const LoaderComponent = ({ image = true }) => {
	return (
		<div className={styles.container}>
			{image ? (
				<>
					<img src={cooptech} alt='COOPTECH Logo' className={styles.logo} />
					<div className={styles.track}>
						<div className={styles.bar} />
					</div>
				</>
			) : (
				<div className={styles.ring} />
			)}
		</div>
	)
}
export default LoaderComponent
