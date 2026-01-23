import { useState } from 'react'
import './App.css'


function App() {
  const [count, setCount] = useState(0)

  const api = import.meta.env.VITE_API_URL || 'API URL bulunamadı';
  console.log("API URL:", api);
  const healthCheck = async () => {
    try {
      const response = await fetch(`${api}/db-health`);
      const data = await response.json();
      console.log("Health Check Response:", data);
    } catch (error) {
      console.error("Health Check Error:", error);
    }
  };

  healthCheck();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white text-3xl font-bold">
      Tailwind çalışıyor 🚀
      <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </div>
  )
}

export default App
