import { ResponseDefault } from '@/lib/types/Response';
import { TrackingTaskConfig } from '@/lib/types/AccountInfo';
import { TaskLogDTO } from '@/lib/types/TaskLogDTO';
import { TaskStatus } from '@/lib/types/TaskStatus';
import axios from 'axios';
import moment from 'moment';

import { SendTask } from '../../types/SendTask';

function getDescStatus(taskStatus: string, notes?: string, imageArry?: string[]): TaskStatus {
  if (notes) return TaskStatus.DELIVERY_NOTE_ADDED;

  if (imageArry && imageArry?.length > 0) return TaskStatus.DELIVERY_PROTOCOL_ADDED;

  const st = [
    {
      in: '2',
      out: TaskStatus.FILE_CHECK,
    },
    {
      in: '3',
      out: TaskStatus.PACKAGE_ACCEPTED,
    },
    {
      in: '4',
      out: TaskStatus.PACKAGE_ON_DELIVERY_ROUTE,
    },
    {
      in: '5',
      out: TaskStatus.PACKAGE_IS_NEAR,
    },
    {
      in: '6',
      out: TaskStatus.DELIVERY_SUCCESSFULLY,
    },
    {
      in: '7',
      out: TaskStatus.DELIVERY_FAILURE,
    },
    {
      in: '8',
      out: TaskStatus.DELIVERY_ABORTED,
    },
    {
      in: '9',
      out: TaskStatus.DELIVERY_CANCELLED,
    },
    {
      in: '10',
      out: TaskStatus.PACKAGE_PICKED,
    },
    {
      in: '18',
      out: TaskStatus.UPDATED_DELIVERY_DATA,
    },
  ];
  const getDescStatusRet = st.find((s) => s?.in === taskStatus.toString());

  if (getDescStatusRet) return getDescStatusRet.out;

  return TaskStatus.UNDEFINED;
}

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
  const result = {
    content: null,
    error: null,
  };
  const headers = {
    'Content-Type': 'application/json',
    apiKey: auth,
  };
  await axios({
    method: 'get',
    url,
    headers: {
      ...headers,
    },
  })
    .then((response) => {
      result.content = response.data;
    })
    .catch((error) => {
      result.error = error?.response?.data || error;
    });
  return result;
}

async function post(url: string, data: any, key: string): Promise<ResponseDefault> {
  const result = {
    content: null,
    error: null,
  };
  const headers = {
    'Content-Type': 'application/json',
    apiKey: key,
  };
  await axios({
    method: 'post',
    url,
    headers: {
      ...headers,
    },
    data,
  })
    .then((response) => {
      result.content = response.data;
    })
    .catch((error) => {
      result.error = error?.response?.data || error;
    });
  return result;
}

async function getTaskLog(taskId: string, auth: string): Promise<TaskLog[]> {
  const urlbase = process.env.URL_BASE_DELIFORCE;
  const responseData = await get(`${urlbase}/task/tasklog?taskId=${taskId}`, auth);
  if (!responseData) throw new Error('Erro interno!');
  if (!responseData.content) throw new Error(`Erro interno!${JSON.stringify(responseData?.error || '{}')}`);
  const logs = responseData.content as TaskLog[];
  if (!logs.length) return [];
  return logs.map((hist) => ({
    ...hist,
    created_at: moment(hist.created_at).subtract(3, 'hours').format('DD/MM/YYYY hh:mm:ss A') || '',
    taskDescStatus: getDescStatus(hist.taskStatus, hist.notes, hist.imageArry),
  }));
}

async function getTaskByOrder(orderNumber: string, auth: string): Promise<Task | null> {
  const urlbase = process.env.URL_BASE_DELIFORCE;
  const responseData = await get(`${urlbase}/task/orderid?orderId=${orderNumber}`, auth);

  if (!responseData) throw new Error('Erro interno!');
  if (!responseData.content) throw new Error(`Erro interno!${JSON.stringify(responseData?.error || '{}')}`);
  const tasks = responseData.content as Task[];
  if (!tasks.length) return null;
  const task = tasks.find((resp) => !resp.isDeleted);
  if (!task) return null;
  return task;
}

