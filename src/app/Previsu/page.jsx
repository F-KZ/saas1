import { Suspense } from 'react'
import { Previsu } from './Previsu/Previsu'

export default function PrevisuPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Previsu />
    </Suspense>
  )
}
