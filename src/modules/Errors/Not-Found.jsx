import { Button } from "@mui/material"
import { useNavigate } from "react-router-dom"

export default function NotFound() {
  const navigate = useNavigate()
  const returnHome = () => {navigate("/")}

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <img src="/assets/img/Logo/MasAgua.png" alt="MAS AGUA Logo" width={200} height={200} priority />
        </div>

        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {returnHome()}}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
            textTransform: "none",
            fontWeight: "bold",
            padding: "10px 24px",
            borderRadius: "8px",
          }}
        >
          Volver al inicio
        </Button>
      </div>

      <div className="mt-8">
        <img src="/assets/img/logoCooptech.png" alt="COOPTECH Logo" width={160} height={80} />
      </div>
    </div>
  )
}
