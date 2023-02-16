import { ResponseDefault } from "@/lib/types/Response";
import { TaskLogDTO } from "@/lib/types/TaskLogDTO";
import { TaskStatus } from "@/lib/types/TaskStatus";
import axios from "axios";
import moment from "moment";
import { SendTask } from "../../types/SendTask";

type TaskLog = {
  _id: string;
  isDeleted: number;
  role: number;
  taskStatus: string;
  taskId: string;
  clientId: string;
  driverName: string;
  user: string;
  distanceTravelled: number;
  created_at: string;
  __v: number;
  reason: string;
  imageArry: string[];
  notes: string;

  taskDescStatus: string;
};

type Task = {
  _id: string;
  isDeleted: number;
  name: string;
  email: string;
  date: string;
  endDate: string;
  address: {
    formatted_address: string;
    geometry: any;
  };
  phone: string;
  businessType: number;
  orderId: string;
  taskStatus: string;
  taskId: string;
  created_at: string;

  taskDescStatus: string;
  forecast: string;
};

async function get(url: string, auth: string): Promise<ResponseDefault> {
  var result = {
    content: null,
    error: null,
  };
  const headers = {
    "Content-Type": "application/json",
    apiKey: auth,
  };
  await axios({
    method: "get",
    url: url,
    headers: {
      ...headers,
    },
  })
    .then(function (response) {
      result.content = response.data;
    })
    .catch(function (error) {
      result.error = error?.response?.data || error;
    });
  return result;
}

async function post(url: string, data: any, key: string): Promise<ResponseDefault> {
  var result = {
    content: null,
    error: null,
  };
  const headers = {
    "Content-Type": "application/json",
    apiKey: key,
  };
  await axios({
    method: "post",
    url: url,
    headers: {
      ...headers,
    },
    data: data,
  })
    .then(function (response) {
      result.content = response.data;
    })
    .catch(function (error) {
      result.error = error?.response?.data || error;
    });
  return result;
}

async function getTaskLog(taskId: string, auth: string): Promise<TaskLog[]> {
  const urlbase = process.env.URL_BASE_DELIFORCE;
  let responseData = await get(urlbase + `/task/tasklog?taskId=${taskId}`, auth);
  if (!responseData) throw new Error("Erro interno!");
  if (!responseData.content) throw new Error("Erro interno!" + JSON.stringify(responseData?.error || "{}"));
  const logs = responseData.content as TaskLog[];
  if (!logs.length) return [];
  return logs.map((hist) => ({
    ...hist,
    created_at: moment(hist.created_at).format("DD/MM/YYYY hh:mm:ss A") || "",
    taskDescStatus: getDescStatus(hist.taskStatus, hist.notes, hist.imageArry),
  }));
}

async function getTaskByOrder(orderNumber: string, auth: string): Promise<Task | null> {
  const urlbase = process.env.URL_BASE_DELIFORCE;
  let responseData = await get(urlbase + `/task/orderid?orderId=${orderNumber}`, auth);

  if (!responseData) throw new Error("Erro interno!");
  if (!responseData.content) throw new Error("Erro interno!" + JSON.stringify(responseData?.error || "{}"));
  const tasks = responseData.content as Task[];
  if (!tasks.length) return null;
  let task = tasks.find((resp) => !resp.isDeleted);
  if (!task) return null;
  return task;
}

