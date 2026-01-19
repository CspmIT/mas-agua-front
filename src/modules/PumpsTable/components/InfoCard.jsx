const InfoCard = ({ label, value, color }) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
    }
  
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 py-2 px-4 shadow-md bg-slate-50/50 dark:bg-gray-800">
        <div className="text-sm text-gray-800 dark:text-gray-900">
          {label}
        </div>
        <div className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors[color]}`}>
          {value}
        </div>
      </div>
    )
  }

  export default InfoCard
  