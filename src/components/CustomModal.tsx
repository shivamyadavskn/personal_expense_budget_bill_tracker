import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ReactNode } from 'react'

type CustomModalProps = {
    open: boolean
    onClose: () => void
    title: string
    children: ReactNode
}

const CustomModal = ({
    open,
    onClose,
    title,
    children,
}: CustomModalProps) => {
    return (
        <Dialog open={open} onClose={onClose} className="relative z-10 m-6">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-100/75 transition-opacity"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
                    <DialogPanel
                        transition
                        className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
                    >
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                            {title}
                        </DialogTitle>

                        <div className="mt-4">{children}</div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default CustomModal