async function sendTask({
  name,
  email,
  address,
  orderNumber,
  value,
  valueDriver,
  description,
  startDate,
  endDate,
  phone,
  complement,
  reference,
  type,
  key,
  driver,
  team,
  rule,
  model,
  declaredValue,
  clientAddress,
}: SendTask): Promise<ResponseDefault> {
  const urlbase = process.env.URL_BASE_DELIFORCE;

  if (!rule || !driver || !team || !model) return { content: null, error: 'erro ao buscar infos deliforce' };

  const order = await getTaskByOrder(orderNumber, key);

  if (order) {
    return {
      content: null,
      error: 'Pedido já existe',
    };
  }

  const now = moment().format('YYYY-MM-DD');

  if (moment(startDate).isBefore(moment(now)) || moment(endDate).isBefore(moment(now))) {
    return {
      content: null,
      error: 'Pedido com data antes de hoje, verifique se os campos de data estão como texto',
    };
  }

  const data = {
    name,
    email,
    date: startDate,
    endDate,
    lastName: ' ',
    FlatNo: complement,
    address,
    phone: `+55 ${!phone || phone === '' ? '8888888888' : phone.replace(/\D/g, '')}`,
    isPickup: true,
    manual: true,
    businessType: 2,
    orderId: orderNumber,
    timezone: 'America/Fortaleza',
    driverId: driver,
    teamId: team,
    customerNotes: reference || '',
    description,
    jobAmount: value,
    driverType: 1,
    transportType: [1],
    pricingOrEarningRules: [rule],

    isRepeat: false,
    isDriverTemplateRepeat: false,
    templateId: model,
    templateName: 'Envio',
    templateData: [
      {
        fieldName: 'tipo',
        fieldValue: type,
        dataType: 'text',
        mandatoryFields: 'Not-Mandatory',
        permitAgent: 'Read Only',
        order: 0,
      },
      {
        fieldName: 'valor',
        fieldValue: value,
        dataType: 'text',
        mandatoryFields: 'Not-Mandatory',
        permitAgent: 'Hidden fields',
        order: 1,
      },
      {
        fieldName: 'valor entrega',
        fieldValue: valueDriver,
        dataType: 'text',
        mandatoryFields: 'Not-Mandatory',
        permitAgent: 'Read Only',
        order: 2,
      },
      {
        fieldName: 'valor declarado',
        fieldValue: declaredValue,
        dataType: 'text',
        mandatoryFields: 'Not-Mandatory',
        permitAgent: 'Read Only',
        order: 3,
      },
      {
        fieldName: 'endereço coleta',
        fieldValue: clientAddress,
        dataType: 'text',
        mandatoryFields: 'Not-Mandatory',
        permitAgent: 'Read Only',
        order: 4,
      },
    ],
  };
  try {
    const response = await post(`${urlbase}/task`, data, key);
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

// function adjustData(date:string) {
//   const dataString = moment(date);
//   return `${dataString.day() < 10 ? 0 : ''}${dataString.day()}/${dataString.month() < 10 ? 0 : ''}${dataString.month()}/${dataString.year()}
//   ${dataString.hours()}:${dataString.minutes()}
//   `;
// }

async function getTrackingHistory(orderNumber: string, config: TrackingTaskConfig[]): Promise<TaskLogDTO | null> {
  if (orderNumber.indexOf('-') < 0) {
    return null;
  }

  for (let i = 0; i < config.length; i++) {
    const { key, name } = config[i];
    const order = await getTaskByOrder(orderNumber, key);

    if (!order) continue;

    const histories = await getTaskLog(order.taskId, key);
    const historyResponse: TaskLogDTO = {
      history: histories,
      task: {
        ...order,
        name: order.name || '',
        date: moment(order.date).subtract(3, 'hour').format('DD/MM/YYYY hh:mm:ss A') || '',
        endDate: moment(order.endDate).subtract(3, 'hour').format('DD/MM/YYYY hh:mm:ss A') || '',
        created_at: moment(order.created_at).subtract(3, 'hour').format('DD/MM/YYYY hh:mm:ss A') || '',
        orderId: order.orderId || '',
        taskDescStatus: getDescStatus(order.taskStatus || ''),
        address: {
          ...order.address,
          formatted_address: order.address.formatted_address || '',
        },
        forecast: moment(order.endDate).subtract(3, 'hour').format('DD/MM/YYYY hh:mm:ss A') || '',
      },
      origin: name,
    };
    return historyResponse;
  }
  return null;
}

export const deliforceImplementation = { sendTask, getTrackingHistory };
