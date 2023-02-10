export type Task = {
    _id: string,
    isDeleted: number,
    name: string,
    email: string,
    date: string,
    endDate: string,
    address: {
        formatted_address: string,
        geometry: any
    },
    phone: string
    businessType: number
    orderId: string
    taskStatus: string
    taskId: string
    created_at: string

    taskDescStatus: string
    forecast: string
}