async function sendTask({
  name,
  email,
  address,
  orderNumber,
  value,
  description,
  startDate,
  endDate,
  phone,
  complement,
  reference,
  account,
  deliveryType,
}: SendTask): Promise<ResponseDefault> {
  const urlbase = process.env.URL_BASE_DELIFORCE;

  const prefix = orderNumber.slice(0, orderNumber.indexOf("-"));

  const generalAuth = process.env["CONFIG_" + prefix] as string;

  if (!generalAuth) return { content: null, error: "erro ao buscar empresa" };

  const driverID = process.env["DRIVER_" + account] as string;
  const teamID = process.env["TEAM_" + account] as string;
  const ruleID = process.env["RULE_" + account] as string;
  const templateID = process.env["MODEL_TYPE_" + account] as string;

  if (!ruleID || !driverID || !teamID || !templateID) return { content: null, error: "erro ao buscar infos deliforce" };

  const key = JSON.parse(generalAuth) as string;

  const data = {
    name: name,
    email: email,
    date: startDate,
    endDate: endDate,
    lastName: " ",
    FlatNo: complement,
    address: address,
    phone: "+55 " + (!phone || phone == "" ? "8888888888" : phone.replace(/\D/g, "")),
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
    templateId: templateID,
    templateName: "Envio",
    templateData: [
      {
        fieldName: "tipo",
        fieldValue: deliveryType,
        dataType: "text",
        mandatoryFields: "Mandatory",
        permitAgent: "Read",
        order: 0,
      },
    ],
  };
  console.log("🚀 ~ file: deliforce.ts:193 ~ data", data);
  try {
    const response = await post(urlbase + "/task", data, key);
    if (!response?.content || response?.error) {
      return { content: null, error: response?.error };
    }
    return {
      content: response,
      error: null,
    };
  } catch (e) {
    return {
      content: null,
      error: e,
    };
  }
}

async function getTrackingHistory(orderNumber: string): Promise<TaskLogDTO | null> {
  if (orderNumber.indexOf("-") < 0) {
    return null;
  }

  const prefix = orderNumber.slice(0, orderNumber.indexOf("-"));

  const generalAuth = process.env["CONFIG_" + prefix] as string;

  if (!generalAuth) return null;

  const keys = JSON.parse(generalAuth) as string[];

  for (const key of keys) {
    const order = await getTaskByOrder(orderNumber, key);

    if (!order) return null;

    const histories = await getTaskLog(order.taskId, key);
    const historyResponse: TaskLogDTO = {
      history: histories,
      task: {
        ...order,
        name: order?.name || "",
        date: moment(order?.date).subtract(3, "hour").format("DD/MM/YYYY hh:mm:ss A") || "",
        endDate: moment(order?.endDate).subtract(3, "hour").format("DD/MM/YYYY hh:mm:ss A") || "",
        orderId: order?.orderId || "",
        taskDescStatus: getDescStatus(order?.taskStatus || ""),
        address: {
          ...order?.address,
          formatted_address: order?.address.formatted_address || "",
        },
        forecast: moment(order?.endDate).subtract(3, "hour").format("DD/MM/YYYY hh:mm:ss A") || "",
      },
    };
    return historyResponse;
  }
  return null;
}

function getDescStatus(taskStatus: string, notes?: string, imageArry?: string[]): TaskStatus {
  if (notes) return TaskStatus.DELIVERY_NOTE_ADDED;

  if (imageArry && imageArry?.length > 0) return TaskStatus.DELIVERY_PROTOCOL_ADDED;

  const st = [
    {
      in: "2",
      out: TaskStatus.FILE_CHECK,
    },
    {
      in: "3",
      out: TaskStatus.PACKAGE_ACCEPTED,
    },
    {
      in: "4",
      out: TaskStatus.PACKAGE_ON_DELIVERY_ROUTE,
    },
    {
      in: "5",
      out: TaskStatus.PACKAGE_IS_NEAR,
    },
    {
      in: "6",
      out: TaskStatus.DELIVERY_SUCCESSFULLY,
    },
    {
      in: "7",
      out: TaskStatus.DELIVERY_FAILURE,
    },
    {
      in: "8",
      out: TaskStatus.DELIVERY_ABORTED,
    },
    {
      in: "9",
      out: TaskStatus.DELIVERY_CANCELLED,
    },
    {
      in: "10",
      out: TaskStatus.PACKAGE_PICKED,
    },
    {
      in: "18",
      out: TaskStatus.UPDATED_DELIVERY_DATA,
    },
  ];
  const getDescStatus = st.find((s) => s?.in == taskStatus);

  if (getDescStatus) return getDescStatus.out;

  return TaskStatus.UNDEFINED;
}

export const deliforceImplementation = { sendTask, getTrackingHistory };
