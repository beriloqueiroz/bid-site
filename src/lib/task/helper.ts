import { calculePrice, dateByDeliveryType } from '../helpers/rules';
import { AccountInfo } from '../types/AccountInfo';
import { SendTask } from '../types/SendTask';

export function mountSendTask(
  street: string,
  number:string,
  neighborhood:string,
  city:string,
  state:string,
  cep:string,
  complement:string,
  reference:string,
  orderNumber:string,
  recipient:string,
  declaredValue:number,
  accountInfos:AccountInfo,
  phone:string,
  type:string,
  startDate?:string,
  endDate?:string,
) :SendTask {
  const {
    driver, key, model, rule, team, client,
  } = accountInfos;
  const price = calculePrice(declaredValue, type, city, client);
  const data: SendTask = {
    address: `${street}, ${number} - ${neighborhood}, ${city} - ${state}, ${cep} Brazil`,
    complement: `${complement}, ${reference}`,
    phone,
    name: `[${orderNumber}] ${recipient}`,
    value: price.toString(),
    startDate: startDate || `${dateByDeliveryType(type).format('YYYY-MM-DD')}T10:00:00.830Z`,
    endDate: endDate || `${dateByDeliveryType(type).format('YYYY-MM-DD')}T23:00:00.830Z`,
    reference,
    description: client.address,
    email: 'sender@bid.log.br',
    orderNumber,
    type,
    driver,
    key,
    model,
    rule,
    team,
  };
  return data;
}
