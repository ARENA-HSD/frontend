import { useEffect } from "react"

export default function AuthSync() {
    useEffect(() => {
        const handleStorage = () => {
            window.location.reload()
        }

        window.addEventListener("storage", handleStorage)

        return () => {
            window.removeEventListener("storage", handleStorage)
        }
    }, [])

    return null
}