'use client'

export default function DashboardError({reset}: {reset: () => void }) {
    return(
        <div>
            <p>Algo deu errado.</p>
            <button onClick={reset}></button>
        </div>
    )
}