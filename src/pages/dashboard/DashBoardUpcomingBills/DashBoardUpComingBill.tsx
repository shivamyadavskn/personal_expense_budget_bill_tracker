import UpcomingBillsTimeline from "./UpcomingBillsTimeLine"

type UpcomingBillsProps = {
    timeline: any[]
}

export default function UpcomingBills({ timeline }: UpcomingBillsProps) {
    return (
        <section
            aria-labelledby="timeline-title"
            className="lg:col-span-1 lg:col-start-3 border-t border-gray-200 pt-11"
        >
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                <h2 id="timeline-title" className="text-lg font-medium text-gray-900">
                    Upcoming Bills
                </h2>

                <UpcomingBillsTimeline upcomingBills={timeline} />

                <div className="mt-6 flex flex-col justify-stretch">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    >
                        View all bills
                    </button>
                </div>
            </div>
        </section>
    )
}
