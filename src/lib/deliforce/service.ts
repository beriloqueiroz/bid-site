import axios from "axios";
import moment from "moment";
import { SendTask } from "../types/SendTask";
import { Task } from "../types/Task";
import { TaskLog } from "../types/TaskLog";

type Response = {
    content: any
    error: any
}

async function get(url: string, auth: string): Promise<Response> {
    var result = {
        content: null,
        error: null
    }
    const headers = {
        "Content-Type": "application/json",
        apiKey: auth,
    };
    await axios({
        method: 'get',
        url: url,
        headers: {
            ...headers,
        },
    }).then(function (response) {
        result.content = response.data;
    }).catch(function (error) {
        result.error = error?.response?.data || error
    });
    return result;
}

async function post(url: string, data: any, key: string): Promise<Response> {
    var result = {
        content: null,
        error: null
    }
    const headers = {
        "Content-Type": "application/json",
        apiKey: key,
    };
    await axios({
        method: 'post',
        url: url,
        headers: {
            ...headers,
        },
        data: data
    }).then(function (response) {
        result.content = response.data;
    }).catch(function (error) {
        console.log("🚀 ~ file: service.ts:54 ~ post ~ error", error)
        result.error = error?.response?.data || error
    });
    return result;
}

export async function getTaskLog(taskId: string, key: string): Promise<TaskLog[]> {
    const urlbase = process.env.URL_BASE_DELIFORCE;
    let responseData = await get(urlbase + `/task/tasklog?taskId=${taskId}`, key);
    if (!responseData)
        throw new Error("Erro interno!")
    if (!responseData.content)
        throw new Error("Erro interno!" + JSON.stringify(responseData?.error || "{}"))
    const logs = responseData.content as TaskLog[];
    if (!logs.length)
        return []
    return logs.map(hist => ({
        ...hist,
        created_at: moment(hist.created_at).format(
            "DD/MM/YYYY hh:mm:ss A"
        ) || "",
        taskDescStatus: getDescStatus(hist.taskStatus, hist.notes, hist.imageArry),
    }));
}

export async function getTaskByOrder(orderNumber: string, key: string): Promise<Task | null> {
    const urlbase = process.env.URL_BASE_DELIFORCE;
    let responseData = await get(urlbase + `/task/orderid?orderId=${orderNumber}`, key);
    if (!responseData)
        throw new Error("Erro interno!")
    if (!responseData.content)
        throw new Error("Erro interno!" + JSON.stringify(responseData?.error || "{}"))
    const tasks = responseData.content as Task[];
    if (!tasks.length)
        return null
    let task = tasks.find(resp => !resp.isDeleted);
    if (!task) return null;
    return task;
}


export async function sendTask(
    { name, email, address, orderNumber, value, description, startDate, endDate, phone, complement, reference, driverID, teamID, ruleID }: SendTask, key: string
): Promise<any> {
    const urlbase = process.env.URL_BASE_DELIFORCE;

    const data = {
        name: name,
        email: email,
        date: startDate,
        endDate: endDate,
        lastName: " ",
        FlatNo: complement,
        address: address,
        phone: "+55 " + (!phone || phone == '' ? '8888888888' : phone.replace(/\D/g, '')),
        isPickup: true,
        manual: true,
        businessType: 2,
        orderId: orderNumber,
        timezone: "America/Fortaleza",
        driverId: driverID,
        teamId: teamID,
        customerNotes: reference,
        description: description,
        jobAmount: value,
        driverType: 1,
        transportType: [1],
        pricingOrEarningRules: [ruleID],
    };
    const responseData = await post(urlbase + "/task", data, key);
    return responseData;
}

/*
Unassigned	1	Task not assigned to any driver
Assigned	2	Task assigned to driver
Accepted	3	Task accepted by driver
Started	4	Task is started by driver
Arrived	5	Driver has arrived to task Location
Success	6	Task completed successfully
Fail	7	Task Failed
Declined	8	Task declined by driver
Cancelled	9	Task cancelled by driver
Acknowledged	10	Task Acknowledged by driver
Deleted	14	Deleted Task

Tarefa criada 		---> Nenhum status
Tarefa atribuida 	---> Arquivo de transporte recebido
Tarefa reconhecida   —-> Pacote coletado pelo Entregador
Tarefa iniciada		---> Pacote em rota de entrega
Tarefa falhou		---> Falha na Entrega
Tarefa atualizada	---> Dados de entrega atualizados - Nova tentativa de entrega
Imagem adicionada	---> Protocolo de entrega adicionado
Notas adicionada	---> Nota de entrega adicionada
Tarefa sucedida		---> Pacote entregue com sucesso
Tarefa chegando		---> O Entregador está próximo ao endereço de destino
Tarefa cancelada	---> Entrega cancelada
*/
export function getDescStatus(taskStatus: string, notes?: string, imageArry?: string[]): string {
    const st = [
        {
            in: "2",
            out: 'Arquivo de transporte recebido'
        },
        {
            in: "3",
            out: 'Pacote aceito pelo Entregador'
        },
        {
            in: "4",
            out: 'Pacote em rota de entrega'
        },
        {
            in: "5",
            out: 'O Entregador está próximo ao endereço de destino'
        },
        {
            in: "6",
            out: 'Pacote entregue com sucesso'
        },
        {
            in: "7",
            out: 'Falha na Entrega'
        },
        {
            in: "8",
            out: 'Entrega abortada'
        },
        {
            in: "9",
            out: 'Entrega cancelada'
        },
        {
            in: "10",
            out: 'Pacote coletado pelo Entregador'
        },
        {
            in: "18",
            out: 'Dados de entrega atualizados - Nova tentativa de entrega'
        }
    ]
    const getDescStatus = st.find(s => s?.in == taskStatus);

    let toReturn = "";

    if (getDescStatus)
        toReturn = getDescStatus.out;

    if (notes)
        toReturn = "Nota de entrega adicionada";

    if (imageArry && imageArry?.length > 0)
        toReturn = "Protocolo de entrega adicionado";

    return toReturn;
}
