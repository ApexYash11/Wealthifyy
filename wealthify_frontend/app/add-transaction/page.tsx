"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AddTransactionModal from '@/components/add-transaction-modal'
import transactionAPI from '@/lib/api/transactions'
import { useToast } from '@/hooks/use-toast'

export default function AddTransactionPage() {
  const [open, setOpen] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  return (
    <div>
      <AddTransactionModal
        isOpen={open}
        onClose={() => {
          setOpen(false)
          router.push('/dashboard')
        }}
        onAddTransaction={async (tx) => {
          try {
            await transactionAPI.addTransaction({
              description: tx.description,
              amount: tx.amount,
              type: tx.type,
              category: tx.category,
              date: tx.date,
            })
            toast({ title: 'Transaction added', description: 'Your transaction was saved.' })
            setOpen(false)
            router.push('/transactions')
          } catch (e) {
            console.error('Error adding transaction from page:', e)
            toast({ title: 'Error', description: 'Could not add transaction', variant: 'destructive' })
          }
        }}
      />
    </div>
  )
}
