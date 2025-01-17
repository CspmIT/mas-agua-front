'use client'

import { useState } from 'react'
// import {
//     PlusIcon,
//     XMarkIcon,
//     DropletIcon,
//     ClockIcon,
// } from '@heroicons/react/24/outline'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card'
// import {
//     Dialog,
//     DialogContent,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
import { PiPlusCircleDuotone } from 'react-icons/pi'
import { Close, X } from '@mui/icons-material'
import { BiDroplet } from 'react-icons/bi'
import { BsClock } from 'react-icons/bs'
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogTitle,
    Input,
    Typography,
} from '@mui/material'

export default function PumpControl() {
    const [pumps, setPumps] = useState([
        { id: 1, name: 'Bomba 1', percentage: 88.58 },
        { id: 2, name: 'Bomba 2', percentage: 88.58 },
        { id: 3, name: 'Bomba 3', percentage: 0 },
    ])
    const [open, setOpen] = useState(false)
    const [newPumpName, setNewPumpName] = useState('')

    const handleAddPump = () => {
        if (newPumpName.trim()) {
            const newPump = {
                id: Math.max(0, ...pumps.map((p) => p.id)) + 1,
                name: newPumpName,
                percentage: 0,
            }
            setPumps([...pumps, newPump])
            setNewPumpName('')
            setOpen(false)
        }
    }

    const handleRemovePump = (id) => {
        setPumps(pumps.filter((pump) => pump.id !== id))
    }

    return (
        <div className="container mx-auto mt-8 p-4">
            <Card className="max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">
                            Control de Bombas
                        </h2>
                        <Button onClick={() => setOpen(true)}>
                            <PiPlusCircleDuotone className="h-5 w-5 mr-2" />
                            Agregar Bomba
                        </Button>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-md flex gap-1 justify-center items-center mb-6">
                        <Typography variant='h6'>Estado:</Typography>
                        <Typography variant='h6' className="font-bold text-green-600">Normal</Typography>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {pumps.map((pump) => (
                            <Card key={pump.id} className="!relative !bg-gray-100">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="!absolute !-right-4 !top-1 !p-0"
                                    onClick={() => handleRemovePump(pump.id)}
                                >
                                    <Close className="!h-4 !w-4" />
                                </Button>
                                <CardContent className="p-4">
                                    <h4 className="text-lg font-medium mb-2">
                                        {pump.name}
                                    </h4>
                                    <p className="text-3xl font-bold text-blue-500">
                                        {pump.percentage}%
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex items-center mt-4 text-gray-500">
                        <BsClock className="h-5 w-5 mr-2" />
                        <span className="text-sm">
                            {new Date().toLocaleString()}
                        </span>
                    </div>
                </CardContent>
            </Card>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <div>
                        <DialogTitle>Agregar Nueva Bomba</DialogTitle>
                    </div>
                    <Input
                        placeholder="Nombre de la Bomba"
                        value={newPumpName}
                        onChange={(e) => setNewPumpName(e.target.value)}
                    />
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleAddPump}>Agregar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
