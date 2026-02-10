import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid"
import { classNames } from "../../../utils/CssClassFunction"

/* -------------------- TYPES -------------------- */

type Bill = {
    _id: string
    title: string
    category: string
    amount: number
    dueDate: string
    frequency: string
    status: "paid" | "pending"
}

type TimelineItem = {
    id: string
    content: string
    target: string
    date: string
    datetime: string
    type: {
        bgColorClass: string
        icon: React.ComponentType<any>
    }
}

type Props = {
    upcomingBills?: Bill[] | any
}

/* -------------------- STATUS CONFIG -------------------- */

const timelineTypeByStatus: Record<string, any> = {
    paid: {
        bgColorClass: "bg-green-500",
        icon: CheckCircleIcon,
    },
    pending: {
        bgColorClass: "bg-yellow-500",
        icon: ClockIcon,
    },
}

/* -------------------- COMPONENT -------------------- */

export default function UpcomingBillsTimeline({
    upcomingBills,
}: Props) {
    // ✅ normalize once → TS-safe
    const bills: Bill[] = upcomingBills ?? []

    const timeline: TimelineItem[] = bills.map(bill => ({
        id: bill._id,
        content: bill.status === "paid" ? "Paid bill" : "Upcoming bill",
        target: bill.title,
        date: new Date(bill.dueDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }),
        datetime: bill.dueDate,
        type: timelineTypeByStatus[bill.status],
    }))

    if (timeline.length === 0) {
        return (
            <p className="mt-4 text-sm text-gray-500">
                No upcoming bills
            </p>
        )
    }

    return (
        <div className="mt-6 flow-root">
            <ul role="list" className="-mb-8">
                {timeline.map((item, itemIdx) => (
                    <li key={item.id}>
                        <div className="relative pb-8">
                            {itemIdx !== timeline.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                />
                            )}

                            <div className="relative flex space-x-3">
                                <div>
                                    <span
                                        className={classNames(
                                            item.type.bgColorClass,
                                            "flex size-8 items-center justify-center rounded-full ring-8 ring-white"
                                        )}
                                    >
                                        <item.type.icon
                                            aria-hidden="true"
                                            className="size-5 text-white"
                                        />
                                    </span>
                                </div>

                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <p className="text-sm text-gray-500">
                                        {item.content}{" "}
                                        <span className="font-medium text-gray-900">
                                            {item.target}
                                        </span>
                                    </p>

                                    <time
                                        dateTime={item.datetime}
                                        className="whitespace-nowrap text-right text-sm text-gray-500"
                                    >
                                        {item.date}
                                    </time>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
